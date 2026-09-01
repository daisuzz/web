---
created: "2026-08-18"
updated: "2026-09-01"
---
# Kotlin Coroutines

OSスレッドを使わずに「中断可能な計算」を実現する言語機能。中心は`suspend`修飾子で、これが付いた関数はスレッドをブロックせずに一時停止・再開できる。`async`/`await`はKotlin言語自体のキーワードではなく標準ライブラリにも含まれない。`kotlinx.coroutines`というライブラリが`launch`/`async`/`Dispatchers`などのAPIとして提供している。言語がサポートしているのは`suspend`という中断可能性のマーキングと、それをコンパイラが解釈する変換の仕組みだけ。

## 実現方法: CPS変換 + 状態機械

JVM自体にはコルーチンに相当するランタイム機構はない。Kotlinはコンパイラによるソースコード変換だけでこれを実現している([[async-runtime]]の「実装は言語・ランタイムごとに異なる」の一例)。

### 1. Continuation Passing Style (CPS) 変換

`suspend fun f(p: A): T` は、コンパイル時に次のような通常の関数に変換される。

```kotlin
fun f(p: A, cont: Continuation<T>): Any?
```

戻り値が`Any?`になるのは、正常終了時は結果`T`をそのまま返し、中断時には特別なマーカー値`COROUTINE_SUSPENDED`を返すという2通りの意味を持たせるため。追加される`Continuation`は次のようなインターフェース。

```kotlin
interface Continuation<in T> {
    val context: CoroutineContext
    fun resumeWith(result: Result<T>)
}
```

`Continuation`は「中断点より後に残っている処理」を表すコールバックオブジェクト。`in T`が付いているのは`resumeWith`で`T`を受け取るだけで返すことはないため（[[kotlin-variance]]参照）。

### 2. 状態機械への変換

1つの関数内にある複数の中断点は1つの匿名クラスにまとめられ、`label`フィールド(現在の状態番号)と`switch`/`goto`相当のジャンプテーブルを持つ`invokeSuspend()`が生成される。ローカル変数はスタックではなくこのクラスのフィールドに退避される。中断が起きると`COROUTINE_SUSPENDED`を返してその場で呼び出しを抜け、再開時は保存された`label`から続きが実行される。

スタックそのものを保持する(Goのgoroutineのような)方式ではなく、必要な状態だけをヒープ上のオブジェクトに手動で退避して積み直す「スタックレスコルーチン」。`BaseContinuationImpl.resumeWith`は再帰呼び出しではなく`while(true)`ループで次のcontinuationへ渡り歩く実装になっており、中断点が同期的に連鎖してもJVMのコールスタックを消費しない。

### 3. Dispatcherによるスレッドプール多重化

コルーチン自体はスレッドではないので、実行にはどこかのスレッドが要る。`ContinuationInterceptor`(`CoroutineContext`の要素)がこれを仲介し、`Dispatchers.Default`/`Dispatchers.IO`/`Dispatchers.Main`などが少数のOSスレッドプールに多数のコルーチンをM:Nでスケジューリングする。

## 構造化された並行性 (structured concurrency)

`CoroutineScope`内で起動したコルーチンは必ず親子関係を持つ。親がキャンセルされれば子も連鎖的にキャンセルされ、例外も自動的に伝播する。「起動したタスクの後始末を明示的に書かなくても親のライフサイクルに縛られる」という設計。

- `launch`: 結果値を持たない`Job`を返す
- `async`: 結果値を持つ`Deferred`を返す(`.await()`で取得)

## システムコールレベルの実体

`suspend`関数の中断・再開そのもの(状態機械の`invokeSuspend`呼び出し)はシステムコールを一切発行しない。ヒープ上のフィールド代入と関数呼び出しだけで完結する。実際にOSへ問い合わせが発生するのは以下の2箇所だけ。

