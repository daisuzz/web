---
created: "2026-08-27"
---
# アクセスパスと結合方式（Oracle）

## [[oracle-execution-plan]]の中での位置づけ

実行計画のOperation列に出てくる代表的な操作（アクセスパス・結合方式）の意味と、それぞれがいつ選ばれるかをまとめたノート。実行計画自体の読み方は[[oracle-explain-plan-reading]]を参照。

## アクセスパス（1テーブルからのデータ取得方法）

- **`TABLE ACCESS FULL`（フルテーブルスキャン）**: テーブルの全ブロックを読み、WHERE条件に合わない行を捨てる。対象行の割合が多い、使えるインデックスが無い、あるいはオプティマイザがそれをコストの最も低い選択肢と判断した場合に選ばれる。フルスキャンが出ていること自体は問題ではなく、「その判断が妥当か」を見るのが本来のポイント。
- **`INDEX UNIQUE SCAN`**: 一意インデックス（主キー等）から1行だけを返すスキャン。
- **`INDEX RANGE SCAN`**: インデックスの値範囲を辿るスキャン。等価条件・範囲条件（`BETWEEN`、`<`等）で使われる。
- **`INDEX SKIP SCAN`**: 複合インデックスの先頭列がWHERE条件に含まれていなくても、先頭列の取りうる値ごとにインデックスを複数回スキャンして使う方式。先頭列のカーディナリティ（distinct値の数）が低いほど有効。

## 結合方式（2つの表を結合する方法）

| 結合方式 | 動作 | 有利な状況 |
|---|---|---|
| `NESTED LOOPS` | 外側表（driving table）の各行に対し、内側表を都度検索する（forループの入れ子） | 外側表の行数が少なく、内側表へのアクセスにインデックスが効く場合 |
| `HASH JOIN` | 小さい方の表の結合キーでハッシュ表をメモリ上に構築し、大きい方の表をスキャンしながらハッシュ表をプローブする | 大量データ同士の等価結合（`=`条件） |
| `SORT MERGE JOIN` | 両方の入力を結合キーでソートしてからマージする（Sort join → Merge join） | 結合条件が不等号（`<`、`<=`、`>`、`>=`）の場合。等価結合でも大量データではネステッドループより有利になることがある |

オプティマイザは、絞り込み後の行数（カーディナリティ）が小さい表から結合していく（結合順序）ことを基本方針とし、その上でどの結合方式が最もコストが低いかを見積もって選択する。実行計画上でネステッドループが選ばれているのに外側表の行数見積もりが実は大きい、といったズレが性能問題の典型パターン（[[oracle-sql-tuning-checkpoints]]のカーディナリティ見積もりの話も参照）。

## 出典

- [The Oracle Optimizer: Explain the Explain Plan (Oracle公式技術ブリーフ)](https://www.oracle.com/a/tech/docs/database/technical-brief-explain-the-explain-plan-052011.pdf)
- [Explain the Explain Plan: Join Methods (Maria Colgan / sqlmaria.com)](https://sqlmaria.com/2021/02/02/explain-the-explain-plan-join-methods/)
- [6 Explaining and Displaying Execution Plans (Oracle SQL Tuning Guide, 19c)](https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/generating-and-displaying-execution-plans.html)

#oracle #sql #db
