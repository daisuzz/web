---
created: "2026-10-13T12:01:00+09:00"
updated: "2026-11-01"
---
# AWS Lambda Event Functions

従来からある「Lambda関数」の新しい呼び名。2026-10-12に [[aws-lambda-web-functions]] が登場したのに合わせて、HTTPネイティブなWeb Functionsと区別するために改名された。イベントを受け取り、処理し、レスポンスを返すというモデルを名前で表している。

## 改名で変わったこと・変わらないこと

- 変わったのは名前だけ。コード変更・再デプロイは不要
- APIオペレーション（`CreateFunction`、`Invoke` など）、SDK、CLI、CloudFormationの `AWS::Lambda::Function`、ARNは引き続き `function` のまま。IaCテンプレートやIAMポリシーも書き換え不要
- コンソール上の表示は「Event function」
- ドキュメントは「Lambda Event Functions（previously known as Lambda functions）」という表記になっている

## モデル

- トリガー（イベントソース）を設定し、イベントが来るとハンドラ関数が呼ばれる。イベントソースの例: API Gateway経由のHTTPリクエスト、DynamoDBの変更、SQSのメッセージ、S3へのアップロード
- 1つの実行環境は同時に1リクエストだけ処理する。同時リクエストが増えると実行環境の数が増える
- 課金はwall-clockの実行時間 × メモリ（＋リクエスト数）。I/O待ちの時間も課金対象
- 1回の実行は最大15分

## 呼び出し方

- **同期呼び出し**（`RequestResponse`、デフォルト）: レスポンスを待つ。ペイロード上限6MB
- **非同期呼び出し**（`InvocationType=Event`）: キューに積んで即返る。ペイロード上限1MB（2025-10に256KBから引き上げ）
- HTTPで公開したい場合はAPI Gateway、ALB、関数URLなどを前段に置き、HTTPリクエストをイベント（JSON）に変換して渡す形になる。既存のExpress等のWebアプリを載せるにはLambda Web Adapterのようなアダプタが必要だった——ここをネイティブに解決したのがWeb Functions

## Web Functionsとの使い分け

公式の整理では、キューのメッセージ処理やファイルアップロードのようなイベント駆動処理はEvent Functions、HTTPトラフィックを直接受けて返すワークロードはWeb Functions。詳しい比較は [[aws-lambda-web-functions]] を参照。

## [[aws-lambda]]の中での位置づけ

Lambdaの3形態（Event Functions / [[aws-lambda-web-functions]] / [[aws-lambda-microvms]]）のうち、元からある形態。イベントを1件ずつ受けて処理し、1つの実行環境は同時に1リクエストだけ扱う。

## 出典

- [AWS Lambda announces Lambda Web Functions - AWS（What's New）](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/)
- [What is AWS Lambda? - AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [How Lambda works - AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/concepts-basics.html)
- [Understanding Lambda Event Function scaling - AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html)
- [Invoke - AWS Lambda API Reference](https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html)
- [AWS Lambda increases maximum payload size from 256 KB to 1 MB for asynchronous invocations - AWS](https://aws.amazon.com/about-aws/whats-new/2025/10/aws-lambda-payload-size-256-kb-1-mb-invocations/)
- [Using response streaming with AWS Lambda Web Adapter to optimize performance - AWS Compute Blog](https://aws.amazon.com/blogs/compute/using-response-streaming-with-aws-lambda-web-adapter-to-optimize-performance/)
- [Serverless Computing - AWS Lambda Event Functions](https://aws.amazon.com/lambda/lambda-functions/)

#aws #serverless #lambda
