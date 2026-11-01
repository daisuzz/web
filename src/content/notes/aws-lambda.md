---
created: "2026-11-01T12:01:00+09:00"
---
# AWS Lambda

AWSのサーバーレスコンピューティングサービス。2026-10時点で3つのフォームファクタを持つ。いずれもFirecracker上で動き、ワークロード間はVMレベルで分離されている。分離・状態・ライフサイクルの要件で選ぶ、というのが公式の整理。

- [[aws-lambda-event-functions]]: 従来の「Lambda関数」の新しい名前。イベントを受けてハンドラが処理する。1実行環境1リクエスト、wall-clock課金
- [[aws-lambda-web-functions]]: ポートをlistenするHTTPサーバーをそのまま動かす（2026-10）。1実行環境で最大128同時リクエスト、アクティブCPU課金
- [[aws-lambda-microvms]]: 信頼できないコード・AI生成コード向けのステートフルなサンドボックス（2026-06）。Dockerfileベース、1セッション1環境、suspend/resumeを自分で制御、寿命最大8時間

| | Event Functions | Web Functions | MicroVMs |
| --- | --- | --- | --- |
| 何を動かすか | イベントハンドラ | HTTPサーバー | Dockerfileで作る任意の環境 |
| 環境の割り当て | 1リクエストごと | 複数リクエストで共有 | 1セッションごと |
| 状態 | 基本ステートレス | 基本ステートレス | ステートフル（suspendで保持） |
| 寿命 | 1実行最大15分 | 1リクエスト最大15分 | 1台最大8時間 |
| 課金の軸 | 実行時間 × メモリ | アクティブCPU + メモリ | インスタンス秒 + スナップショット |

## 出典

- [AWS Lambda announces Lambda Web Functions - AWS（What's New）](https://aws.amazon.com/about-aws/whats-new/2026/10/aws-lambda-web-functions/)
- [Announcing AWS Lambda Web Functions - AWS News Blog](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/)
- [What is AWS Lambda? - AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [Run isolated sandboxes with full lifecycle control: AWS Lambda introduces MicroVMs - AWS News Blog](https://aws.amazon.com/blogs/aws/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/)

#aws #serverless #lambda #moc
