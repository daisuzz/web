---
created: "2026-08-27"
---
# Kotlin Coroutinesのシステムコール実験

[[kotlin-coroutines]]の「中断・再開自体はヒープ上の状態機械操作でしかない」という理解を、実際に`strace`でシステムコールを観測して裏付けた記録。

## 目的

- `suspend`関数の中断・再開そのものがシステムコールを発行するのか
- `Dispatchers.Default`のワーカースレッドはどう生成されるのか
- `delay()`の「時間待ち」は何によって実現されているのか
- 非同期I/Oライブラリがコルーチンの上に乗せるノンブロッキングI/Oの基盤は何か

という4点を、実際にコンパイル・実行・`strace -f`で確認する。

## 素材

- 環境: OpenJDK 21.0.10（Ubuntu、この検証環境に元から存在）
- `kotlinc`: 2.4.10（2026年7月リリース、2026年8月時点の最新安定版。2.4.0のバグ修正リリース）。JetBrains公式のGitHub Releasesから`kotlin-compiler-2.4.10.zip`を取得し、SHA256チェックサムを検証してから展開した
- `kotlinx-coroutines-core`: 1.11.0（2026年8月時点の最新安定版）。Maven Central (`repo1.maven.org`) から`kotlinx-coroutines-core-jvm-1.11.0.jar`を直接ダウンロード
- `strace`: 環境にプリインストール済み

初回の検証(下記「バージョンについての補足」参照)ではUbuntuリポジトリの`apt install kotlin`で入る1.3.31を使っていたが、2026年時点で7年近く前のバージョンであり実態を反映しないため、公式配布の最新安定版に差し替えて再実施した。

## 躓いた点と対処

- Ubuntuの`apt`で入る`kotlin`パッケージは1.3.31と非常に古い。`sdkman`も入っていない環境だったため、JetBrains公式のGitHub Releasesから`kotlin-compiler-<version>.zip`を直接`curl`で取得する方式に切り替えた（`repo1.maven.org`・`github.com`ともにこの環境から疎通可能だった）。
- kotlinc 2.4.10でコンパイルした`demo.jar`を`java -jar demo.jar`で単体実行すると`NoClassDefFoundError: kotlinx/coroutines/BuildersKt`。`-include-runtime`はKotlin標準ライブラリだけをjarに同梱し、`kotlinx-coroutines-core`は同梱されないため。`java -cp demo.jar:kotlinx-coroutines-core.jar CoroDemoKt`のように明示的にクラスパスへ追加する必要がある。
- 旧バージョン(1.3.31)では`ProcessHandle.current().pid()`使用時に`-jvm-target 1.8`の明示が必要だった(デフォルトJVMターゲットが1.6だったため)が、2.4.10ではこの指定なしでも問題なくコンパイルできた。デフォルトのJVMターゲットが底上げされている。
- `strace -e trace=clone`を指定してもスレッド生成が1件もマッチしなかった。このカーネル/glibcの組み合わせでは`pthread_create`が`clone`ではなく`clone3`システムコールとして観測される（比較的新しいglibcの挙動）。`-e trace=clone3`に変えたら捕捉できた。

## 実行結果

### 1. `Dispatchers.Default`のスレッド生成 → `clone3`

```kotlin
fun main() = runBlocking {
    val jobs = List(8) { i ->
        launch(Dispatchers.Default) {
            delay(200)
            println("done $i on ${Thread.currentThread().name}")
        }
    }
    jobs.forEach { it.join() }
}
```

```
kotlinc -cp kotlinx-coroutines-core.jar CoroDemo.kt -include-runtime -d demo.jar
strace -f -e trace=clone3,futex -o strace.log java -cp demo.jar:kotlinx-coroutines-core.jar CoroDemoKt
```

出力:

```
start pid=1932
done 0 on DefaultDispatcher-worker-4
done 3 on DefaultDispatcher-worker-3
done 1 on DefaultDispatcher-worker-2
done 2 on DefaultDispatcher-worker-1
done 5 on DefaultDispatcher-worker-3
done 4 on DefaultDispatcher-worker-4
done 6 on DefaultDispatcher-worker-2
done 7 on DefaultDispatcher-worker-1
all done
```

