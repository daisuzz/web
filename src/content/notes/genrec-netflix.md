---
created: 2026-08-18
updated: 2026-08-20
---
# GenRec (Netflix)

Netflixが開発したLLMベースの推薦ランキングシステム。2026年7月のNetflix TechBlog記事 "GenRec: Towards LLM-Native Recommendation at Netflix" と、arXiv論文 "GenRec: An LLM-Backed Recommendation Ranker at Netflix" (arXiv:2608.10257) で発表されている。

従来の推薦システムは手作りの特徴量やdense embeddingに依存する特徴量エンジニアリング型が主流だったが、そこにLLMを組み込むことで複雑さ・硬直性を解消することを狙っている。

## アーキテクチャ

- decoder-onlyのTransformerを土台にし、next-token-prediction（通常のLLM事前学習と同じ目的関数）で訓練する
- その上に**catalog-aware scoring head**を追加する。これはNetflixのカタログ内タイトルだけをスコアリングするヘッドで、推薦結果が必ず在庫作品の範囲内に収まることを保証する
- 推論時は自己回帰的なトークン生成（decoding）を行わない**prefill-onlyモード**で動作する。プロンプトを1回読み込むだけで、候補作品全体を1回のforward passでまとめてスコアリングする。トークンごとの逐次デコードが不要なため効率が良い
- ユーザーの視聴履歴・作品メタデータ・文脈を、手作り特徴量やembeddingベクトルに変換するのではなく、**自然言語または軽く構造化されたテキスト（会話的な表現）としてverbalize**する。この統一されたテキスト表現を、言語モデリング目的関数とcatalog-awareなランキング目的関数の両方の学習に使う

## 2フェーズの学習

1. **Phase 1（基盤モデル化）**: オープンソースLLMをNetflixのデータに適応させる。カタログ理解・会員行動理解・コンテンツ理解・instruction followingなどの能力をバランスさせ、Netflix特化の基盤モデルを作る
2. **Phase 2（ランキング特化のpost-training）**: Phase 1の基盤モデルを、推薦ランキング用のデータ・ラベル・報酬信号でpost-trainする。ビジネス要件と長期的な会員満足度に沿うよう、reward-weightedな目的関数を使う

## 成果

Netflixトラフィックの約10%を対象にした大規模A/Bテストで、成熟した本番ベースラインに対して短期・長期のオンライン指標の両方で統計的に有意な改善を達成した。Phase 2のラベル付き学習データは10〜40分の1で済み、手作り特徴量への依存も大幅に減らせている。

## 関連・混同しやすいもの

- Netflixは別途「Towards Generalizable and Efficient Large-Scale Generative Recommenders」という記事で、生成的推薦モデルをO(100万)パラメータからO(10億)パラメータへスケールする取り組みも公開している。GenRecと関連はするが別の話題として扱われている
- 2023年に別チームが発表した同名の論文 "GenRec: Large Language Model for Generative Recommendation" (arXiv:2307.00457) が存在するが、これはNetflixとは無関係

## 出典

- [GenRec: An LLM‑Backed Recommendation Ranker at Netflix (arXiv:2608.10257)](https://arxiv.org/abs/2608.10257)
- [GenRec: Towards LLM-Native Recommendation at Netflix (Netflix TechBlog)](https://netflixtechblog.com/genrec-towards-llm-native-recommendation-at-netflix-f20be6f643e3)
- [Netflix: LLM-Native Recommendation System at Scale (ZenML LLMOps Database)](https://www.zenml.io/llmops-database/llm-native-recommendation-system-at-scale)
- [Towards Generalizable and Efficient Large-Scale Generative Recommenders (Netflix Technology Blog / Medium)](https://netflixtechblog.medium.com/towards-generalizable-and-efficient-large-scale-generative-recommenders-a7db648aa257)

#recommendation-system #llm #netflix #ai
