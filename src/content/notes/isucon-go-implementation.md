---
created: 2026-08-22
---

# ISUCONにおけるGo実装

[[isucon]] を戦う際、言語にGoを選んだ場合に定番となる技術スタックと改善手法。

## 定番の技術スタック

- **Webフレームワーク**: 近年の初期実装では [echo](https://echo.labstack.com/) が使われることが多い。最小限のコードで動き、シンプルなルーティングとミドルウェア機構を持つ。
- **DBアクセス**: `database/sql` を素で使わず、`jmoiron/sqlx` で薄くラップして使うのが定番。構造体への自動マッピングなどが書きやすくなる。
- **DBドライバ**: MySQLなら `go-sql-driver/mysql`。

## Go特有の計測・最適化ツール

- **pprof**: `net/http/pprof` を組み込み、CPU/メモリプロファイルを取得する。CPUがボトルネックになるレベルまでN+1解消やキャッシュ導入が進んでから真価を発揮する。`github.com/pkg/profile` でラップして使う例もある。
- **goccy/go-json**: 標準の`encoding/json`と互換のドロップイン高速JSONエンコーダ/デコーダ。
- **golang.org/x/sync/singleflight**: 同一キーへの同時リクエストを1つの実行にまとめる。キャッシュのthundering herd対策に使える。
- **mazrean/isucon-go-tools**: ISUCON向けにprofiler・cache・DB・HTTP・コネクションプールまわりの計装やコード書き換えを提供するユーティリティ集。

## ハマりどころ・注意点

- Goの`slice`や`map`はthread safeではないため、インメモリキャッシュを実装する際は`sync.Mutex`/`sync.RWMutex`（あるいは`sync.Map`）での保護が必須。
- HTMLテンプレートはリクエストごとに`.ParseFiles`せず、起動時に一度パースしてグローバル変数に保持する。
- DBのコネクションプールは`SetMaxOpenConns`/`SetMaxIdleConns`で明示的に上限を設定する（Goのデフォルトは無制限）。`SetMaxIdleConns`は`SetMaxOpenConns`以上の値にし、`SetConnMaxLifetime`は概ね「最大接続数×1秒」程度を目安にする。

## Go・ISUCON未経験者の準備

- Goの基本文法は [A Tour of Go](https://go.dev/tour/) でひととおり触っておく。
- `sqlx`の使い方（`Select`/`Get`/`NamedExec`など）を事前に触っておく。
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

#isucon #go #パフォーマンスチューニング #pprof
