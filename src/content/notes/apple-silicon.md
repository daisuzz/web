---
created: 2026-09-21
---

# Apple Silicon

Appleが自社設計するArm(AArch64)ベースのSoC(System on a Chip)の総称。iPhone向けAシリーズの設計思想をMac向けに拡張したもので、2020年のM1を皮切りにMacのCPUをIntel製x86-64プロセッサから置き換えた。

## Appleが何を解決しようとしたか

2020年6月のWWDCでAppleはMacをApple Siliconへ移行すると発表した。Apple自身が挙げた狙いは大きく2つ。

- **パフォーマンス/ワットの向上**: 自社シリコンによって業界最高水準の性能とワットあたり性能を実現する。
- **製品ライン全体でのアーキテクチャ統一**: iPhone/iPad/Macで共通のアーキテクチャを持つことで、開発者がApple製品全体向けにソフトウェアを書き・最適化しやすくする。iOS/iPadOSアプリをMac上で無改造で動かせるようになったのもこの統一の帰結。

背景にはIntelのプロセス微細化の遅延など、外部ベンダーへのロードマップ依存から脱却したいという事情もある。ハードウェア(SoC)とOS(macOS)を同一ベンダーが垂直統合で設計することで、両者を協調させた最適化が可能になる。

## x86(Intel/AMD)との違い

### 命令セットアーキテクチャ: ARM64(AArch64) vs x86-64

- Apple SiliconはArmのAArch64(64bit ARM、いわゆるARM64)命令セットを採用する。x86-64はCISC(Complex Instruction Set Computing)、ARM64はRISC(Reduced Instruction Set Computing)に分類される。
- CISCは1命令が複数ステップの複雑な処理(メモリアクセス+演算など)をまとめて行えるのに対し、RISCは「ロードしてから演算する」ようにload/store命令と演算命令を分離し、個々の命令を単純化する。
- 命令長も異なる。ARM64の命令は原則固定長(32bit)で、可変長のx86-64命令に比べてデコードの単純化・並列化がしやすい。

### マイクロアーキテクチャ: 広いデコード幅と深いROB

M1に搭載されたAppleの高性能コア(Firestorm)は、発表当時の他の商用CPUコアと比べて突出した特徴を持っていた。

- 8命令を同時にデコードできる8-wideデコーダ(当時の他社ハイエンドコアの多くは4-wide前後)。
- 深さ約630エントリという非常に大きなROB(リオーダーバッファ)を持ち、実行順序を並べ替えるための「見渡せる範囲」(アウトオブオーダーの実行ウィンドウ)が広い。

こうした「広く・深く」作る設計は、命令セットがRISCで単純なぶんトランジスタ予算をデコーダやROBの拡張に振り向けやすいことも一因とされる。

### 統合メモリアーキテクチャ(Unified Memory Architecture, UMA)

CPU・GPU・Neural Engine・メディアエンコーダ/デコーダなど複数の処理ユニットが、物理的に同一の高帯域幅メモリプール(LPDDR系)を共有する設計。

- 従来のディスクリートGPU構成では、CPU側メモリとGPU側VRAMの間でPCIeバス越しにデータをコピーする必要があった。UMAではテクスチャや画像・ジオメトリなどのデータをコピーせず、ポインタの受け渡しだけでCPU/GPU/Neural Engine間を跨いで処理できる。
- 機械学習フレームワークの[[mlx]]はこのUMAを前提に設計されており、CPU/GPU間のデータコピーなしに配列を扱える。

### 異種混在コア構成(ヘテロジニアスコア)

高い処理能力を持つP(Performance)コアと、電力効率を優先したE(Efficiency)コアを1つのSoCに混在させる非対称マルチプロセッシング(AMP)構成を採る。負荷の軽いタスクはEコアに割り当てることで消費電力を抑える。x86系でもIntelがHybrid構成(P-core/E-core)を採用するなど後追いしているが、Apple SiliconはA-シリーズ由来でこの構成を先行して採用していた。

### SoCへの機能統合

CPU/GPUコアに加えて、Neural Engine(機械学習の推論アクセラレータ)、Secure Enclave、メディア用のハードウェアエンコーダ/デコーダなどを1つのSoCダイに統合している。行列演算専用のコプロセッサであるAMX(Apple Matrix coprocessor)も搭載されているが、Apple公式の命令セット仕様としては公開されておらず、Accelerateフレームワーク(vImage、BLAS、BNNS、vDSPなど)経由でのみ間接的に利用できる。M4世代ではArmの行列演算命令セット拡張であるSME(Scalable Matrix Extension)のサポートも追加された。

### GPUアーキテクチャ: TBDR(Tile-Based Deferred Rendering)

Apple SiliconのGPUは、専用のビデオメモリを持たずに効率よく動作するよう設計されたTBDR方式を採る。

- **タイリング(tiling)フェーズ**: 画面をタイルに分割し、ジオメトリ処理の結果を各タイルに割り当てる。
- **レンダリング(rendering)フェーズ**: 各タイルをGPU上のタイルメモリ内で描画し、フレームが完成した時点でシステムメモリに書き出す。

この方式により、Hidden Surface Removal(隠面消去)やプログラマブルブレンディング、メモリレスレンダーターゲットなどが可能になり、帯域幅・電力を削減できる。デスクトップGPUで主流のImmediate Mode Rendering(IMR、ピクセルを都度フレームバッファに書き込む方式)とは設計思想が異なる。

### x86互換性: Rosetta 2

x86-64向けにビルドされたアプリケーションをApple Silicon上で実行するための、Appleが提供する動的バイナリトランスレータ。

- **AOT(Ahead-of-Time)変換**: アプリのインストール時など、システムが都合の良いタイミングでx86-64バイナリを事前にARM64へ変換し、専用形式のファイルとしてストレージに保存しておく方式。
- **JIT(Just-In-Time)変換**: 実行時に生成されるコード(JITコンパイラの出力など、事前変換できないコード)を、実行の直前に都度変換する方式。

エミュレーション(命令を1つずつソフトウェア的に解釈実行する)ではなく、事前にネイティブなARM64コードへ変換しておく点が特徴で、これによりエミュレーションより実行時オーバーヘッドを抑えている。

## 出典

- [Apple announces Mac transition to Apple silicon - Apple Newsroom](https://www.apple.com/newsroom/2020/06/apple-announces-mac-transition-to-apple-silicon/)
- [About the Rosetta translation environment - Apple Developer Documentation](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment)
- [Tailor your apps for Apple GPUs and tile-based deferred rendering - Apple Developer Documentation](https://developer.apple.com/documentation/metal/tailor-your-apps-for-apple-gpus-and-tile-based-deferred-rendering)
- [Rosetta 2 on a Mac with Apple silicon - Apple Support(セキュリティガイド)](https://support.apple.com/guide/security/rosetta-2-on-a-mac-with-apple-silicon-secebb113be1/web)
- [Finding and evaluating AMX co-processors in Apple silicon chips - The Eclectic Light Company](https://eclecticlight.co/2023/12/13/finding-and-evaluating-amx-co-processors-in-apple-silicon-chips/)
- [Apple Silicon Accelerators - Asahi Linux Documentation](https://asahilinux.org/docs/hw/soc/accelerators/)

#apple #applesilicon #arm #cpu #アーキテクチャ
