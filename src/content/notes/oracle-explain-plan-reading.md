---
created: "2026-08-27"
updated: "2026-08-29"
---
# EXPLAIN PLANの読み方（Oracle）

## [[oracle-execution-plan]]の中での位置づけ

実行計画を「どう出力し、どう読むか」に絞ったノート。実行計画に出てくる個々のオペレーション（アクセスパス・結合方式）の意味は[[oracle-access-paths-and-joins]]、読んだ後に何を疑うかは[[oracle-sql-tuning-checkpoints]]を参照。

## 出力方法: EXPLAIN PLAN vs DISPLAY_CURSOR

- `EXPLAIN PLAN FOR <SQL>` → `SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY)`: SQLを実行せずにオプティマイザの**見積もり**計画だけを見る。事前確認用。
- `DBMS_XPLAN.DISPLAY_CURSOR`: 実際に実行されたカーソルの計画を見る。`gather_plan_statistics`ヒントを付けて実行する（または`STATISTICS_LEVEL=ALL`）と、見積もり行数(E-Rows)に加えて実測行数(A-Rows)も出力される。実際の性能問題を調査するときはこちらが推奨される——EXPLAIN PLANはあくまで見積もりで、実行時のバインド値・実データとは乖離しうるため。

## 列の意味

| 列 | 意味 |
|---|---|
| `Id` | ステップ番号（インデントでツリー構造を表す） |
| `Operation` | アクセスパス・結合方式などの操作種別（`TABLE ACCESS FULL`、`HASH JOIN`など） |
| `Name` | 対象のテーブル・インデックス名 |
| `Rows`（E-Rows） | オプティマイザの見積もり処理行数 |
| `Bytes` | 見積もりデータ量 |
| `Cost` | オプティマイザのコスト見積もり値（絶対時間ではなく相対比較用の指標） |
| `A-Rows` | （DISPLAY_CURSOR時のみ）実際に処理された行数 |

E-RowsとA-Rowsが大きく乖離している箇所は、統計情報やカーディナリティ見積もりの問題を疑うサイン（[[oracle-sql-tuning-checkpoints]]参照）。

## 読む順序

ツリーはOperation列のインデント（字下げ）で表現される。**最もインデントが深い行から実行され、外側（インデントが浅い行）へと結果が渡っていく**。同じ階層内では上から順に実行される。慣れないうちは「一番深くネストしている行から見て、外側に向かって追う」と読みやすい。

## Predicate Information（述語情報）

実行計画の下に付く`Predicate Information`セクションには、各ステップで適用された述語がAccessとFilterに分けて表示される。番号はOperationのId列に対応する。

```
Predicate Information (identified by operation id):
---------------------------------------------------
   2 - access("SECTION"=:A AND "ID2"=:B)
       filter("ID2"=:B)
```

- **access述語**: インデックスなどを使って「そもそも読みに行くブロックを絞り込む」ための述語。無駄なデータを最初から読まずに済む。
- **filter述語**: いったん読み込んだ（フェッチした）行に対して事後的に評価し、条件に合わない行を捨てるための述語。ブロック自体は既に読んでしまっている分、accessより非効率。

同じ条件でも、インデックスの列構成や結合順序次第でaccessになるかfilterになるかが変わる。実行計画を見て「本来access述語であってほしい条件がfilter述語に落ちていないか」を確認するのがチューニングの基本動作の一つ。

## SQL Monitoring（実行中クエリの観測）

Oracle 11g以降、`V$SQL_MONITOR`/`V$SQL_PLAN_MONITOR`に実行中・実行済みSQLの詳細な実行統計がリアルタイムに記録される（長時間実行やパラレル実行のSQLが対象になりやすい）。`DBMS_SQLTUNE.REPORT_SQL_MONITOR`でレポートを取得できるほか、Oracle Enterprise Managerからも参照できる。`MONITOR`/`NO_MONITOR`ヒントで対象SQLごとに有効・無効を制御できる。DISPLAY_CURSORが「完了後の集計」を見るのに対し、SQL Monitoringは実行中の進捗を追える点が異なる。

## バージョンについて

本ノートの内容はOracle Database 19c〜23ai（2026年8月時点の最新リリースアップデートは23.26.2.0.0、通称Oracle AI Database 26ai）を前提にしている。EXPLAIN PLAN/DISPLAY_CURSORの基本的な使い方・列の意味はバージョンを跨いで大きく変わらない。

## 出典

- [Oracle AI Database 26ai replaces Oracle Database 23ai](https://mikedietrichde.com/2025/10/14/oracle-ai-database-26ai-replaces-oracle-database-23ai/)
- [6 Explaining and Displaying Execution Plans (Oracle SQL Tuning Guide, 19c)](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/generating-and-displaying-execution-plans.html)
- [EXPLAIN PLAN (Oracle SQL Language Reference, 19c)](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/EXPLAIN-PLAN.html)
- [The Oracle Optimizer: Explain the Explain Plan (Oracle公式技術ブリーフ)](https://www.oracle.com/technetwork/database/bi-datawarehousing/oracle-explain-the-explain-0218-4403741.pdf)
- [Filter-predicates are a major Oracle SQL performance risk (use-the-index-luke.com)](https://use-the-index-luke.com/sql/explain-plan/oracle/filter-predicates)
- [Oracle Database - Execution Plan Predicate (datacadamia.com)](https://www.datacadamia.com/db/oracle/predicate)
- [21 データベース操作の監視 (Oracle SQL Tuning Guide, 日本語)](https://docs.oracle.com/cd/F19136_01/tgsql/monitoring-database-operations.html)
- [リアルタイムSQLモニタリングの使用 (Oracle Database Tools ドキュメント)](https://docs.oracle.com/ja-jp/iaas/database-tools/doc/real-time-sql-monitoring.html)

#oracle #sql #db
