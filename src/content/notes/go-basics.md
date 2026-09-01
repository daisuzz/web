---
created: "2026-09-01"
---

# Go言語の基礎

他言語（Java/Kotlin/Python/TypeScriptなど）の経験はあるがGoは未経験、という前提で、最短で「読み書きできる」レベルまで到達するための要点をまとめる。「他言語と何が違うか」にフォーカスし、一般的なプログラミングの説明は省く。ISUCON文脈での実践的な使い方（フレームワーク選定、DBアクセス、計測ツール）は[[isucon-go-implementation]]・[[isucon-go-runbook]]を参照。

## 実行モデル

- コンパイル言語。`go run main.go`でコンパイル＋実行、`go build`で単一の実行バイナリを生成する。JVMのようなランタイムやインタプリタは不要で、生成されたバイナリ単体で動く。
- クロスコンパイルが標準機能: `GOOS=linux GOARCH=amd64 go build`のように環境変数を指定するだけで、手元のmacOSから本番Linux向けバイナリを作れる。
- エントリポイントは`package main`の`func main()`。

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```

## 変数・型・ゼロ値

- `var x int = 1`か、型推論する`x := 1`（関数内でのみ使える短縮宣言）。
- 基本型: `int`, `int64`, `float64`, `string`, `bool`, `byte`(`uint8`のエイリアス), `rune`(`int32`のエイリアス、Unicodeコードポイント1つを表す)。
- **未初期化変数という概念がない**。`var x int`は自動的に`0`で初期化される。`string`は`""`、`bool`は`false`、ポインタ/スライス/マップ/interfaceは`nil`。この「ゼロ値」は言語仕様上の保証であり、Goのコードを読むときに頻出する前提。
- 定数は`const`。列挙的に使う場合は`iota`で連番を振る。

```go
type Status int

const (
    StatusPending Status = iota // 0
    StatusRunning                // 1
    StatusDone                   // 2
)
```

## 制御構文

- ループは`for`しかない（`while`相当も`for`で書く）。
  ```go
  for i := 0; i < 10; i++ { }
  for cond { }        // while相当
  for { }              // 無限ループ
  for i, v := range xs { } // イテレーション
  ```
- `switch`は**各caseが自動でbreakする**（他言語のようにfallthroughがデフォルトではない）。次のcaseに続けたい場合だけ明示的に`fallthrough`と書く。
- 例外機構がないため、エラーは早期`return`で弾いてネストを浅く保つのが定石（後述）。

## 関数

- 複数戻り値が言語機能として存在する。エラーハンドリングの`(値, error)`パターンの土台になっている。
  ```go
  func divide(a, b int) (int, error) {
      if b == 0 {
          return 0, fmt.Errorf("divide by zero")
      }
      return a / b, nil
  }
  ```
- 名前付き戻り値、可変長引数(`...int`)、無名関数・クロージャも使える。

### defer

- `defer`は関数のreturn直前（実際にはreturn処理の一部として）に実行される後始末構文。`f.Close()`のような解放処理を確保直後に書けるのが利点。
- 複数の`defer`はLIFO（後入れ先出し）で実行される。
- **引数はdefer文が実行された時点で評価され、実際の呼び出しはreturn時**という点に注意（クロージャで包めば呼び出し時点の値を参照できる）。
- 名前付き戻り値と組み合わせると、deferの中で戻り値を書き換えられる（recoverでpanicを戻り値のerrorに変換する、といった用途で使われる）。

```go
func readFile(path string) (err error) {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()
    // ...
    return nil
}
```

## エラーハンドリング

- 例外機構がない。`error`はただの1メソッドのinterface（`type error interface { Error() string }`）で、失敗しうる関数は最後の戻り値として`error`を返すのが規約。
- 呼び出し側は毎回`if err != nil { return err }`で伝播させる。これがGoコードの大半を占める定型パターン。
- エラーに文脈を追加するときは`fmt.Errorf("...: %w", err)`で**ラップ**する。`%v`ではなく`%w`を使うと、元のエラーへのチェーンが保持され、`errors.Unwrap`で辿れるようになる（Go 1.13から）。
- 特定のエラーかどうかを比較するときは`==`ではなく`errors.Is`（センチネルエラーの一致判定、ラップされていても内部を辿って比較する）、特定の型に変換したいときは`errors.As`を使う。
- `panic`/`recover`は「本当にプログラムを継続できない異常系」専用。通常のエラー処理には使わない。`recover`はdeferの中で直接呼んだときだけ効く。

```go
var ErrNotFound = errors.New("not found")

