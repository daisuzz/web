---
title: Claudeでブログサイトを改善した
date: "2026-08-14"
---

お盆休みで時間があったので、Claudeとやり取りしながらこのサイトを手直しした。サイト全体のデザインのリニューアルから始まって、記事管理の仕組み、デプロイ基盤の移行、SEO対応など思っていたより広い範囲を触ることになったので記録として残しておく。

## サイト全体のデザインをターミナル風のデザインにリニューアル

きっかけは「サイトの見た目を作り直したい」という思いつきで、Claude Designを使っていくつかデザイン案を提案してもらい、ターミナルプロンプト風のダークテーマに変更した（[#309](https://github.com/daisuzz/web/pull/309)）。また、そこから元々発生していたCI周りの警告解消（[#308](https://github.com/daisuzz/web/pull/308)）やビルドエラーの修正（[#310](https://github.com/daisuzz/web/pull/310)）まで一気に片付けた。

## 記事をサイト上で直接書けるようにした

これまでこのサイトはHatenaとQiitaの記事一覧を表示するだけだったが、サイト内記事機能の土台を作り（[#312](https://github.com/daisuzz/web/pull/312)）、Markdownファイルを置くだけでサイト内に記事を追加できる仕組みにした（[#316](https://github.com/daisuzz/web/pull/316)）。今読んでいるこの記事もその仕組みで公開している。

## デプロイ基盤をCloudflare Workersに移行

まずFirebase Hostingをやめて（[#317](https://github.com/daisuzz/web/pull/317)）Cloudflare Pagesに寄せた（[#311](https://github.com/daisuzz/web/pull/311)）。その後、CloudflareがPagesからWorkers(静的アセット)への移行を推奨していると知り、そのままWorkersに乗り換えた（[#323](https://github.com/daisuzz/web/pull/323)）。Cloudflare公式の移行ガイド([Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/))が参考になる。合わせてPR時にプレビュー用のサイトをデプロイする仕組みも導入した。

## SEO/OGP対応 + 細かい修正（[#321](https://github.com/daisuzz/web/pull/321)）

- description・OGP・Twitter Card・canonicalタグとJSON-LD構造化データを追加
- robots.txtでsitemapを明示
- 404ページにトップへのリンクを追加
- 使っていないコンポーネントや依存パッケージ(gatsby-plugin-image、react-helmet-asyncなど)を削除
- Qiita/HatenaのAPI呼び出しにtry/catchとtimeoutを追加し、外部APIが落ちてもビルド全体がコケないようにした
- favicon.icoが404になっている問題に気づいたので、favicon.icoを追加

## プロフィール周りの整理

トップページの文言を実際のブログ内容に合わせて更新し（[#318](https://github.com/daisuzz/web/pull/318)）、冗長だったプロフィール文とヘッダーのGitHubリンクを削除（[#319](https://github.com/daisuzz/web/pull/319)）、ヘッダータイトルのリンクが正しくトップに戻るよう修正した（[#320](https://github.com/daisuzz/web/pull/320)）。最後にAboutセクションにroleフィールドを追加し、興味分野(interests)を実態に合わせて更新（[#325](https://github.com/daisuzz/web/pull/325)）。

## 参考リンク

- [Migrate from Pages to Workers – Cloudflare Workers docs](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
