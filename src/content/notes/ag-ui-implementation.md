---
created: "2026-10-01T10:08:00+09:00"
---
# AG-UIの最小実装

[[ag-ui]]のproducer（SSEサーバー）とconsumer（`@ag-ui/client`）を最小構成で書いた例。仕様と公式SDKのソースを読んで書いたもので、まだ実行して確認はしていない。

## サーバー（SDKなし、Node）

ワイヤの形を確かめるため、`@ag-ui/encoder`を使わずにSSEを直接書いている。フロントエンドツールで止まる分岐も入れた。

```ts
import http from "node:http";
import { randomUUID } from "node:crypto";

http.createServer(async (req, res) => {
  if (req.method !== "POST") { res.writeHead(405).end(); return; }
  let body = ""; for await (const c of req) body += c;

  let input: any;
  try { input = JSON.parse(body); } catch { res.writeHead(400).end(); return; } // RUN_STARTED前の拒否はHTTPで
  if (!input.threadId || !input.runId || !Array.isArray(input.messages)) { res.writeHead(422).end(); return; }

  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
  const send = (e: object) => res.write(`data: ${JSON.stringify(e)}\n\n`); // 1イベント=1 data, LF

  const { threadId, runId } = input;
  send({ type: "RUN_STARTED", threadId, runId, protocolVersion: "1.0" });
  try {
    const last = input.messages.at(-1);

    if (last?.role === "tool") {
      // フロントエンドツールの結果を受け取った2ラン目
      const id = randomUUID();
      send({ type: "TEXT_MESSAGE_START", messageId: id, role: "assistant" });
      send({ type: "TEXT_MESSAGE_CONTENT", messageId: id, delta: `結果: ${JSON.stringify(last.content)}` });
      send({ type: "TEXT_MESSAGE_END", messageId: id });
      send({ type: "RUN_FINISHED", threadId, runId, outcome: { type: "success" } });
    } else if ((input.tools ?? []).some((t: any) => t.name === "confirm")) {
      // フロントエンドツールを呼んで、successで終える（RESULTは出さない）
      const msgId = randomUUID(), callId = randomUUID();
      send({ type: "STATE_DELTA", delta: [{ op: "add", path: "/phase", value: "confirming" }] }); // 基準は input.state ?? {}
      send({ type: "TOOL_CALL_START", toolCallId: callId, toolCallName: "confirm", parentMessageId: msgId });
      send({ type: "TOOL_CALL_ARGS", toolCallId: callId, delta: '{"question":' });
      send({ type: "TOOL_CALL_ARGS", toolCallId: callId, delta: '"実行してよい？"}' });
      send({ type: "TOOL_CALL_END", toolCallId: callId });
      send({ type: "RUN_FINISHED", threadId, runId,
             outcome: { type: "success", pendingToolCallIds: [callId] } });
    } else {
      const id = randomUUID();
      send({ type: "TEXT_MESSAGE_CHUNK", messageId: id, delta: "Hello" }); // chunk形式。ENDはクライアントが合成
      send({ type: "TEXT_MESSAGE_CHUNK", delta: ", world." });
      send({ type: "RUN_FINISHED", threadId, runId });                     // outcome省略 = success
    }
  } catch (e: any) {
    send({ type: "RUN_ERROR", message: String(e?.message ?? e) });
  }
  res.end();
}).listen(8000);
```

Pythonなら、公式クイックスタートのように`ag_ui.core`のイベントモデル（snake_caseで書き、ワイヤ上はcamelCaseのalias）と、`ag_ui.encoder.EventEncoder(accept=request.headers.get("accept"))`を使う。FastAPIの`StreamingResponse`で`encoder.encode(event)`を順にyieldし、`media_type=encoder.get_content_type()`にすれば、Protobufのネゴシエーションにも乗れる。

## クライアント（`@ag-ui/client`）

`HttpAgent`（`AbstractAgent`のサブクラス）が、chunkの展開・JSON Patchの適用・`messages`/`state`の更新までやってくれる。[[ag-ui-frontend-tools]]のループだけを自分で書く。

