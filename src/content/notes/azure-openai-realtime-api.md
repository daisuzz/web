---
created: 2026-08-21
---

# Azure OpenAI Realtime API

音声を中心としたリアルタイム双方向会話のためのAPI。Azure OpenAI(現Microsoft Foundry Models)がOpenAIのRealtime APIをAzure上でホストして提供しているもの。

## 概要

従来の音声会話アプリは 音声認識(STT) → LLM推論 → 音声合成(TTS) という3段のパイプラインを組む必要があったが、Realtime APIは音声入力から音声出力までを単一モデル内で直接処理する（speech-in, speech-out）。この結果、パイプライン構成に比べて低遅延で、抑揚やトーンなど音声特有のニュアンスも保持しやすい。カスタマーサポートの音声エージェント、音声アシスタント、リアルタイム翻訳などが典型的なユースケース。

対応モデルは `gpt-realtime`、`gpt-4o-realtime-preview`、`gpt-4o-mini-realtime-preview`、および2026年に追加された `gpt-realtime-1.5`・`gpt-audio-1.5`・`gpt-realtime-2.1`（軽量版の `gpt-realtime-2.1-mini` も）など。文字起こし・翻訳に特化したリアルタイムモデルも別途用意されている。

## 提供している機能

- **音声⇔音声のストリーミング対話**: マイク入力をストリームで送りつつ、モデルの応答音声をストリームで受け取れる。テキストのみのやり取りも可能で、音声とテキストを混在させられる（`modalities`）。
- **Voice Activity Detection (VAD)**: ユーザーが話し始めた/話し終えたことをサーバー側で自動検出し、割り込み（ユーザーがモデルの発話中に話しかけるバージイン）にも対応する。`turn_detection` として設定する。
- **Function calling**: 通常のChat Completions APIと同様、会話の途中でツール呼び出しを行える。
- **リアルタイム文字起こし・翻訳**: 音声対話に特化したモデルとは別に、リアルタイムの文字起こし・多言語翻訳向けモデルも提供される。
- **3種類の接続方式**: WebSocket、WebRTC、SIP（後述）。

## 基本概念

Realtime APIはリクエスト/レスポンス型ではなく、**イベント駆動の非同期双方向プロトコル**。WebSocketやWebRTCのデータチャネル上でJSON形式のイベントを送り合う。

- **session**: 接続確立時に作られる会話全体の設定オブジェクト。モデル、音声の種類（`voice`）、`modalities`（`audio`/`text`）、`turn_detection`（VADの設定）、システムプロンプトに相当する `instructions` などを持つ。クライアントから `session.update` イベントで途中からでも設定変更できる。
- **client events / server events**: クライアント→サーバーに送るイベント（`session.update`、`input_audio_buffer.append`、`input_audio_buffer.commit`、`conversation.item.create`、`response.create` など）と、サーバー→クライアントに流れてくるイベント（`session.created`、`conversation.item.created`、`response.output_item.added`、`response.audio.delta`、`response.audio_transcript.delta`、`response.done` など）がそれぞれ多数定義されている。
- **conversation / item**: 1接続内の会話履歴が `conversation` で、そこに追加される個々の発話・関数呼び出し・関数の戻り値などが `item`。`conversation.item.create` で履歴に手動でアイテムを追加することもできる（過去の会話を引き継ぐ場合など）。
- **response**: モデルにアイテムを生成させる単位。`response.create` で明示的に応答生成をトリガーできるほか、VADがユーザーの発話終了を検出すると自動的に応答生成が走る設定もできる。応答は `response.audio.delta`/`response.text.delta` のようなdeltaイベントでストリーミングされてくる。

## 接続方式: WebSocket / WebRTC / SIP

- **[[webrtc]]**: ブラウザ・モバイルアプリなどクライアントサイドから直接繋ぐ用途向け。低遅延に最適化されており、Microsoftはクライアントサイドでは基本WebRTCを推奨している。
- **WebSocket**: サーバー間（server-to-server）通信向け。WebRTCよりレイテンシは高くなるが、バックエンドサーバーからAPIキーを使って直接接続する構成に向いている。
- **SIP**: 電話網（PSTN）とRealtime APIを接続する用途（Twilioなどのテレフォニー基盤経由の音声エージェント）。

## GA版とPreview版の違い

Realtime APIは2025年にPreview提供が始まり、2026年にGA（一般提供）となった。エンドポイントの形が異なる点に注意が必要。

