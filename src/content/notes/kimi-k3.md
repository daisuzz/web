---
created: "2026-08-26"
---
# Kimi K3

中国のAIスタートアップMoonshot AI（月之暗面）が2026年7月に公開した、2.8兆パラメータのオープンウェイトLLM。前世代のKimi K2系（2025年7月のKimi K2、2026年1月のK2.5、4月のK2.6）は2026年5月25日付で公式にディスコンとなっており、K3がその後継にあたる。公開時点で最大級のオープンウェイトモデルとされる。

## アーキテクチャ

- 総パラメータ数2.8兆、Mixture-of-Experts（MoE）構成で896個のエキスパートから16個を選択して推論する（アクティブパラメータ約1040億）。
- 93層のうち69層が**Kimi Delta Attention（KDA）**という線形アテンションとゲート付きMLA（Multi-head Latent Attention）を組み合わせたハイブリッドアテンション機構を採用し、残り24層はGated MLA。KDAにより100万トークン級の長文コンテキストでのデコードが最大6.3倍高速化するとMoonshotは説明している。
- ネイティブなマルチモーダル対応（画像などの視覚入力を直接処理）。
- 常時オンの推論モード「thinking mode」を搭載。

## コンテキスト長

最大100万トークン。長時間稼働するコーディングタスクや知識労働、深い推論を意識した設計。

## ベンチマーク・用途

実タスク自動化系のベンチマーク8種のうち4種（Automation Bench、SpreadsheetBench 2、BrowseCompなど）で首位。100万トークンのフルコンテキストをコンテキスト管理なしで使った評価では90.4のスコアを記録している。コーディング分野ではClaude Fable 5をFrontend Code Arenaベンチマークで上回ったとも報じられている。長時間稼働するコーディング・知識労働・視覚推論・エージェント的タスクを主なユースケースとして掲げている。

## 公開形態・ライセンス

- モデルの重みはHugging Faceで公開されており、vLLMでのKDA本番対応も同時にリリースされた。
- APIはOpenAI SDK互換で、OpenAI/Anthropic向けに書かれたツールチェーンからの移行障壁を下げている。
- ライセンスは独自の「Kimi K3 License」。直近12ヶ月の累計収益が2000万ドルを超えるMaaS（Model-as-a-Service）事業者は別途契約が必要、また月間アクティブユーザー1億人または月間収益2000万ドルを超える商用プロダクトは「Kimi K3」の名称を目立つ形で表示する義務がある、という条件付き。

## 出典

- [China's Moonshot Releases Breakthrough AI Model for Download - Bloomberg](https://www.bloomberg.com/news/articles/2026-07-27/china-s-moonshot-to-release-breakthrough-ai-model-for-download)
- [China's Moonshot AI releases Kimi K3, the largest open-source model ever - VentureBeat](https://venturebeat.com/technology/chinas-moonshot-ai-releases-kimi-k3-the-largest-open-source-model-ever-rivaling-top-u-s-systems)
- [Kimi K3: 2.8T Parameters, Open Weights, 1M Context, Benchmarks, Pricing - morphllm](https://www.morphllm.com/kimi-k3)
- [China's 2.8-trillion-parameter Kimi K3 beats Claude Fable 5 in Frontend Code Arena benchmark - Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/moonshot-releases-2-8-trillion-parameter-kimi-k3)
- [Kimi K3's full weights are here, but they're 'open' with a caveat - VentureBeat](https://venturebeat.com/technology/kimi-k3s-full-weights-are-here-but-theyre-open-with-a-caveat-what-enterprises-should-know)
- [moonshotai/Kimi-K3 · Hugging Face](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi K3: benchmarks, pricing, hardware requirements, and self-hosting - Northflank](https://northflank.com/blog/what-is-kimi-k3-self-hosting)
- [With Moonshot's free Kimi K3, China changes the sovereign AI playbook - restofworld](https://restofworld.org/2026/china-moonshot-kimi-k3-free-sovereign-ai/)

#kimi #moonshot-ai #llm #moe #ai
