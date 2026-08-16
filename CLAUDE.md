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

`/notes/<slug>` は個人用のZettelkasten的ノート機能。[64p.org](https://64p.org)の運用方針を参考にしつつ、このリポジトリの実装に合わせて調整している。上の「アーキテクチャ」節がコードの仕組みを説明しているのに対し、この節はノートを実際に書く・編集するときの方針をまとめたもの。

### 設計原則

- **1ノート1概念**: 複数の概念を1つのノートに詰め込まない。話が広がったら別ノートに切り出して `[[...]]` で繋ぐ
- **概念中心**: 「いつ書いたか」ではなく「何についてのノートか」を主語にする
- **分類より関連付け**: フォルダによる階層分類は使わない。`[[wikilink]]` と `#tag` による関連付けだけで整理する
- **積極的なリンク**: 新しいノートを書く・既存ノートを編集するときは、他のノート本文の中でそのトピックに言及している箇所がないか `src/content/notes/` を検索し、見つかったら `[[...]]` でリンクする
- **前置き不要**: 個人用メモなので、読者への配慮や前置きは書かない。ラフな文体でよい
- **事後の構成調整**: 追記したら、見出しの並びや重複がないか、ノート全体を見直す

### 新しいノートを追加する手順

1. `src/content/notes/<kebab-case>.md` を作成する
2. frontmatterに `created`（今日の日付）を書く。既存ノートを更新する場合は `updated` を今日の日付に更新する。**このリポジトリには64p.orgのようなpre-commitフックによる日付自動付与の仕組みはないため、`created`/`updated` は手動で管理する**（`src/content/loadNotes.ts` はfrontmatterの値をそのまま使うだけで、git履歴やファイルのmtimeからは推測しない）
3. 本文1行目に `# タイトル`（日本語可）を書く。このタイトルが `[[wikilink]]` の表示名やページの `<h1>` になる
4. `npm run develop` でローカルにレンダリングを確認する
5. 関連する既存ノートへの `[[...]]` リンクを追加する

### 相互リンク（`[[wikilink]]`）

- 書式は `[[<ファイル名（slug）>]]` のみ。64p.orgにある `[[ファイル名|別テキスト]]` のようなカスタム表示テキスト構文はこのリポジトリでは未実装
- 存在しないslugを指定すると、build時に `console.warn` で警告が出て、ページ上は打ち消し線付きの「リンク切れ」表示になる（`src/content/noteMarkdown.ts` の `resolveWikilinks`）
- バックリンク（「🔗 リンクされているノート」）は自動生成されるので、リンクを追加・削除するだけでよく手動メンテは不要
- コードブロック・インラインコード内の `[[...]]` は展開されない

### ハブノート（MOC）

複数の関連ノートを一望できる「ハブノート」を作りたい場合は、通常のノートとして `#moc` タグを付け、配下のノートを `[[...]]` で列挙して一言説明を添える運用にする。専用のページ種別や機能としては実装しておらず、既存のwikilink・タグ機能の組み合わせだけで表現する。

### `#tag` の仕様（実装済みの挙動）

- `src/content/noteMarkdown.ts` の `extractAndLinkTags` が処理する
- タグとして認識されるのは、直前が行頭・空白・開き括弧類のときの `#` のみ（`https://x.com/foo#bar` のようなURL内の `#` やコードブロック内は無視される）
- 英数字・アンダースコア・ハイフンのみで構成されるタグ（ASCII）は小文字に正規化される。日本語などそれ以外の文字を含むタグは正規化されない
- 64p.orgと異なり、タグの先頭文字が数字/アンダースコアかどうかによる制限は現状ない
- `/notes/tags/` にタグクラウードが自動生成される。手動メンテ不要

### Mermaid図・KaTeX数式・X/Twitter埋め込み

- `` ```mermaid `` フェンスは実装済み。該当ノートを開いたときだけクライアント側で `mermaid` を動的importして描画する（`src/components/organisms/Mermaid.tsx`）。このサイトはダークテーマ固定なので、64p.orgにあるライト/ダーク自動追従は非対応
- KaTeX数式（`$$...$$` / `\(...\)`）とX(Twitter)投稿の自動埋め込みは、64p.orgには存在するが**このリポジトリでは未実装**（意図的にスコープ外とした）。追加する場合はMermaidと同様、該当ノートのみクライアント側で遅延読み込みする設計にすること

### URLを渡されたときのノート化方針

ユーザーからURL（技術記事など）を渡されてノート化を頼まれた場合:

- 元記事が「結論・手順そのもの」が本質な内容（実装ガイドなど）なら、記事の具体的なトピックを主語にしてノートを書く
- 元記事が特定の要素技術の入門的な説明なら、記事ではなくその技術自体を主語にして書き、元記事は参考文献として扱う
- 原文の要約と自分の考察は別セクションに分ける
- 未検証・推測の内容は明記する。ウェブ調査した内容は末尾に「出典」セクションを設けてリンクする

### 書き方のトーン

- 日本語で、ラフでよい。読者向けの前置きは不要
- 抽象論より具体（検証結果・コマンド例）を優先する
- 批判的・評価的なニュアンスは避け、事実ベースで淡々と書く
- 根拠のない情報は書かない。推測は推測だと明記する

### 会話の中でのノート提案

- ユーザーから技術的な調査・質問（「〇〇の使い方は？」など）を受けて回答したときは、回答して終わりにせず「ノートに残しておきましょうか？」と一言提案する
- ノートを書き終えたら、本文中で触れたが深掘りできていない関連概念がないか確認し、あれば「〇〇も別ノートに切り出しますか？」と提案する

### 手を動かす実験

技術的なトピックは、可能なら実際に手を動かして検証してから書く。検証に伴うコマンド実行は、実行前にユーザーに内容を説明し承認を得ること。実験の詳細な記録は本体のノートに埋め込まず `<トピック>-experiment.md` として切り出し、元のノートから `[[...]]` でリンクする。

### 調査のしかた

- 知識を問われる質問には、学習データの記憶だけで即答せず、Web検索・fetchで裏取りしてから答える（学習データ以降の情報更新や記憶違いを避けるため）
- 検索語を1つのジャンルに決め打ちしない。固有名詞だけでまず検索し、結果を見て複数分野にまたがる語に広げる。同じ狭い検索語を繰り返すだけの堂々巡りは避ける
- 技術トピックについては、個人ブログなどの二次情報より公式ドキュメント・一次情報源を優先する
