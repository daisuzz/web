---
created: "2026-08-20"
---
# Claude Codeのhooks

Claude Codeのライフサイクル上の特定タイミングでユーザー定義のコマンドを自動実行する仕組み。「LLMが気を利かせてやってくれる」ことに頼らず、フォーマット・ブロック・通知・監査ログなどを**必ず**実行させる決定論的な制御を目的とする。設定は`hooks`ブロックとしてsettings系のJSONファイルに書く。

## 基本構造

```json
{
  "hooks": {
    "<イベント名>": [
      {
        "matcher": "<ツール名やサブタイプでの絞り込み>",
        "hooks": [
          { "type": "command", "command": "..." }
        ]
      }
    ]
  }
}
```

- `matcher`は`"*"`/`""`/省略で全マッチ、英数字と`|`区切りは完全一致リスト（例: `Edit|Write`）、それ以外の文字を含むと素のJavaScript正規表現として評価される
- イベントによって`matcher`が指す対象は変わる（ツール系イベントならツール名、`SessionStart`なら`startup`/`resume`/`clear`/`compact`/`fork`、`Notification`なら`permission_prompt`/`idle_prompt`など）
- hookの実体（`type`）は`command`（シェルコマンド）以外に`http`（外部エンドポイントにPOST）、`mcp_tool`（MCPツール呼び出し）、`prompt`/`agent`（LLM自身に判定させる）がある

## 入出力

**入力**: stdin経由のJSON。`session_id`/`cwd`/`hook_event_name`のような共通フィールドに加え、`PreToolUse`なら`tool_name`/`tool_input`のようにイベント固有のフィールドが渡る。

**制御**: exit codeとJSON出力の組み合わせで挙動が決まる。

| exit code | 意味 |
|---|---|
| `0` | 成功。stdoutが`{`で始まればJSONとしてパースされ、その内容（`decision`や`hookSpecificOutput.permissionDecision`等）が反映される |
| `2` | ブロック（イベントによって「ツール実行を止める」「応答の停止を止める」「設定変更を止める」など意味が変わる）。ブロック理由はJSONの`reason`かstderrのテキスト |
| それ以外 | 多くのイベントでは非ブロック扱い。ただし`WorktreeCreate`は0以外なら常に失敗扱いになるなど例外もある |

JSON出力の主なフィールド: `continue`（false で全処理停止）、`decision`（`allow`/`deny`/`escalate`）、`reason`、`additionalContext`（Claudeの文脈に追加）、`updatedInput`（`PreToolUse`限定でツール入力そのものを書き換え）、`hookSpecificOutput.permissionDecision`。

## 主なイベント（一部)

ツール呼び出し系（ブロック可能）: `PreToolUse`→`PermissionRequest`→`PostToolUse`/`PostToolUseFailure`。
ターン系: `UserPromptSubmit`、`Stop`（応答完了、ブロックすると停止を止められる）、`SubagentStop`。
セッション系: `SessionStart`（`compact`サブタイプは圧縮直後の文脈再注入に使える）、`SessionEnd`。
ファイル/環境系: `FileChanged`（監視対象ファイルの変更検知）、`CwdChanged`（作業ディレクトリ変更）、`ConfigChange`（settings/skillsファイルの変更を監査・ブロック）。
その他: `Notification`（Claudeが入力待ちになったときの通知）、`PreCompact`/`PostCompact`。
全イベントは`/hooks`コマンド（読み取り専用ブラウザ）で一覧・設定元ファイル・実コマンドまで確認できる。

## 設定できる場所

| 場所 | スコープ | 共有 |
|---|---|---|
| `~/.claude/settings.json` | ユーザー全体 | 不可 |
| `.claude/settings.json` | プロジェクト | 可（git管理） |
| `.claude/settings.local.json` | プロジェクト個人用 | 不可（gitignore対象） |
| Managed policy settings | 組織全体 | 管理者のみ |
| Skill/Subagentのfrontmatter | セッション中のそのスキル/サブエージェント実行中のみ | 可 |

プロジェクト側のsubagentのfrontmatter hookは、そのagentファイルが置かれたフォルダのworkspace trustダイアログを承諾するまで実行されない。

## 活用例

**通知**: `Notification`イベント（matcher省略で全種）で`osascript`/`notify-send`等を叩き、入力待ちになったらデスクトップ通知を出す。

**編集後の自動フォーマット**:
```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }]
    }]
  }
}
```

**保護ファイルへの編集をブロック**: `PreToolUse`+`Edit|Write`で、`.env`や`.git/`配下へのパスなら`exit 2`するスクリプトを噛ませる。Claudeにはstderrのメッセージがフィードバックされ、別のアプローチを取らせられる。

**圧縮後の文脈再注入**: `SessionStart`を`compact`にマッチさせ、`echo`やコマンドの出力をstdoutに流すと、コンテキスト圧縮で失われがちなプロジェクト固有の注意点を都度差し込める。

**設定変更の監査ログ**: `ConfigChange`でsettings/skillsファイルの変更を検知し、タイムスタンプ付きでログファイルに追記。`matcher`で`user_settings`/`project_settings`/`policy_settings`等に絞れる。

**direnv連携**: `SessionStart`と`CwdChanged`の両方で`direnv export bash > "$CLAUDE_ENV_FILE"`を実行し、ディレクトリ移動のたびに環境変数を再読み込みする（Claude CodeのBashツールは素の`direnv`のシェルフック機構を自動では拾わないため）。

## [[claude-code-loop]]・[[claude-code-observability]]との関係

いずれも「Claude Codeの動作をコード側から確実に制御・観測する」ための仕組みという点で近い領域にあるが役割が異なる。hooksはライフサイクルの特定タイミングに割り込んで**制御**（ブロック・変更・自動実行）するもの、`/loop`は同じプロンプトを**繰り返し発火**させる仕組み、observabilityはセッション横断で**利用状況を可視化**する仕組み。

## 出典

- [Claude Code: Hooks reference](https://code.claude.com/docs/en/hooks.md)
- [Claude Code: Automate actions with hooks (Getting started guide)](https://code.claude.com/docs/en/hooks-guide.md)

#claude-code #ai #agent #automation
