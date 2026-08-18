---
created: "2026-08-18"
---
# HikariCP

Brett Wooldridgeが開発したJava向けの高性能JDBC[[connection-pooling]]実装。「光」の意。Spring Bootのデフォルトコネクションプールとして採用されている。設計思想は「Simplicity is prerequisite for reliability(シンプルさは信頼性の前提条件である)」というDijkstraの言葉に基づいており、必要最小限の機能に絞ってある。ライブラリサイズはわずか165KB程度。

## 特徴

- **速度と軽量性**: Apache DBCP、Tomcat JDBC Pool、c3p0などの既存プールに対して、ベンチマークで一貫して高いスループット・低レイテンシを示す
- **コネクションのライフサイクル管理**: アプリ起動時にベースラインの接続を確立・ウォームアップし、プールの健全性を継続的に監視。死んだ接続は静かに排除し、目標数まで自動的に補充する
- **リーク検出**: 借用したまま返却されない接続を検出する機能を内蔵し、コードの不具合を早期に発見できる
- **監視・メトリクス連携**: プールの稼働状況をトラッキングするための監視機構を提供
- **JDBC 4.3準拠**: v6.0.0以降ではrequest boundary API(`beginRequest`/`endRequest`)にも対応

## 内部の仕組み

高速化の工夫は主にバイトコードレベルの最適化に集約されている。

- **ConcurrentBag**: 接続を保持するための自作のロックフリーコレクション。ThreadLocalキャッシュ、キュー盗用(queue-stealing)、直接ハンドオフといった技法を組み合わせ、高い並行性と極めて低いレイテンシを実現している
- **FastList**: `ArrayList<Statement>`の代替として自作。範囲チェックを省略し、`remove()`をリストの末尾から走査するようにしている。JDBCプログラミングでは「最後に開いたステートメントを最初に閉じる」パターンが多いため、この最適化が効く
- **バイトコード最適化**: 継承階層をフラット化し、メンバ変数をシャドーイングし、不要なキャストを排除。JITコンパイラが最適化しやすい形にコードを書いている。プロキシ生成にはJavassistを使い、JDK標準のダイナミックプロキシより生成バイトコードを小さく抑えている
- **invokestatic優先**: シングルトンファクトリをstaticメソッド呼び出しに置き換え、`getstatic`呼び出しやスタックサイズを削減している
- **CPUキャッシュへの配慮**: クリティカルパスの命令数を削り、OSスケジューラの実行クォンタム内に処理が収まるようにすることで、CPUキャッシュラインの無効化を避けている

## プールサイズの考え方

PostgreSQLプロジェクトが提唱する式を推奨している。

```
connections = ((core_count × 2) + effective_spindle_count)
```

例えば4コア・ディスク1台のサーバーなら `(4×2)+1=9` で、切り上げて10接続程度が目安。背景にある考え方は、スレッド数がコア数を超えるとコンテキストスイッチのオーバーヘッドで性能が落ちる一方、I/O待ちの間は他スレッドを実行できるのでコア数より少し多めが効率的、というもの。公式Wikiでは「小規模で、接続待機スレッドで満たされたプールが望ましい(過剰プロビジョニングは避けるべき)」と強調されている。

## 出典

- [HikariCP – High Performance JDBC Connection Pool for Java](https://hikaricp.com/)
- [HikariCP GitHub README](https://github.com/brettwooldridge/HikariCP)
- [HikariCP Wiki: Down the Rabbit Hole](https://github.com/brettwooldridge/HikariCP/wiki/Down-the-Rabbit-Hole)
- [HikariCP Wiki: About Pool Sizing](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)
- [Introduction to HikariCP - Baeldung](https://www.baeldung.com/hikaricp)

#hikaricp #jdbc #java #connection-pool
