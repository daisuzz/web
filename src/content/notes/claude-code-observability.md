---
created: "2026-08-20"
---
# Claude Codeのobservability

Claude Codeの利用状況を監視・可視化する仕組み。大きく分けて「OpenTelemetryによるリアルタイム・カスタム監視」と「Analytics APIによる組織向け集計データ」の2系統がある。

## OpenTelemetry (OTel) 統合

metrics・logs・traces（β）をOTLPで外部のobservability基盤にエクスポートできる仕組み。

- Datadog、Grafana、Honeycombなど任意のOTel対応backendに送れる
- プロトコルはgRPC/HTTP、Prometheus形式にも対応。mTLS認証も可能
- 有効化・接続先の指定は環境変数ベース（`OTEL_METRICS_EXPORTER`、`OTEL_LOGS_EXPORTER`、エンドポイントURLなど）

### 取得できる主なメトリクス

- `session.count`（セッション数）
- `cost.usage`（コスト）
- `token.usage`（トークン使用量、モデル別）
- `lines_of_code.count`（コード変更量）
- `commit.count` / `pull_request.count`
- `active_time.total`
- ツールごとの受理/却下率

### ログに含まれる属性

- `session.id`、`user.id`（匿名ID）、`organization.id`
- OAuth利用時は`email`も含まれる
- `OTEL_LOG_USER_PROMPTS`や`OTEL_LOG_TOOL_DETAILS`のような環境変数で、プロンプト内容やツール詳細をログに記録するかどうかを個別にオン/オフできる（プライバシー制御）

## Claude Code Analytics API

組織向けの集計データAPI。

- Admin APIから組織全体の**日次集計データ**を取得できる（約1時間遅延）
- ユーザー単位で、セッション数・コード行数・commit数・PR数・ツール受理率などを分析できる
- Anthropic Consoleの**Analytics Dashboard**で可視化されるほか、APIを叩いて独自ダッシュボードを構築することも可能

## ユーザー/管理者が実際にできること

- **個人開発者**: 環境変数を設定するだけで自分のセッションのメトリクス・ログを任意のOTelバックエンドに流し、コスト・トークン消費・活動時間などを可視化できる
- **組織管理者**: managed settingsでOTLPエンドポイントやAPIキーを組織全体に一括設定し、Consoleダッシュボードやカスタムダッシュボードでチーム全体の利用状況・コスト・生産性指標を横断的に監視できる

[[claude-code-loop]]のようなポーリング/イベント駆動の監視の仕組みは個々のセッションの「動作」を制御するものだが、observabilityはセッション横断で「利用状況」を可視化する仕組みという違いがある。

## 出典

- [Claude Code: Monitoring usage](https://code.claude.com/docs/en/monitoring-usage.md)
- [Claude Code Analytics API](https://platform.claude.com/docs/en/manage-claude/claude-code-analytics-api.md)

#claude-code #observability #opentelemetry #ai
