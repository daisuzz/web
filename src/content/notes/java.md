---
created: "2026-10-12T10:20:00+09:00"
---
# Java

Java・JVMまわりのノートを束ねるハブノート。Kotlin固有の話はKotlinのハブノートを参照。

## JDKのリリースと新機能

- [[jdk-releases]] — 6ヶ月ごとのリリースサイクルと2年ごとのLTS。各JDKバージョンのノートを束ねるハブ。
- [[structured-concurrency]] — `StructuredTaskScope`。サブタスクの生存期間をブロック構造に束縛する。Project Loomの一部で、JDK 21以降プレビューが続いている。
- [[project-leyden]] — トレーニング実行の結果をAOTキャッシュに保存し、起動時間・ウォームアップ・フットプリントを改善するOpenJDKのプロジェクト。

## JVMの内部

- [[jvm-class-loading]] — `.class`をロード→リンク→初期化する流れと、クラスローダーの階層・委譲モデル。起動コストの一因。
- [[java-classpath]] — クラスローダーが「どこを探すか」を決める場所のリスト。module path（Java 9〜）との違い。
- [[jit-compilation]] — HotSpotのインタプリタ→JITの流れとTiered Compilation、ウォームアップタイム。

## コンパイル時処理

- [[annotation-processor]] — javacのコンパイル時プラグイン機構（JSR 269）。Kotlinからの使われ方（kapt/KSP）はKotlinのアノテーション処理のハブノートにまとめてある。

## ビルドツール

- [[maven]] — `pom.xml`による宣言的なビルド・依存関係管理。GAV座標とビルドライフサイクル。
- [[maven-4]] — Build POMとConsumer POMの分離、モデルバージョン4.1.0などを入れた次期メジャー。
- [[gradle]] — Gradleのノートを束ねるハブ。

#java #jvm #moc