func find(id int) (*User, error) {
    u, err := repo.Get(id)
    if err != nil {
        return nil, fmt.Errorf("find user %d: %w", id, err)
    }
    return u, nil
}

// 呼び出し側
if errors.Is(err, ErrNotFound) {
    // ...
}
```

## ポインタと値渡し

- 関数呼び出し・代入はデフォルトで値のコピー。構造体を書き換えたい場合や大きな構造体のコピーコストを避けたい場合はポインタ(`*T`)を使う。
- `&x`でアドレスを取り、`*p`で参照先の値にアクセスする。GCがあるのでポインタの解放を自分で管理する必要はない（メモリ安全）。ポインタ演算はできない。

## 構造体とメソッド

- クラスはなく、`struct`（データ）と、それに紐づく`func`（メソッド、レシーバで束ねる）で表現する。
- レシーバは値レシーバ（コピーを受け取る）とポインタレシーバ（元の値を変更できる）を選べる。フィールドを変更するメソッド、または構造体が大きい場合はポインタレシーバにするのが基本方針。
- 継承はなく、構造体の埋め込み(embedding)でフィールド・メソッドを「昇格」させる形でコード再利用する。

```go
type Base struct{ ID int }
func (b *Base) Describe() string { return fmt.Sprintf("id=%d", b.ID) }

type User struct {
    Base
    Name string
}

u := User{Base: Base{ID: 1}, Name: "foo"}
u.Describe() // Baseのメソッドがそのまま呼べる
```

## interface

- **構造的部分型(structural typing)**: 「このinterfaceをimplementsします」という明示的な宣言は不要で、必要なメソッドを実装していれば自動的にそのinterfaceを満たす。Java/Kotlinの`implements`とはここが根本的に異なる。
- 空interface`interface{}`（Go 1.18以降のエイリアス`any`）は任意の型を受け入れる。
- 標準ライブラリの中核はほぼ小さいinterfaceの組み合わせでできている。代表例が`io.Reader`/`io.Writer`（`Read([]byte) (int, error)`/`Write([]byte) (int, error)`の1メソッドだけを持つ）で、ファイル・ネットワーク接続・バッファなどが共通のinterfaceで扱える。

## スライス・マップ・配列

- 配列(`[5]int`)は固定長で値型。実務でよく使うのはスライス(`[]int`)で、内部的にはポインタ・長さ(len)・容量(cap)を持つ「配列への窓」。
- `append`は容量を超えると新しい配列を確保してコピーする（再割り当て）。複数のスライスが同じ配列を共有している状態でappendすると、片方の変更がもう片方に見えたり見えなかったりする挙動があるため注意。
- マップは`make(map[K]V)`または`map[K]V{}`で初期化。`nil`マップは読み取りはできるが書き込むとpanicする。存在確認は`v, ok := m[k]`のカンマokイディオム。
- **スライス・マップはthread-safeではない**。複数goroutineから同時にアクセスする場合は`sync.Mutex`/`sync.RWMutex`か`sync.Map`で保護する必要がある（[[isucon-go-implementation]]でも触れているインメモリキャッシュ実装時の注意点）。

## ジェネリクス

- Go 1.18で導入。型パラメータを関数名・型名の後の`[]`で宣言する。
  ```go
  func Map[T, U any](xs []T, f func(T) U) []U {
      ys := make([]U, len(xs))
      for i, x := range xs {
          ys[i] = f(x)
      }
      return ys
  }
  ```
- 型パラメータには制約(constraint)を指定できる。`any`（任意の型）、`comparable`（`==`が使える型）が組み込み。それ以外はinterfaceとして自作の制約を定義する。
- 呼び出し側で型引数を省略できる場合が多い（コンパイラが引数から推論する）。

## 並行処理: goroutineとchannel

- `go f()`と書くだけで軽量な並行実行単位（goroutine）が起動する。OSスレッドではなく、Goランタイムが少数のOSスレッド上に多数のgoroutineをM:Nでスケジューリングする（GMPモデル）。スタックも数KBから可変長で伸縮するため、数万〜数十万オーダーで起動しても現実的なコストで収まる。
- 他言語の`async`/`await`のような協調的な非同期モデル（[[async-runtime]]参照）とは異なり、goroutineの呼び出し側コードは同期的な見た目のまま書ける。関数呼び出しに`go`を前置するだけで並行実行に切り替わる。
- goroutine間の通信は`channel`（`ch := make(chan int)`、送信は`ch <- v`、受信は`v := <-ch`）。バッファなしchannelは送受信が揃うまでブロックする同期点になり、バッファ付き(`make(chan int, 10)`)は容量まで貯め込める。
- 複数channelを待つには`select`。
- 単に「完了を待つ」「共有state を保護する」だけならchannelより`sync`パッケージの方が素直なことも多い（ISUCON実装では後者が頻出）。

```go
var wg sync.WaitGroup
var mu sync.Mutex
counts := map[string]int{}

