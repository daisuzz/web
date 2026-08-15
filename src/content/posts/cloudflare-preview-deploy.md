---
title: PRごとにCloudflareへプレビューデプロイする仕組みを作った
date: "2026-08-15"
---

これまでこのサイトはmainにマージした後でしか本番反映後の見た目を確認できず、レイアウト崩れなどをマージ後に気づくことがあった。PRの時点でCloudflare上に実際に動く状態を作ってレビューできるようにしたので、その仕組みを記録しておく。

## 仕組みの概要

`pull_request`（対象: main）をトリガーに、`wrangler-action`で`versions upload`コマンドを実行し、Cloudflare Workersに新しい「バージョン」としてアップロードするワークフローを追加した（[#323](https://github.com/daisuzz/web/pull/323)）。本番反映用の`deploy`コマンド（push to main時に実行）とは別のワークフローとして分離してあるので、影響範囲を切り分けやすい。

`wrangler.jsonc`側で`workers_dev: true`・`preview_urls: true`を有効にしておくことで、アップロードしたバージョンごとに固有のworkers.dev URLが払い出されるようになる。

## PRへのプレビューURL自動コメント

デプロイ結果からプレビューURLを取得し、`actions/github-script`でPRにコメントする。同じPRに再pushしたときに新規コメントが増え続けないよう、目印用のHTMLコメント（`<!-- cloudflare-workers-preview -->`）を埋め込んで、既存コメントがあれば更新するだけにした。

## プレビューURLにCloudflare Accessで認証をかけた

仕組みを入れてしばらく経ってから、PRコメントに貼られるプレビューURLがそのままworkers.devの公開URLであることに気づいた。PRコメントを見られる人なら誰でもアクセスできてしまうので、下書き中の記事やレイアウトが崩れた状態の画面を第三者に見られる可能性があるのが気になった。

そこでCloudflare Zero TrustのAccessをダッシュボードから設定し、プレビュー用のworkers.devサブドメインへのアクセスにログインを要求するようにした。認証方式はCloudflareアカウントでのSSOにして、自分以外はアクセスできない状態にしている。この設定はリポジトリのコードには表れず、Cloudflareダッシュボード側だけで完結する変更なので、後から見返す用に記録として残しておく。

## まとめ

- PRごとにCloudflare Workersへプレビューデプロイし、URLをPRにコメントする仕組みを導入した
- 公開URLがそのままPRコメントに貼られてしまう問題は、Cloudflare Accessで認証をかけて対処した
