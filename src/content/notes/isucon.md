---
created: 2026-08-22
---

# ISUCON

「いいかんじにスピードアップコンテスト」の略。与えられたWebアプリケーション（言語は毎回複数用意される）を、機能や整合性を壊さずにチューニングし、専用ベンチマーカーが計測するスコアを制限時間内にどれだけ伸ばせるかを競う。予選・本選の2段階構成で行われる。

## 基本サイクル

ISUCONの改善作業は「計測→ ボトルネック特定 → 改善 → ベンチマーク実行 → スコア確認」のループを高速に回すことに尽きる。勘に頼って闇雲に手を入れるのではなく、必ず計測結果に基づいて手を入れる箇所を決める。

- **アクセスログ解析**: nginxのアクセスログを [alp](https://github.com/tkuchiki/alp) で集計し、どのエンドポイントが遅い・呼ばれる回数が多いかを把握する。
- **スロークエリ解析**: MySQLのスロークエリログを `mysqldumpslow` や `pt-query-digest` で集計し、どのクエリが遅いかを把握する。
- **プロファイリング**: 各言語のプロファイラ（Goなら`pprof`など）でアプリケーションコード内のどこに時間がかかっているかを特定する。

## 定番の改善ポイント

- N+1クエリの解消（JOINへの書き換え、事前フェッチ、インメモリキャッシュ）
- 適切なインデックスの追加
- 静的ファイル配信をアプリケーションサーバーからnginx（またはnginxの`X-Accel-Redirect`）に委譲する
- インメモリキャッシュの導入（DBアクセス自体を減らす）
- コネクションプール数など各種ミドルウェアの上限設定の見直し
- 複数台構成の場合、DB・アプリケーション・リバースプロキシをサーバー間で適切に分散配置する

## 出典

- [ISUCON初心者のためのISUCON7予選対策 : ISUCON公式Blog](https://isucon.net/archives/50697356.html)
- [ISUCONで学ぶGo private-isu環境構築編 alp,pprof,pt-query-digestの導入方法 - Qiita](https://qiita.com/yusuke_hrsm/items/75555f4254529c315de3)
- [GitHub - catatsuy/memo_isucon](https://github.com/catatsuy/memo_isucon)

#isucon #パフォーマンスチューニング #webアプリケーション #mysql #nginx
