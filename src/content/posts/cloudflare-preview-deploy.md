---
title: PRごとにCloudflareへプレビューをデプロイして動作確認できるようにした
date: "2026-08-15"
---

今までこのサイトに変更を加えるときは、mainにマージした後でしか本番反映後の見た目を確認できない状態だったので、レイアウト崩れなどをマージ後に気づくことがあった。
PRを作成した時点でCloudflare上に実際に動くプレビューをデプロイして、レビューできるようにしたので、備忘録として残す。

## 仕組みの概要

mainブランチへのPR作成/更新をトリガーに、`wrangler-action`で`versions upload`コマンドを実行し、Cloudflare Workersに新しいバージョンをアップロードするワークフローを追加した（[#323](https://github.com/daisuzz/web/pull/323)）。

特別難しいことを実装したわけではなく、Cloudflareを操作するCLI[Wrangler](https://developers.cloudflare.com/workers/wrangler/)の設定ファイル`wrangler.jsonc`の中で、`workers_dev: true`・`preview_urls: true`を有効にしておくことで、アップロードしたバージョンごとに固有のプレビュー用URLが払い出されるようになる。

## PRへのプレビューURL自動コメント

毎回Actionsのログからプレビュー用URLを確認するのが手間なので、アップロード結果からプレビューURLを取得し、`actions/github-script`でPRにコメントするようにした。
また、同じPRに再pushしたときに新規コメントが増え続けないよう、目印用のHTMLコメント（`<!-- cloudflare-workers-preview -->`）を埋め込んで、既存コメントがあれば更新するようにした。

## プレビューURLにCloudflare Accessで認証をかけた

このままだと、PRコメントに貼られるプレビューURLは誰でもアクセスできてしまうので、認証の仕組みをかけるようにした。

認証の仕組み自体は、Cloudflare Accessをダッシュボードから有効にして、プレビュー用のURLへのアクセスに対してログインを要求するようにした。認証はCloudflareアカウントを使ってこのサイトのプロジェクトへのアクセス権がある人のみpassするようにした。

## 参考

* [Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
* [Manage access to Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/#manage-access-to-preview-urls)
