---
created: "2026-09-16T18:10:00+09:00"
---
# JDK 26

2026年3月17日GAの短期リリース（非LTS）。10本のJEPを含み、内訳はFinal 5本・プレビュー4本・インキュベータ1本。

## Final機能

- **JEP 500: Prepare to Make Final Mean Final** — 将来のリリースで、deep reflectionによる`final`フィールドの書き換えをデフォルトで禁止するための準備。`final`フィールドの不変性はJDK 5以降のJavaメモリモデルでマルチスレッド下の安全な初期化を支えてきたが、デシリアライズ時にフィールドを書き換えるシリアライズライブラリの都合でリフレクションAPIに抜け道が作られていた経緯がある。
- **JEP 504: Remove the Applet API** — Applet APIを削除。
- **JEP 516: Ahead-of-Time Object Caching with Any GC** — AOTキャッシュ内のオブジェクト参照を生のメモリアドレスではなく論理インデックスとして保存することで、GCの種類を問わず起動時にキャッシュ済みオブジェクトを展開できるようにした。ZGCでもAOTオブジェクトキャッシュが使えるようになり、レイテンシ重視の構成での制約が外れた。
- **JEP 517: HTTP/3 for the HTTP Client API** — JDK 11で入った`java.net.http.HttpClient`をHTTP/3に対応させた。HTTP/3はQUICベースで、ハンドシェイクが速くパケットロス時の性能も良い。
- **JEP 522: G1 GC: Improve Throughput by Reducing Synchronization** — カードテーブルを2枚持ち、アプリケーションスレッドは同期なしで一方に書き込み、最適化スレッドがもう一方を処理し、G1が必要に応じて2枚をアトミックに入れ替える方式。オブジェクト参照フィールドを頻繁に書き換えるアプリケーションで5〜15%のスループット向上、x64ではライトバリアの単純化でさらに最大5%の上乗せが報告されている。

## プレビュー・インキュベータ機能

- **JEP 524: PEM Encodings of Cryptographic Objects**（2nd preview）
- **JEP 525: [[structured-concurrency]]**（6th preview） — `onTimeout()`の追加、`allSuccessfulOrThrow()`の戻り値調整。
- **JEP 526: Lazy Constants**（2nd preview） — [[jdk-25]]でStable Valuesとしてプレビューされていたものの改称。
- **JEP 529: Vector API**（11th incubator）
- **JEP 530: Primitive Types in Patterns, instanceof, and switch**（4th preview）

## [[jdk-releases]]の中での位置づけ

LTSである[[jdk-25]]と[[jdk-27]]の間に挟まる非LTSリリース。サポートは6ヶ月で、[[jdk-27]]のGA（2026年9月15日）をもって更新提供が終了する。G1への改善は[[jdk-27]]のJEP 523（G1を全環境のデフォルトGCに）へ、AOT関連は[[jdk-25]]からの一連の流れ（[[project-leyden]]）につながっている。

## 出典

- [Oracle Releases Java 26](https://www.oracle.com/news/announcement/oracle-releases-java-26-2026-03-17/)
- [JDK 26](https://openjdk.org/projects/jdk/26/)
- [JDK 26 Release Notes, Important Changes, and Information | Oracle](https://www.oracle.com/java/technologies/javase/26-relnote-issues.html)
- [Java 26 Features Unveiled: 10 Highlights You Need to Know | BellSoft](https://bell-sw.com/blog/an-overview-of-jdk-26-features/)
- [Java 26 / JDK 26: General Availability (jdk-dev)](https://mail.openjdk.org/archives/list/jdk-dev@openjdk.org/thread/2MXXXBJKTJXQD25Q4XGGINKYA33T7D5I/)

#java #jdk
