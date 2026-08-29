---
created: "2026-08-16"
updated: "2026-08-29"
---
# Claude Codeの/loop

`/loop` は Claude Code のビルトインskillで、プロンプトやスラッシュコマンドを**定期的に繰り返し実行**させる機能。デプロイ監視・PRのCI確認・ビルド完了待ちのような「ポーリングが必要な作業」を自動化するために使う。[[loop-engineering]]という設計思想を、Claude Code上で最も手軽に実践できる入り口になっている。

## 使い方

| 入力例 | 動作 |
|---|---|
| `/loop` | ビルトインの定期メンテナンスを動的間隔で実行 |
| `/loop 5m デプロイ確認して` | 指定タスクを5分おきの固定間隔で実行 |
| `/loop デプロイ確認して` | 指定タスクをClaudeが判断する動的間隔で実行 |
| `/loop 15m` | ビルトイン定期メンテナンスを15分おき実行 |

間隔は `30s` / `5m` / `1h` / `3d` のような書式で指定する（秒指定は分単位に丸められる）。

## 固定間隔 vs 動的間隔

- **固定間隔**: cronのように指定した時間ごとに機械的に実行する
- **動的間隔**: Claude自身が状況に応じて次にいつ起きるか判断する（作業中は短く、静かなときは最大1時間程度まで延ばす）。効率的だが実行タイミングは予測しづらい

## 内部の仕組み

- 裏側では `CronCreate`/`CronList`/`CronDelete` ツールでスケジューラに定期実行を登録している
- スケジューラは低優先度キューで発火させ、Claudeが別のターンを処理中ならそのターン終了後に実行される
- 動的間隔モードでは、Claude自身が `ScheduleWakeup` ツールを呼び、次回起床時刻（または停止）を都度決める

## 典型的なユースケース: PR監視

Anthropic公式ブログが挙げている例:

```
/loop 5m check my PR, address review comments, and fix failing CI
```

コーディング・テスト・PR作成までを1回のタスクとしてエージェントにやらせたあと、`/loop`で「CIの状態を見て、落ちていれば原因を調べて直してpushする」というプロンプトを一定間隔（または動的間隔）で回し続ける。CIがgreenになった時点でClaudeが自己判断して停止するか、`Esc`で手動停止するまでループが続く。「一回プロンプトを打って終わり」ではなく「グリーンになるまで自動で監視・修正し続けるシステムを設計する」という点で、ループエンジニアリング的な使い方の代表例になっている。

デプロイ進行状況の監視、ビルド完了待ちなども同様のパターンで使える。

## 終了方法

- 待機中に `Esc` で停止（固定間隔ループ向け）
- 動的間隔時は、Claudeが「もう不要」と判断すれば自動的に `stop: true` で終了する
- 「〇〇のジョブをキャンセルして」と明示的に指示する、または`/loop`のタスク一覧からIDを指定して削除する

## 注意点・制限事項

- **セッションスコープ**: セッション終了でタスクは消える（`--resume`で7日以内なら復帰可）
- **7日で自動失効**: それ以降は最後に1回実行されて削除される。長期の継続監視にはRoutines（`/schedule`によるトリガー化）やDesktopのスケジュールタスクの方が向く
- `/loop`はローカルマシン上で動くため、端末を閉じればループも止まる（バックグラウンドセッション化していれば継続可）
- 1セッションあたり最大50タスクまで
- `disable-model-invocation: true` のskillやビルトインコマンド（`/permissions`等）はループ対象にできない
- タイムゾーンはUTCではなくローカル時刻を使う

## ポーリングとイベント駆動の違い

`/loop`は一定間隔でのポーリング型の監視。これに対し、GitHub App連携済みのClaude Code環境（Claude Code on the webなど）では、CI失敗やレビューコメントといったWebhookイベントが来たときだけセッションを起こす**イベント駆動型**の監視の仕組みも用意されている場合がある（この点は一般公開ドキュメントで裏取りしたわけではなく、セッション内で観察した挙動に基づく記述）。変化がある時だけ動く分イベント駆動の方が無駄が少ないが、Webhook連携がない環境では`/loop`によるポーリングが素直な代替手段になる。

## バージョンについて

本ノートの内容はClaude Code v2.1.251（2026年8月28日時点）を前提にしている。Claude Codeはほぼ毎日ペースでパッチリリースされるため、細部の挙動は`claude --version`や公式changelogで確認するのが確実。

## 出典

- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Claude Code: Run prompts on a schedule](https://code.claude.com/docs/en/scheduled-tasks.md)
- [Loop engineering: Getting started with loops | Claude by Anthropic](https://claude.com/blog/getting-started-with-loops)

#claude-code #ai #agent #automation
