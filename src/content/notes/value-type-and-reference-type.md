---
created: "2026-11-15T18:32:00+09:00"
---

# 値型と参照型

値型と参照型の違いは、**変数に何が入っているか**。

| | 値型 (value type) | 参照型 (reference type) |
|---|---|---|
| 変数の中身 | インスタンスそのもの | インスタンスへの参照（アドレス） |
| 代入・引数渡し | 中身がまるごとコピーされる | 参照だけがコピーされ、同じ実体を共有する |
| 片方を変更すると | もう片方は影響を受けない | もう片方からも変更が見える |
| 同一性 (identity) | なし（値が同じなら区別しない） | あり（値が同じでも別の実体として区別できる） |
| null | 基本的には持てない | 持てる |

## 例（C#）

```csharp
struct PointS { public int X; }   // 値型
class  PointC { public int X; }   // 参照型

var a = new PointS { X = 1 };
var b = a;      // 中身をコピー
b.X = 99;       // a.X == 1 のまま

var c = new PointC { X = 1 };
var d = c;      // 参照をコピー（同じオブジェクトを指す）
d.X = 99;       // c.X == 99 になる
```

メソッドに渡すときも同じ。structを値渡しすると、メソッドは自分専用のコピーを受け取る。classを渡すと、メソッドが受け取るのはインスタンスのアドレスのコピーなので、メソッド内での変更が呼び出し元にも見える。

## コピーは浅い

値型が参照型のフィールドを持っている場合、値型をコピーしてもそのフィールドは参照がコピーされるだけ。指している先の実体は共有されたままになる。

## 言語ごとの決まり方

| 言語 | 値型か参照型かを決めるもの |
|---|---|
| C++ | **使う側**。`T`（値）／`T&`（参照）／`T*`（ポインタ）／`std::shared_ptr<T>`（共有所有）から選ぶ。structかclassかは関係ない（[[cpp-struct-and-class]]） |
| C# / Swift | **型の定義側**。`struct`なら値型、`class`なら参照型 |
| Java | プリミティブ（`int`など）が値型で、オブジェクトはすべて参照型 |
| Go | 代入・関数呼び出しはデフォルトで値のコピー。共有したいときはポインタ（`*T`）を使う（[[go-basics]]） |

## immutableとの関係

値型はコピーされるので、意図しない共有が起きにくく、immutableと相性が良い。.NETの設計ガイドラインでも、インスタンスが小さい・短命・immutableといった条件を満たすときにstructを検討するよう勧めている。

参照型は共有されるので、どこか1か所で変更すると他の場所にも波及する。そのため、参照型では「変更されないこと」の保証がより重要になる。C++でimmutableにする手段については[[cpp-const]]。

## 出典

- [Value types - C# reference | Microsoft Learn](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/value-types)
- [How to: Know the Difference Between Passing a Struct and Passing a Class Reference to a Method (MSDN)](https://msdn.microsoft.com/en-US/library/8b0bdca4(v=vs.100))
- [Choosing Between Class and Struct - Framework Design Guidelines | Microsoft Learn](https://learn.microsoft.com/dotnet/standard/design-guidelines/choosing-between-class-and-struct)
- [C# Concepts: Value vs Reference Types (Joseph Albahari)](https://www.albahari.com/valuevsreftypes.aspx)

#プログラミング言語 #型システム #immutable
