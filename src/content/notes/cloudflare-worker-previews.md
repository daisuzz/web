---
created: "2026-09-24"
---
# Cloudflare Worker Previews

[[cloudflare-workers]]上で、Gitのブランチごとに本番相当の隔離されたプレビュー環境を使い捨てで用意できる機能。2026年9月にCloudflareが発表した。`npx wrangler preview` コマンドで起動する。

## 何を隔離するか

単にコードをデプロイしたプレビューURLを払い出すだけでなく、状態を持つリソースまでブランチ単位で隔離する点が特徴。

- `wrangler preview` を実行するたびに、そのプレビュー専用の新しいDurable Objectネームスペースと新しいContainerアプリケーションが自動的に作成される
- 環境変数・secrets・bindingsも本番設定・本番トラフィックとは別に持てる
- そのブランチのセッション・メモリ・マイグレーション・並行テストなどの状態変化が、そのプレビューの中だけに閉じる（本番や他のブランチのプレビューに影響しない）
- ブランチに対して安定した1つのPreview URLが発行され、push するたびに同じ稼働中のプレビューが更新される
- そのプレビュー単位でログ・エラー・メトリクス・トレースを確認できる

## 想定ユースケース

ブログ記事のタイトルは "isolated preview environments for every change your agent makes" で、AIコーディングエージェントが加えた変更ごとに、本番に触れずに動作確認できるサンドボックスを用意する用途を前面に打ち出している。人間のPRレビューだけでなく、エージェントが自動でコードを変更→検証→修正するループの中で使うことを想定している。

## 既存の「Preview URLs」機能との違い

Cloudflare Workersには2025年7月に導入された「Preview URLs」という既存機能があり、こちらと混同しやすい。

- **Preview URLs**（2025年7月〜）: GitHub/GitLabと連携したWorkerに対して、PR・ブランチごとに`wrangler versions upload`でバージョンをアップロードすると、共有可能な安定したプレビューURLが自動で払い出される仕組み。トラフィック管理・バージョン管理の延長にある機能で、Durable ObjectsやContainersの隔離は行わない。
- **Worker Previews**（2026年9月〜）: `wrangler preview`によって、コードだけでなくDurable ObjectsやContainersを含む実行環境そのものをブランチ単位で新規作成する。状態を持つテストが必要な場合や、エージェントによる自動変更を隔離したい場合に、より強い分離を提供する。

## 出典

- [Introducing Worker Previews: isolated preview environments for every change your agent makes - Cloudflare Blog](https://blog.cloudflare.com/worker-previews/)
- [Previews - Cloudflare Workers docs](https://developers.cloudflare.com/workers/previews/)
- [Test out code changes before shipping with per-branch preview deployments for Cloudflare Workers - Cloudflare Changelog](https://developers.cloudflare.com/changelog/post/2025-07-23-workers-preview-urls/)
- [Preview URLs - Cloudflare Workers docs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)

#cloudflare-workers #serverless #ci-cd #ai-agent
