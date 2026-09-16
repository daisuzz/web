---
created: "2026-09-16T18:05:00+09:00"
---
# JDK 25

2025年9月16日GAのLTSリリース。JDK 21に続くLTSで、18本のJEPを含む。うち7本はプレビュー・インキュベータ・実験的段階を経てFinal化したもの。Oracle JDKのLTSサポートは最低8年。

## Final化された言語機能

- **JEP 506: Scoped Values** — スレッド内の呼び出し先および子スレッドに対して、イミュータブルな値を共有するための仕組み。ThreadLocalより推論しやすく、空間・時間コストも小さい。特に仮想スレッド・structured concurrencyと組み合わせたときに効く。
- **JEP 511: Module Import Declarations** — モジュールがexportしている全パッケージを一括importする構文。importするコード側がモジュールである必要はない。個別importの羅列を減らせる。
- **JEP 512: Compact Source Files and Instance Main Methods** — `main()`が`static`である必要がなくなり、`String[] args`も省略可能に（instance main methods）。さらにクラス宣言なしにトップレベルでメソッド・文を書けるようになった（compact source files）。初学者が大規模プログラム向けの言語機能を理解せずに最初のプログラムを書けるようにするのが狙い。
- **JEP 513: Flexible Constructor Bodies** — コンストラクタの最初の文が`this(...)`/`super(...)`でなければならないという制約を緩和。明示的なコンストラクタ呼び出しの前にprologue、後にepilogueを書ける。prologueでは構築中のオブジェクトを参照できないが、フィールドの初期化や安全な計算は可能。

## Final化された性能・ランタイム機能

- **JEP 519: Compact Object Headers** — [[jdk-24]]で実験的機能だったものが製品機能に昇格。
- **JEP 521: Generational Shenandoah** — 同じく実験的機能から昇格。
- **JEP 510: Key Derivation Function API** — [[jdk-24]]のJEP 478（プレビュー）がFinal化。
- **JEP 514: Ahead-of-Time Command-Line Ergonomics** — AOTキャッシュ作成に必要なコマンドを簡略化。
- **JEP 515: Ahead-of-Time Method Profiling** — 過去の実行時プロファイルを再利用してウォームアップを短縮する。
- **JEP 518: JFR Cooperative Sampling**
- **JEP 520: JFR Method Timing & Tracing**
- **JEP 503: Remove the 32-bit x86 Port** — [[jdk-24]]のJEP 501で非推奨化されたものを実際に削除。

## プレビュー・インキュベータ・実験的機能

- **JEP 470: PEM Encodings of Cryptographic Objects**（プレビュー）
- **JEP 502: Stable Values**（プレビュー） — [[jdk-26]]以降はLazy Constantsに改称される。
- **JEP 505: Structured Concurrency**（5th preview）
- **JEP 507: Primitive Types in Patterns, instanceof, and switch**（3rd preview）
- **JEP 508: Vector API**（10th incubator）
- **JEP 509: JFR CPU-Time Profiling**（実験的）

## [[jdk-releases]]の中での位置づけ

2年ごとのLTSサイクルにおけるJDK 21の次のLTS。[[jdk-26]]・[[jdk-27]]は非LTSなので、次のLTSはJDK 29（2027年9月予定）になる。本番環境でLTSを選ぶ場合は2026年9月時点でもこれが最新。

## 出典

- [Oracle Releases Java 25](https://www.oracle.com/news/announcement/oracle-releases-java-25-2025-09-16/)
- [JDK 25](https://openjdk.org/projects/jdk/25/)
- [Consolidated JDK 25 Release Notes | Oracle](https://www.oracle.com/java/technologies/javase/25all-relnotes.html)
- [JEP 506: Scoped Values](https://openjdk.org/jeps/506)
- [JEP 512: Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512)
- [JEP 513: Flexible Constructor Bodies](https://openjdk.org/jeps/513)
- [New Features in Java 25 | Baeldung](https://www.baeldung.com/java-25-features)

#java #jdk #lts