このマシンは`nproc`で4コア。8個`launch`しても実スレッドは`DefaultDispatcher-worker-1〜4`の4本のみ——CPUコア数を上限にワーカースレッドへ多重化されている。生成時の`clone3`呼び出し:

```
1932  clone3({flags=CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_SIGHAND|CLONE_THREAD|CLONE_SYSVSEM|CLONE_SETTLS|CLONE_PARENT_SETTID|CLONE_CHILD_CLEARTID, child_tid=0x7f986bbff990, parent_tid=0x7f986bbff990, exit_signal=0, stack=0x7f986bb00000, stack_size=0xfef80, tls=0x7f986bbff6c0} => {parent_tid=[1933]}, 88) = 1933
```

コルーチンなしのベースライン（`println`だけの最小プログラム）でも`clone3`は17回発行される（GC/JITコンパイラなどJVM自体が使う分）。コルーチン版では27回で、差分の10回がワーカースレッド4本＋`delay()`用の専用スレッド1本＋JITコンパイラスレッドの追加分などに相当する（1.3.31/1.3.0の組み合わせで同じ実験をしたときはそれぞれ17回/26回で、絶対数は実行のたびに多少ぶれるが「ベースライン比+9〜10」という傾向は変わらない）。

`Thread.getAllStackTraces().keys`で全生存スレッド名を確認すると:

```
Common-Cleaner
DefaultDispatcher-worker-1
DefaultDispatcher-worker-2
DefaultDispatcher-worker-3
DefaultDispatcher-worker-4
Finalizer
Notification Thread
Reference Handler
Signal Dispatcher
kotlinx.coroutines.DefaultExecutor
main
```

`kotlinx.coroutines.DefaultExecutor`という専用デーモンスレッドが実在しており、これが`delay()`のタイマーキューを管理している。

### 2. ワーカーのアイドル待機/`delay()` → `futex`

同じstraceログで最多だったのが`futex`（2983回）。`CoroutineScheduler.park()`の実装:

```kotlin
private fun park() {
    if (terminationDeadline == 0L)
        terminationDeadline = System.nanoTime() + idleWorkerKeepAliveNs
    LockSupport.parkNanos(idleWorkerKeepAliveNs)
    if (System.nanoTime() - terminationDeadline >= 0) {
        tryTerminateWorker()
    }
}
```

実際のログ（ワーカースレッド間のパーク/ウェイクの様子）:

```
1933  futex(0x7f9864077c78, FUTEX_WAIT_BITSET_PRIVATE|FUTEX_CLOCK_REALTIME, 0, NULL, FUTEX_BITSET_MATCH_ANY <unfinished ...>
1934  futex(0x7f9864077c78, FUTEX_WAKE_PRIVATE, 2147483647) = 1
1933  <... futex resumed>)              = 0
1934  futex(0x7f9864077c7c, FUTEX_WAIT_BITSET_PRIVATE|FUTEX_CLOCK_REALTIME, 0, NULL, FUTEX_BITSET_MATCH_ANY <unfinished ...>
1933  futex(0x7f9864077c28, FUTEX_WAKE_PRIVATE, 1) = 0
```

`LockSupport.parkNanos`はHotSpotの`Parker`クラス経由で`pthread_cond_timedwait`を呼び、Linuxではglibcがこれを`futex(FUTEX_WAIT_BITSET|FUTEX_CLOCK_REALTIME, ...)`に変換する。`delay(200)`自体もスレッドをブロックしないが、その裏で`kotlinx.coroutines.DefaultExecutor`スレッドが同じ`parkNanos`の仕組みで次のタイマー期限まで眠っている。

### 3. 実際の非同期I/O → `epoll`

`kotlinx-coroutines-core`自体にネットワークI/Oは含まれない（Ktor/OkHttpなど別ライブラリの領分）が、それらが使う基盤を素のJava NIOで再現して確認した。

