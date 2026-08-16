---
created: "2026-08-16"
---
# ループエンジニアリング

AIコーディングエージェントに対して、人間が毎回プロンプトを打つのをやめ、**エージェントに自動でプロンプトを打ち続けるシステム（ループ）を設計する**という考え方・設計手法。Google ChromeチームのAddy Osmaniが広めた言葉で、Peter Steinbergerの「エージェントにプロンプトを打つループ自体を設計すべき」という発言や、Claude Codeのリード開発者Boris Chernyの「自分の仕事はもはやモデルに直接プロンプトを打つことではなく、ループを書くことだ」という発言に端を発する。

## 技術トレンドの進化としての位置づけ

以下の順で語られることが多い:

1. **プロンプトエンジニアリング** — どう指示するか
2. **コンテキストエンジニアリング** — モデルに何を読ませるか
3. **ハーネスエンジニアリング** — AIが働ける環境全体をどう整えるか
4. **ループエンジニアリング** — 指示を出す行為そのものを自動化する

「自分がエージェントにプロンプトを打つ人」であることをやめ、「エージェントに自動でプロンプトを打ち続けるシステムを設計する人」になる、というパラダイムシフトとして説明される。

## ループが繰り返す基本サイクル

典型的なループは以下を自律的に繰り返す:

1. **状態を観測する**（コードベース、タスクリスト、ビジネスデータなどの現状を読む）
2. **次の行動を決める**（モデル自身が状態に基づいて判断する）
3. **実行する**（ファイル編集・コマンド実行・データ更新などツールを使う）
4. **検証する**（テスト実行や結果確認で正しさを確かめる）

## インフラとして必要になる6要素

チームがループエンジニアリングを実践する上で整備すべき基盤として、Automations（自動化）、Worktrees（作業ツリーの分離）、Skills（再利用可能な手順）、Connectors/MCP（外部システム連携）、Sub-agents（サブエージェント）、Memory（記憶）の6つが挙げられている。

## Claude Codeでの実践: [[claude-code-loop]]

Claude Codeにおいてループエンジニアリングを最も手軽に実践できる機能が`/loop`スキル。「CIがpassするまでPRを監視して直し続ける」のような具体例は[[claude-code-loop]]を参照。`/loop`はローカルマシン上で動く軽量なループで、より恒久的・クラウド常駐のループにしたい場合は`/schedule`でRoutine（トリガー）化して発展させる、という使い分けが語られている。

## 出典

- [Loop engineering: Getting started with loops | Claude by Anthropic](https://claude.com/blog/getting-started-with-loops)
- [Practical Loop Engineering - by Addy Osmani - Elevate](https://addyo.substack.com/p/practical-loop-engineering)
- [Loop Engineering - by Addy Osmani - Elevate](https://addyo.substack.com/p/loop-engineering)
- [AddyOsmani.com - Loop Engineering](https://addyosmani.com/blog/loop-engineering/)
- [入門から実践 -「🔁 ループエンジニアリング」 `#ClaudeCode` - Qiita](https://qiita.com/Syoitu/items/97ed37e7ba9c38dc75d8)

#loop-engineering #ai #agent #claude-code
