---
created: "2026-10-01T10:06:00+09:00"
---
# AG-UIのトランスポート

[[ag-ui]]のイベントの意味はトランスポートに依存しない。トランスポートは「binding」と呼ばれ、入力の渡し方・イベントのフレーミング・終端と失敗の伝え方だけを決める。HTTPを話す実装はSSEが必須で、Protobufは任意。

## HTTP + SSE

```
POST /agent
Content-Type: application/json
Accept: text/event-stream

{"threadId":"thr-1","runId":"run-1","messages":[…]}

HTTP/1.1 200 OK
Content-Type: text/event-stream

data: {"type":"RUN_STARTED","threadId":"thr-1","runId":"run-1"}

data: {"type":"TEXT_MESSAGE_START","messageId":"msg-1","role":"assistant"}

data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"msg-1","delta":"Hello."}

data: {"type":"TEXT_MESSAGE_END","messageId":"msg-1"}

data: {"type":"RUN_FINISHED","threadId":"thr-1","runId":"run-1"}
```

- SSEの1イベントにつき、`data`にはプロトコルイベントのJSONをちょうど1つ入れる（複数入れたり、断片にしたりしない）
- 改行はLFに固定（SSEの文法上はCR/CRLFも許されるが、このbindingではLFを使う）
- consumerは`event:`/`id:`/`retry:`を無視し、`: keep-alive`のようなコメント行を許容する（MUST）
- 入力の不正・認証エラーはHTTPのエラーステータスで返し、ストリームは始めない。ストリームが始まった後の失敗は`RUN_ERROR`で返す。200が返っても成功とはみなさない
- `Last-Event-ID`による再開は無い。切れたストリームには戻れないので、新しい`runId`でやり直す
- 1回のPOSTでも、スレッド履歴のリプレイとして複数のランが流れることはある

## HTTP + Protobuf

- リクエストはSSEと同じJSONのPOST。`Accept`に`application/vnd.ag-ui.event+proto`を含めてネゴシエートする
- レスポンスの`Content-Type`は`application/vnd.ag-ui.event+proto`。フレームは「4バイトのビッグエンディアン長＋本体」で、区切りなしで並ぶ
- producerが対応していなければSSEで返ってくるので、クライアントは常にSSEも受けられるようにしておく
- `.proto`は同じJSON Schemaから生成される。first-partyのエンコーダは、共有のバイトコーパスとバイト単位で一致することが求められる
- 制約: スキーマより新しいフィールドは、protobufのデコードの時点で黙って消える（JSONなら警告付きで取り除かれる）

## 独自トランスポート

WebSocket、メッセージバス、プロセス内パイプなども使ってよい。ただし次を満たす必要がある（MUST）。

- 順序どおりで欠落のない配送
- イベントより前に`RunAgentInput`を届ける
- 正常終了と切断（truncated）を区別できる
- 不正な入力を、ストリームの外で拒否する経路がある

JSONを運ぶなら、SSEと同じく「1フレーム1イベント」にするのがSHOULD。認証・認可はプロトコルの範囲外で、bindingとアプリの責務。

## バージョンについて

本ノートの内容はAG-UI 1.0（2026年9月30日リリース）を前提にしている。Protobuf bindingは1.0で仕様化された。

## 出典

- [ag-ui-protocol/ag-ui (GitHub)](https://github.com/ag-ui-protocol/ag-ui) — `docs/spec/1.0/basic/transports/`
- [HTML Standard - Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)

#ag-ui #protocol #sse #protobuf
