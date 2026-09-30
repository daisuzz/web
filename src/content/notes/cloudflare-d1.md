---
created: "2026-09-29T12:10:00+09:00"
updated: "2026-09-30"
---
# Cloudflare D1

Cloudflareのマネージドなサーバーレスデータベース。SQLiteのSQLセマンティクスを持ち、[[cloudflare-workers]]のバインディングやHTTP APIから使える。「アプリサーバーがネットワーク越しにDBを叩く」というおなじみの構成で使える、全部入りのリレーショナルDB製品。

## 特徴

- **SQLite互換**: SQLiteのSQLをそのまま書ける。WorkersからはD1のClient API（`env.DB.prepare(...).bind(...).run()`、`db.batch()`）で使う
- **HTTP APIがある**: Workers以外の外部からもクエリを投げられるので、サードパーティのツールとつなぎやすい。[[cloudflare-durable-objects]]のSQLiteはWorkersからしかアクセスできないので、ここが違いの1つ
- **マイグレーション、import/export、クエリインサイト**などのDB運用機能が最初から揃っている
- **Time Travel**: バックアップ兼ポイントインタイムリカバリ。直近30日（Freeは7日）の任意の1分単位の時点に戻せる
- **DBを大量に作れる**: 分離のためにDBを数千個作っても追加料金はかからない（料金はクエリとストレージのみ）。1アカウントあたり5万DB（Paid）で、申請すれば数百万〜数千万まで増やせる
- 内部実装はDurable Objectsの上に作られている

## 配置とリードレプリカ

- リードレプリカを使わない場合、読み書きのクエリはすべて世界のどこか1か所の**プライマリ**インスタンスに送られる。そのためレイテンシはプライマリとの物理的な距離で決まる。作成時にlocation hintで場所を指定できる
- **グローバルリードレプリケーション**（ベータ）を有効にすると、読み込み専用のレプリカが複数のリージョンに非同期で作られる。読み込みは近くのレプリカで処理され、書き込みは常にプライマリに転送される
- レプリカには遅延（replica lag）があるので、**Sessions API**（`env.DB.withSession(...)`）で順序整合性（sequential consistency）を保証する。各クエリにbookmarkがついていて、同じセッション内では「前に見たものより古いデータは見えない」ことが保証される
  - `withSession()`（= `"first-unconstrained"`）: 最初のクエリはどのインスタンスで処理してもよい。最新である必要がない場合向け
  - `withSession("first-primary")`: 最初のクエリをプライマリに送って最新の状態から始める
  - `withSession(bookmark)`: 以前のセッションのbookmarkを引き継いで続ける（例: HTTPヘッダでクライアントに渡しておく）
- アプリ（Worker）とDBは同じ場所にないので、レイテンシが気になるときはWorkersのSmart Placementで、Workerを実行する場所をDBの近くに寄せる

## Durable Objects（SQLite）との使い分け

どちらも中身はSQLiteで、SQLクエリの料金・制限も揃えられている。違いは抽象度。

- **D1**: マネージドなDB製品。1つの共有DBを複数のWorkerから使う、よくある構成向け。運用ツール付き
- **Durable ObjectsのSQLite**: 分散システムを組むための低レベルな部品。ロジックとDBが同じマシンで動き、ユーザー・テナント単位の小さなDBを大量に持つ用途や、リアルタイム協調向け

公式の選び方ガイドでは、D1は「読み込みが多く、グローバルなユーザーがリードレプリカの恩恵を受けられ、伝統的なRDBMSを管理したくない軽量なサーバーレスアプリ」向けとされている。既存のPostgres/MySQLを使いたい場合や、1TB以上の単一DBが必要な場合はHyperdriveが推奨されている。

## 制限（抜粋）

| 項目 | Workers Paid | Free |
|---|---|---|
| 1DBあたりの最大サイズ | 10GB | 500MB |
| アカウントあたりのストレージ | 1TB（申請で増やせる） | 5GB |
| DB数/アカウント | 50,000 | 10 |
| Time Travelの期間 | 30日 | 7日 |
| 1回のWorker呼び出しでのクエリ数 | 1,000 | 50 |

- 1行・文字列・BLOBの最大サイズは2MB、SQL文は100KBまで、バインドパラメータは100個まで
- 1クエリの最大実行時間は30秒
- 10GBを超えるデータは、複数の小さなD1 DBに分割することが推奨されている

## [[cloudflare-developer-platform]]の中での位置づけ

ストレージのうち、共有リレーショナルDBの担当。ユーザー・テナント単位の小さなDBを大量に持つなら[[cloudflare-durable-objects]]のSQLite、キャッシュ的な読み込み中心のデータなら[[cloudflare-workers-kv]]。

## 出典

- [Cloudflare D1 · Overview](https://developers.cloudflare.com/d1/)
- [Limits · Cloudflare D1 docs](https://developers.cloudflare.com/d1/platform/limits/)
- [Global read replication · Cloudflare D1 docs](https://developers.cloudflare.com/d1/best-practices/read-replication/)
- [Choose a data or storage product · Cloudflare Workers docs](https://developers.cloudflare.com/workers/platform/storage-options/)
- [Building D1: a Global Database - Cloudflare Blog](https://blog.cloudflare.com/building-d1-a-global-database/)

#cloudflare-workers #serverless #database #sqlite
