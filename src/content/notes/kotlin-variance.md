---
created: "2026-09-01"
---
# Kotlinのin/out（宣言サイド変性）

ジェネリクスの型パラメータに`out`/`in`を付けて、そのクラス・インターフェースが型パラメータをどう使うかを宣言時に一箇所で指定する仕組み。Javaのワイルドカード(`? extends T`/`? super T`)を使用サイドで毎回書く代わりに、宣言サイドで一度だけ決める。

## 覚え方: out=出す係、in=受け取る係

- `out T`: `T`を**返す（produce）**ことしかしない → 共変（covariant）。`C<Derived>`を`C<Base>`として使える。
- `in T`: `T`を**受け取る（consume）**ことしかしない → 反変（contravariant）。`C<Base>`を`C<Derived>`として使える。

「outは外にTを出す」「inは中にTを入れる（受け取る）」と読むと英単語のイメージ通り。

型システムはこの宣言を強制する。`out T`と書くと、そのメンバー関数の**引数**の位置に`T`を使うとコンパイルエラーになる。`in T`と書くと**戻り値**の位置に`T`を使うとコンパイルエラーになる。

## `out`の例: `List<out T>`

```kotlin
interface Source<out T> {
    fun nextT(): T   // Tを返すだけ
}

fun demo(strs: Source<String>) {
    val objects: Source<Any> = strs  // OK
}
```

標準ライブラリの`List<out E>`がこれ。`List<String>`は`List<Any>`として渡せる。読み出すだけなので安全。

## `in`の例: `Comparable<in T>`

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int   // Tを受け取るだけ
}

fun demo(x: Comparable<Number>) {
    val y: Comparable<Double> = x  // OK
}
```

「`Number`と比較できるなら、`Number`のサブタイプである`Double`とも当然比較できる」という直感に合う。

[[kotlin-coroutines]]で出てくる`Continuation<in T>`も同じ理屈。`Continuation`は`resumeWith(Result<T>)`で`T`を受け取るだけで返すことはないので`in`。

## どちらのアノテーションも付けられない場合

引数と戻り値の両方に型パラメータが登場するなら`out`も`in`も付けられず、invariant（不変）のまま。`MutableList<T>`が好例で、`add(T)`で受け取り`get(): T`で返すため両方に登場し、共変にも反変にもできない。

## PECSとの対応

Effective Javaの語呂合わせ「PECS: Producer-Extends, Consumer-Super」がそのままKotlinにも対応する。

| Java（使用サイド） | Kotlin（宣言サイド） | 役割 |
|---|---|---|
| `? extends T` | `out T` | Producer（出す） |
| `? super T` | `in T` | Consumer（受け取る） |

Kotlinはクラス定義側で一度decideすれば済むため、使う側で毎回ワイルドカードを書く必要があるJavaより簡潔になる。

## 判定の最短ルート

1. 関数の**引数**にだけ登場する型パラメータ → `in`
2. 関数の**戻り値**にだけ登場する型パラメータ → `out`
3. 両方に登場するなら、どちらも付けられない（invariant）

## 余談: Goのジェネリクスにはvarianceの概念自体がない

[[go-basics]]のジェネリクスは型パラメータの制約(constraint)は持つが、共変・反変というvarianceの概念自体を持たない。Kotlin/Javaのこの手のin/out変性は、あらゆるジェネリクス言語に共通の話ではなく、型システムの設計によって有無が分かれる。

## 出典

- [Generics: in, out, where | Kotlin Documentation](https://kotlinlang.org/docs/generics.html)
