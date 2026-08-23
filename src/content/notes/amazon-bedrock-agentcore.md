---
created: "2026-08-20"
---
# Amazon Bedrock AgentCore

AIエージェントを本番環境で安全に・大規模に動かすためのAWSのマネージドサービス群。2025年7月にプレビュー公開され、2025年10月13日にRuntime / Memory / Gateway / Identity / Observability / Browser / Code Interpreterの中核コンポーネントが東京を含む9リージョンでGA（一般提供）した。Bedrockという名前がついているが特定の基盤モデルに縛られず、モデル・フレームワーク・プロトコルを問わず使える「エージェントのためのインフラ」という位置づけ。

## 設計思想: フレームワーク非依存・モデル非依存

AgentCoreは特定のエージェントフレームワークを提供するのではなく、Strands Agents・LangGraph・LangChain・CrewAI・LlamaIndex・Google ADK・OpenAI Agents SDK・自作ループ（BYO）など好きなフレームワークで書いたエージェントコードをそのままホストできることを謳っている。同様にBedrock以外のモデルプロバイダーも利用可能で、通信プロトコルもMCP（Model Context Protocol）やA2A（Agent2Agent）など標準的なものに対応する。「サーバーレスで動かす場所（Runtime）」と「エージェントに共通して必要な横断的関心事（記憶・認証・ツール接続・監視）」を分離し、それぞれを独立したマネージドサービスとして組み合わせられるように設計されている。

## 構成要素

AgentCoreは以下のような複数の独立したサービス（Composable Services）の集合で、個別に使うことも組み合わせて使うこともできる。

### Runtime
エージェントやツールのコードをホストするサーバーレス実行環境。セッションごとに専用のFirecracker microVM（独立したCPU・メモリ・ファイルシステムを持つ軽量仮想マシン）が割り当てられ、コンテナのようにリソースを使い回さない。セッション終了後はmicroVMごと破棄されメモリもサニタイズされるため、あるユーザーのセッションが別ユーザーのデータにアクセスするリスクを構造的に排除している。長時間実行（最大8時間）のプロセスやステートフルな処理にも対応し、セッションの一時停止・再開をまたいでファイルシステムの状態（インストール済みパッケージやビルド成果物など）を保持できる。
呼び出し時の認証（Inbound Auth）はAWS IAM(SigV4)かJWT(OIDC)ベアラートークンのどちらか一方を選ぶ。
デプロイ方式は2種類あり、自分でエージェントループを書いたコードをそのまま持ち込む「Code-based Runtime」と、設定ファイル（モデル・プロンプト・ツール・メモリ）を宣言するだけでAgentCore側がループを実行してくれる「Managed Harness」がある。

### Gateway
既存のAWS Lambda関数・REST API（OpenAPI仕様）・Smithyモデルを、数行の設定でMCP互換のツールに変換して公開する統合ポイント。エージェントからのMCPリクエストをAPI呼び出しやLambda実行に変換（翻訳）してくれるため、エージェント側は個々のAPIごとの通信方式を意識せずに済む。ツール呼び出し時の認証（Ingress認証）と、Gatewayから背後のAPI・Lambdaへの認証（Egress認証）の両方をマネージドで扱える点が特徴とされる。

### Identity
エージェントおよびエージェントが呼び出す外部サービスへのアクセスを管理する認証基盤。Runtimeを作成すると自動的にARNを持つ「Workload Identity」が発行され、エージェントを個別の主体として管理・監査・権限付与できる。Okta/Entra ID/CognitoなどのOIDCプロバイダーと連携するInbound Auth（誰がエージェントを呼び出せるか）と、エージェントがユーザーに代わってGoogle CalendarやGitHubなど外部サービスにアクセスするOutbound Auth（3-legged OAuthなど）を分離して提供する。

### Memory
LLMが会話間で記憶を持たないという制約に対応するマネージドの記憶ストア。セッション内の直近の会話文脈を保持する短期記憶（Short-Term Memory）と、複数セッションをまたいで永続化される長期記憶（Long-Term Memory）の2階層構造を持つ。長期記憶側は「Memory Strategy」という抽出ルールで生の会話ログから何を抽出しどう構造化するかを決める。組み込みのStrategyとしてSemantic（会話中の事実・知識の抽出）、Summary（会話の要約）、User Preference（ユーザーの好み）、Episodic（過去のやり取りの出来事単位の記憶）の4種類がある。

