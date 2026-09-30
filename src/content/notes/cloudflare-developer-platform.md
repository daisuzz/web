---
created: "2026-09-30"
---
# Cloudflare Developer Platform

Cloudflareが[[cloudflare-workers]]を中心に提供している、コンピュートとストレージの製品群の見取り図。各製品はWorkerからbinding（`env.XXX`）経由で使う。

## コンピュート

- [[cloudflare-workers]] — 基盤。V8アイソレート上で動くステートレスなサーバーレス関数で、全PoPに事前デプロイされ、最寄りのエッジで実行される。
- [[cloudflare-durable-objects]] — 状態を持つWorker。IDごとに世界で1つだけのインスタンスがシングルスレッドで動き、専用のSQLiteストレージを持つ。協調・強整合・WebSocket・エンティティごとのタイマー向け。考え方は[[actor-model]]そのもの。

## ストレージ

- [[cloudflare-workers-kv]] — 結果整合のKVストア。中央に保存して各拠点でキャッシュする。読み込みが多いデータ（設定・セッション・フラグ）向けで、同じキーへの書き込みは1回/秒まで。
- [[cloudflare-d1]] — マネージドなサーバーレスSQLite。1つの共有リレーショナルDBとして使い、HTTP API・マイグレーション・Time Travel・リードレプリカが揃っている。
- [[cloudflare-r2]] — S3互換のオブジェクトストレージ。egress無料で強整合。画像・動画・ログ・データセットなど大きなファイル向け。

## メッセージング

- [[cloudflare-queues]] — at-least-onceのメッセージキュー。重い処理の後回し、Worker間の連携、書き込み前のバッファリング向け。R2のイベント通知の受け口にもなる。

## 開発フロー

- [[cloudflare-worker-previews]] — `wrangler preview` で、ブランチごとにDurable ObjectsやContainersまで含めて隔離したプレビュー環境を作る。

## 選び方の早見表

```mermaid
flowchart TD
    Q{何をしたい?} -->|ステートレスな処理| W[Workers]
    Q -->|データを保存したい| S{どんなデータ?}
    S -->|読み込み中心・多少古くてもよい| KV[Workers KV]
    S -->|リレーショナル・共有DB| D1[D1]
    S -->|大きなファイル・非構造化データ| R2[R2]
    S -->|同時更新を直列化したい / エンティティごとの状態| DO[Durable Objects]
    Q -->|複数クライアントの協調・WebSocket| DO
    Q -->|処理を後回し・非同期にしたい| QU[Queues]
```

## 製品同士の関係

- D1もQueuesも内部はDurable Objectsの上に作られている。Durable Objectsは、ほかの製品を組み立てるための低レベルな部品という位置づけ
- KVとDurable Objectsを組み合わせる使い方もある。書き込みを1つのDurable Objectに通して順序を保証し、読み込みはKVのキャッシュを使う
- R2のバケットの変更をQueuesに流し、consumer Workerで処理する（例: サムネイル生成）という組み合わせが公式に用意されている
- このノートで扱っていない製品には、Hyperdrive、Vectorize、Workflowsなどがある

## 出典

- [Choose a data or storage product · Cloudflare Workers docs](https://developers.cloudflare.com/workers/platform/storage-options/)
- [Event notifications · Cloudflare R2 docs](https://developers.cloudflare.com/r2/buckets/event-notifications/)

#cloudflare-workers #serverless #moc
