---
created: "2026-08-20"
---
# Cursor Origin

AIコードエディタ「Cursor」を開発するAnysphereが2026年6月16日、自社初のカンファレンス「Compile 2026」（サンフランシスコ）で発表したGitホスティングプラットフォーム。GitHub/GitLabのようなGitフォージにあたるが、「人間ではなくAIエージェントが大量に並列でclone・push・ブランチ作成する」ことを前提に設計されている点が最大の特徴。

GitHubは2008年、人間がコードを書きレビューし、ブラウザでdiffを読んでマージすることを前提に作られた。Originはその逆で、多数のエージェントが同時にブランチを切ってpushしてくる、人間中心のGitホストが想定していなかった負荷パターンに最適化されている。デモでは1リポジトリあたり秒間22.6コミットというスループットを示した。

2025年12月にAnysphereが買収したGraphiteの技術を再構築したベースの上に構築されている。

## 主な機能

### スタックドPR（Stacked Pull Requests）
依存関係のある変更を「スタック」として積み重ね、依存グラフを可視化する仕組み。1つのスタックは複数の依存ブランチ＝複数のPRで構成され、それぞれが下位のPRの上に積まれる。レビュー・マージはスタックの下から順に行うため、各PRを小さく保てる。エージェントが大きなタスクをこなすと「前の変更に依存する変更の連鎖」が自然に生まれるため、スタックドPRはエージェントの出力形態と相性が良いとされる。

### マージキュー（Merge Queues）
複数のエージェントが同じリポジトリを同時に触る状況でCIをグリーンに保ち、コンフリクトのchurnを減らす仕組み。キューは「対象ブランチ＋自分の変更＋先に並んでいる変更すべて」を含む一時ブランチを作ってCIを実行し、その組み合わせが通ったときだけマージする。失敗したビルドへの自動修正も組み込まれている。

### 機械可読なレビュー・マージ状態
diffフォーマット・レビューインターフェース・マージ状態のロジックが、後付けではなく最初から「機械可読・機械操作可能」に設計されている。人間のコメントスレッドだけでなく、エージェントによる一括承認やプログラムからのステータス参照を前提にしている。

### コンフリクト解消（意味ベース）
行単位のdiffマーカーを人間に提示する従来型ではなく、各エージェントのブランチが「何をしようとしていたか」という意図を推論してコンフリクトを解消する設計を志向している。AIによるコンフリクトエンジンが大半のケースを自動解決すると謳われているが、意味的マージ状態やエージェントの監査証跡といった本格的な部分は2027年以降になる見込みという指摘もある。

### MCP/API拡張性
Gitと互換性があり、API・MCP経由で外部から操作できる。Cursorのエージェントは、Origin CLIのインストール・サインイン・リポジトリ作成・リモート設定・pushまでを自律的に行える。リポジトリのセットアップは通常のGitリモートとして `git remote add origin https://origin.cursor.com/{owner}/{repo}.git` の形で追加する。

## データ・プライバシー面の注意点

2026年6月、SpaceXがAnysphere（Cursor）を600億ドルの全株式交換で買収する契約を締結し、8月14日に完了（SpaceXAI部門に統合）。その3日後の8月17〜18日にOriginが有料プラン（Pro/Teams/Enterprise、オプトアウト方式でデフォルト有効）向けにベータ提供された。しかし提供開始時点では、Origin上のコードに関するデータ保持・トレーニング利用・サブプロセッサ・データのエクスポート方法などを定めた**Origin固有の利用規約が未公開**だった。CursorエディタのPrivacy Mode設定はOriginのホスティング基盤には自動適用されないため、機密性の高いコードは当面GitHubを正とし、Originはミラーとして使う運用が推奨されていた。

## 提供状況

発表時は「2026年秋にウェイトリスト制」とされていたが、実際には2026年8月17〜18日に前倒しでベータ提供が始まった。料金は未公表（2026年8月時点）。

## 出典

- [Cursor Announces Origin, a Git Forge Built for Parallel AI Agents](https://webdeveloper.com/news/cursor-origin-git-forge-parallel-agents/)
- [What is Cursor Origin? Cursor's Git forge for the agentic era](https://www.eesel.ai/blog/what-is-cursor-origin)
- [Stacked Diffs in Cursor Origin: The Review Model](https://www.learncursor.dev/learn/cursor-origin/stacked-diffs)
- [Merge Queues Explained: Keeping CI Green at Agent Scale](https://www.learncursor.dev/learn/cursor-origin/merge-queues)
- [Cursor launches Origin code hosting platform as GitHub outage exposes opening in AI coding race (VentureBeat)](https://venturebeat.com/infrastructure/cursor-launches-origin-code-hosting-platform-as-github-outage-exposes-opening-in-ai-coding-race)
- [Cursor Origin Ships With No Data Terms: SpaceX Now Holds Paid Developers Code](https://www.techtimes.com/articles/324838/20260818/cursor-origin-ships-no-data-terms-spacex-now-holds-paid-developers-code.htm)
- [Cursor Origin is on by default for paid users, and its data terms are unpublished](https://thenextweb.com/news/cursor-origin-opt-out-data-terms-spacex-github-outage)
- [SpaceX completes record $60 billion acquisition of AI coding platform Cursor (Yahoo Finance)](https://finance.yahoo.com/technology/ai/articles/spacex-completes-record-60-billion-131311785.html)
- [SpaceX to acquire the AI coding startup Cursor for $60 billion (CNBC)](https://www.cnbc.com/2026/06/16/spacex-spcx-cursor-acquisition-ipo.html)

#cursor #git #ai #agent
