---
created: "2026-09-03"
---

# sqlx (Go)

Goの`database/sql`を薄くラップするライブラリ(`jmoiron/sqlx`)。`sql.DB`/`sql.Tx`/`sql.Stmt`など標準のインターフェースをそのまま包含したスーパーセットになっているため、既存の`database/sql`ベースのコードに後から段階的に導入できる。[[isucon-go-implementation]]で触れているとおり、ISUCONのGo実装では`database/sql`を素で使わずsqlxで薄くラップするのが定番。

## ハンドル型

- `sqlx.DB`: `sql.DB`相当（コネクションプールそのものを表す）
- `sqlx.Tx`: `sql.Tx`相当（トランザクション）
- `sqlx.Stmt`: `sql.Stmt`相当（プリペアドステートメント）
- `sqlx.NamedStmt`: 名前付きパラメータに対応したプリペアドステートメント

## Get / Select: 構造体への自動マッピング

```go
// 1行取得。0件ならsql.ErrNoRowsを返す
var user User
err := db.Get(&user, "SELECT * FROM users WHERE id = ?", id)

// 複数行取得。スライスに自動マッピングされる
var users []User
err := db.Select(&users, "SELECT * FROM users WHERE team_id = ?", teamID)
```

内部で`StructScan`が使われ、カラム名と構造体タグ(`` `db:"..."` ``)を自動マッピングする。埋め込み構造体(embedded struct)にも対応している。

## NamedExec / NamedQuery: 名前付きパラメータ

```go
_, err := db.NamedExec(
    `INSERT INTO users (name, team_id) VALUES (:name, :team_id)`,
    user, // structまたはmap[string]interface{}
)

rows, err := db.NamedQuery(`SELECT * FROM users WHERE team_id = :team_id`, arg)
```

`:name`のような名前付きプレースホルダをサポートし、struct/mapのフィールドから自動的に値を抽出してバインドする。

## In: IN句の展開

```go
query, args, err := sqlx.In("SELECT * FROM users WHERE id IN (?)", idList)
query = db.Rebind(query) // プレースホルダをドライバの記法に変換（MySQLは?のまま、PostgreSQLは$1,$2...に変換）
db.Select(&users, query, args...)
```

スライスを渡すと要素数ぶんプレースホルダを自動展開する。N+1クエリをバルクフェッチに書き換える際の定番の道具。具体的な書き換え例は[[isucon-go-implementation]]を参照。

## Preparex / Beginx

```go
stmt, err := db.Preparex("SELECT * FROM users WHERE id = ?") // sqlx拡張のGet/Select等が使えるプリペアドステートメント

tx, err := db.Beginx()           // sqlx対応のトランザクション開始
tx, err := db.BeginTxx(ctx, nil) // contextを伝播させる版
```

`Tx`内でも`Get`/`Select`/`NamedExec`など上記のメソッドがすべて同様に使える。`ctx`を伝播させる`Context`サフィックス付きメソッド（`GetContext`/`SelectContext`/`NamedExecContext`など）も一通り用意されており、[[go-context]]で触れているリクエストスコープのキャンセルをDBアクセスまで伝える場合はそちらを使う。

## バージョンについて

本ノートの内容はsqlx v1.4.0（2024年4月23日リリース）を前提にしている。

## 出典

- [sqlx package - pkg.go.dev](https://pkg.go.dev/github.com/jmoiron/sqlx)
- [jmoiron/sqlx - GitHub](https://github.com/jmoiron/sqlx)
- [Releases · jmoiron/sqlx - GitHub](https://github.com/jmoiron/sqlx/releases)

#go #sqlx #database
