---
created: "2026-09-16T18:00:00+09:00"
---
# JDK 24

2025年3月18日GAの短期リリース（非LTS）。24本のJEPを含み、6ヶ月リリースサイクルに移行して以降で最も本数が多い回。Project Leyden（起動高速化）・Project Loom（仮想スレッド）・耐量子暗号の3方面が同時に動いた。

## 言語・API

- **JEP 484: Class-File API**（Final） — classファイルの解析・生成・変換を行う標準API。ASMのような外部ライブラリへの依存をなくすのが狙い。
- **JEP 485: Stream Gatherers**（Final） — Stream APIに独自の中間操作を差し込める仕組み。プレビューを経てFinal化。
- **JEP 487: Scoped Values**（4th preview）
- **JEP 488: Primitive Types in Patterns, instanceof, and switch**（2nd preview）
- **JEP 492: Flexible Constructor Bodies**（3rd preview）
- **JEP 494: Module Import Declarations**（2nd preview）
- **JEP 495: Simple Source Files and Instance Main Methods**（4th preview）
- **JEP 499: Structured Concurrency**（4th preview）

## 起動・実行性能

- **JEP 483: Ahead-of-Time Class Loading & Linking** — クラスの読み込み・パース・ロード・リンクの結果をAOTキャッシュに保存し、JVMのウォームアップ時のCPU時間とメモリオーバーヘッドを削減する。事前テストでは起動時間が約40%改善したと報告されている。Project LeydenがmainlineのOpenJDKに入った最初の成果。
- **JEP 491: Synchronize Virtual Threads without Pinning** — `synchronized`内でブロックしても仮想スレッドがキャリアスレッドに固定（pinning）されなくなった。JVMの`synchronized`実装が変更され、仮想スレッドがキャリアと独立してモニタを取得・保持・解放できる。`synchronized`を使い続けたままスケーラビリティの悪影響を避けられるようになり、Loomの積年の制約が解消した。
- **JEP 475: Late Barrier Expansion for G1** — G1のGCバリア展開をC2コンパイルの後段に遅らせる性能改善。
- **JEP 490: ZGC: Remove the Non-Generational Mode** — 非世代別ZGCを削除し、世代別ZGCに一本化。
- **JEP 404: Generational Shenandoah**（実験的）
- **JEP 450: Compact Object Headers**（実験的）

## セキュリティ

- **JEP 496: Quantum-Resistant Module-Lattice-Based Key Encapsulation Mechanism** — 耐量子の鍵カプセル化機構（ML-KEM）。
- **JEP 497: Quantum-Resistant Module-Lattice-Based Digital Signature Algorithm** — 耐量子のデジタル署名（ML-DSA）。
- **JEP 478: Key Derivation Function API**（プレビュー）
- **JEP 486: Permanently Disable the Security Manager** — Security Managerを恒久的に無効化。

## 削除・非推奨・整理

- **JEP 479: Remove the Windows 32-bit x86 Port**
- **JEP 501: Deprecate the 32-bit x86 Port for Removal** — [[jdk-25]]のJEP 503で実際に削除される。
- **JEP 472: Prepare to Restrict the Use of JNI** — JNI使用時に警告を出し、将来の制限に備える。
- **JEP 498: Warn upon Use of Memory-Access Methods in sun.misc.Unsafe**
- **JEP 493: Linking Run-Time Images without JMODs** — JMODファイルを同梱しないJDKからでも`jlink`でランタイムイメージを作れるようにする。

## [[jdk-releases]]の中での位置づけ

短期リリースなので単体でのサポートは6ヶ月で終わり、LTSとしては次の[[jdk-25]]に引き継がれる。ここでプレビュー・実験的機能として入ったもの（Scoped Values、Flexible Constructor Bodies、Module Import Declarations、Compact Object Headers など）の多くが[[jdk-25]]でFinal化している。

## 出典

- [Oracle Releases Java 24](https://www.oracle.com/news/announcement/oracle-releases-java-24-2025-03-18/)
- [JDK 24](https://openjdk.org/projects/jdk/24/)
- [All 24 new JEPs for JDK 24 - JVM Weekly vol. 111](https://www.jvm-weekly.com/p/all-24-new-jeps-for-jdk-24-quantum)
- [Six JDK 24 Features You Should Know About - Azul](https://www.azul.com/blog/six-jdk-24-features-you-should-know-about/)
- [Significant Changes in JDK 24 Release | Oracle](https://docs.oracle.com/en/java/javase/25/migrate/significant-changes-jdk-24.html)

#java #jdk
