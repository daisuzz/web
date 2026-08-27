---
created: "2026-08-27"
---
# Oracle実行計画

Oracle DatabaseのSQLチューニングで必ず向き合うことになる「実行計画」まわりを束ねるハブノート。実行計画そのものの読み方、それを構成するアクセスパス・結合方式、そして実際にチューニングするときの着眼点、の3つに分けている。

## 配下ノート

- [[oracle-explain-plan-reading]]: EXPLAIN PLAN/DBMS_XPLANの出力をどう読むか。列の意味、読む順序、Predicate Information（Access/Filter述語）、SQL Monitoringによる実行中クエリの観測
- [[oracle-access-paths-and-joins]]: 実行計画に出てくるアクセスパス（フルテーブルスキャン、各種インデックススキャン）と結合方式（ネステッドループ、ハッシュジョイン、ソートマージジョイン）
- [[oracle-sql-tuning-checkpoints]]: 実際のチューニングでまず疑うべき点——統計情報の陳腐化、ヒストグラム、バインドピーキングとAdaptive Query Optimization、SQLプランベースライン、ヒント濫用のリスク

#moc #oracle #sql #db
