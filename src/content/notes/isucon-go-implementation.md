---
created: 2026-08-22
updated: 2026-09-03
---

# ISUCONにおけるGo実装

[[isucon]] を戦う際、言語にGoを選んだ場合に定番となる技術スタックと改善手法。競技開始直後に実際に打つコマンド・書くコードは[[isucon-go-runbook]]にまとめてある。

## 定番の技術スタック

```mermaid
flowchart LR
    Bench[ベンチマーカー] --> Nginx[nginx]
    Nginx --> Echo["echo(Webフレームワーク)"]
    Echo --> Sqlx["sqlx(薄いラッパー)"]
    Sqlx --> Driver[go-sql-driver/mysql]
    Driver --> MySQL[(MySQL)]
    Echo -.計測.-> Pprof["net/http/pprof"]
```

- **Webフレームワーク**: 近年の初期実装では[[echo-go-framework]]が使われることが多い。最小限のコードで動き、シンプルなルーティングとミドルウェア機構を持つ。
- **DBアクセス**: `database/sql` を素で使わず、`jmoiron/sqlx` で薄くラップして使うのが定番。構造体への自動マッピングなどが書きやすくなる。使い方の詳細は[[sqlx]]を参照。
- **DBドライバ**: MySQLなら `go-sql-driver/mysql`。

## 初見のコードを読み解く視点

ボトルネック特定に入る前に、まずコードの構造を把握しておくと以降の調査が速い。

- **ルーティング一覧を先に俯瞰する**: `main.go`（または`http.go`等）で`e.GET`/`e.POST`などの定義を全部拾い、どのURLがどのハンドラに繋がっているか一覧化する。
- **`POST /initialize`を確認する**: ベンチマーク実行前にDB・キャッシュを初期状態へ戻すエンドポイント。中で流しているSQL・シェルコマンドを読むと、初期データの構造とスキーマの全体像がつかめる。
- **ミドルウェアの適用範囲を確認する**: Root（`e.Use`）・Group（`g.Use`）・Route単位のどこで何が効いているかを洗い出す。認証チェックがどのミドルウェアで行われ、`c.Set`/`c.Get`でどう値をハンドラに受け渡しているかを追うと、ハンドラ内の「認証済み前提」のコードが理解しやすくなる。
- **ハンドラ内のDBアクセスを1つずつ確認する**: `sqlx`の`Get`/`Select`呼び出しが`for`ループの中にないか（N+1クエリ）をまず疑う。見つかった後の定石は下の「過去のボトルネックと解消事例」を参照。
- **静的ファイル配信の経路を確認する**: `e.Static`/`e.File`がアプリケーションサーバー内で使われているか、nginx側で完結しているか。
- **セッションストアの実装を確認する**: Cookieに値を直接載せているか、DB/Redis等サーバー側ストレージを使っているか。

Echo自体のルーティング・Context・ミドルウェアの基本的な使い方は[[echo-go-framework]]にまとめた。

## Go特有の計測・最適化ツール

- **pprof**: `net/http/pprof` を組み込み、CPU/メモリプロファイルを取得する。CPUがボトルネックになるレベルまでN+1解消やキャッシュ導入が進んでから真価を発揮する。`github.com/pkg/profile` でラップして使う例もある。
- **goccy/go-json**: 標準の`encoding/json`と互換のドロップイン高速JSONエンコーダ/デコーダ。
- **golang.org/x/sync/singleflight**: 同一キーへの同時リクエストを1つの実行にまとめる。キャッシュのthundering herd対策に使える。
- **mazrean/isucon-go-tools**: ISUCON向けにprofiler・cache・DB・HTTP・コネクションプールまわりの計装やコード書き換えを提供するユーティリティ集。

## 過去のボトルネックと解消事例

定石を機械的に当てはめるのではなく、alp/pprof/pt-query-digestの実測結果に基づいて手を入れる箇所を決める必要がある。あるISUCON13参加チームは、N+1クエリを解消してもスコアが伸びず、pt-query-digestで見ると実は別のクエリが支配的ボトルネックだったと報告している。