```kotlin
import java.nio.channels.Selector
import java.nio.channels.SelectionKey
import java.nio.channels.Pipe

fun main() {
    val selector = Selector.open()
    val pipe = Pipe.open()
    pipe.source().configureBlocking(false)
    pipe.source().register(selector, SelectionKey.OP_READ)

    Thread {
        Thread.sleep(150)
        pipe.sink().write(java.nio.ByteBuffer.wrap(byteArrayOf(1)))
    }.start()

    println("selecting...")
    val n = selector.select(2000) // ここでepoll_waitに到達するはず
    println("selected: $n")
    selector.close()
}
```

```
strace -f -e trace=epoll_create1,epoll_ctl,epoll_wait -o nio_strace.log java -jar nio.jar
```

出力:

```
selecting...
selected: 1
```

straceログ:

```
1991  epoll_create1(EPOLL_CLOEXEC)      = 5
1991  epoll_ctl(5, EPOLL_CTL_ADD, 6, {events=EPOLLIN, data={u32=6, ...}}) = 0
1991  epoll_ctl(5, EPOLL_CTL_ADD, 7, {events=EPOLLIN, data={u32=7, ...}}) = 0
1991  epoll_wait(5, [{events=EPOLLIN, data={u32=7, ...}}], 1024, 2000) = 1
```

`Selector.open()`で`epoll_create1`、`register()`で`epoll_ctl(EPOLL_CTL_ADD)`、`select(timeout)`で`epoll_wait`が発行され、別スレッドがpipeに書き込んだ150ms後にイベントが返っている（タイムアウトの2000msより早く返っていることから、ポーリングではなくイベント待ちであることも確認できる）。`suspendCancellableCoroutine`でこの`Selector`をラップし、`select()`が返ったタイミングで`continuation.resume()`を呼ぶ、というのが非同期I/Oライブラリの定石。

## コードから読み取れること

- `suspend`関数の中断・再開そのもの（状態機械の`invokeSuspend`呼び出し）は、この実験の中で一切システムコールとして観測されなかった。ヒープ上のフィールド代入と関数呼び出しだけで完結している。
- システムコールが発生するのは「スレッドプールの増減」（`clone3`）と「本当に待つ」処理（`futex`によるpark/unpark）の2箇所に限定される。`Dispatchers.Default`はCPUコア数を上限に実スレッドを抑え、余った分のコルーチンは同じスレッドをキューで使い回す。
- `delay()`は独立した1本のタイマースレッド（`kotlinx.coroutines.DefaultExecutor`）に集約されており、コルーチンの数だけタイマースレッドが増えるわけではない。
- 実ネットワークI/Oは`kotlinx-coroutines-core`の範囲外で、`java.nio.channels.Selector`（Linuxでは`epoll`）のようなOSのreadiness通知APIを土台にライブラリ側が`suspend`関数を実装する。

## バージョンについての補足

最初にこの実験をしたときは`apt install kotlin`で入る1.3.31 + kotlinx-coroutines-core 1.3.0という組み合わせだった。Kotlin 2.4.10 + kotlinx-coroutines-core 1.11.0（いずれも2026年8月時点の最新安定版）に差し替えて再実行した結果、`clone3`/`futex`/`epoll_*`という観測されるシステムコールの種類、スレッド構成（`DefaultDispatcher-worker-N`がCPUコア数分＋`kotlinx.coroutines.DefaultExecutor`が1本）は完全に同じだった。`CoroutineScheduler`のワークスティーリング設計は少なくとも1.3系から1.11系まで変わっていないと考えてよい。

## 出典

- [kotlinx.coroutines公式リポジトリ - CoroutineScheduler.kt](https://github.com/Kotlin/kotlinx.coroutines/blob/master/kotlinx-coroutines-core/jvm/src/scheduling/CoroutineScheduler.kt)
- [LockSupport.parkNanos() Under the Hood and the Curious Case of Parking - Hazelcast](https://hazelcast.com/blog/locksupport-parknanos-under-the-hood-and-the-curious-case-of-parking/)
- [Async IO on Linux: select, poll, and epoll - Julia Evans](https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/)
- 上記に加え、本ノート自身がこの検証環境上で`kotlinc`+`kotlinx-coroutines-core`をインストールして実行した一次記録

#kotlin #coroutine #strace #syscall #実験
