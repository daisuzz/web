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

`/notes/<slug>` は個人用のZettelkasten的ノート機能。上の「アーキテクチャ」節がコードの仕組みを説明しているのに対し、この節はノートを実際に書く・編集するときの方針をまとめたもの。

### 設計原則

- **1ノート1概念**: 複数の概念を1つのノートに詰め込まない。話が広がったら別ノートに切り出して `[[...]]` で繋ぐ
- **概念中心**: 「いつ書いたか」ではなく「何についてのノートか」を主語にする
- **分類より関連付け**: フォルダによる階層分類は使わない。`[[wikilink]]` と `#tag` による関連付けだけで整理する
- **積極的なリンク**: 新しいノートを書く・既存ノートを編集するときは、他のノート本文の中でそのトピックに言及している箇所がないか `src/content/notes/` を検索し、見つかったら `[[...]]` でリンクする
- **前置き不要**: 個人用メモなので、読者への配慮や前置きは書かない。ラフな文体でよい
- **事後の構成調整**: 追記したら、見出しの並びや重複がないか、ノート全体を見直す

### 新しいノートを追加する手順

1. `src/content/notes/<kebab-case>.md` を作成する
2. frontmatterに `created`（今日の日付）を書く。既存ノートを更新する場合は `updated` を今日の日付に更新する。（`src/content/loadNotes.ts` はfrontmatterの値をそのまま使うだけで、git履歴やファイルのmtimeからは推測しない）
3. 本文1行目に `# タイトル`（日本語可）を書く。このタイトルが `[[wikilink]]` の表示名やページの `<h1>` になる
4. `npm run develop` でローカルにレンダリングを確認する
5. 関連する既存ノートへの `[[...]]` リンクを追加する

### 相互リンク（`[[wikilink]]`）

- 書式は `[[<ファイル名（slug）>]]` のみ。
- 存在しないslugを指定すると、build時に `console.warn` で警告が出て、ページ上は打ち消し線付きの「リンク切れ」表示になる（`src/content/noteMarkdown.ts` の `resolveWikilinks`）
- バックリンク（「🔗 リンクされているノート」）は自動生成されるので、リンクを追加・削除するだけでよく手動メンテは不要
- コードブロック・インラインコード内の `[[...]]` は展開されない

## ハブノート（MOC）

原子ノートとは別に、同じ話題領域に属する複数の原子ノートを見取り図的に束ねる「ハブノート」（Zettelkasten/LYT文脈での MOC: Map of Content に相当）を作ってよい。ハブノート自身は深掘りした内容を書かず、配下ノートを`[[...]]`でリンクし、それぞれの位置づけ・違いを一言でまとめる役割に徹する。

- 同じ分野の原子ノートが3つ前後たまってきたら、ハブノート作成を検討する（例: `markdown-presentation-tools.md` が `slidev.md`/`marp.md`/`deck-k1low.md` を束ねている）。
- 配下ノート側にも「## [[ハブノート名]]の中での位置づけ」のような見出しでハブノートへの参照を書き、双方向にリンクする。
- ハブノート本文には他のタグに加えて`#moc`タグを付ける。`/notes/tags/moc.html`でハブノート一覧を一望できるようにするため。

### `#tag` の仕様

- `src/content/noteMarkdown.ts` の `extractAndLinkTags` が処理する
- タグとして認識されるのは、直前が行頭・空白・開き括弧類のときの `#` のみ（`https://x.com/foo#bar` のようなURL内の `#` やコードブロック内は無視される）
- 英数字・アンダースコア・ハイフンのみで構成されるタグ（ASCII）は小文字に正規化される。日本語などそれ以外の文字を含むタグは正規化されない
- `/notes/tags/` にタグクラウードが自動生成される。手動メンテ不要

### Mermaid図

