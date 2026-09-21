---
created: 2026-09-21
---

# MLX

Appleの機械学習研究チームが開発した、Apple Silicon向けの配列(array)フレームワーク。2023年12月5日にオープンソースで公開された。MITライセンス。

## 特徴

- **NumPy風のPython API**: NumPyに近い配列操作APIを提供する。`nn`/`optimizers`パッケージはPyTorchに倣った設計になっている。
- **統一メモリ(unified memory)**: MLXの配列は共有メモリ上に存在し、CPU/GPU間でデータをコピーせずにそのまま操作できる。Apple SiliconのUnified Memory Architectureを前提にした設計。
- **遅延評価(lazy evaluation)**: 計算は必要になるまで実体化(materialize)されない。
- **動的グラフ構築**: コンパイル待ちなしに計算グラフを柔軟に組める。
- **関数変換**: 自動微分やベクトル化などの関数変換に対応する。

## 対応環境

- macOS(Apple Silicon向けに最適化)に加え、Linux上でもCPU/CUDA対応版が提供されている。
- Python API以外にC++・Swift向けのAPIもある。

## エコシステム

`mlx-lm`というPythonパッケージがLLM(LLaMA、Mistral、Mixtralなど)推論・ファインチューニング(LoRA/QLoRA)向けに提供されている。Hugging Face上の"MLX Community"組織でMLX形式に変換済みのモデルチェックポイントが公開されている。LM Studioなど、Mac上でローカルLLMを動かすアプリからも利用されている。

## 背景

TensorFlow/PyTorchなどの主要な深層学習フレームワークはNVIDIAのCUDAエコシステムへの最適化が中心で、Apple製ハードウェアを使う研究者が同じように参加しづらいという課題があった。MLXはこの隙間を埋める位置づけで、Apple Siliconの統一メモリアーキテクチャを最大限活かすことを狙っている。

## バージョンについて

本ノートの内容はMLX v0.32.2(PyPI公開日: 2026-08-25)時点の情報を前提にしている。

## 出典

- [GitHub - ml-explore/mlx](https://github.com/ml-explore/mlx)
- [GitHub - ml-explore/mlx-examples](https://github.com/ml-explore/mlx-examples)
- [PyPI - mlx](https://pypi.org/project/mlx/)
- [9to5Mac - Apple drops new MLX machine learning framework for Apple silicon Macs](https://9to5mac.com/2023/12/06/mlx-machine-learning-apple-silicon-mac/)
