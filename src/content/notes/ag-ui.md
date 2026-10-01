---
created: "2026-10-01T10:00:00+09:00"
---
# AG-UI

Agent–User Interaction Protocol。エージェント（バックエンド）とユーザーが触るアプリ（フロントエンド）をつなぐイベント駆動のオープンプロトコル。CopilotKitが作ったもので、CopilotKit自体はこのAG-UIクライアントの上に乗ったReact向けフレームワークという関係。LangGraph・Mastra・Google ADK・Pydantic AI・OpenAI Agents SDK・Claude Managed Agentsなどが対応している。

## 他プロトコルとの関係

- MCP: エージェント ↔ ツール/コンテキスト
- A2A: エージェント ↔ エージェント
- AG-UI: エージェント ↔ ユーザー（アプリ経由）

競合ではなくレイヤーが違う。1つのエージェントが3つとも話すこともある。

## 骨格

```
run(input: RunAgentInput) -> Stream<Event>
```

リクエスト1つ（`RunAgentInput`）を送ると、型付きイベントの順序付きストリームが1本返ってくる。逆方向（アプリ→エージェント）に流れるのはラン開始時の`RunAgentInput`だけで、ランの途中でクライアントからエージェントへ送る経路はない。この制約から[[ag-ui-frontend-tools]]や[[ag-ui-interrupt-resume]]の「2ランにまたがる往復」という設計が出てくる。

1.0からは権威が2つに分かれている。

- 構造（フィールド・必須かどうか・型）はJSON Schema（`spec/1.0/schema.json`）が決める。TS/Python/.NETのSDKの型はここから自動生成される
- 振る舞い（順序・ライフサイクル・エラー処理・互換性）は仕様本文がRFC 2119のMUST/SHOULDで決める

登場する役割は、イベントを出す側のproducer（エージェント、プロキシなど）と、読む側のconsumer（クライアントSDK、UIなど）。

## イベント: 8ファミリー・31種

| ファミリー | イベント |
|---|---|
| ラン/ステップ | `RUN_STARTED` `RUN_FINISHED` `RUN_ERROR` `STEP_STARTED` `STEP_FINISHED` |
| テキスト | `TEXT_MESSAGE_START/CONTENT/END/CHUNK` |
| ツール呼び出し | `TOOL_CALL_START/ARGS/END/CHUNK` `TOOL_CALL_RESULT` |
| 状態 | `STATE_SNAPSHOT` `STATE_DELTA` `MESSAGES_SNAPSHOT` |
| アクティビティ | `ACTIVITY_SNAPSHOT` `ACTIVITY_DELTA` |
| 推論 | `REASONING_START/END` `REASONING_MESSAGE_START/CONTENT/END/CHUNK` `REASONING_ENCRYPTED_VALUE` |
| サブエージェント | `SUBAGENT_STARTED/FINISHED/ERROR` |
| パススルー | `RAW` `CUSTOM` |

全イベント共通で`type`（必須）と、任意の`timestamp`/`rawEvent`/`metadata`を持つ。多くのイベントは、サブエージェント帰属用の`subagentRunId`も任意で持てる。

## 構成ノート

- [[ag-ui-run-lifecycle]] — `RunAgentInput`の中身と、`RUN_STARTED`〜`RUN_FINISHED`/`RUN_ERROR`の状態機械。`outcome`（success/interrupt/cancelled）、truncated、token usage
- [[ag-ui-streaming-events]] — テキスト・ツール引数・推論に共通するStart→Content→Endの規律と、短縮形の`*_CHUNK`
- [[ag-ui-frontend-tools]] — アプリ側で実行するツールの、2ランにまたがる往復
- [[ag-ui-interrupt-resume]] — エージェントが明示的に止まって尋ねるHuman-in-the-loopの経路
- [[ag-ui-state-sync]] — `STATE_SNAPSHOT`/`STATE_DELTA`（JSON Patch）とActivityによる状態同期
- [[ag-ui-transports]] — HTTP+SSE（必須）とHTTP+Protobuf
- [[ag-ui-processing-model]] — 「未知はエラーにしない、既知の不正値は致命的」の非対称性、middleware、バージョンネゴシエーション
- [[ag-ui-implementation]] — SDKなしのSSEサーバーと`@ag-ui/client`による最小実装、およびハマりやすい点

## その他のファミリー（概要のみ）

- Reasoning: スパン（`REASONING_START/END`）と推論メッセージは別の名前空間。`REASONING_ENCRYPTED_VALUE`は、OpenAIの暗号化reasoningやGeminiのthought signatureのような値を、クライアントが中身を読まずに保持して次の入力で返すためのもの。0.x の`THINKING_*`は廃止され、TSクライアントの互換層が警告付きで変換する
- Subagents: `SUBAGENT_STARTED`〜`FINISHED`/`ERROR`の間に出たイベントを`subagentRunId`で帰属させ、並行するサブエージェントの出力を区別する。stateはサブエージェントごとではなく、ラン単位の1つのドキュメントのまま
- Metadata: どのイベントにも付けられる、キーが自由な入れ物。生成されるメッセージにキー単位でマージされる（後勝ち・再帰なし）。`ag-ui`キーは予約済み。独自データを載せる正規の経路はここ
- Capabilities: `AgentCapabilities`（identity/tools/state/reasoning/multimodal/humanInTheLoop など）。あくまで参考情報で、宣言が無いことを「非対応」と読んではいけない

## バージョンについて

本ノートの内容はAG-UI 1.0（2026年9月30日リリース）を前提にしている。

## 出典

- [ag-ui-protocol/ag-ui (GitHub)](https://github.com/ag-ui-protocol/ag-ui) — 仕様本文 `docs/spec/1.0/`、`spec/1.0/schema.json`
- [Release 2026-09-30 · ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui/releases/tag/release/2026-09-30)
- [Introducing AG-UI 1.0 (CopilotKit Blog)](https://www.copilotkit.ai/blog/ag-ui-1.0)
- [AG-UI 1.0: A Stable Spec for Connecting AI Agents to Apps (SitePoint)](https://www.sitepoint.com/ag-ui-1-0-stable-spec-agent-user-interaction/)
- [feat: AG-UI 1.0 for CopilotKit (CopilotKit PR 7270)](https://github.com/CopilotKit/CopilotKit/pull/7270)

#ag-ui #ai-agent #protocol #moc
