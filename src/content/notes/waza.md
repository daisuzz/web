---
created: "2026-09-28"
---
# waza

Microsoftが開発している、AIエージェントの「スキル」を評価するためのGo製CLI／フレームワーク。READMEの説明は "CLI / Framework for Agent Skills - create, test, measure and improve skill quality and effectiveness"。要するにエージェントスキル向けのテスト・ベンチマーク基盤。MITライセンス。

#ai #ai-agent #agent-skills #llm #evaluation #go #cli

## 評価対象

- `SKILL.md` 形式のAgent Skills（agentskills.io の仕様に準拠したもの）
- `.agent.md` 形式のカスタムエージェント

`microsoft/skills` リポジトリのCIに組み込んで、スキル作者がコントリビュート前に検証できるようにする想定で作られている。

## 基本的な流れ

```bash
waza init my-project                  # プロジェクト初期化
waza new skill my-skill               # SKILL.md の雛形を作る
waza suggest skills/my-skill --apply  # SKILL.mdのトリガー/非トリガー記述から eval/task を自動生成
waza run eval.yaml --trials 3         # 評価実行（同じタスクを複数回回してflakinessを見る）
waza compare a.json b.json            # 結果比較（モデル間など）
waza check skills/my-skill            # 仕様準拠・トークン予算などのチェック
waza serve                            # 結果閲覧用ダッシュボード
```

## eval.yaml

評価の定義は `eval.yaml` に書く。モデル、タスク（プロンプト・fixtureファイル・期待値）、採点器を指定する。

```yaml
name: code-explainer
description: "Tests the agent's ability to explain code"
skill: code-explainer
model: claude-sonnet-4.6
tasks:
  - "tasks/*.yaml"
```

`skill: xxx` を書くと、対象の `SKILL.md` の本文が実行時にエージェントのシステムメッセージへ自動注入される（`config.inject_skill_body: false` で無効化できる）。

プロジェクト全体の設定は `.waza.yaml`。evalファイル名やtaskのglob、`SKILL.md` のトークン上限（例: `tokens.limits: { SKILL.md: 500 }`）、結果の保存先（Azure Blob Storage）などを書く。

## 採点器（grader）

| grader | 内容 |
|---|---|
| `text` | 部分文字列・パターンマッチ |
| `code` | Python/JavaScriptのアサーション |
| `file` | 生成ファイルの存在・内容 |
| `diff` | ワークスペースのファイルとスナップショットの差分 |
| `behavior` | ツール呼び出し数・トークン数・所要時間などの振る舞い制約 |
| `action_sequence` | ツール呼び出しの順序（F1スコア） |
| `skill_invocation` | スキルが呼ばれた順序 |
| `prompt` | ルーブリックを使うLLM-as-judge |
| `trigger_tests` | スキルが発火すべきプロンプトで正しく発火するかの精度 |

採点器は `ref: github.com/org/repo#export@version` の形でリモート参照でき、`waza get` でlockファイルを作ってから使う。

## 実行エンジン

- **copilot-sdk**（デフォルト）: GitHub Copilot SDKでエージェントを動かす。`GITHUB_TOKEN` が必要。`COPILOT_BASE_URL` などを設定するとCopilotの認証チェックを飛ばして別プロバイダの設定をSDKに渡す
- **mock**: 実際には実行しない。認証なしでCI上の配線確認ができる

## waza check

`SKILL.md` を5つの観点で検査する。

1. Compliance Score: frontmatterの準拠度（Low〜High）
2. Token Budget: `SKILL.md` のトークン数が上限内か
3. Evaluation Suite: `eval.yaml` があるか
4. Spec Compliance: agentskills.io仕様への適合（必須フィールド、命名規則、ディレクトリ名との一致、descriptionの長さ、ライセンス、バージョンなど）
5. Advisory Checks: 参照モジュール数、複雑さ、過度な特殊化など品質・保守性の注意点

## トークン管理

スキルはコンテキストに載るので、トークン量の管理用コマンドがまとまっている。

```bash
waza tokens count skills/ --format json --sort tokens  # トークン数集計
waza tokens profile my-skill                           # セクション数・コードブロック数などの構造分析
waza tokens compare main --skills --threshold 10       # mainと比べて10%以上増えたら失敗
waza tokens suggest skills/ --copilot --model gpt-4o   # 削減案の提示
```

## その他の機能

- **敵対的テスト**: `waza adversarial --skill ./skills/code-review --packs prompt-injection`。組み込みパックは `prompt-injection`（間接プロンプトインジェクション耐性）と `scope-bypass`（対象範囲外の依頼を断れるか）
- **スナップショットとリプレイ**: `waza run --snapshot` で実行を保存し、`waza replay` で再生。`waza replay a.json --bisect b.json` で2つの実行が分かれた地点を探せる
- **ダッシュボード**: `waza serve` で実行履歴・合格率・モデル比較・トレンド・実行中のライブ表示を見られる
- **CI連携**: GitHub Actionsのワークフロー例あり。終了コードは 0=全成功 / 1=テスト失敗 / 2=設定エラー。`--format github-comment` でPRコメント用の出力ができる
- **結果の保存**: `.waza.yaml` で設定すると結果をAzure Blob Storageに自動アップロードする（`DefaultAzureCredential` で認証）

## 導入方法

```bash
# macOS / Linux / Git Bash など
curl -fsSL https://raw.githubusercontent.com/microsoft/waza/main/install.sh | bash

# Azure Developer CLIの拡張として
azd ext source add -n waza -t url -l https://raw.githubusercontent.com/microsoft/waza/main/registry.json
azd ext install microsoft.azd.waza
```

ほかにPowerShell用スクリプト、ソースからのビルド（Go 1.26以上とGit LFSが必要）、Dockerでも使える。

## バージョンについて

本ノートの内容はwaza v0.38.7（2026-08-19リリース）時点のREADME・ドキュメントを前提にしている。2〜3週間おきにリリースされていて更新が速い。

## 出典

- [GitHub - microsoft/waza](https://github.com/microsoft/waza)
- [waza/docs/GUIDE.md](https://github.com/microsoft/waza/blob/main/docs/GUIDE.md)
- [waza/docs/SKILLS_CI_INTEGRATION.md](https://github.com/microsoft/waza/blob/main/docs/SKILLS_CI_INTEGRATION.md)
- [Releases · microsoft/waza](https://github.com/microsoft/waza/releases)
- [waza ドキュメントサイト](https://microsoft.github.io/waza/)
