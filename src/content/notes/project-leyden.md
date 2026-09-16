---
created: "2026-09-16T19:00:00+09:00"
---
# Project Leyden

Javaプログラムの**起動時間・ピーク性能到達までの時間（ウォームアップ）・フットプリント**を改善することを目的としたOpenJDKのプロジェクト。

中心にあるのは「実行時（just in time）にやっている作業の一部を、事前（ahead of time）に移す」という発想。具体的には、アプリケーションを**トレーニング実行（training run）**して挙動を観測し、その結果をAOTキャッシュに保存しておき、以後の本番実行ではそれを即座に使う。

## condensers

Leydenが導入する概念で、実行前または実行中にアプリケーションコードを順番に変換していく専用のトランスフォーマ。プロジェクトリードのMark Reinholdは、計算を選択的に「前倒し（shift）」し「制約（constrain）」するための仕組みとしてこれを説明している。

## GraalVM Native Imageとの違い

どちらもJavaのコールドスタート問題への答えだが、アプローチが違う。

- **GraalVM Native Image**: closed-world（閉世界）仮定に基づく積極的なAOTコンパイル。リフレクションや動的クラスロードといった動的機能と、ピークスループットを犠牲にする。
- **Project Leyden**: closed-world制約**より弱い制約のスペクトラム**を探索し、それぞれがどんな最適化を可能にするかを調べる、という立て付け。別のコンパイルパスを作るのではなく、CDS（Class Data Sharing）やHotSpotのJITといった既存のJVMインフラの上に積み上げる。

## 実際にJDKに入ったJEP

- **JEP 483: Ahead-of-Time Class Loading & Linking**（[[jdk-24]]） — トレーニング実行時にロード・リンクされた形のクラスをAOTキャッシュに保存する。LeydenがmainlineのOpenJDKに入った最初の成果。
- **JEP 514: Ahead-of-Time Command-Line Ergonomics**（[[jdk-25]]） — キャッシュ作成の手順を簡略化（下記）。
- **JEP 515: Ahead-of-Time Method Profiling**（[[jdk-25]]） — 頻繁に実行されるメソッドのプロファイルをAOTキャッシュに含め、起動直後からJITがネイティブコード生成を始められるようにする。
- **JEP 516: Ahead-of-Time Object Caching with Any GC**（[[jdk-26]]） — オブジェクト参照を生のメモリアドレスではなく論理インデックスで保存することで、ZGCを含む任意のGCでAOTオブジェクトキャッシュを使えるようにした。

**JEP 544: Ahead-of-Time Code Compilation** は2026年9月時点でCandidate段階。トレーニング実行でアプリケーションコードをネイティブコードまでコンパイルしてAOTキャッシュに入れ、ワークロードが変わればネイティブコードを動的に再生成する、という内容。まだどのリリースにもtargetされていない。

## AOTキャッシュの作り方

[[jdk-24]]の時点では2ステップだった。`java`ランチャをそれぞれ別のAOTモードで2回起動する。

1. **record mode**: トレーニング実行の挙動を観測し、AOT構成（configuration）に記録する
2. **create mode**: 記録した構成をもとにAOTキャッシュを作る

[[jdk-25]]のJEP 514で、`-XX:AOTCacheOutput=<キャッシュの場所>` を渡せばJVM終了時にキャッシュを作る1ステップの形が使えるようになった。ただし1ステップ版はキャッシュ生成のサブ起動がトレーニング実行と同じサイズのヒープを別途使うため、**コマンドラインで指定したヒープサイズの2倍のメモリが必要**になる。2ステップを残す利点もあり、トレーニング実行はデプロイ環境に合わせつつ、キャッシュ生成だけCPUコアとメモリに余裕のある大きいインスタンスで回す、といった使い分けができる。

## 関連

[[jit-compilation]]のウォームアップ問題に対して、プロセスを使い回す（[[gradle-daemon]]のような）方向とは別の解として、事前計算した結果を持ち越すアプローチを取っている。キャッシュの対象になるロード・リンク段階については[[jvm-class-loading]]を参照。

## 出典

- [Project Leyden | OpenJDK](https://openjdk.org/projects/leyden/)
- [Selectively Shifting and Constraining Computation - Mark Reinhold](https://openjdk.org/projects/leyden/notes/02-shift-and-constrain)
- [JEP 514: Ahead-of-Time Command-Line Ergonomics](https://openjdk.org/jeps/514)
- [JEP 516: Ahead-of-Time Object Caching with Any GC](https://openjdk.org/jeps/516)
- [JEP 544: Ahead-of-Time Code Compilation](https://openjdk.org/jeps/544)
- [What's New in Project Leyden - JEP 514 and JEP 515 Explained | SoftwareMill](https://softwaremill.com/whats-new-in-project-leyden-jep-514-and-jep-515-explained/)
- [Project Leyden vs GraalVM Native Image](https://stevenpg.com/posts/project-leyden-vs-graalvm-native-image/)

#java #jvm #jdk #performance
