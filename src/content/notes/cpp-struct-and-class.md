---
created: "2026-11-15T18:30:00+09:00"
---

# C++のstructとclass

C++の`struct`と`class`は、**デフォルトのアクセス指定以外は同じもの**。cppreferenceも「class keyの`struct`と`class`は、デフォルトのメンバアクセスとデフォルトの継承モード以外は区別できない」と書いている。

| | `struct` | `class` |
|---|---|---|
| メンバのデフォルトアクセス | `public` | `private` |
| 基底クラスのデフォルト（継承） | `public`継承 | `private`継承 |

```cpp
struct S { int x; };   // x は public
class  C { int x; };   // x は private

struct D1 : Base {};   // public 継承
class  D2 : Base {};   // private 継承
```

- コンストラクタ・デストラクタ・仮想関数・テンプレート・演算子オーバーロードなどは、どちらでも全部使える。
- 継承のデフォルトを決めるのは**派生クラス側**のキーワード。基底クラスがどちらで宣言されているかは関係ない。
- `union`もメンバのデフォルトアクセスは`public`。

## 慣習的な使い分け

言語のルールではなく、慣習としてこう使い分けることが多い。

- `struct`: 不変条件を持たず、データを束ねるだけの型（集約型）。メンバは公開する。例: `struct Point { int x, y; };`
- `class`: 不変条件を持ち、内部状態を`private`で隠して、メンバ関数経由でだけ操作させる型。

## 値型か参照型か

C#やSwiftでは`struct`が値型、`class`が参照型と分かれているが、C++にはその区別はない。C++ではstructもclassも値型で、代入するとコピーになる。参照のように扱いたいときは、使う側で`T&`・`T*`・`std::shared_ptr<T>`を選ぶ。詳しくは[[value-type-and-reference-type]]。

## immutableかどうか

structでもclassでもデフォルトはmutable。変更できなくするには`const`を組み合わせる。→ [[cpp-const]]

## バージョンについて

`struct`/`class`のデフォルトアクセスと継承のルールは、最初の標準規格（C++98）から変わっていない。どのバージョンの規格でも同じように成り立つ。

## 出典

- [Class declaration - cppreference.com](https://en.cppreference.com/w/cpp/language/class)
- [Access specifiers - cppreference.com](https://en.cppreference.com/w/cpp/language/access)
- [Derived classes - cppreference.com](https://en.cppreference.com/w/cpp/language/derived_class)

#cpp #プログラミング言語