| 観点 | 症状 | 解消方法 |
|---|---|---|
| N+1クエリ | ループ内で1件ずつSELECTしている | JOINへの書き換え、`IN`句でのバルクフェッチ、インメモリキャッシュ化 |
| 都度再計算される集計処理 | 決済処理などで「直近の取引件数」のような集計をリクエストのたびにループで数え直しており、データが増えるほど重くなる。ISUCON14で上位チームが踏んだボトルネックの1つ | 集計結果をキャッシュ・増分更新し、毎回全件を舐めないようにする |
| キャッシュ更新時のThundering Herd | キャッシュミス時に大量リクエストが同時にDBへ殺到する | `golang.org/x/sync/singleflight`で同一キーへの同時実行を1本化。ISUCON12優勝チームはこれで20万〜27万点の間で不安定だったスコアを安定化させた |
| CPU重い処理（bcryptなど） | パスワードハッシュ計算のようなCPUバウンドな処理が支配的になる。pprofのCPUプロファイルで発覚するのが定番パターン | コストパラメータの見直し、検証結果のキャッシュ |
| 静的ファイル配信 | 画像・JS・CSS等をアプリケーションサーバー経由で返している | nginxに配信を委譲してAPサーバーの負荷を下げる |
| 画像/アイコン配信 | `/api/user/.../icon`のような画像配信エンドポイントがボトルネック化 | ハッシュ値をインメモリキャッシュしつつ画像本体はローカルファイルシステムに配置。`/initialize`実行時にキャッシュをパージする |
| セッションストア | セッションをMySQL等のRDBに保存し、大量I/Oでボトルネック化 | Redis/Memcachedなどのin-memory KVSに移行してDBの負荷を分離する |
| 外部HTTPリクエスト | `http.Client`を毎回生成、または`http.DefaultClient`をそのまま使い、`Transport`の`MaxIdleConnsPerHost`のデフォルト値(2)が並列リクエストのボトルネックになる | `http.Client`/`Transport`をグローバルで使い回し、`MaxIdleConnsPerHost`を大きめ（1000など）に設定する。レスポンスボディを確実に読み切ってCloseし、コネクション再利用を成立させる |
| DNS解決 | DNSレコードのTTL・cache-ttl設定が0でキャッシュが効かず、毎回名前解決が走る | TTL/cache-ttl設定を見直してキャッシュを有効化する |
| CPU以外のリソース | 全ホストでCPU使用率に余裕があるのにスコアが伸びない | ネットワーク帯域やファイルディスクリプタ数など、CPU以外のリソースも多面的に監視する |

## チューニング例（before/after）

上の表のうち、実際のコードでどう書き換えるかが分かりにくいものをbefore/afterで示す。

### N+1クエリの解消（[[sqlx]]のInでバルクフェッチ）

```go
// before: ループの中で1件ずつSELECTしている（N+1）
var items []Item
db.Select(&items, "SELECT * FROM items")
for i := range items {
    var user User
    db.Get(&user, "SELECT * FROM users WHERE id = ?", items[i].UserID)
    items[i].User = user
}

// after: IN句でまとめて取得し、Go側のmapでルックアップする
var items []Item
db.Select(&items, "SELECT * FROM items")

userIDs := make([]int, len(items))
for i, item := range items {
    userIDs[i] = item.UserID
}
query, args, _ := sqlx.In("SELECT * FROM users WHERE id IN (?)", userIDs)
query = db.Rebind(query)
var users []User
db.Select(&users, query, args...)

userByID := make(map[int]User, len(users))
for _, u := range users {
    userByID[u.ID] = u
}
for i := range items {
    items[i].User = userByID[items[i].UserID]
}
```

クエリ発行数がitemsの件数分から2回（items取得＋users一括取得）に減る。

### コネクションプールの明示設定

```go
// before: 上限を設定していない（Goのデフォルトは実質無制限）
db, err := sqlx.Open("mysql", dsn)

// after: 上限を明示する
db, err := sqlx.Open("mysql", dsn)
db.SetMaxOpenConns(10)
db.SetMaxIdleConns(10)                 // SetMaxOpenConns以上の値にする
db.SetConnMaxLifetime(10 * time.Second) // 「最大接続数×1秒」程度が目安
```

無制限のままだとリクエスト急増時にMySQL側の`max_connections`を食い潰して接続エラーが多発する。数値はMySQL側の設定・APサーバーの台数に応じて調整する。

### interpolateParamsでラウンドトリップ削減

