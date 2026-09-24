---
created: "2026-09-24"
---
# Amazon CloudWatch Omni

2026年9月にAWSが発表した、Amazon CloudWatchの次世代版にあたるオブザーバビリティ基盤。AIエージェント・アプリケーション・インフラの監視を1つの体験に統合している。AIを前提に作り直されていて、[[opentelemetry]]などのオープン標準の上に構築されている。AWSコンソールの外（専用のWeb UIとIDE拡張）で使うのが大きな特徴。

## 主な機能

- **トポロジの自動検出**: アカウント・リージョンをまたいでサービス、依存関係、golden metricsを自動で見つけ、手動設定なしにトポロジマップを作る
- **OpenTelemetryベース**: 既にCloudWatchに送っているテレメトリは再設定なしでOmniに出てくる。それ以外のワークロードはOpenTelemetryで計装し、OTLPエンドポイントに送る
- **統合検索**: ログ・メトリクス・トレースを横断して、自然言語かSQLで検索できる。組み込みのAIアシスタントが関連するテレメトリを探し、動的なビューを組み立てて根本原因の特定を手伝う
- **AIによる障害調査**: [[aws-devops-agent]]が調査セッションに参加する。エンジニアと同じテレメトリを元に、サービス横断で関連イベントを見つけ、依存グラフ上で根本原因の経路をたどり、次の一手を提案する。調査履歴は残るので、障害後の振り返りに使える
- **共同調査**: SRE・開発者・DBエンジニア・マネージャーが同じデータと調査コンテキストを共有する。エスカレーションで次の担当者が同じセッションに入っても、経緯がそのまま見られる
- **アクセス方法**: 単一のURLにIAM Identity Center経由のエンタープライズSSO（Okta、Azure ADなど）でログインする

## AIエージェント向けの機能

- VS Code・Cursor・Kiro向けのIDE拡張がある。拡張は無料で、**AWSアカウントなしでも使える**（Bedrockを使うためのAWS認証情報か、OpenAI・AnthropicなどのAPIキーがあればよい）。エージェントの計装・デバッグ・評価をローカルで回せる
- エージェントの実行はすべてトレースとして記録される
- 組み込みのevaluatorが17種類ある。correctness、coherence、helpfulness、faithfulness、retrieval quality、tool selection、routing correctnessなどを評価できる。AutoEvalやDeepEvalといったサードパーティのevaluatorも接続できる

[[amazon-bedrock-agentcore]]のObservabilityもOpenTelemetryベースでCloudWatchにエージェントのテレメトリを送る仕組みで、Omniはその可視化・評価側を受け持つ位置にある（推測）。

## 既存のCloudWatchとの関係

- 既存のログ・メトリクス・トレースは統合データストア経由でそのままOmniで使え、シグナル種別を横断した相関分析ができる
- 既存の計装・ダッシュボード・アラームも引き継がれる
- 操作の起点が「自分で作って保守するダッシュボード」から「アプリケーション中心」に変わる。触り方は、コンソールでの自然言語チャット、重要なシグナルをたどるガイド付きのクリック操作、AWS Agent Toolkitプラグイン経由で手元のツールから、の3通り

## 料金

- 送信・保存したテレメトリ量に対する課金
- ダッシュボードとアラートは追加料金なし
- クエリは月間取り込み量の5倍までは無料
- 対象アカウントには30日間の無料トライアルと、OTelテレメトリ取り込み向けの$1,000クレジットが付く

## 提供リージョン

GA時点では米国東部（バージニア北部）、米国西部（オレゴン）、欧州（アイルランド）の3リージョンのみ。

## 出典

- [Amazon CloudWatch Omni（製品ページ）](https://aws.amazon.com/cloudwatch/omni/)
- [What's New: Amazon CloudWatch Omni: AI-first observability for agents and applications](https://aws.amazon.com/about-aws/whats-new/2026/09/amazon-cloudwatch-omni-ai/)
- [AWS Blog: Introducing Amazon CloudWatch Omni: collaborative AI-powered observability for your applications](https://aws.amazon.com/blogs/aws/introducing-amazon-cloudwatch-omni-collaborative-ai-powered-observability-for-your-applications/)
- [AWS Blog: Introducing Amazon CloudWatch Omni: AI-powered observability for generative AI and agentic workloads](https://aws.amazon.com/blogs/aws/introducing-amazon-cloudwatch-omni-ai-powered-observability-for-generative-ai-and-agentic-workloads/)
- [AWS Cloud Operations Blog: Introducing Amazon CloudWatch Omni: Observability for the AI Era](https://aws.amazon.com/blogs/mt/introducing-amazon-cloudwatch-omni-observability-for-the-ai-era/)

#aws #observability #opentelemetry #ai