- Preview版: `wss://<resource>.openai.azure.com/openai/realtime?api-version=2025-04-01-preview&deployment=<deployment-name>`
- GA版: `wss://<resource>.openai.azure.com/openai/v1/realtime?model=<deployment-name>`（`api-version` クエリパラメータが不要になり、`deployment` ではなく `model` を指定する）

Preview版のAPIは2026年4月30日付で廃止（deprecated）されており、GA版への移行が必要とアナウンスされている。

## 認証

- **Microsoft Entra ID**（推奨）: マネージドID対応のリソースに対してBearerトークンで認証する。
- **APIキー**: `api-key` ヘッダーまたはクエリパラメータで渡す。ブラウザから直接繋ぐWebRTC/WebSocketの構成ではAPIキーを露出させたくないため、サーバー側で短命の「ephemeral token（client secret）」を発行してクライアントに渡す構成が推奨される。

## Spring Bootでの実装例

Azure/OpenAIともに公式のJava/Spring Boot向けサンプルは提供されていない（Azureの[aoai-realtime-audio-sdk](https://github.com/Azure-Samples/aoai-realtime-audio-sdk)にはJavaコンソールサンプルはあるがSpring Bootではなく、Spring AI側でもRealtime API対応は[議論段階](https://github.com/spring-projects/spring-ai/issues/1464)）。以下はドキュメント化されているWebSocketプロトコルをもとにした実装イメージ。

サーバー間接続が前提のWebSocketを使う場合、典型的にはブラウザ ⇔ Spring Bootサーバー ⇔ Azure Realtime API という中継構成にし、APIキーをサーバー側に閉じ込める。Spring自体の`spring-boot-starter-websocket`が持つ`StandardWebSocketClient`でAzure側へのアウトバウンド接続を張れる。

```java
@Service
public class AzureRealtimeClient {

    private static final String ENDPOINT =
        "wss://%s.openai.azure.com/openai/v1/realtime?model=%s";

    public WebSocketSession connect(String resourceName, String deployment, String apiKey,
                                     WebSocketHandler handler) throws Exception {
        WebSocketClient client = new StandardWebSocketClient();
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        headers.add("api-key", apiKey);

        URI uri = URI.create(ENDPOINT.formatted(resourceName, deployment));
        return client.execute(handler, headers, uri).get();
    }
}
```

```java
public class AzureRealtimeHandler extends TextWebSocketHandler {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionUpdate = """
            {
              "type": "session.update",
              "session": {
                "modalities": ["audio", "text"],
                "voice": "alloy",
                "turn_detection": { "type": "server_vad" }
              }
            }
            """;
        session.sendMessage(new TextMessage(sessionUpdate));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode event = mapper.readTree(message.getPayload());
        switch (event.get("type").asText()) {
            case "response.audio.delta" -> {
                byte[] audioChunk = Base64.getDecoder().decode(event.get("delta").asText());
                // ブラウザ側のWebSocketへ中継するなど
            }
            case "response.done" -> {
                // 応答完了時の後処理
            }
            default -> { /* session.created, conversation.item.created など */ }
        }
    }
}
```

マイク入力はブラウザ側から受け取ったPCM音声チャンクをbase64化し、`input_audio_buffer.append` イベントとして送信する形になる。VADを`server_vad`にしていれば発話終了は自動検出され、明示的な`response.create`なしでも応答生成がトリガーされる。

## 出典

- [Use the GPT Realtime API for speech and audio with Azure OpenAI - Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio)
- [Use the GPT Realtime API via WebRTC - Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-webrtc)
- [Use the GPT Realtime API via WebSockets - Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-websockets)
- [Realtime API reference (audio events) - Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/openai/realtime-audio-reference)
- [Migration from Preview to GA version of Realtime API - Microsoft Learn](https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/realtime-audio-preview-api-migration-guide)
- [What's new in Azure OpenAI in Microsoft Foundry Models? - Microsoft Learn](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/whats-new)
- [Azure-Samples/aoai-realtime-audio-sdk (GitHub)](https://github.com/Azure-Samples/aoai-realtime-audio-sdk)
- [Adding support for OpenAI's real-time model · spring-projects/spring-ai#1464](https://github.com/spring-projects/spring-ai/issues/1464)

#azure #openai #realtime-api #websocket #webrtc #springboot #llm