for _, key := range keys {
    wg.Add(1)
    go func(k string) {
        defer wg.Done()
        v := fetch(k)
        mu.Lock()
        counts[k] = v
        mu.Unlock()
    }(key)
}
wg.Wait()
```

## パッケージ管理

- `go.mod`が依存関係の定義ファイル（npmの`package.json`、Mavenの`pom.xml`相当）。`go.sum`はロックファイル。
- `go mod init <module-path>`で初期化、`go mod tidy`でimport文から依存を再計算して`go.mod`/`go.sum`を整合させる。オフライン環境向けに依存を同梱する`go mod vendor`は[[isucon-go-runbook]]でも使っている。

## 標準ライブラリ最短ルート（Web開発向け）

- `net/http`: `http.ServeMux`でルーティング、`http.HandlerFunc`でハンドラを書ける。ただしISUCONの初期実装ではecho等のフレームワークが使われることが多い（[[isucon-go-implementation]]参照）。
- `encoding/json`: 構造体タグ（`` `json:"name"` ``）でフィールド名をマッピングし、`json.Marshal`/`json.Unmarshal`で相互変換する。
- `database/sql`: `sql.DB`はコネクションプールそのもの（コネクション1本を表すわけではない）。素で使わず`sqlx`で薄くラップするのが定番（詳細は[[isucon-go-implementation]]）。
- `context.Context`: キャンセル・タイムアウト・締め切りを関数呼び出しの連鎖に伝播させるための型。I/Oを行う関数の第一引数として受け取るのが慣習（`req.Context()`、`db.QueryContext(ctx, ...)`など）。

## テスト

- 標準の`testing`パッケージ＋`go test`コマンドで完結し、追加のテストフレームワークは必須ではない。
- ファイル名は`_test.go`、関数名は`TestXxx(t *testing.T)`。
- テーブル駆動テスト（入力と期待値の組をスライスにして1つのテスト関数でループする書き方）がGoの慣用的なスタイル。`t.Run`でサブテスト化すると個別に実行・報告できる。

## Goらしい書き方

- フォーマットは`gofmt`/`goimports`に完全に委ねる（スタイル論争が発生しない設計）。
- インデントの深いネストを避け、エラーは早期returnで弾く「ガード節」スタイルが好まれる。
- 大文字始まりの識別子はパッケージ外に公開(export)される、小文字始まりは非公開。Java的な`public`/`private`キーワードの代わりに命名規則で表現する。

## 学習の進め方の目安

- [A Tour of Go](https://go.dev/tour/)を通しで触る（半日程度）。このノートの内容と重なるが、実際に手を動かして構文エラーに慣れておくのが目的。
- 本ノートのdefer/error/interface/goroutine周りは、コードを読んでいて引っかかりやすい箇所なので重点的に。
- 過去問の練習環境`private-isu`を実際に手を動かして一通り改善してみる（[[isucon-go-implementation]]の「Go・ISUCON未経験者の準備」参照）。ここまでで実戦投入レベルの土台になる。

## バージョンについて

本ノートの内容はGo 1.26系（2026年2月リリース、2026年8月時点の最新パッチは1.26.7）を前提にしている。ジェネリクス(Go 1.18〜)やエラーラッピング(Go 1.13〜)など言語機能自体は安定して久しいため、記載内容は将来のマイナーバージョンでも大きくは変わらない見込み。

## 出典

- [A Tour of Go](https://go.dev/tour/)
- [Go 1.26 Release Notes](https://go.dev/doc/go1.26)
- [Go 1.26 is released - The Go Programming Language](https://go.dev/blog/go1.26)
- [Working with Errors in Go 1.13 - The Go Programming Language](https://go.dev/blog/go1.13-errors)
- [errors package - Go Packages](https://pkg.go.dev/errors)
- [Tutorial: Getting started with generics - The Go Programming Language](https://go.dev/doc/tutorial/generics)
- [An Introduction To Generics - The Go Programming Language](https://go.dev/blog/intro-generics)

#go #プログラミング言語
