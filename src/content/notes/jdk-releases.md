---
created: "2026-09-16T18:20:00+09:00"
---
# JDKリリースサイクル

JDK 9以降、Javaは6ヶ月ごと（毎年3月と9月）に新バージョンをGAする。非LTSリリースのサポートは次リリースまでの6ヶ月で終わる。

LTSは2年ごと。元は3年ごとだったが、2021年9月にOracleが2年周期への変更を提案し、JDK 17以降は2年間隔になった（11 → 17 → 21 → 25）。Oracle JDKのLTSサポート期間は各LTSにつき最低8年。

## 各リリースのノート

- [[jdk-24]] — 2025年3月GA、非LTS。24本のJEPで本数最多。Project Leyden（AOT）・Loom（pinning解消）・耐量子暗号が同時に動いた回。
- [[jdk-25]] — 2025年9月GA、**LTS**。18本のJEPのうち7本がFinal化。Scoped Values、Module Import Declarations、Compact Source Filesなど言語面の成果が揃った。
- [[jdk-26]] — 2026年3月GA、非LTS。10本のJEP。HTTP/3対応とG1のスループット改善が目立つ。
- [[jdk-27]] — 2026年9月GA、非LTS。9本のJEP。Compact Object HeadersとG1がデフォルト化、TLS 1.3に耐量子ハイブリッド鍵交換が入った。

## 複数バージョンをまたぐ流れ

同じ機能がプレビューや実験的機能として何度も再登場し、数リリースかけてFinal化・デフォルト化していくのがこのサイクルの特徴。

- **Compact Object Headers**: [[jdk-24]]で実験的（JEP 450）→ [[jdk-25]]で製品機能（JEP 519）→ [[jdk-27]]でデフォルト有効（JEP 534）。
- **Structured Concurrency**: [[jdk-24]]で4th preview → [[jdk-25]]で5th → [[jdk-26]]で6th → [[jdk-27]]で7th。まだFinalになっていない。
- **Primitive Types in Patterns**: [[jdk-24]]で2nd preview → [[jdk-27]]で5th preview（JEP 532でPrimitive Type Patternsに改称）。
- **Stable Values / Lazy Constants**: [[jdk-25]]でStable Values（JEP 502）→ [[jdk-26]]でLazy Constantsに改称（JEP 526）→ [[jdk-27]]で3rd preview。
- **耐量子暗号**: [[jdk-24]]でML-KEM（JEP 496）とML-DSA（JEP 497）が入り、[[jdk-27]]でそれらを使ったTLS 1.3のハイブリッド鍵交換（JEP 527）につながる。
- **32-bit x86ポート**: [[jdk-24]]でWindows版を削除（JEP 479）・残りを非推奨化（JEP 501）→ [[jdk-25]]で削除（JEP 503）。
- **AOT（Project Leyden）**: [[jdk-24]]のクラスロード・リンクのキャッシュ（JEP 483）→ [[jdk-25]]でコマンドライン簡略化とメソッドプロファイル（JEP 514/515）→ [[jdk-26]]で任意のGCに対応（JEP 516）。

## 出典

- [Moving the JDK to a Two Year LTS Cadence | Oracle](https://blogs.oracle.com/java/moving-the-jdk-to-a-two-year-lts-cadence)
- [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html)
- [What is Java LTS and Why Does It Matter? | JRebel](https://www.jrebel.com/blog/java-lts)

#java #jdk #moc
