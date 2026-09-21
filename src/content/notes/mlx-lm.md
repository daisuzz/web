---
created: 2026-09-21
updated: 2026-09-21
---

# mlx-lm

[[mlx]]上でLLMのテキスト生成・ファインチューニングを行うためのPythonパッケージ。`ml-explore/mlx-lm`として単独のリポジトリで開発されている(元々は`mlx-examples`リポジトリの一部だった)。MITライセンス。

## インストール

```bash
pip install mlx-lm
# または
conda install -c conda-forge mlx-lm
```

## 主な機能

- **テキスト生成**: `mlx_lm.generate` コマンドでプロンプトからテキスト生成。ストリーミング生成にも対応。
- **チャットREPL**: `mlx_lm.chat` で対話的なチャットインターフェースを起動できる。
- **OpenAI互換サーバー**: `mlx_lm.server` でOpenAI Chat Completions APIと互換のエンドポイントを持つローカルサーバーを起動できる(例: `mlx_lm.server --model mlx-community/LFM2-1.2B-8bit --port 8080`)。基本的なセキュリティチェックしか実装されておらず、本番運用は非推奨とされている。
- **量子化・変換**: `mlx_lm.convert` コマンドでHugging Face形式のモデルを4bit量子化しつつMLX形式に変換し、Hugging Face Hubへアップロードできる。
- **ファインチューニング**: LoRA(低ランク適応)およびフルモデルのファインチューニングに対応。量子化済みモデルに対するファインチューニングもサポートする。
- **分散処理**: `mx.distributed` を使った分散推論・分散ファインチューニングに対応。
- **プロンプトキャッシュ**: プロンプトキャッシングと回転キー・バリューキャッシュにより、繰り返し推論を高速化する。

## モデル

Hugging Face Hub統合により数千のLLMを利用できる。デフォルトモデルは`mlx-community/Llama-3.2-3B-Instruct-4bit`。MLX形式に変換済みのチェックポイントはHugging Face上の"MLX Community"組織で公開されている。

## 動作環境

macOS上で動作する。大規模モデルを扱う場合はmacOS 15.0以上が推奨されている。

## [[mlx]]との関係

mlx-lmは[[mlx]]という配列フレームワークの上に構築された、LLM専用のアプリケーション層のパッケージという位置づけ。MLX自体はNumPy風の汎用的な配列演算・自動微分ライブラリで、LLMのトークナイズ、生成ループ、量子化、Hugging Faceとの連携といったLLM固有の機能はmlx-lm側が担っている。

## バージョンについて

本ノートの内容はmlx-lm v0.31.3(PyPI公開日: 2026-04-22)時点の情報を前提にしている。

## 出典

- [GitHub - ml-explore/mlx-lm](https://github.com/ml-explore/mlx-lm)
- [PyPI - mlx-lm](https://pypi.org/project/mlx-lm/)

#mlx #apple #機械学習 #llm #python
