---
created: "2026-11-15T18:31:00+09:00"
---

# C++のconst

C++には「immutableな型」を宣言する専用のキーワードはない。[[cpp-struct-and-class]]のどちらで定義した型も、デフォルトではmutable。変更できなくするには`const`を付ける。付けられる場所が何通りかある。

## 1. オブジェクトをconstにする

一番よく使う方法。変更できるかどうかは「型」ではなく、「その変数（オブジェクト）」ごとに決まる。

```cpp
const Point p{1, 2};
p.x = 3;   // コンパイルエラー
```

## 2. constメンバ関数

`const`オブジェクトから呼べるのは、`const`を付けたメンバ関数だけ。

```cpp
class Counter {
    int n_ = 0;
public:
    int get() const { return n_; }  // const オブジェクトからも呼べる
    void inc() { ++n_; }            // const オブジェクトからは呼べない
};
```

## 3. メンバ自体をconstにする

```cpp
struct Point { const int x; const int y; };
```

生成した後は書き換えられなくなり、型として「必ずimmutable」になる。ただし副作用がある。コピー代入演算子が暗黙にdeleteされるので、`p1 = p2`ができない。そのせいで`std::vector`の要素などとして扱いにくい。実務では、メンバを`private`にしてgetterだけを公開する設計にすることが多い。

## 抜け道・補足

- **`mutable`**: `const`オブジェクトの中でも変更できるメンバ。キャッシュやmutexなど、論理的な状態ではないものに使う。
- **`const_cast`**: constを外すキャスト。キャストすること自体は合法。ただし、もともと`const`として定義されたオブジェクトを書き換えると**未定義動作**になる。もともと非constだったオブジェクトを、`const`参照から`const_cast`して書き換えるのは問題ない。
- **`constexpr`**（C++11〜）: コンパイル時に値が決まる定数。constexprな変数は暗黙に`const`になる。
- **constは浅い**: constオブジェクトがポインタをメンバに持っている場合、const になるのはポインタ自体だけ（`int* const`扱い）。指している先の値は変更できる。

## バージョンについて

`const`オブジェクト、constメンバ関数、`mutable`、`const_cast`はC++98からある機能。`constexpr`だけはC++11で導入された。

## 出典

- [cv (const and volatile) type qualifiers - cppreference.com](https://en.cppreference.com/w/cpp/language/cv)
- [const_cast conversion - cppreference.com](https://en.cppreference.com/w/cpp/language/const_cast)
- [[dcl.type.cv] - C++ draft (N4659)](https://www.ece.uvic.ca/~frodo/cppdraft/n4659/html/dcl.type.cv)

#cpp #プログラミング言語 #immutable
