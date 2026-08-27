---
created: "2026-08-27"
---
# Oracle SQLチューニングの着眼点

## [[oracle-execution-plan]]の中での位置づけ

実行計画を読んで「悪いプランが選ばれている」と分かった後、原因側でまず疑うべきポイントをまとめたノート。実行計画自体の読み方は[[oracle-explain-plan-reading]]、アクセスパス・結合方式の意味は[[oracle-access-paths-and-joins]]を参照。

## 統計情報の陳腐化

オプティマイザはテーブル・インデックス・列の統計情報（行数、distinct値数、データ分布など）を元にコストを見積もる。統計情報が古い、あるいはデータ量・分布の急変に追随できていないと、見積もり行数(E-Rows)と実測行数(A-Rows)が乖離し、誤ったアクセスパス・結合方式が選ばれる。`DBMS_STATS.GATHER_TABLE_STATS`での再収集が基本対応。[[oracle-explain-plan-reading]]の`DISPLAY_CURSOR`でE-RowsとA-Rowsの乖離を確認するのが典型的な調査の入り口になる。

## ヒストグラム

オプティマイザはデフォルトで列内の値が一様分布していると仮定する。実際には偏り（スキュー）のある列（例: ステータスが大半"完了"で稀に"エラー"）だとこの仮定が外れ、見積もりが不正確になる。ヒストグラムはこの偏りを統計情報として持たせる仕組み。

- **Frequency histogram**: distinct値の数がバケット数（デフォルト254）以下のとき、値ごとに1バケットを割り当てる。
- **Height-balanced histogram**: 従来方式。バケット数を超えるdistinct値がある場合、各バケットがほぼ同じ行数を持つように値の範囲を圧縮する。
- **Hybrid / Top-frequency histogram**（12c以降）: 明示的なサンプリングを指定せずに統計収集した場合、Oracleは全件スキャンしてこれらの新方式でヒストグラムを作る。従来のheight-balancedは明示サンプリング時のみ作成される。

## バインドピーキングとAdaptive Query Optimization

- **バインドピーキング (bind peeking)**: カーソルの初回実行時に実際にバインドされた値を「覗いて」その値に基づいたプランを決定し、以降は同じ共有カーソルを使い回す。データ分布に偏りがある列に対して異なる値でバインドされると、初回に最適化されたプランが以降の実行には不適切になりうる。
- **Adaptive Query Optimization**（12c〜）: 見積もりと実測の乖離を実行時・以降の実行にフィードバックする仕組みの総称。
  - **Adaptive Plans**: 実行中に、ある操作の実測行数が見積もりと大きく異なった場合、あらかじめ用意された代替サブプランに切り替える（例: ネステッドループを想定していたが実際の行数が多く、ハッシュジョインに切り替える）。
  - **Statistics Feedback**（旧称Cardinality Feedback、11gR2で単一表対象として導入、12cで結合にも拡張されて改称）: ある実行での見積もり誤差を記録し、次回以降の同一SQLの実行時にプランへ反映する。結合に対するフィードバックは`optimizer_adaptive_statistics`パラメータで無効化できるが、単一表のカーディナリティフィードバックは常時有効。

## SQLプランベースライン（SQL Plan Management, SPM）

統計情報の再収集やOracleバージョンアップなどをきっかけに、重要なSQLのプランが意図せず変わり性能劣化することがある。SPMは、許可された1つ以上の「ベースライン」の中から実行コストが最も低いプランを選ばせることで、プランを安定化させる仕組み。Oracle Database 18c以降はStandard Editionでも1SQLにつき1ベースラインを作成できる。

## ヒントの濫用リスク

ヒントは特定時点でのオプティマイザの判断を強制的に上書きするものであり、以下のリスクを伴う。

- 統計情報の更新やデータ量の変化、Oracleバージョンアップによってオプティマイザ本来の判断の方が優れたプランを選べるようになっても、ヒントが古い判断を固定してしまう。
- ヒントを使う前に、まず対象表の統計情報を最新化し、ヒント無しでのEXPLAIN PLANを確認して本当にオプティマイザの判断が誤っているかを切り分けるのが基本手順。
- `NO_MONITOR`ヒントのように、意図せず実行時間の長いSQLの[[oracle-explain-plan-reading]]で触れたSQL Monitoringを無効化してしまうヒントもあり、調査を妨げる副作用にも注意が必要。

## 出典

- [11 Histograms (Oracle SQL Tuning Guide, 18c)](https://docs.oracle.com/en/database/oracle/oracle-database/18/tgsql/histograms.html)
- [Histogram Enhancements in Oracle Database 12c Release 1 (ORACLE-BASE)](https://oracle-base.com/articles/12c/histograms-enhancements-12cr1)
- [Optimizer Adaptive Features in Oracle Database 12c Release 2 (Oracle Optimizer Blog)](https://blogs.oracle.com/optimizer/optimizer-adaptive-features-in-oracle-database-12c-release-2)
- [Adaptive Plans in Oracle Database 12c Release 1 (ORACLE-BASE)](https://oracle-base.com/articles/12c/adaptive-plans-12cr1)
- [Statistics Feedback (Formerly Cardinality Feedback) (Oracle Optimizer Blog)](https://blogs.oracle.com/optimizer/statistics-feedback-formerly-cardinality-feedback)
- [【Oracle Database】実行計画の固定化方法まとめ（アシスト）](https://www.ashisuto.co.jp/db_blog/article/201809_execution_plans.html)
- [Oracle SQLチューニング Season2（第24回）第4章 SQL TuningとHINTの関係（日本エクセム）](https://www.ex-em.co.jp/blog/sql_2_24)
- [21 データベース操作の監視 (Oracle SQL Tuning Guide, 日本語)](https://docs.oracle.com/cd/F19136_01/tgsql/monitoring-database-operations.html)

#oracle #sql #sql-tuning #db
