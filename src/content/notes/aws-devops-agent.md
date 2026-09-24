---
created: "2026-09-24"
---
# AWS DevOps Agent

AWSが提供する、運用（SRE）業務を自律的にこなすAIエージェント。インシデントの調査・解決・予防、アプリケーションの信頼性とパフォーマンスの改善、SREのオンデマンドなタスクをこなす。対象はAWSに限らず、マルチクラウドやオンプレミスの環境も含む。

## 経緯

- **2025年12月（re:Invent 2025）**: 長時間にわたって自律的に動くAIエージェント群「frontier agents」の一つとしてパブリックプレビューになった
- **2026年3月31日**: AWS Security Agentとともに、frontier agentsの最初の2つとしてGAになった
- **2026年6月17日（AWS New York Summit）**: リリース管理機能がプレビューで追加され、運用だけでなくデリバリー側もカバーするようになった
- **2026年9月**: [[amazon-cloudwatch-omni]]の障害調査機能の中核として組み込まれた

## 仕組み

- **Agent Space**: エージェントを設定・管理する単位。この中で、対象となるAWSアカウントや連携ツールを紐付ける
- **トポロジグラフ**: アプリケーションのリソースとその関係を学習してグラフにする。オブザーバビリティツール、runbook、コードリポジトリ、CI/CDパイプラインをまたいで、テレメトリ・コード・デプロイのデータを相関させる
- **権限**: IAMロールでリソースを検出・参照する。デフォルトは読み取り専用で、AWS管理ポリシー `AIDevOpsAgentAccessPolicy` を付ければ追加設定なしで読み取り専用アクセスになる。付与するIAMポリシーでアクセス範囲を絞れる
- **Web app**: 調査データや結果を見るためのUI。閲覧用のロールも最小権限で設定する

## できること

### インシデント調査

- アラートなどをきっかけに調査を始め、ライブのインシデントを原因となったコード変更やデプロイまでたどる
- 調査結果として、根本原因の分析と対処手順を出す。インシデントの説明、アカウントとリージョン、タイムスタンプ、具体的な修復手順が含まれる
- 運用者がmitigation planや改善提案を確認し、会話の中からそのままエージェントに実行させられる（directed actions）

### 予防的な改善提案

過去のインシデントのパターンを分析し、次の4つの領域について改善を提案する。

- オブザーバビリティ
- インフラの最適化
- デプロイパイプラインの強化
- アプリケーションのレジリエンス

### リリース管理（2026年6月時点でプレビュー）

- **Release readiness review**: コード変更を、本番要件、依存関係の安全性、チームがエージェントに定義した基準やベストプラクティスと照らし合わせて評価する
- **Autonomous release testing**: 固定のテストスイートを流すのではなく、変更内容を推論して専用のテストを組み立てる。機能の正しさ、振る舞いのリグレッション、結合シナリオを確認する
- プレビュー中はバージニア北部リージョンのみで、追加料金はかからない

### その他（GA時点）

- AzureやオンプレミスのアプリケーションもAgent Spaceの対象にできる
- カスタムのagent skillで機能を拡張できる
- カスタムのチャートやレポートを作れる

## 連携先

- **オブザーバビリティ**: Amazon CloudWatch、Datadog、Dynatrace、Grafana、New Relic、Splunk
- **コード/CI**: GitHub、GitLab、Azure DevOps
- **コミュニケーション/インシデント管理**:
  - Slack: 調査結果や対処手順を流す
  - ServiceNow: インシデントを自動作成し、根本原因の欄を埋める
  - PagerDuty: アラートで調査を始め、結果をPagerDutyのインシデントに書き戻す

## 料金

- エージェントが実際に作業している時間に対して、$0.0083/agent-secondで課金される（1時間あたり約$29.88）
- 調査、評価、チャットなどのオンデマンドタスク、カスタムエージェントはすべて同じ単価。待機中は無料
- 新規顧客には、GA後の最初の運用タスクから2か月の無料トライアルがある。AWS Free Tierの無料プランにも含まれる
- AWS Supportの契約者には、前月のSupport費用に応じて毎月クレジットが付く（Unified Operationsは100%、Enterprise Supportは75%、Business Support+は30%）

## 出典

- [AWS DevOps Agent is now generally available（What's New, 2026-03）](https://aws.amazon.com/about-aws/whats-new/2026/03/aws-devops-agent-generally-available)
- [Introducing AWS DevOps Agent (preview)（What's New, 2025-12）](https://aws.amazon.com/about-aws/whats-new/2025/12/devops-agent-preview-frontier-agent-operational-excellence/)
- [AWS launches frontier agents for security testing and cloud operations（AWS ML Blog）](https://aws.amazon.com/blogs/machine-learning/aws-launches-frontier-agents-for-security-testing-and-cloud-operations/)
- [AWS DevOps Agent adds release management capabilities to assess code changes before production (preview)（AWS News Blog）](https://aws.amazon.com/blogs/aws/aws-devops-agent-adds-release-management-capabilities-to-assess-code-changes-before-production-preview/)
- [AWS DevOps Agent FAQs](https://aws.amazon.com/devops-agent/faqs/)
- [AWS DevOps Agent Pricing](https://aws.amazon.com/devops-agent/pricing)
- [AWS DevOps Agent User Guide: About AWS DevOps Agent](https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent.html)
- [AWS DevOps Agent User Guide: DevOps Agent IAM permissions](https://docs.aws.amazon.com/devopsagent/latest/userguide/aws-devops-agent-security-devops-agent-iam-permissions.html)
- [AWS DevOps Agent User Guide: Working with directed actions](https://docs.aws.amazon.com/devopsagent/latest/userguide/working-with-devops-agent-working-with-directed-actions.html)

#aws #ai #sre #observability
