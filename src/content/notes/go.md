---
created: "2026-10-12T10:00:00+09:00"
---
# Go

Go言語まわりのノートを束ねるハブノート。

## 言語・ランタイム

- [[go-basics]] — 入口。他言語経験者向けに、ゼロ値・多値返却によるエラーハンドリング・interface・goroutine/channelなど「他言語と何が違うか」を最短でまとめたもの。
- [[go-context]] — `context.Context`。キャンセル・デッドライン・リクエストスコープの値をAPI境界越しに伝搬させる型。[[go-basics]]の標準ライブラリ節から切り出し。
- [[go-goroutine-scheduler]] — goroutineを大量に起動しても安く動く理由。G/M/PのGMPモデル、work-stealing、プリエンプション、sysmon。[[go-basics]]のgoroutine節から切り出し。

## ライブラリ・フレームワーク

- [[echo-go-framework]] — `net/http`の上に乗るミニマリスト志向のWebフレームワーク。ルーター・ミドルウェア・バインディング・一元化されたエラーハンドリング。
- [[sqlx]] — `database/sql`のスーパーセットになっている薄いラッパー。構造体への自動マッピング（`Get`/`Select`）や名前付きパラメータ、IN句展開。

#go #moc
