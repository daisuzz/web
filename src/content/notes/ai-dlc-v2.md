---
created: "2026-08-18"
---
# AI-DLC v2

[[ai-dlc-v1]]（AWSが定義したAI-DLC方法論）のオープンソース参照実装`awslabs/aidlc-workflows`におけるメジャーバージョン2。AWS DevOpsブログ「Open-Sourcing Adaptive Workflows for AI-Driven Development Life Cycle (AI-DLC)」（2025年11月公開、re:Invent 2025のタイミングと重なる）で発表された、実装のほぼ全面書き換え版。native TypeScriptによる再実装で、v1の方法論（3フェーズ・Bolt・Mob Elaboration/Construction）自体は引き継ぎつつ、実装のあり方を大きく変えている。

## v1実装が抱えていた課題

AWSはv2を「adaptive workflows（適応的ワークフロー）」と名付けており、これは裏を返すとそれ以前のルールベース実装が抱えていた次のような課題への回答になっている。

- **画一的なワークフロー**: プロジェクトの規模や複雑さによらず、すべてのタスクを同じ手順・同じステージ数で処理しようとしてしまう
- **深さの調整ができない**: 成果物の詳細度（要件定義の粒度、テストの厚み等）を状況に応じて変えられない
- **過剰な自動化のリスク**: ツールが自動化を進めすぎることで、人間が本来担うべき検証・監督の機会が失われる

## アーキテクチャ: ハーネス中立なコア

v2の実装上の最大の特徴は、方法論のロジックを**単一の`core/`**に持ち、そこから各AIコーディングツール（AWSはこれを「ハーネス」と呼ぶ）向けの薄い表層を自動生成する構造になっている点。

- 対応ハーネス: Kiro IDE / Kiro CLI、Claude Code、Codex CLI、Cursor、opencode、GitHub Copilot（Amazon Q Developerも含む）
- 各ハーネスが持つのは見た目・呼び出し方法の薄い表層のみで、状態機械・監査ログ・並列エージェント調整といった「決定論的エンジン」部分は全ハーネスでバイト互換
- この設計により、方法論そのものの修正は`core/`の一箇所で完結し、各ハーネス向けの実装は自動的に追従する

## フェーズ・ステージ構成

v1の3フェーズ（Inception/Construction/Operations）は、v2の実装レベルでは**5フェーズ・約32〜33ステージ**（初期化、構想、概念実装、構築、運用）に細分化されている。「初期化」と「概念実装」という、v1の原型には無かった段階が追加された形になる。

重要なのは、これらのステージが常に全部実行されるわけではないという点。**タスクに価値を追加するステージだけを実行する**アダプティブな実行モデルが採られている。

- 1行のバグ修正のような小さなタスクなら、要件定義や設計フェーズを飛ばしてほぼ直接コード生成に進む
- 新規マイクロサービスの立ち上げのような大きなタスクなら、アプリケーション設計・作業単位分解・非機能要件（NFR）分析・インフラ設計まで含むフルセットのステージを通る

## 14エージェント体制

ワークフローは14のエージェントで構成される。

- **11の専門ドメインエージェント**: 要件、アーキテクチャ、実装、テストなど各領域を担当
- **2つのレビュー専任エージェント**: 生成物のレビューのみを行う
- **adaptive-workflow composer**: ユーザーのタスク内容・コードベースのスキャン結果・実行中の状況から、そのリクエストに最適なステージ計画を提案する司令塔的エージェント

各ステージの実行結果は、v1から引き継がれた**承認ゲート**を通過してはじめて次に進む。「AIが全自動でやりきる」のではなく、都度人間がゲートで承認するという統制構造はv1の思想のまま維持されている。

## アダプティブ・スコープと深さの調整

- **9つの適応スコープ**: エンタープライズ規模からワークショップ（お試し・学習用途）規模まで、9段階のスコープが用意されており、フリーテキストで書いたタスクの意図から自動検出される
- **3段階の深さ**（最小 / 標準 / 包括的）と**3段階のテスト戦略**が用意されており、ワークフロー実行中でも動的に変更できる
- スコープ・深さ・テスト戦略のいずれも、固定的な設定ではなく実行中に調整可能な「つまみ」として設計されている

## 学習・トレーサビリティ機能

- 人間による修正が**永続的な行動ルール**として記録され、同じ誤りを繰り返さないようにフィードバックされる
- 約85種類のイベントからなる監査証跡が記録され、エンタープライズ用途でのトレーサビリティ要件に対応する
- チェックポイントからの再開や、任意のステージへのジャンプも可能

## モデルの柔軟性

高性能なモデル（Claude Opus級）を推奨しつつ、より下位のモデルでも一部機能を制限した形で動作するよう設計されている。すべてのハーネス・すべてのモデルで同一の体験を強制するのではなく、使えるモデルに応じて段階的に機能を絞る発想。

## リリースの経緯

`awslabs/aidlc-workflows`は元々v0.1系・v1.0系としてルールベースの実装を重ねてきたリポジトリで、v1.0系のある時点で「AIDLC v2 alpha」対応が追加され、その後2025年11月の発表でTypeScriptによる全面書き換え版としてv2が一般公開（GA）された、という順序で進化している。個々のリリース日付はCHANGELOG.md参照だが、この文書の裏取り時点では正確な年月日の確認までは取れていない。

## 出典

- [awslabs/aidlc-workflows (GitHub)](https://github.com/awslabs/aidlc-workflows)
- [awslabs/aidlc-workflows v2ブランチ](https://github.com/awslabs/aidlc-workflows/tree/v2)
- [Open-Sourcing Adaptive Workflows for AI-Driven Development Life Cycle (AI-DLC) | AWS DevOps & Developer Productivity Blog](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/)
- [AI-DLC Workflows v2 GitHub検索結果まとめ](https://github.com/awslabs/aidlc-workflows/tree/v2)
- [awslabs/aidlc-workflows CHANGELOG.md](https://raw.githubusercontent.com/awslabs/aidlc-workflows/main/CHANGELOG.md)

#ai-dlc #aws #software-development #methodology #ai-agent
