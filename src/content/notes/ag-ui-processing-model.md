---
created: "2026-10-01T10:07:00+09:00"
---
# AG-UIの処理モデル

[[ag-ui]]のconsumer・producerが、受け取ったものをどう扱うかのルール。SDKやプロキシを書くなら必須の内容。

## 未知はエラーにしない、既知の不正値は致命的

- 未知のイベント型 → 警告を出して捨てる。ランは中断しない
- イベントに未定義のプロパティ → 警告を出して取り除く
- 未知のunionメンバー（新しいコンテンツパートの種類、新しいoutcomeなど） → ランは中断しない
- 既知フィールドの値が不正（`messageId`が数値など） → ランを失敗させる。補正・型変換・無視はしない

この非対称性は意図的なもの。新しい型やフィールドは、相手が新しいバージョンなだけかもしれず、古い側にそれを不正と判断する根拠は無い。一方、既知フィールドの型違いは単なるバグで、黙って直すと後で原因の分かりにくい形で表面化する。

JSON Schema側は、各オブジェクトを`unevaluatedProperties: false`で閉じている（「厳密なオブジェクト、寛容な受信者」）。そのため、新しいproducerのストリームを古いスキーマで検証すると落ちる。スキーマ検証は同じバージョン同士の準拠チェックであって、互換性のチェックではない。

## パイプラインの順序

```
producer → 互換境界(旧形式の変換) → middleware → enforcement → アプリコード
```

- 互換境界で、廃止された形式を新しい形式に翻訳する（`THINKING_*`→`REASONING_*`、`binary`パート→メディアパート、`null`→フィールド省略）。翻訳のたびに警告を出す
- middlewareは、取り除かれる前の素材を見られる
- アプリコードは、enforcementで取り除かれるはずの素材を見てはいけない
- chunkの展開は検証より前に行う。不正なchunkは、どの段階で見つかっても修復せず拒否する
- SSEでもProtobufでも同じ判定にする

独自データを載せたいなら、各イベント・メッセージの`metadata`（キー自由、取り除かれない）か、入力の`forwardedProps`を使う。イベントに独自のプロパティを生やしても、アプリには届かない。

## null を送らない

1.0から、省略可能なフィールドは`null`を入れず、フィールドごと省略する。値としての`null`（state内、metadataのキーの値、JSON Patchで`add`する値）は保持される。

## バージョンネゴシエーション

- consumerは`RunAgentInput.protocolVersion`、producerは`RUN_STARTED.protocolVersion`で、それぞれ自分のバージョンを自己申告する（`MAJOR.MINOR`）。フィールドが無ければ、バージョン導入前の相手とみなす
- 実装しているメジャー系列の新しいマイナーバージョンが来ても、拒否せず処理する（追加は安全という前提）。警告を出すのがSHOULD
- 古い相手向けに情報を落とすダウングレードをする場合は、警告を出す（MUST）。ダウングレードは形を変えるだけで、値を捏造しない。プレースホルダも入れない

## Capabilities

`AgentCapabilities`はあくまで参考情報で、真実はストリームのほう。宣言が無いことを「非対応」と読んではいけないし、宣言外のイベントが来ても拒否しない。取得方法はプロトコルでは定めていない（TSでは`agent.getCapabilities?()`）。

## バージョンについて

本ノートの内容はAG-UI 1.0（2026年9月30日リリース）を前提にしている。0.x ではこれらの振る舞いがTSクライアントの実装の中にしか無く、1.0で仕様として明文化された。

## 出典

- [ag-ui-protocol/ag-ui (GitHub)](https://github.com/ag-ui-protocol/ag-ui) — `docs/spec/1.0/basic/processing.mdx`、`docs/spec/1.0/basic/versioning.mdx`、`docs/spec/1.0/basic/capabilities.mdx`、`spec/README.md`、`docs/migrating-to-1-0.mdx`

#ag-ui #protocol #compatibility
