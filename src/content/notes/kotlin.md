---
created: "2026-10-12T10:10:00+09:00"
---
# Kotlin

Kotlinまわりのノートを束ねるハブノート。JVM・ビルドツール側の話はJava・Gradleのハブノートを参照。

## 言語機能

- [[kotlin-variance]] — ジェネリクスの`in`/`out`（宣言サイド変性）。Javaのワイルドカードを使用サイドで毎回書く代わりに、宣言時に一度だけ決める。
- [[kotlin-coroutines]] — `suspend`によるOSスレッドを使わない中断可能な計算。言語が持つのは`suspend`とCPS変換＋状態機械への変換だけで、`launch`/`async`などは`kotlinx.coroutines`が提供する。
- [[kotlin-coroutines-experiment]] — [[kotlin-coroutines]]の中断・再開がシステムコールを発行しないことを`strace`で確かめた実験記録。syscallが出るのはスレッドの増減（`clone3`）と本当に待つ処理（`futex`）だけ。

## ビルド・コード生成

- [[kotlin-annotation-processing]] — コンパイル時コード生成のハブ。Javaのannotation processorを土台に、Javaスタブ経由のkaptとKotlinネイティブな後継のKSPがある。

#kotlin #moc
