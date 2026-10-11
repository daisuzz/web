---
created: "2026-10-11"
updated: "2026-10-11T12:00:00+09:00"
---

# InsightFace

2D・3Dの顔解析をまとめたオープンソースのツールキット。主にPyTorchとMXNetで書かれている。リポジトリは `deepinsight/insightface` で、主な開発者はJia Guo氏とJiankang Deng氏。顔認識の損失関数として広く使われている[[arcface]]は、このプロジェクトから出てきた。 #face-recognition #computer-vision #python

## 主な機能とモデル

| 分野 | 代表的なもの |
|---|---|
| 顔認識 | [[arcface]]（CVPR 2019）、SubCenter ArcFace（ECCV 2020）、Partial FC（CVPR 2022）、VPL（CVPR 2021）。バックボーンはIResNetやMobileFaceNet |
| 顔検出 | RetinaFace（CVPR 2020）、SCRFD（処理効率重視で、NASにも対応） |
| ランドマーク検出・位置合わせ | SDUNets（BMVC 2018）、座標を回帰する軽量モデル |
| その他 | 年齢推定、3D顔の再構成、視線推定、顔の入れ替え（inswapper） |

- `pip install insightface` でPythonライブラリが入る。`buffalo_l` などのモデルパックは初回実行時に自動でダウンロードされ、検出・ランドマーク・埋め込み抽出までを数行で書ける。
- 事前学習済みモデルの一覧は、GitHub WikiのModel-Zooにある。

## 最近のリリース

PyPIの版でいうと、0.7.3（2023-04）から約3年空いて、2026年に大きく動いた。

- **1.0（2026-05-23）**: クロスプラットフォームのデスクトップGUIデモを追加。Pythonでのインストールも軽量化。
- **InsightFace Server（2026-07-27）**: セルフホスト型の顔検索サーバー。AWS Rekognitionの代わりとして位置づけられている。Web UI、REST API、Pythonクライアントを備える。埋め込みをINT8に量子化しており、RTX 5090 1枚で5,000万枚超の画像を検索できるとしている。
- **2.0（2026-09）**: 2つの機能を追加。
  - RGB画像での生体検知（Liveness）。`normal` / `observe` の2モードがあり、顔ごとにスコアを返す。
  - PrivateFrame。ローカル動画の顔を検出・追跡し、ぼかしやモザイクをかける。参照写真を渡して特定の人だけを隠すこともできる。
- **2.1（2026-10-03）**: PersonAnalysisを更新。人物検出、顔認識、体の特徴による同一人物の照合（ReID）を組み合わせて使える。`get()` / `match()` / `update()` のAPIと、`cheetah_s` / `cheetah_l` モデルが入った。

関連プロダクトとして、C/C++で書かれたクロスプラットフォームの顔認識SDK「InspireFace」がある（2024-05公開、商用利用は要問い合わせ）。

## ライセンス

コードとモデルでライセンスが分かれている。

- **コード**: MIT License。原文は "There is no limitation for both academic and commercial usage."
- **学習データとそれで学習したモデル**: 非商用の研究目的に限られる。原文は "available for non-commercial research purposes only"。GitHubから手動でダウンロードしたモデルにも、Pythonライブラリが自動でダウンロードするモデルにも、同じ条件がかかると明記されている。
- **2025-11-24の追記**: 次のものはライセンスについて個別の問い合わせ先が示された。
  1. inswapper系（`inswapper_128.onnx`、`inswapper-512-live` など）: contact@insightface.ai
  2. `buffalo_l` などのオープンソース顔認識モデル: recognition-oss-pack@insightface.ai
  3. InspireFace SDKと関連モデル: contact@insightface.ai

つまり、コードがMITでも、同梱されて自動でダウンロードされるモデルをそのまま製品に使うことはできない。

## 非商用・個人利用での扱い

公式に明示されている条件は「非商用」かつ「研究目的」だけで、個人利用についての定義はない。以下は文言から読み取った解釈。

- 手元での実験、学習、検証は、研究・学習目的の範囲と読むのが自然。
- 個人のアプリやサービスに組み込んで日常的に使う場合は、収益がなくても「研究目的」と言えるかどうかが曖昧。
- 広告収入のあるサイトで使う、モデルを組み込んだツールを配布する、モデルファイルを再配布する、といった使い方は非商用の研究の範囲を超えうる。
- 2025-11の追記が商用利用だけについての案内なのかは書かれていない。inswapperと `buffalo_l` を使う場合は、上記の窓口に確認するのが確実。

ライセンスとは別に、他人の顔画像を解析・加工して公開する場合は、肖像権やプライバシーの問題が絡みうる（推測であり、法的な確認はしていない）。

## バージョンについて

本ノートの内容は、PyPIの `insightface` 2.1（2026-10-03リリース）時点のGitHub README・PyPIの記載を前提にしている。

## 出典

- [GitHub - deepinsight/insightface](https://github.com/deepinsight/insightface)
- [insightface · PyPI](https://pypi.org/project/insightface/)
- [InsightFace About](https://www.insightface.ai/about-us)
