---
created: "2026-08-16"
---
# デュアルトラックアジャイル (Dual-Track Agile)

プロダクト開発を「発見(Discovery)」と「実装(Delivery)」という2つの並行トラックで進める考え方。

## 2つのトラック

- **Discoveryトラック**: 何を作るべきかを検証するフェーズ。ユーザーインタビュー、プロトタイピング、ユーザビリティテストなどを通じて、検証済みのプロダクトバックログ項目を素早く生み出すことが目的
- **Deliveryトラック**: Discoveryで検証されたアイデアを、実際にリリース可能なソフトウェアとして実装するフェーズ。通常のアジャイル開発(スプリント、イテレーションなど)がここにあたる

ポイントは、この2つを「順番に」やるのではなく「並行して」回すこと。DiscoveryチームがDeliveryチームより一歩先を行きながら、常に検証済みのアイデアがDeliveryチームに供給され続ける状態を目指す。両トラックは互いにフィードバックを与え合う関係にある。

## 起源

- 2005年、Lynn Millerが最初に言及
- 2007年、Desirée Syがさらに発展させた考え方を発表。この頃Jeff Pattonも概念を提唱し始める
- 2012年、Marty CaganとJeff Pattonが「Dual-Track Agile(当初はDual-Track Scrumとも呼ばれた)」として定式化・普及させた

CaganはSilicon Valley Product Group (SVPG) の創業者で、プロダクトマネジメント分野での発信力が大きく、この用語の普及に大きく寄与した。

## よくある課題

実運用でこの手法が破綻する典型的な原因は「DiscoveryのペースがDeliveryに追いつかない」こと。Discoveryが遅れると、Deliveryチームに供給する検証済みバックログが枯渇し、結局ウォーターフォール的な「まず全部決めてから作る」に逆戻りしてしまうケースが多いとされている。

## チーム運用の具体例

8人くらいのプロダクトチームを想定した例。

### チーム構成

- **プロダクトトリオ**: PM 1人、デザイナー 1人、テックリード 1人 — Discoveryの中心を担う
- **エンジニア**: 4〜5人 — 主にDeliveryを担当。うち1〜2人が持ち回りでトリオのDiscoveryに参加(技術的な実現可能性を早期に見る役)
- **QA**: Deliveryのテストを担当

役割分担としては、PMが「何を優先するか」の意思決定、デザイナーが「体験」の検証(プロトタイピング・ユーザビリティテスト)、テックリードが「実現可能性」の見極めを担う。

### 週単位のリズム(例)

| タイミング | やること |
|---|---|
| 毎日 | 1本の朝会で済ませる: Discovery報告5分 + Delivery報告10分 |
| 週次 | Discoveryレビュー(30分): その週の検証結果(プロトタイプのテスト結果、顧客インタビュー2件など)を共有 |
| スプリント境界(1〜2週おき) | 統合スプリントプランニング: トリオが「検証済みで実装可能」なアイテムを提示 → チーム全体でDelivery側の次スプリントに取り込む |
| 継続的 | トリオは毎週決まった時間をDiscoveryに確保(例: プロトタイプ1本レビュー、顧客2人に話を聞く、簡単な実験を1つ回す、というTeresa Torres流のペース) |

### 時間差の作り方

Discoveryは常にDeliveryより1〜2スプリント先を進む。

```
Sprint 1: Discovery→機能Aを検証  |  Delivery→(前スプリントで検証済みの)機能Zを実装
Sprint 2: Discovery→機能Bを検証  |  Delivery→機能Aを実装
Sprint 3: Discovery→機能Cを検証  |  Delivery→機能Bを実装
```

こうすることで、Deliveryチームは常に「検証済みで手戻りの少ないバックログ」を消化し続けられる。

### 運用上のポイント

- 「Ready for Delivery」というキューを可視化し、そこに入っているアイテムしかスプリントに入れない、というルールを徹底する。これが機能の分かれ目になりやすい
- エンジニアが完全にDeliveryだけに固定されるのではなく、持ち回りでDiscoveryにも顔を出す設計にすると、実装時の手戻りが減る

## 出典

- [What is Dual-Track Agile? | Productboard](https://www.productboard.com/glossary/dual-track-agile/)
- [Dual-Track Agile - Silicon Valley Product Group](https://www.svpg.com/dual-track-agile/)
- [Dual Track Agile | Glossary | ProdPad](https://www.prodpad.com/glossary/dual-track-agile/)
- [Dual-track agile and continuous discovery: What you need to know - LogRocket Blog](https://blog.logrocket.com/product-management/dual-track-agile-continuous-discovery/)
- [Dual-Track Agile – when everyone is a researcher | Digital Leaders](https://digileaders.com/dual-track-agile-when-everyone-is-a-researcher/)
- [What Is Dual-Track Agile? A Practical Guide for PMs in 2026](https://theproductflow.com/what-is-dual-track-agile/)
- [Dual-Track Agile: Managing Discovery and Delivery in a Single Sprint — Sense & Respond Learning](https://www.senseandrespond.co/blog/dual-track-agile)
- [Dual-Track Agile for Innovation & Product | Umbrex](https://umbrex.com/resources/frameworks/project-management-frameworks/dual-track-agile/)

#アジャイル #プロダクトマネジメント #dual-track-agile