```go
// before: プレースホルダがサーバーサイドprepared statementとして送られる（Prepare→Execute→Closeの3往復）
dsn := "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=true&loc=Local"

// after: クライアント側で単一のクエリ文字列に埋め込んでから送る（1往復）
dsn := "user:password@tcp(localhost:3306)/dbname?charset=utf8mb4&parseTime=true&loc=Local&interpolateParams=true"
```

DSNオプション1つの変更で全クエリに効く分コストパフォーマンスが良い改善策。詳細（マルチバイト文字コードと併用できない制約など）は[[isucon-go-runbook]]の「MySQLドライバのDSNオプション」を参照。

### Bulk Insert

```go
// before: INSERTをループで1件ずつ実行
for _, item := range items {
    db.NamedExec(`INSERT INTO items (name, price) VALUES (:name, :price)`, item)
}

// after: VALUES句を組み立てて1クエリにまとめる
placeholders := make([]string, 0, len(items))
args := make([]interface{}, 0, len(items)*2)
for _, item := range items {
    placeholders = append(placeholders, "(?, ?)")
    args = append(args, item.Name, item.Price)
}
query := "INSERT INTO items (name, price) VALUES " + strings.Join(placeholders, ",")
_, err := db.Exec(query, args...)
```

`NamedExec`は1レコード単位でのバインドしかできないため、複数レコードをまとめる場合はプレースホルダを手動で組み立てて`Exec`を使う。

## ハマりどころ・注意点

- Goの`slice`や`map`はthread safeではないため、インメモリキャッシュを実装する際は`sync.Mutex`/`sync.RWMutex`（あるいは`sync.Map`）での保護が必須。
- HTMLテンプレートはリクエストごとに`.ParseFiles`せず、起動時に一度パースしてグローバル変数に保持する。
- DBのコネクションプールは`SetMaxOpenConns`/`SetMaxIdleConns`で明示的に上限を設定する（Goのデフォルトは無制限）。`SetMaxIdleConns`は`SetMaxOpenConns`以上の値にし、`SetConnMaxLifetime`は概ね「最大接続数×1秒」程度を目安にする。

## Go・ISUCON未経験者の準備

- Goの基本文法（他言語との違いに絞った要点）は[[go-basics]]にまとめてある。[A Tour of Go](https://go.dev/tour/)と合わせてひととおり触っておく。
- [[sqlx]]の使い方（`Select`/`Get`/`NamedExec`など）を事前に触っておく。
- 過去問の練習環境として配布されている `private-isu` を実際に手を動かして一通り改善してみる。
- チーム内でGoのバージョンと`goimports`のルールを事前に統一しておく（当日のコード衝突・フォーマット崩れを防ぐ）。
- デプロイ手順を決めておく（手元でLinux向けバイナリをビルドして`scp`で転送する方式が定番）。

## 出典

- [Go の pprof で ボトルネックを探して ISUCON で優勝する - Zenn](https://zenn.dev/team_soda/articles/d4701665e8a3a7)
- [GitHub - mazrean/isucon-go-tools](https://github.com/mazrean/isucon-go-tools)
- [GitHub - goccy/go-json](https://github.com/goccy/go-json)
- [sql.DBのチューニング方法 - Qiita](https://qiita.com/go_sagawa/items/11929cd0883608a6888d)
- [mercari_go_isucon.md (catatsuy)](https://gist.github.com/catatsuy/e627aaf118fbe001f2e7c665fda48146)
- [GitHub - catatsuy/memo_isucon](https://github.com/catatsuy/memo_isucon)
- [ISUCON12で優勝しました(チーム NaruseJun) - Zenn](https://zenn.dev/tohutohu/articles/8c34d1187e1b21)
- [ISUCON11予選惨敗してきました - Zenn (catatsuy)](https://zenn.dev/catatsuy/articles/6265ca623545ed)
- [ISUCON13に参加した話 - くっきーの備忘録](https://blog.ck9.jp/post/240/)
- [GoのキャッシュライブラリRapidashをISUCON問題で試す - Qiita](https://qiita.com/kanataxa/items/981e16e1db97e7187b64)
- [ISUCON14 受賞チームおよび全チームスコア : ISUCON公式Blog](https://isucon.net/archives/58837992.html)
- [takonomura/isucon14 - GitHub（ISUCON14優勝チームのリポジトリ）](https://github.com/takonomura/isucon14)

#isucon #go #パフォーマンスチューニング #pprof
