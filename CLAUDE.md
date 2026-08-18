# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm install       # 依存パッケージのインストール
npm run develop   # 開発サーバーを起動 (http://localhost:8000、npm start でも同じ)
npm run build     # public/ に本番ビルドを出力
npm run serve     # ビルド済みの public/ をローカルで配信
npm run clean     # Gatsbyの .cache/ と public/ を削除
```

このリポジトリにlint/testのスクリプトは用意されていない。

`npm run build` を実行するには `GATSBY_TRACKING_ID`（ダミー値でも可）を設定する必要がある。未設定だと `gatsby-plugin-google-gtag` のバリデーションで `trackingIds[0] must not be a sparse array item` エラーになりビルドが失敗する。`HATENA_NAME`/`HATENA_API_KEY` はローカルでは未設定でも問題ない。`gatsby-node.ts` 内のHatena/Qiita APIへのリクエストはtry/catchとタイムアウトでラップされているため、外部APIが失敗・未設定でも警告が出るだけでビルド全体は失敗しない。

## アーキテクチャ

Gatsby 5 + TypeScriptで構築された個人サイト/ブログで、静的アセットとしてCloudflare Workersにデプロイされている（`wrangler.jsonc` 参照）。Gatsbyサイトではあるが、意図的に一般的なコンテンツ管理の仕組み（MDX、`gatsby-transformer-remark`、`gatsby-source-filesystem`）は使っていない。Markdownコンテンツは手組みのパイプライン（`marked` のlexer/renderer + frontmatter解析用の `gray-matter`）でパースし、ページは `gatsby-node.ts` の `createPages`内でTypeScriptとしてコンテンツを解決した上で、パース済みオブジェクトをそのまま `pageContext` に渡して生成している——各ページテンプレートは `pageContext` を直接読むだけで、GraphQLクエリは実行しない。新しいコンテンツ種別を追加する際も、GraphQLベースのソーシングを導入するのではなく、この方式に合わせること。

### 2系統並行するコンテンツパイプライン: posts と notes

**posts**（`/posts/<slug>`、ブログ記事）: `src/content/posts/*.md` → `src/content/loadPosts.ts` がfrontmatter（`title`、`date`）を解析し、本文を `PostBlock[]`（paragraph/heading/code/blockquote/listのみ。`marked` が出力するそれ以外のトークンは黙って捨てられる）にレクシングする → `gatsby-node.ts` の `createPages` が `createPage({path: "/posts/<slug>", component: PostPage.tsx, context: {post}})` を呼ぶ。

**notes**（`/notes/<slug>`、Zettelkasten風の個人Wiki）: `src/content/notes/*.md` → `src/content/loadNotes.ts` が2パス構成で処理する——1パス目で全ファイルを読み `slug -> title` のインデックスを構築する（タイトルはfrontmatterではなく本文先頭の `# 見出し` 行から取る。frontmatterが持つのは `created`/`updated` のみ）。2パス目でそのインデックスを使って各ファイルを再パースする。`marked` に渡す前に `src/content/noteMarkdown.ts` が前処理を行い、`[[wikilink]]` を通常のMarkdownリンクに書き換える（対象のslugが存在しなければ `<span class="wikilink-missing">` に置換し、build時に `console.warn` を出す）。`#tag` は `/notes/tags/<tag>` へのリンクに書き換える（ASCIIタグは小文字化、それ以外の言語のタグはそのまま）。どちらの変換も本文中のコード領域を除いた部分にのみ適用される（フェンスドコードブロックとインラインコードは先に分離される）ため、コードブロック内の `[[...]]`/`#tag` はそのまま残る。` ```mermaid ` のコードフェンスは通常のcodeブロックではなく専用の `{type: "mermaid"}` ブロックになる。`loadNotes()` は全ノートを横断した逆リンクグラフ（`backlinks`）とタグインデックスも計算する。`gatsby-node.ts` はこれらを使って `/notes/<slug>`（`NotePage.tsx`）、`/notes/`（`NotesIndexPage.tsx`）、`/notes/tags/`（`NoteTagsIndexPage.tsx`）、`/notes/tags/<tag>`（`NoteTagPage.tsx`）を生成する。Mermaid図はクライアントサイドのみで描画される: `src/components/organisms/Mermaid.tsx` が `useEffect` 内で動的に `import("mermaid")` するため、mermaidバンドルはMermaidブロックを含むノートページを開いたときだけ取得される。notesはGraphQLにソーシングされておらず、RSSフィードにも含まれない——postsとは意図的に別の名前空間として扱われている。

### GraphQLノードと pageContext の使い分け

`gatsby-node.ts` の `sourceNodes` は、`gatsby-source-filesystem` を使わず `createNode()` を直接呼ぶことで3種類のカスタムノードを作成している: `SitePosts`（`loadPosts()` から）、`QiitaPosts`（Qiita APIからライブ取得）、`HatenaPosts`（Hatenaブログの Atom フィードからライブ取得。`rel=next` のリンクを再帰的にたどってページネーションする）。`allSitePosts`/`allQiitaPosts`/`allHatenaPosts` はアプリ内で唯一のGraphQLクエリで、`src/pages/index.tsx`（トップページの「writing」一覧）と `gatsby-config.ts` の `gatsby-plugin-feed` によるRSSクエリで使われている。個別の記事ページ、およびnotes機能全体はGraphQLを一切経由しない。

### スタイリングとテーマ

CSS Modules（`*.module.css`。型定義が生成されていないため `import * as style from "./X.module.css"` の直前に `// @ts-ignore` を付けてimportしている）と、MUIの `ThemeProvider`/`CssBaseline` を組み合わせている。`src/assets/theme.ts` は単一のダークテーマをハードコードしており（このコードベースにライトモードやテーマ切り替えは存在しない）、パレットをCSSカスタムプロパティ（`--color-*`）として公開し、各 `.module.css` がそれを参照している——新しいスタイルを書く際も色をハードコードせずこの変数を再利用すること。

### headタグ / SEO

`react-helmet` / `gatsby-plugin-react-helmet` は使っていない。`src/components/Layout.tsx` がGatsby 5の組み込み `<head>` サポートに乗る形で、`<title>`・`<meta>`・OG/Twitterタグ・canonicalリンク・JSON-LD構造化データをJSXとして直接設定している。

### デプロイ

`.github/workflows/deploy-cloudflare-workers.yml` が `main` へのpushのたびに `npm run build` を実行し、`public/` ディレクトリをCloudflare Workersの静的アセットとしてデプロイする。それに加えて毎日1回のcronでも実行される——これはコードに変更がなくてもQiita/Hatenaのライブコンテンツを最新化するための仕組み。`preview-cloudflare-workers.yml` はPRブランチをプレビューURLにデプロイする。本番へのアクセスはCloudflareのエッジで日本・アメリカからのトラフィックのみに制限されており、プレビューURLはCloudflare Accessで保護されている（詳細は `README.md` を参照）。

## Notesの設計原則と運用ガイドライン

`/notes/<slug>` は個人用のZettelkasten的ノート機能。上の「アーキテクチャ」節がコードの仕組みを説明しているのに対し、ノートを実際に書く・編集するときの方針（設計原則、新規ノート追加手順、`[[wikilink]]`/`#tag`の書き方、ハブノート、Mermaid、URLのノート化方針、文体、追記・深掘り提案など）は `.claude/skills/notes/SKILL.md` に集約している（`/notes` コマンドとして呼び出せる）。ノートを作成・編集するときは必ずこのスキルを参照すること。

## 知識を問う質問には検索してから答える

事実・知識を問うどんな質問（聞き覚えのない単語・固有名詞はもちろん、自分の知識だけで答えられそうに見える一般的な質問も含む）に対しても、憶測で即答せず、まず最低1回はWebSearch/WebFetchで裏取りしてから回答すること。学習データのカットオフ以降の新情報や、記憶違い・古い情報のリスクを避けるため。

検索しても自信の持てる結果に辿り着けなかった場合、「これはおそらく〇〇というジャンルの話だろう」という思い込みで検索語を狭めたまま何度も再検索しないこと。まずジャンルの決め打ち自体を疑い、固有名詞そのものだけで検索する・複数ジャンルにまたがる中立的な語を使うなど、検索語を広げて調べ直すこと。

個人ブログなどの二次情報より公式ドキュメント・一次情報源を優先すること。
