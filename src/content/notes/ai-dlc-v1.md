---
created: "2026-08-18"
---
# AI-DLC v1

AWSが提唱する、AIエージェントが開発作業の大半を担うことを前提に設計されたソフトウェア開発方法論。AWS DevOpsブログ「Building with AI-DLC using Amazon Q Developer」（2025年7月公開）で最初に発表された。ここでいう「v1」はこの最初に定義された方法論そのものを指す。[[ai-dlc-v2]]（OSS実装のメジャーバージョン2）と区別するための便宜的な呼び方で、AWS自身が"v1"という番号をこの方法論に明示的に振っているわけではない点に注意。

## 解決しようとしている課題

- **アドホックなAIコーディング（いわゆるvibe coding）の限界**: 小さなスクリプトなら気軽にAIに書かせて動かせばよいが、プロジェクト規模が大きくなるとコンテキストドリフト（会話が長くなるにつれ元の意図から逸脱していく）、なぜその実装になったかという意思決定記録の欠落、予期しない挙動の発生といった問題が顕在化する
- **人間の関与のバランス**: 逆に人間がAIの提案を細かくチェックしすぎると、AIによる高速化のメリットが失われる。かといって完全に自動化してしまうと、重要な検証・監督の機会から人間が締め出されてしまう。この両極のバランスを取ることが狙い
- **開発サイクルの単位が実情に合っていない**: 2週間スプリントのような固定サイクルは、AIが数時間〜数日で成果物を出せる速度感に合わない

## 全体設計: 3フェーズ

方法論の骨格は3つのフェーズで構成される。

- **Inception（構想）**: 「何を」「なぜ」作るかを決めるフェーズ。AIがビジネス上の意図を要件・ユーザーストーリー・作業単位（units of work）に変換する
- **Construction（構築）**: 「どう」作るかを決めるフェーズ。Inceptionで確定した文脈をもとに、AIがアーキテクチャ・ドメインモデル・コード・テストを提案する
- **Operations（運用）**: 蓄積された文脈をインフラ構築・デプロイ・運用タスクに適用するフェーズ

各フェーズを通じて一貫しているのは、「AIが叩き台を作り、人間が承認してから次に進む」というゲート構造。AIの提案を無条件に採用するのではなく、常に人間が最終判断を下す。

## Bolt: スプリントに代わる反復単位

AI-DLCでは、2週間スプリントに代わる最小の反復単位として**Bolt**という概念を導入している。数時間から数日という短いサイクルで1つの作業単位を回すもので、AIが人間よりずっと速く成果物を出せることを前提に、反復の粒度そのものを小さくしている。

## Mob Elaboration / Mob Construction: 同期的な検証儀式

AI-DLCの中核にある実践が、各フェーズに対応する2つの「モブ」形式の儀式。

### Mob Elaboration（Inceptionフェーズ）

AIが要件案・確認質問を次々に提示し、プロダクト・エンジニアリング・QAなど職能を横断したメンバーが一堂に会し、**同期的に・リアルタイムで**その場で検証していくセッション。AIが出す質問や提案に対してチームがその場で反応し、要件やユーザーストーリー、作業分解を確定させていく。非同期のレビュー（後でSlackにコメントする、PRに後からコメントを付ける、など）ではなく、AIの生成物が出てくるそばから複数の視点で即座にチェックする点がポイント。

### Mob Construction（Constructionフェーズ）

Mob Elaborationで確定した要件をもとに、AIがアーキテクチャ・ドメインモデル・コードを提案する。これも同様に、チームが同じ場でリアルタイムに技術的な意思決定を検証していく。

これらの儀式が担っている役割は、「AIの提案を鵜呑みにしない」「承認された計画だけが実行される」「関係者全員が最終成果物をレビュー・検証する」という統制を、開発の初期段階から組み込むこと。

## トレーサビリティと監査証跡

要件・ユーザーストーリー・設計判断・コード変更といった各成果物は相互にトレース可能な形で扱われ、人間が行った承認・判断はすべて監査証跡として記録される。「人間がAIの加速を導くコンパスであり続ける」という思想が、この記録の仕組みによって裏付けられている。

## 生産性についての言及

AWSはre:Invent 2025のセッション（DVT214）などで、AI-DLCによる開発速度の大幅な向上（10〜15倍というオーダーの数字）を紹介している。ただしこれはAWS自身の発表による数字で、独立した第三者による検証結果ではない点は踏まえておく必要がある。

## 方法論と実装の関係

AI-DLCはあくまで**方法論**であり、特定のツールに縛られない。AWSはこの方法論を体現するOSSのルールベース実装として`awslabs/aidlc-workflows`を公開しており、Amazon Q Developer・Kiro・Claude Code・Cursor・GitHub Copilot・Codex CLIなど複数のAIコーディングエージェント上で動作する。この実装は当初「一つの手順を全プロジェクトに一律適用する」形だったため画一的になりがちという課題を抱えており、それを解消する形で全面刷新されたのが[[ai-dlc-v2]]（AI-DLC Workflows 2.0）。

## 出典

- [Building with AI-DLC using Amazon Q Developer | AWS DevOps & Developer Productivity Blog](https://aws.amazon.com/blogs/devops/building-with-ai-dlc-using-amazon-q-developer)
- [Open-Sourcing Adaptive Workflows for AI-Driven Development Life Cycle (AI-DLC) | AWS DevOps & Developer Productivity Blog](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/)
- [How AWS's AI-DLC defines an AI-Native methodology (ttpsc)](https://ttpsc.com/en/blog/how-aws-ai-dlc-defines-an-ai-native-methodology/)
- [I Opened AI-DLC's Mob Elaboration to Strangers (AWS Builder Center)](https://builder.aws.com/content/3HRX5hF8YeB0TFmg9I6cxWEPFM6/i-opened-ai-dlcs-mob-elaboration-to-strangers)
- [AWS re:Invent 2025 - Introducing AI driven development lifecycle (AI-DLC) (DVT214) - DEV Community](https://dev.to/kazuya_dev/aws-reinvent-2025-introducing-ai-driven-development-lifecycle-ai-dlc-dvt214-32b)
- [AI-DLC Flow Overview - specs.md](https://specs.md/aidlc/overview)

#ai-dlc #aws #software-development #methodology #ai-agent