```ts
import { HttpAgent } from "@ag-ui/client";

const agent = new HttpAgent({ url: "http://localhost:8000", threadId: "thr-1" });

agent.subscribe({
  onTextMessageContentEvent: ({ textMessageBuffer }) => render(textMessageBuffer),
  onToolCallArgsEvent: ({ toolCallName, partialToolCallArgs }) => preview(toolCallName, partialToolCallArgs),
  onStateChanged: ({ state }) => setUiState(state),
  onRunErrorEvent: ({ event }) => showError(event.message), // RUN_ERRORでrunAgentはrejectしない
});

const tools = [{
  name: "confirm",
  description: "ユーザーに確認を取る",
  parameters: { type: "object", properties: { question: { type: "string" } }, required: ["question"] },
}];

agent.addMessage({ id: crypto.randomUUID(), role: "user", content: "やって" });

while (true) {
  await agent.runAgent({ tools });
  const answered = new Set(agent.messages.filter(m => m.role === "tool").map(m => m.toolCallId));
  const pending = agent.messages
    .flatMap(m => (m.role === "assistant" ? m.toolCalls ?? [] : []))
    .filter(tc => !answered.has(tc.id));          // pendingToolCallIdsに頼らずストリームから導出
  if (pending.length === 0) break;

  for (const tc of pending) {
    const args = safeParse(tc.function.arguments); // 引数は信頼できない入力。スキーマで検証する
    const ok = args ? window.confirm(args.question) : false;
    agent.addMessage({ id: crypto.randomUUID(), role: "tool", toolCallId: tc.id,
                       content: ok ? "approved" : "declined" });  // 全部に回答してから次のランへ
  }
}
```

TS SDKの主なAPI。

- `runAgent(params?, subscriber?)`: 戻り値は`{ result, newMessages }`
- `subscribe(subscriber)`: `on<Event>Event`系と`onMessagesChanged`/`onStateChanged`/`onNewToolCall`などのフックを持つ。ハンドラが`{messages?, state?, stopPropagation?}`を返すと、状態を書き換えられる
- `use(middleware)`: 関数形式は`(input, next) => next.run(input)`、クラス形式は`Middleware`を継承して`run(input, next)`を実装し、中で`this.runNext(input, next)`を呼ぶ
- `addMessage`/`setMessages`/`setState`/`abortRun`/`getCapabilities?()`
- 独自トランスポートを使うなら、`AbstractAgent`を継承して`run(input): Observable<BaseEvent>`を実装する
- 1.0から、zodのバリデータは`@ag-ui/core/schemas`のサブパスに移った（`@ag-ui/core`本体は型と定数だけ）

CopilotKitを使う場合は、この上にReactフックとCopilotRuntime（AG-UIエンドポイントへのプロキシ）が載るので、このループを自分で書くことはほぼ無い。

## ハマりやすい点

1. `RUN_STARTED`の前に何も出さない。入力エラーはHTTP 4xxで返す（[[ag-ui-run-lifecycle]]）
2. 例外のパスでも、開いたテキストやツール呼び出しをENDしてから`RUN_FINISHED`を出す。閉じられない場合は`RUN_ERROR`
3. フロントエンドツールに`TOOL_CALL_RESULT`を出さない。interruptにもしない
4. 未回答のツール呼び出しを履歴に残したまま、次のランを送らない（多くのLLM APIがエラーにする）
5. `STATE_DELTA`の基準値は`input.state ?? {}`（[[ag-ui-state-sync]]）
6. `null`を送らない。独自データは`metadata`か`forwardedProps`に入れる（[[ag-ui-processing-model]]）
7. 接続断を成功扱いしない（truncated）。中断は`outcome: cancelled`で報告する
8. SSEの改行はLF。`: keep-alive`のようなコメント行を受け流せるようにする（[[ag-ui-transports]]）

## バージョンについて

本ノートの内容はAG-UI 1.0（2026年9月30日リリース）と、同時点の`@ag-ui/client`/`ag-ui-protocol`（Python）を前提にしている。

## 出典

- [ag-ui-protocol/ag-ui (GitHub)](https://github.com/ag-ui-protocol/ag-ui) — `docs/quickstart/server.mdx`、`docs/sdk/js/client/`、`sdks/typescript/packages/client/src/agent/`
- [Release 2026-09-30 · ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui/releases/tag/release/2026-09-30)

#ag-ui #ai-agent #typescript
