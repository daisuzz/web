---
created: 2026-08-29
---

# CodeBuild-hosted GitHub Actions runner

AWSが2024年4月に発表した機能。AWS CodeBuildのプロジェクトを、GitHub Actionsのself-hosted runnerのバックエンドとして使えるようにするもの。GitHubリポジトリにWebhook（フィルターグループで`WORKFLOW_JOB_QUEUED`を選択）を設定しておくと、GitHub ActionsのワークフローでジョブがキューされるたびにCodeBuildがそれを受け取り、ジョブ1つにつき1つのephemeralなランナーをCodeBuildコンテナ上に起動する。ジョブが終わるとランナーとビルドは即座に終了する。

ワークフロー側は`runs-on:`にCodeBuildプロジェクトに対応するラベルを指定するだけでよい。ラベルにimage/instanceのオーバーライドを書けば、プロジェクトを複数作らずに単一のCodeBuildプロジェクトのままマトリクスビルド（異なる実行環境）に対応できる。ただしWebhook自体は1プロジェクト＝1リポジトリの単位なので、複数リポジトリで使う場合はリポジトリごとにプロジェクトとWebhookを作る必要がある。

## 素のCodeBuild（GitHub Webhookで直接起動）との違い

CodeBuildには、GitHub Actionsを介さずGitHubのWebhookで直接CodeBuildプロジェクトを起動する従来の使い方もある（`buildspec.yml`をそのままCodeBuildが実行する構成）。この従来構成とCodeBuild-hosted GitHub Actions runnerを比べると、論点は大きく分けて「トリガーの柔軟性」と「コスト構造」になる。

### トリガーの柔軟性は明確に向上する

素のCodeBuild Webhookは、フィルターグループとして`PUSH`/`PULL_REQUEST_CREATED`/`UPDATED`/`MERGED`/`REOPENED`/`RELEASED`やコメントベースのトリガーなど限られたイベント種別と、`FILE_PATH`/`COMMIT_MESSAGE`/`HEAD_REF`/`BASE_REF`によるフィルタしか組めない。GitHub Actions経由にすると以下が使えるようになる。

- `workflow_dispatch`: パラメータ付きの手動実行がGitHub UI/CLIから直接できる
- `schedule`（cron）: ワークフローYAML内に直接書ける（素のCodeBuildだとEventBridgeの別ルールが必要）
- より細かいPRイベント（`labeled`、`review_requested`、`ready_for_review`など）
- `concurrency:`によるジョブの自動キャンセル
- マトリクスビルド（1つのワークフローYAMLで複数環境を並列実行）
- `environments`による手動承認ゲート、reusable workflow/composite actionによるCI定義の再利用

### コストは「下がる」というより「構造が変わる」

素のCodeBuild直起動はGitHub Actionsを一切経由しないため、AWS側のCodeBuild課金（インスタンスタイプ別の分課金）だけで完結する。一方CodeBuild-hosted GitHub Actions runnerは**GitHub Actionsのジョブとして実行される**ため、AWS側のCodeBuild課金に加えてGitHub側のself-hosted runner課金にも乗る。2026年3月以降はprivateリポジトリのself-hosted runnerにも$0.002/分のプラットフォーム利用料がかかるようになっており、以前のように「self-hosted＝GitHub側の課金ゼロ」ではなくなっている。つまり素のCodeBuild直起動と比べると、課金レイヤーが1つ増える方向に働く。

AWS CodeBuildの`general1.small`（$0.005/分）とGitHub Actions Linuxランナー（$0.006/分）の単価差は1,000分あたり$1程度で、この差自体はAWSサービス構成が複雑になるコストに見合わないことが多いとも指摘されている。CodeBuild-hosted runnerを選ぶ意味が出てくるのは、単価差そのものよりも、VPCアクセス・大型インスタンス・IAMネイティブ統合が必要な場面。

## メリット

