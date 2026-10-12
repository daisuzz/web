---
created: "2026-10-12T10:50:00+09:00"
---
# Claude Code

Claude Codeの機能まわりのノートを束ねるハブノート。

## 機能

- [[claude-code-hooks]] — ライフサイクルの特定タイミングでユーザー定義のコマンドを決定論的に実行する仕組み。フォーマット・ブロック・通知・監査ログなど「必ずやらせたいこと」向け。
- [[claude-code-loop]] — プロンプトやスラッシュコマンドを定期的に繰り返し実行させるビルトインskill。デプロイ監視やCI待ちのようなポーリング作業向け。
- [[claude-code-observability]] — 利用状況の監視。OpenTelemetryによるリアルタイム監視とAnalytics APIによる組織向け集計の2系統。

## 考え方

- [[loop-engineering]] — 人間が毎回プロンプトを打つ代わりに、エージェントにプロンプトを打ち続けるループを設計するという考え方。Claude Codeでの最も手軽な実践が[[claude-code-loop]]。

#claude-code #ai #agent #moc