### Observability
OpenTelemetry（[[opentelemetry]]参照）ベースでエージェントのトレース・メトリクス・ログを収集し、Amazon CloudWatchなどで可視化・監視できるようにする機能。エージェント特有の「どのツールが何回呼ばれたか」「LLM呼び出しのレイテンシ・トークン数」といった情報も追跡できる。

### Browser Tool / Code Interpreter
どちらもエージェントに実世界の操作能力を与えるための隔離されたサンドボックス実行環境。Browser Toolはヘッドレスブラウザ操作（Webサイトの閲覧・フォーム入力など）を、Code InterpreterはPython/JavaScript/TypeScriptコードの実行（データ分析やグラフ生成など）をそれぞれ隔離環境で行わせる。どちらもネットワークアクセスの範囲を「Sandbox（限定的な外部アクセスのみ）」「Public（インターネットへのアウトバウンドを許可）」「VPC（プライベートリソースへの接続を許可しつつ外部インターネットからは隔離）」の3段階から選べる。

### Policy / Evaluation（比較的新しい追加コンポーネント）
Policyは、Cedarポリシー言語でエージェントの振る舞い・アクセス権をガバナンスするための機能。Evaluation（Harness）は本番投入前にエージェントの挙動をオンデマンド/オンラインで評価・改善するための機能で、いずれもRuntime/Gateway/Memory/Identity/Observabilityよりも後に追加された比較的新しいコンポーネント。

## 開発フロー

現在推奨されているCLIは`agentcore`（`@aws/agentcore`パッケージ、Python向けの旧CLIだった`bedrock-agentcore-starter-toolkit`は非推奨）。

```bash
agentcore create   # 対話形式でプロジェクトを初期化(フレームワーク選択含む)
agentcore dev      # ファイル変更を監視しながらローカルで開発・実行
agentcore deploy   # AWS上のAgentCore Runtimeへデプロイ
agentcore add      # Memory/Identity/Evaluationなどの機能を追加
agentcore invoke   # デプロイ済みエージェントを呼び出してテスト
```

コード側は`bedrock-agentcore` Python SDK（github.com/aws/bedrock-agentcore-sdk-python）でMemory/Gateway/Identityなどの機能をグルーコードなしで呼び出せる。

## 料金体系

サブスクリプションや最低利用料金がなく、13種類ほどの構成要素それぞれに従量課金が設定されている。Runtime/Browser/Code Interpreterは秒単位でCPU・メモリ使用量に応じて課金される（目安としてvCPUは$0.0895/時間、メモリは$0.00945 GB/時間）。特徴的なのは、CPU課金は実際に消費したCPUサイクルのみが対象でI/O待ち（LLMのレスポンス待ちやAPI呼び出し待ちなど）の間は課金されない一方、メモリ課金はセッションが生きている間（アイドル中含む）ずっと発生し続ける点。エージェントのワークロードは処理時間の3〜7割がI/O待ちと言われており、このCPU/メモリの課金非対称性が実質的なコストメリットになるとされている。

## 出典

- [Amazon Bedrock AgentCore Documentation (AWS公式)](https://docs.aws.amazon.com/bedrock-agentcore/)
- [Make agents a reality with Amazon Bedrock AgentCore: Now generally available (AWS News Feed経由)](https://aws-news.com/article/2025-10-13-make-agents-a-reality-with-amazon-bedrock-agentcore-now-generally-available)
- [Amazon Bedrock AgentCore is now generally available (AWS What's New)](https://aws.amazon.com/about-aws/whats-new/2025/10/amazon-bedrock-agentcore-available)
- [Use isolated sessions for agents - Amazon Bedrock AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-sessions.html)
- [Amazon Bedrock AgentCore Gateway: A secure AI gateway for agents, tools, and models](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html)
- [Authenticate and authorize with Inbound Auth and Outbound Auth](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-oauth.html)
- [Execute code and analyze data using Amazon Bedrock AgentCore Code Interpreter](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/code-interpreter-tool.html)
- [amazon-bedrock-agentcore-samples (awslabs, GitHub)](https://github.com/awslabs/amazon-bedrock-agentcore-samples)
- [Get started with the AgentCore CLI](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html)
- [Amazon Bedrock AgentCore Pricing](https://aws.amazon.com/bedrock/agentcore/pricing/)

#aws #bedrock #ai-agent #mcp
