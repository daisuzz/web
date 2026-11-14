---
created: "2026-10-12T10:10:00+09:00"
updated: "2026-11-14"
---
# Kotlin

Kotlinまわりのノートを束ねるハブノート。JVM・ビルドツール側の話はJava・Gradleのハブノートを参照。

## 言語機能

- [[kotlin-variance]] — ジェネリクスの`in`/`out`（宣言サイド変性）。Javaのワイルドカードを使用サイドで毎回書く代わりに、宣言時に一度だけ決める。
- [[kotlin-coroutines]] — `suspend`によるOSスレッドを使わない中断可能な計算。言語が持つのは`suspend`とCPS変換＋状態機械への変換だけで、`launch`/`async`などは`kotlinx.coroutines`が提供する。
- [[kotlin-coroutines-experiment]] — [[kotlin-coroutines]]の中断・再開がシステムコールを発行しないことを`strace`で確かめた実験記録。syscallが出るのはスレッドの増減（`clone3`）と本当に待つ処理（`futex`）だけ。

## ビルド・コード生成

- [[kotlin-annotation-processing]] — コンパイル時コード生成のハブ。Javaのannotation processorを土台に、Javaスタブ経由のkaptとKotlinネイティブな後継のKSPがある。

## マルチプラットフォーム

- [[kotlin-expect-actual]] — KMPでcommonに宣言だけを置き、プラットフォームごとに実装する仕組み。K2ではフロントエンドで actual→expect を対応付け、`IrActualizer`がIR上でactual化する。

## コンパイラ（K2 / FIR）

- [[fir]] — K2のフロントエンドとその中心のツリー。`RAW_FIR`から`BODY_RESOLVE`までの解決フェーズを順に進め、「後のフェーズの情報に頼らない」という契約で動く。CLIは全体を一括で、Analysis APIは宣言ごとに遅延して解決する。
- [[fir-checker]] — K2フロントエンドで`BODY_RESOLVE`済みのFIRツリーに対して走り、diagnosticを報告するCheckerの仕組み。宣言・式・型ごとの型付きCheckerと、その契約（ステートレス・独立・具体的・構文非依存）。
- [[fir-additional-checkers-extension]] — コンパイラプラグインから独自のFIR Checkerを足す拡張ポイント。diagnostic定義→Checker→拡張→`FirExtensionRegistrar`→`CompilerPluginRegistrar`の順に配線する。

#kotlin #moc