- `` ```mermaid `` フェンスは実装済み。該当ノートを開いたときだけクライアント側で `mermaid` を動的importして描画する（`src/components/organisms/Mermaid.tsx`）。

## URLを渡されたときのノート化方針

技術記事のURLを渡されて「まとめて」「ノートにして」と言われた場合、その記事の性質によってノートの主語を使い分けること。

- **URL自体(その記事・発表・実装)が有益な情報の場合** — 記事のトピックそのものをノートの主語にする（例: 「HAProxyでの耐量子暗号TLS対応」のような具体的な手順・発表内容が主眼の記事）。
- **記事が要素技術の紹介にとどまる場合** — 記事ではなく、紹介されている要素技術そのものをノートの主語にする（例: 「post-quantum cryptography」や「ML-KEM」など、記事はあくまで概念の入り口として使う）。
- 海外ブログの紹介である場合は、地の文で要約・言い換えて済ませず、原文の内容・構成を尊重して書く（上記「X(Twitter)投稿を発端にしたノート」節と同じ考え方）。自分の考察を足す場合は、原文の要約とは別セクションに分けて書く。

### 書き方のトーン

- ラフなメモでOK。前置きや読者への配慮は不要（tokuhirom個人用のメモなので）。
- 日本語で書く。
- 検証結果やコマンド例など、具体的な内容を優先する。
- 特定のプロダクト・技術・サービスを批判したり、けなしたりするようなニュアンスは入れない。合わなかった点を書く場合も、事実ベースで淡々と記述する。出典記事が「カルト」のような評価的・煽情的な言葉で形容している場合も、それをそのまま見出しや地の文に持ち込まず、背景にある客観的事実だけを抽出して書く。
- 根拠のある出典がない情報は載せない。ウェブ調査した内容を書く場合は、末尾に「出典」セクションを設けて参照元をリンクする。裏取りできなかった情報や記憶・推測だけの内容は書かないか、推測であると明記する。

## Notesへの追記提案

「〇〇ってどういう用途なの？」のようなオープンクエスチョン（技術・プロダクト・地名などについての素朴な調査依頼）をされたら、調べて回答した後に、その内容を `/notes/` コーナーに書き残すかどうかを聞くこと。

## ノート切り出し後の深掘り提案

ノートを新規作成した際、その本文中に「まだ独立ノートになっていないが、深掘りする余地がありそうな概念」（例: 説明の中で触れているだけの関連用語・隣接する概念）が含まれていないか確認すること。見つかったら、書き終えたタイミングで「〇〇についても別ノートとして切り出して調べられそうですが、書きますか？」のように提案する。ノートを分割・切り出した直後も同様に、そこからさらに切り出せそうな概念がないか確認する。

## 手を動かす実験

説明を読むだけでなく、実際にこのマシン上でコードを書いて動かし、体感してから書くことを積極的に行う。特にネットワーク・カーネル周りのトピックは、動かしてみないと理解が浅くなりがちなので、可能な場合は最小限の実験コードを書いて動かすことを優先的に検討する（例: `/dev/kvm`のioctlを直接叩く最小プログラムをビルド・実行してKVMのVM exitを体感した`kvm-hello-world-experiment.md`）。

- 実験の記録は、対象となる概念のノート（例: `kvm.md`）に混ぜ込まず、`<トピック>-experiment.md`のような独立したノートに切り出し、概念ノート側からリンクする。原子性の原則（1ノート1概念）に従う。
- 実験ノートには、目的・使った素材（参照したリポジトリ等）・実際に躓いた点とその対処・実行結果・コードから読み取れることを書く。単なる感想ではなく再現可能な記録にする。
- 実験コードを実行する前に、何を試すか（実行するコマンド・触るデバイスやリソース等）を説明し、必ずユーザーの許可を取ってから実行すること。

## 知識を問う質問には検索してから答える

事実・知識を問うどんな質問（聞き覚えのない単語・固有名詞はもちろん、自分の知識だけで答えられそうに見える一般的な質問も含む）に対しても、憶測で即答せず、まず最低1回はWebSearch/WebFetchで裏取りしてから回答すること。学習データのカットオフ以降の新情報や、記憶違い・古い情報のリスクを避けるため。

検索しても自信の持てる結果に辿り着けなかった場合、「これはおそらく〇〇というジャンルの話だろう」という思い込みで検索語を狭めたまま何度も再検索しないこと。まずジャンルの決め打ち自体を疑い、固有名詞そのものだけで検索する・複数ジャンルにまたがる中立的な語を使うなど、検索語を広げて調べ直すこと。

個人ブログなどの二次情報より公式ドキュメント・一次情報源を優先すること。
