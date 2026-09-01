---
created: "2026-09-01"
---

# Goのcontext.Context

リクエストスコープのキャンセル・デッドライン・値をAPI境界を越えて伝搬させるための型。[[go-basics]]の標準ライブラリ節から詳細を切り出した。

## Contextとは

- `context.Context`はインターフェースで、`Deadline()`/`Done()`/`Err()`/`Value(key)`の4メソッドを持つ。
- サーバーの受信リクエストや複数goroutineをまたぐ処理で、キャンセル・タイムアウト・リクエストスコープの値を伝搬させるために使う。
- 慣習として、I/Oを行う関数の第一引数として渡す（`func Do(ctx context.Context, ...)`）。専用の構造体フィールドとして保持せず、毎回明示的にバケツリレーする。

## 生成・派生

- `context.Background()`: main・初期化・テストなど、処理の起点で使う空のContext。
- `context.TODO()`: どのContextを使うべきか未確定な場合の暫定値。将来的に適切なContextに置き換える前提の目印として使う。
- 派生Contextを作る関数は、いずれも`(親Context) -> (子Context, CancelFunc)`という形を取る。
  - `WithCancel`: 手動キャンセル可能な子を作る。
  - `WithDeadline`: 指定した時刻でキャンセルされる子を作る。
  - `WithTimeout`: `WithDeadline(parent, time.Now().Add(d))`のショートハンド。
  - `WithValue`: リクエストスコープの値を1つ紐づけた子を作る。

親がキャンセルされると、そこから派生した子Contextはすべて連鎖的にキャンセルされる。

## キャンセルの伝え方: Done()チャネル

`Done()`は、キャンセルされた・デッドラインを過ぎたときにcloseされるchannelを返す。典型的には`select`文で監視する。

```go
func worker(ctx context.Context, jobs <-chan Job) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err() // context.Canceled または context.DeadlineExceeded
        case job := <-jobs:
            process(job)
        }
    }
}
```

`WithCancel`/`WithDeadline`/`WithTimeout`が返す`CancelFunc`は、処理が正常終了した場合も`defer cancel()`で必ず呼ぶ。呼ばないと親Contextとの関連付け（`WithDeadline`/`WithTimeout`なら内部のタイマーも）が解放されずリークする。

## WithValueの使いどころと注意

- `WithValue`は「関数の任意引数の代わり」として使うものではなく、トレースIDや認証情報のような、複数関数・複数goroutineを横断して必要になるリクエストスコープのデータ専用。
- キーの型には`string`のような組み込み型ではなく、パッケージ内だけのunexported型を使うのが慣習。異なるパッケージ同士でキーが衝突するのを防ぐため。

```go
type ctxKey int

const requestIDKey ctxKey = 0

ctx = context.WithValue(ctx, requestIDKey, "abc123")
id, ok := ctx.Value(requestIDKey).(string)
```

## Web開発での典型的な使い方

- `net/http`: `r.Context()`でリクエストに紐づくContextを取得できる。クライアントが接続を切ると、このContextがキャンセルされる。
- `database/sql`: `db.QueryContext(ctx, ...)`のように渡すと、リクエストがキャンセルされた時点でクエリも中断できる。

## バージョンについて

本ノートの内容はGo 1.26系（2026年2月リリース）を前提にしている。`context`パッケージ自体は`golang.org/x/net/context`から昇格する形でGo 1.7（2016年8月）から標準ライブラリ入りしており、以降API自体に大きな変更はない。

## 出典

- [context package - Go Packages](https://pkg.go.dev/context)
- [Go 1.7 Release Notes - The Go Programming Language](https://go.dev/doc/go1.7)

#go #context #並行処理
