# daisuzz.dev

Daisaku Suzuki（daisuzz）の個人サイト

[Gatsby](https://www.gatsbyjs.com/) で構築し、[Cloudflare Workers](https://workers.cloudflare.com/) にデプロイしています。

## 技術スタック

- [Gatsby](https://www.gatsbyjs.com/)
- [React](https://react.dev/) / TypeScript
- [MUI](https://mui.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)

## アクセス制限

[`src/worker/index.ts`](./src/worker/index.ts) で、[`request.cf.country`](https://developers.cloudflare.com/workers/runtime-apis/request/#incomingrequestcfproperties) を見て日本・アメリカ以外からのアクセスを 403 で拒否しています。

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