- **Dispatcherのワーカースレッド管理**: `Dispatchers.Default`のワーカースレッド生成は`java.lang.Thread`起動を経て`pthread_create`→(Linuxでは)`clone3`システムコールに帰着する。アイドル時の待機・再開は`LockSupport.parkNanos`→HotSpotの`Parker`→`pthread_cond_timedwait`→`futex`
- **`delay()`のタイマー待ち**: `kotlinx.coroutines.DefaultExecutor`という専用の1本のデーモンスレッドがタイマーキューを持ち、同じく`futex`ベースのparkで次の期限まで眠る
- **実際のネットワーク/ファイルI/O**: `kotlinx-coroutines-core`自体には含まれず、Ktor/OkHttpのような非同期I/Oライブラリが`java.nio.channels.Selector`(Linuxでは`epoll_create1`/`epoll_ctl`/`epoll_wait`)のようなOSのreadiness通知APIを土台に`suspend`関数を実装する

`strace`で実際に観測した検証記録は[[kotlin-coroutines-experiment]]。

## 他の非同期モデルとの位置づけ

- **[[async-runtime]]としての立ち位置**: OSスレッドをブロックせずに協調的スケジューリングで並行実行する点は他の非同期ランタイムと同じ枠組みに入るが、コルーチン自体はスタックレスの状態機械であり、Dispatcher経由でOSスレッドに載せる2段構成になっている。
- **[[tokio]] / Rust**: RustのFutureも同じくコンパイラ生成の状態機械。ただしRustは言語自体がランタイムを持たず、Tokioという外部ライブラリが実行(poll)する。Kotlinは`kotlinx.coroutines`が同じ役割を担う点で構造が近い。
- **Goのgoroutine**: Goランタイムが管理する軽量スレッドで、スタックを実際に持つ(伸縮可能)。プリエンプションも一部導入されている(詳細は[[go-goroutine-scheduler]])。`async`/`await`に相当する構文自体が存在せず、`go`一つで非同期化できる代わりに、構造化された取り消し伝播は標準では持たない(`context.Context`を手動で伝播させる規約。[[go-context]]参照)。
- **Java Virtual Threads (Project Loom)**: JVMが管理する軽量スレッドで、フル継続(スタックそのもの)を保持する。既存の同期的・ブロッキングなコードをほぼ書き換えずに使える利点があるが、構造化並行性は標準では強制されず、`StructuredTaskScope`を使う側が意識的に採用する必要がある。I/Oバウンドな超高負荷(100万リクエスト規模)ではKotlin coroutinesがVirtual Threadsをやや上回るというベンチマーク報告もある。
- **JS/C#のasync/await**: `async`/`await`が言語のキーワードで、非同期関数の呼び出しは明示的にPromise/Taskでラップされる。Kotlin coroutinesの設計者Roman Elizarovは、Kotlinの位置づけを「C#系のasync/await的な関数色分けと、Goの無色の世界の中間」と説明している。`suspend`という色は付くが`await`に相当する構文はなく、`suspend fun`内では通常の関数呼び出しと同じ見た目で中断可能関数を呼べ、結果もFuture/Promiseに包まれない生の値として返る。

## バージョンについて

本ノートの内容は`kotlinx.coroutines` 1.11.0（2026年5月8日リリース、Kotlin 2.2.20バンドル）を前提にしている。CPS変換・状態機械への変換という基本的な実現方式自体は安定している。

## 出典

- [Kotlin/kotlinx.coroutines - Releases](https://github.com/Kotlin/kotlinx.coroutines/releases)
- [Coroutines overview - Kotlin公式ドキュメント](https://kotlinlang.org/docs/coroutines-overview.html)
- [Asynchronous programming with coroutines - Kotlin公式言語仕様](https://kotlinlang.org/spec/asynchronous-programming-with-coroutines.html)
- [How do you color your functions? - Roman Elizarov](https://elizarov.medium.com/how-do-you-color-your-functions-a6bb423d936d)
- [Virtual Threads vs. Coroutines in 2026: Is Java Finally There? - daily.dev](https://app.daily.dev/posts/virtual-threads-vs-coroutines-in-2026-is-java-finally-there--cvttfhcqg)
- [Structured Concurrency: Will Java Loom Beat Kotlin's Coroutines? - Xebia](https://xebia.com/blog/structured-concurrency-will-java-loom-beat-kotlins-coroutines-2/)

#kotlin #coroutine #並行処理 #非同期
