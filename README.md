# daisuzz.dev

Daisaku Suzuki（daisuzz）の個人サイトのソースコードです。

[Gatsby](https://www.gatsbyjs.com/) で構築し、[Cloudflare Workers](https://workers.cloudflare.com/) にデプロイしています。

## 主な機能

- ブログ記事の一覧・詳細ページ表示
- 自サイトの記事に加え、[Qiita](https://qiita.com/) と [はてなブログ](https://hatenablog.com/) の記事をまとめて取得・掲載
- RSSフィード配信（`/rss.xml`）
- サイトマップ生成

## 技術スタック

- [Gatsby](https://www.gatsbyjs.com/) 5
- [React](https://react.dev/) 19 / TypeScript
- [MUI](https://mui.com/)（Material UI）
- [Cloudflare Workers](https://workers.cloudflare.com/)（デプロイ先）

## セットアップ

```bash
npm install
```

必要に応じてリポジトリ直下に `.env` を作成し、以下の環境変数を設定してください。

| 変数名 | 説明 |
| --- | --- |
| `GATSBY_TRACKING_ID` | Google Analytics のトラッキングID |
| `HATENA_NAME` | はてなブログAPIの認証に使用するユーザー名 |
| `HATENA_API_KEY` | はてなブログAPIキー |

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
