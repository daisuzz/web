---
created: "2026-08-29"
---
# AWS CodePipeline

ソース取得→ビルド→テスト→デプロイという一連のCI/CDワークフローをオーケストレーションするAWSのマネージドサービス。ビルドやデプロイの実処理そのものは行わず、各ステージで他のサービス（CodeBuild、CodeDeployなど）を呼び出して繋ぎ合わせる「指揮者」の役割に徹する。

## 基本構造: pipeline / stage / action / transition

- **pipeline**: 一意な名前を持つワークフロー全体。複数のstageで構成される。
- **stage**: 直列または並列に実行される複数のactionのまとまり（例: Source, Build, Deploy）。
- **action**: 実際の処理単位。タイプは`source`/`build`/`test`/`deploy`/`approval`/`invoke`の6種類。
  - `source`: CodeCommit、GitHub、S3、ECRなどからソースを取得
  - `build`: CodeBuild、Jenkinsなどでビルド・テストを実行
  - `deploy`: CodeDeploy、ECS、CloudFormation、S3、Elastic Beanstalkなどへデプロイ
  - `approval`: 手動承認ステップ。人間の承認があるまでパイプラインを止める
  - `invoke`: Lambda関数などを呼び出す
- **transition**: あるstageのactionが完了して次のstageへ実行が進む「継ぎ目」。デフォルトでは有効だが、明示的に無効化してパイプラインの実行がそこから先に進まないようにブロックできる（無効化中に複数の実行が到達した場合、有効化時には最新の実行だけが先に進む）。

ステージ間のデータ受け渡しは「artifact」と呼ばれ、内部的にはS3バケット経由で行われる。

## CodeBuildとの関係

CodePipelineとCodeBuildは役割が異なるレイヤーのサービス。

- **CodePipeline**: CI/CDワークフロー全体（ソース取得・ビルド・デプロイ・承認など）を順序立てて実行する「オーケストレーター」
- **CodeBuild**: `buildspec.yml`の`install`/`pre_build`/`build`/`post_build`フェーズに従ってコンパイル・テスト・パッケージングを実際に行う「ビルド実行エンジン」

CodePipelineのbuildステージからCodeBuildプロジェクトを呼び出すのが典型的な構成だが、CodeBuildプロジェクト単体でもGitHubのWebhookなどから直接トリガーして動かせる。つまり`buildspec.yml`とCodeBuildプロジェクトが存在するという事実だけでは、その裏にCodePipelineが存在するかどうかは判断できない。CodePipeline経由かどうかは、AWSコンソールのCodePipelineサービス画面や、CloudFormation/Terraform等のIaC定義に`AWS::CodePipeline::Pipeline`リソースがあるかで確認する。

## パイプラインタイプ（V1 / V2）と料金

- **V1**: 月額固定 $1.00/アクティブパイプライン（30日を超えて存在し、その月に1回以上コード変更が流れたパイプラインを「アクティブ」と呼ぶ）。作成から30日間は無料。無料利用枠は月1パイプラインまで無料。
- **V2**: アクション実行時間に応じた従量課金、$0.002/アクション実行分（開始から完了まで、切り上げ分単位）。手動承認アクションとカスタムアクションタイプは課金対象外。無料利用枠は月100アクション実行分。
- V2ではパイプライン変数（parameterized pipelines）などV1にない機能が追加されている。

V1は予測しやすい定額、V2は使った分だけ課金される従量制という設計思想の違い。

## ソースプロバイダとしてのCodeCommit

AWSは2024年6月にCodeCommitの新規顧客受付を停止していたが、2025年11月24日に方針を転換し、新規顧客の受付を再開してGA(General Availability)に復帰した。既存ユーザーは受付停止期間中も通常通り利用可能だった。CodePipelineのsourceアクションではCodeCommitに加えてGitHub、S3、ECRなどもソースプロバイダとして選べる。

## 出典

- [CodePipeline concepts - AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html)
- [How pipeline executions work - AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts-how-it-works.html)
- [Working with stage transitions in CodePipeline - AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/transitions.html)
- [Pipeline types - AWS CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipeline-types.html)
- [AWS CodePipeline Pricing](https://aws.amazon.com/codepipeline/pricing)
- [Build specification reference for CodeBuild - AWS CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [AWS CodeCommit Returns to General Availability - AWS DevOps Blog](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability)

#aws #cicd #codepipeline #codebuild #devops