- 上記のトリガーの柔軟性（workflow_dispatch、schedule、matrix、environments、reusable workflow）
- GitHub Actions Marketplaceのエコシステムがそのまま使え、`buildspec.yml`のシェルスクリプトで自前実装していた処理を既存Actionに置き換えられる
- ログ・実行状況がGitHub Actions UIに統一され、AWSコンソールにサインインしなくても開発者が確認できる
- IAM Role、Secrets Manager、VPCなどAWSネイティブな仕組みをランナー側からそのまま使える
- OIDCの仕組みはAWS以外のクラウド/サービスにも同じやり方で広げられる

## デメリット・制約

### 同時実行数（concurrency）

- CodeBuildのアカウント/プロジェクト単位の同時ビルド数はデフォルトで低いことが多く（1件のみに制限されるケースもある）、ソフトリミットなのでAWSサポートへのクォータ引き上げ申請が必要になる。
- 既知の問題として、複数ジョブを同時に起動すると一部がGitHub側で「Waiting for a runner to pick up this job...」のまま止まり、CodeBuild側は「Listening for Jobs」のまま進まなくなることがある（AWS re:Postで報告あり）。

### ランナートークンの有効期限

CodeBuildが発行するGitHub Actionsランナートークンは発行から1時間で失効する。依存関係のインストールが重いジョブ（install/pre_buildフェーズが長い）だと、ジョブ完了前にタイムアウトするリスクがある。

### キャッシュ・ネットワークコスト

- Docker layer cacheはデフォルトで永続化されない。`cache-from`/`cache-to`を自前で設定してもtarballとしてアップロード/ダウンロードするため、ビルドごとにネットワーク転送コストが二重にかかる。
- GitHub Actions Cache（`actions/cache`）へのアクセスも、GitHub-hostedランナー（キャッシュサービスと同じAzureネットワーク内）に比べ、CodeBuild-hosted runner（AWS側）からは大幅に遅くなるという報告がある。
- プライベートサブネットでVPC内リソースにアクセスする構成にすると、GitHub API/npm/ECRなどへの外向き通信にNAT Gatewayが必要になり、依存関係ダウンロードやDockerレイヤー転送のネットワークコストがコンピュートコストを上回ることもある。

### 観測性の二重管理

ビルドログはCloudWatch Logsに出る一方、GitHub Actions UI側のログ表示とは別管理になる。障害調査時にどちらを見るか、AWSコンソールへのアクセス権をチーム内でどう配るかが運用上の論点になる。

### IAM・セキュリティ設計の複雑さ

GitHub側のOIDC（Actions→AWS）と、CodeBuildサービスロール（AWS→GitHub Webhook受信〜ランナー起動）の両方の権限設計を管理する必要があり、GitHub-hostedランナー＋OIDCだけの構成より権限まわりの設計・監査対象が増える。

## 出典

- [Tutorial: Configure a CodeBuild-hosted GitHub Actions runner - AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/action-runner.html)
- [Self-hosted GitHub Actions runners in AWS CodeBuild - AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/action-runner-overview.html)
- [Label overrides supported with the CodeBuild-hosted GitHub Actions runner - AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/sample-github-action-runners-update-labels.html)
- [GitHub webhook events - AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/github-webhook.html)
- [AWS CodeBuild now supports organization and global GitHub webhooks](https://aws.amazon.com/about-aws/whats-new/2024/06/aws-codebuild-organization-global-github-webhooks/)
- [CodeBuild GitHub runners are randomly failing | AWS re:Post](https://repost.aws/questions/QUhRTAjGpRSfy7MfVdgmQD9A/codebuild-github-runners-are-randomly-failing)
- [Loading cache on AWS CodeBuild runner is way slower than on GitHub runner · Issue #1254 · docker/build-push-action](https://github.com/docker/build-push-action/issues/1254)
- [AWS CodeBuild vs GitHub Actions - Pricing Comparison](https://scavasoft.com/aws-codebuild-vs-github-actions-price/)
- [GitHub Actions Hosted vs Self-Hosted After January and March 2026 Pricing Changes](https://pocketlantern.dev/briefs/github-actions-hosted-vs-self-hosted-runner-pricing-2026)
- [How Kaltura Accelerates CI/CD Using AWS CodeBuild-hosted Runners (AWS DevOps Blog)](https://aws.amazon.com/blogs/devops/how-kaltura-accelerates-ci-cd-using-aws-codebuild-hosted-runners)
