---
created: "2026-09-16T19:05:00+09:00"
---
# Structured Concurrency

並行タスクの生存期間をコードのブロック構造に束縛する考え方。あるスコープの中で起動したサブタスクは、そのスコープを抜けるまでに必ず完了・失敗・キャンセルのいずれかで決着する。構造化プログラミングが制御フローに対してやったことを、並行処理に対してやる、という位置づけで説明されることが多い。

Javaでの実装は`java.util.concurrent`の`StructuredTaskScope`で、Project Loomの一部として仮想スレッドと組み合わせて使う。

## 基本形

```java
try (var scope = StructuredTaskScope.open()) {
    var user  = scope.fork(() -> findUser());
    var order = scope.fork(() -> fetchOrder());
    scope.join();
    return new Response(user.get(), order.get());
}
```

引数なしの`open()`はデフォルトの完了ポリシー——**サブタスクが1つでも失敗したらスコープ全体を失敗させる**——を実装したスコープを開く。それ以外のポリシーが欲しい場合は`Joiner`を引数に取る`open()`を使う。

## 延々とプレビューが続いている

インキュベータ2回、プレビュー7回を重ねてまだFinalになっていない。

| JDK | JEP | 段階 |
| --- | --- | --- |
| 19 | JEP 428 | 1st incubator |
| 20 | JEP 437 | 2nd incubator |
| 21 | JEP 453 | 1st preview |
| 22 | JEP 462 | 2nd preview |
| 23 | JEP 480 | 3rd preview |
| [[jdk-24]] | JEP 499 | 4th preview |
| [[jdk-25]] | JEP 505 | 5th preview |
| [[jdk-26]] | JEP 525 | 6th preview |
| [[jdk-27]] | JEP 533 | 7th preview |

## 主なAPI変更

**JEP 505（[[jdk-25]]）** で一番大きく変わった。

- `StructuredTaskScope`の公開コンストラクタが廃止され、静的ファクトリメソッド`open()`になった（`new StructuredTaskScope<>()` → `StructuredTaskScope.open()`）
- ポリシーと期待する結果の指定が、`StructuredTaskScope`を継承する形から`open()`に`Joiner`を渡す形に変わった。`Joiner`はサブタスクの完了を処理し、`join()`が返す結果を作る
- サブクラス`ShutdownOnFailure`/`ShutdownOnSuccess`は削除され、同等の`Joiner`を得るファクトリメソッドに置き換えられた。従来`handleComplete`をオーバーライドしていたものは`Joiner.onComplete`に相当する
- スコープ名・タイムアウト・スレッドファクトリを設定する構成オブジェクトを、`Joiner`と一緒に渡せる`open()`も用意された

**JEP 525（[[jdk-26]]）** では`onTimeout()`コールバックが追加され、`allSuccessfulOrThrow()`が`List<T>`を返すよう調整された。

**JEP 533（[[jdk-27]]）** では`StructuredTaskScope`と`Joiner`に3つ目の型パラメータ`R_X`が追加された。`Joiner<T, R>`が`Joiner<T, R, R_X>`になり、`R_X`は`join()`が投げると宣言されている例外の型を表す。あわせて、デフォルトのjoinポリシーを実装しつつ`UnaryOperator`で構成を組み立てる`open()`が追加されている。

## 他言語との比較

[[kotlin-coroutines]]では`CoroutineScope`と親子関係による構造化並行性が言語・ライブラリの標準的な使い方として組み込まれているのに対し、Javaの仮想スレッドは構造化並行性を強制しない。`StructuredTaskScope`を使う側が意識的に採用する必要がある。Goも同様に標準では構造化された取り消し伝播を持たず、`context.Context`を手で伝播させる規約になっている（[[go-context]]参照）。

## 出典

- [JEP 505: Structured Concurrency (Fifth Preview)](https://openjdk.org/jeps/505)
- [JEP 525: Structured Concurrency (Sixth Preview)](https://openjdk.org/jeps/525)
- [JEP 533: Structured Concurrency (Seventh Preview)](https://openjdk.org/jeps/533)
- [JEP 533 Tightens Exception Handling in Java's Structured Concurrency for JDK 27 - InfoQ](https://www.infoq.com/news/2026/05/jep-533-jdk-27/)
- [Java's Structured Concurrency: Finally Finding Its Footing - foojay](https://foojay.io/today/javas-structured-concurrency-finally-finding-its-footing/)

#java #concurrency #jdk
