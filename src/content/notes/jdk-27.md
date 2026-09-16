---
created: "2026-09-16"
updated: "2026-09-16T19:13:00+09:00"
---
# JDK 27

2026年9月15日にGAされたJavaの短期リリース（非LTS、Oracleによるサポートは6ヶ月間）。9本のJEPを含み、Core Java Library・HotSpot・Security Library・Java Language Specificationの4カテゴリに分かれる。最新のLTSは[[jdk-25]]（2025年9月GA）のまま。

## Final機能（4件）

- **JEP 534: Compact Object Headers** — オブジェクトヘッダを96bitから64bitに縮小する機能がデフォルト有効化。ヒープ使用量を10〜20%削減し、スループットを5〜10%向上させる。
- **JEP 523: G1 as Default Garbage Collector** — G1GCが全環境でデフォルトに。従来Serial GCがデフォルトだった小さいコンテナ環境も対象に含まれる。
- **JEP 536: JFR In-Process Data Redaction** — JDK Flight Recorderが記録するコマンドライン引数・環境変数・システムプロパティの初期値を、プロセスを出る前にredaction（機微情報の削除）するようになった。
- **JEP 527: Post-Quantum Hybrid Key Exchange for TLS 1.3** — TLS 1.3の鍵交換に、量子耐性アルゴリズムと従来アルゴリズムを組み合わせたハイブリッド鍵交換を追加。将来の量子コンピュータによる攻撃に備える。

## プレビュー・インキュベータ機能（5件）

過半数が再提出されたプレビュー/インキュベータ機能で、内訳は変更ありが3件、変更なし（そのまま再プレビュー）が2件。

- **JEP 533: [[structured-concurrency]]**（7th preview） — `Joiner`に例外型の型パラメータ`R_X`が追加された。
- **JEP 532: Primitive Type Patterns**（5th preview）
- **JEP 538: PEM Encodings**（3rd preview）
- **JEP 531: Lazy Constants**（3rd preview、旧称Stable Values）
- **JEP 537: Vector API**（12th incubator）

## [[jdk-releases]]の中での位置づけ

[[jdk-26]]に続く非LTSリリース。Compact Object Headersは[[jdk-24]]で実験的機能、[[jdk-25]]で製品機能となり、ここでようやくデフォルト有効になった。G1も[[jdk-26]]のスループット改善（JEP 522）を経て、全環境のデフォルトGCになっている。耐量子暗号は[[jdk-24]]のML-KEM/ML-DSAがTLS 1.3のハイブリッド鍵交換として使われるところまで来た。

## 出典

- [Oracle Releases Java 26](https://www.oracle.com/news/announcement/oracle-releases-java-26-2026-03-17/)
- [JDK 27](https://openjdk.org/projects/jdk/27/)
- [JDK 27 and JDK 28: What We Know So Far - InfoQ](https://www.infoq.com/news/2026/08/java-27-so-far/)
- [Java 27 Features Unveiled: 9 Highlights You Need to Know](https://bell-sw.com/blog/overview-of-java-27-features/)
- [The Arrival of Java 27 | java (Oracle Blogs)](https://blogs.oracle.com/java/the-arrival-of-java-27)

#java #jdk
