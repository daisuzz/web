---
created: "2026-08-20T20:17:50+09:00"
---
# OpenTelemetry

分散システムのmetrics・logs・traces（テレメトリデータ）を計装・収集・エクスポートするための、ベンダー中立なオブザーバビリティ標準。CNCF（Cloud Native Computing Foundation）がホストするプロジェクトで、OpenTracingとOpenCensusが統合されて生まれた。

## 構成要素

- **API/SDK**: アプリケーションコードにテレメトリ計装を追加するための言語ごとのライブラリ。API（インターフェース）とSDK（実装）が分離されており、SDKを差し替えても計装コードは変更不要
- **Instrumentation**: アプリやライブラリにテレメトリ収集ポイントを埋め込むこと。自動計装（HTTPフレームワークなどに対する既製のインテグレーション）と手動計装がある
- **Collector**: アプリケーションから送られたテレメトリデータを受信・加工（バッチ化、フィルタリング、属性付与など）し、1つ以上のbackendに転送するスタンドアロンのプロキシ。Receiver→Processor→Exporterのパイプラインで構成される
- **Exporter**: テレメトリデータを特定のbackend（Prometheus、Jaeger、Datadogなど）向けの形式に変換して送信するコンポーネント

## OTLP (OpenTelemetry Protocol)

テレメトリデータの転送に使う、OpenTelemetry標準のプロトコル。gRPCとHTTP（Protobufまたは JSON）の両方の実装がある。多くのobservability backendがOTLPを直接受け付けるようになってきており、独自形式へのExporterを都度書かなくても済むようになってきている。

## 3本柱（Traces / Metrics / Logs）

- **Traces**: リクエストがシステムを通過する経路を表す。複数のspan（処理単位）がつながって1つのtraceを構成する。分散システムでのレイテンシ分析やボトルネック特定に使う
- **Metrics**: カウンター・ゲージ・ヒストグラムなど、集計された数値データ。時系列でのモニタリング・アラートに向く
- **Logs**: タイムスタンプ付きのイベント記録。他の2つと違い元々各言語・システムでバラバラなロギング機構が既にあるため、OpenTelemetryは既存ロギングライブラリとの統合（trace_id/span_idの自動付与など）に力点を置いている

3つのシグナルは共通の`Resource`（サービス名、ホスト名などの発生源情報）と結びつけられ、trace_idを介してログとtraceを紐付けるといった横断的な分析ができるように設計されている。

[[claude-code-observability]]はOTLPエクスポートに対応しており、実際のプロダクトがOpenTelemetryをどう活用しているかの一例になっている。

## 出典

- [OpenTelemetry公式サイト: What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/)
- [OpenTelemetry公式サイト: Collector](https://opentelemetry.io/docs/collector/)
- [OpenTelemetry公式サイト: Protocol specification](https://opentelemetry.io/docs/specs/otlp/)

#observability #opentelemetry #ai
