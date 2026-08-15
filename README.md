# daisuzz.dev

Daisaku Suzuki（daisuzz）の個人サイト

[Gatsby](https://www.gatsbyjs.com/) で構築し、[Cloudflare Workers](https://workers.cloudflare.com/) にデプロイしています。

## 技術スタック

- [Gatsby](https://www.gatsbyjs.com/)
- [React](https://react.dev/) / TypeScript
- [MUI](https://mui.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)

## アクセス制限

本番用（独自ドメイン）とプレビュー用（`workers.dev`）で、それぞれ異なる制限をかけています。

- **本番（独自ドメイン）**: CloudflareのWAF Custom Rulesで、日本・アメリカ以外の国（`ip.geoip.country`）からのアクセスをエッジ側でブロックしています。Workerが起動する前に弾かれるため、Workersのリクエスト数は消費しません。
- **プレビュー（`workers.dev`）**: PRごとのプレビューURL・ベースの`workers.dev`URLはCloudflare Accessで保護しており、認証済みの本人以外はアクセスできません。こちらもAccessの認証チェックがWorker起動前に行われるため、未認証アクセスはWorkersのリクエスト数を消費しません。

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run develop
```

`http://localhost:8000` で開発サーバーが起動します。

## ビルド

```bash
npm run build
```

## その他のコマンド

```bash
npm run serve  # ビルド済みサイトをローカルで配信
npm run clean  # Gatsbyのキャッシュ・ビルド成果物を削除
```

## ライセンス

[LICENSE.txt](./LICENSE.txt) を参照してください。
