---
title: この2日間、Claudeとdaisuzz.devを作り直していた
date: "2026-08-14"
---

8月13日から14日にかけて、Claudeとやり取りしながらこのサイトをまとめて手直しした。ダークテーマへの全面リニューアルから始まって、記事管理の仕組み、デプロイ基盤の移行、SEO対応、faviconの試行錯誤まで、思っていたより広い範囲を触ることになったので記録として残しておく。

## ターミナル風ダークテーマへの全面リニューアル

きっかけは「サイトの見た目を作り直したい」という漠然とした思いつきだった。IBM Plex Monoを基調にしたターミナルプロンプト風のダークテーマに変更し（[#309](https://github.com/daisuzz/web/pull/309)）、そこからCI周りの警告解消（[#308](https://github.com/daisuzz/web/pull/308)）やビルドエラーの修正（[#310](https://github.com/daisuzz/web/pull/310)）まで一気に片付けた。

## 記事をサイト上で直接書けるようにした

これまでこのサイトはHatenaとQiitaの記事一覧を表示するだけだったが、サイト内記事機能の土台を作り（[#312](https://github.com/daisuzz/web/pull/312)）、Markdownファイルを置くだけでサイト内に記事を追加できる仕組みにした（[#316](https://github.com/daisuzz/web/pull/316)）。今読んでいるこの記事もその仕組みで公開している。

## デプロイ基盤をCloudflare Workersに移行

まずFirebase Hostingをやめて（[#317](https://github.com/daisuzz/web/pull/317)）Cloudflare Pagesに寄せた（[#311](https://github.com/daisuzz/web/pull/311)）。その後、CloudflareがPagesからWorkers(静的アセット)への移行を推奨していると知り、そのままWorkersに乗り換えた（[#323](https://github.com/daisuzz/web/pull/323)）。参考にしたのはCloudflare公式の移行ガイド([Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/))で、新規プロジェクトはWorkers(静的アセット)が推奨、既存のPagesプロジェクトも引き続きサポートされるが移行する理由があるなら乗り換えて問題ない、という内容だった。あわせて、プレビューデプロイのPRコメントにURLが空で出てしまう不具合も、`wrangler-action`側の既知の挙動を回避するワークアラウンドを入れて直した。

## SEO/OGP対応と地味な掃除（[#321](https://github.com/daisuzz/web/pull/321)）

- description・OGP・Twitter Card・canonicalタグとJSON-LD構造化データを追加
- robots.txtでsitemapを明示
- 404ページにトップへのリンクを追加
- 使っていないコンポーネントや依存パッケージ(gatsby-plugin-image、react-helmet-asyncなど)を削除
- Qiita/HatenaのAPI呼び出しにtry/catchとtimeoutを追加し、外部APIが落ちてもビルド全体がコケないようにした

見た目には出てこない部分だけど、地味に効いてくるところだと思う。

## faviconは3回作り直した

favicon.icoが404になっている問題に気づいて追加し（[#322](https://github.com/daisuzz/web/pull/322)）、小サイズでの視認性を優先して幾何学図形ベースのシンプルな「d」に作り直したものの、結局サイト本文と同じIBM Plex Mono Boldのグリフをそのまま使う案に差し戻した（[#324](https://github.com/daisuzz/web/pull/324)）。小さいサイズでの視認性を優先するか、サイトのフォントとの統一感を優先するかで一度Claudeが提案したものを自分でボツにした形になる。地味だけど、こういう「一度作ってみて違うと分かる」試行錯誤を素早く回せるのはAIと組む利点だと感じた。

## プロフィール周りの整理

トップページのヒーロー文言を実際のブログ内容に合わせて更新し（[#318](https://github.com/daisuzz/web/pull/318)）、冗長だったプロフィール文とヘッダーのGitHubリンクを削除（[#319](https://github.com/daisuzz/web/pull/319)）、ヘッダータイトルのリンクが正しくトップに戻るよう修正した（[#320](https://github.com/daisuzz/web/pull/320)）。最後にAboutセクションにroleフィールドを追加し、興味分野(interests)を実態に合わせて更新（[#325](https://github.com/daisuzz/web/pull/325)）。

## まとめ

2日間で見た目・記事管理・インフラ・SEO・細かいUIまで一通り触ったことになる。一つ一つは小さい変更でも、こうして並べてみると結構な物量だった。次はサイト内記事をもう少し増やしていきたい。

## 参考リンク

- [Migrate from Pages to Workers – Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
