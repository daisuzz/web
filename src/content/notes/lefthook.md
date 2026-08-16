---
created: "2026-08-16"
---
# Lefthook

[Evil Martians](https://evilmartians.com/)が開発しているGit hooksマネージャー。Go言語製で、Node.js/Ruby/Pythonなど言語を問わず使える単一バイナリのツール。設定は`lefthook.yml`というYAMLファイル1本にまとめる。

## 作られた背景・解決しようとした課題

### 1. 言語エコシステムごとにツールが分断されていた

Git hooksマネージャーは元々エコシステムごとに別々のものが使われてきた。

- JavaScript界隈 → **Husky**
- Ruby/Rails界隈 → **Overcommit**
- Python界隈 → **pre-commit**

これらは単体では優秀だが、フロントエンドとバックエンドが混在するチームでは、Ruby用とJS用で2系統のhooks設定を並行管理する羽目になっていた。しかもHusky自体がNode.js/npmランタイムに、OvercommitがRubyランタイムに依存しているため、そのツールを使う言語が入っていない環境では動かないという制約もあった。

### 2. 設定がファイルにまたがって散らばっていた

典型的なHusky構成では、Husky本体・lint-staged・それらを繋ぐシェルスクリプトの3パッケージ構成になり、フックのロジックは`.husky/`配下のシェルスクリプトに、対象ファイルのルールは`package.json`や`.lintstagedrc`に、という具合に設定が複数ファイル・複数ツールに分散する。結果として「コミット時に実際何が実行されるのか」を把握するのに複数ファイルを見比べる必要があった。

### 3. 逐次実行によるパフォーマンス問題

lint-staged含む従来ツールの多くはチェックを順番に1つずつ実行する設計で、マルチコアCPUを積んでいても他のコアは遊んでいる状態になる。フックが遅いと開発者が「うざいから切る」となり、そもそもの目的（コミット前の品質担保）が形骸化しがちという問題もあった。

## Lefthookが出した解決策

- **単一のYAMLファイル**（`lefthook.yml`）だけで完結させ、シェルスクリプトや複数設定ファイルへの分散をなくす
- Go製の**依存関係なしの単一バイナリ**にすることで、Node.jsやRubyといった特定言語ランタイムへの依存をなくし、どんな言語構成のプロジェクトでも同じツールで統一できるようにする
- **並列実行**をサポートし、複数のリンター/フォーマッターを同時に走らせて実行時間を短縮する

「言語ごとにバラバラだったフックツールを、言語非依存・単一設定・高速並列実行という一本の解に統合する」ために作られたツール、というのが実態。

## 主な特徴

- 高速・並列実行（Go言語製）
- 依存不要の単一バイナリ、どんな環境でも動く
- ステージされたファイルのみ/全ファイルなど、柔軟なファイル対象指定（globパターン・正規表現でのフィルタリング）
- サブディレクトリでの実行、タグでのコマンドグループ制御（モノレポなどでの部分実行がしやすい）
- `lefthook-local.yml`によるチーム設定の個人向けオーバーライド
- Docker対応

## 設定例（`lefthook.yml`）

```yaml
pre-commit:
  jobs:
    - name: lint
      glob: "*.rb"
      run: bundle exec rubocop -- {all_files}
```

`.git/hooks/`配下に薄いスクリプトを仕込み、Git側のフック発火時にlefthookが`lefthook.yml`の定義を読んで実行する仕組み。

## インストール方法

Go / npm / Ruby gem / Python(pipx) / Homebrew / apt / winget など多数の手段に対応。

## Husky・Overcommit・pre-commitとの違い

| | 対象言語 | 実行方式 | 依存 |
|---|---|---|---|
| Husky | JS/Node中心 | lint-stagedと組み合わせて逐次実行 | Node.js/npm |
| Overcommit | Ruby中心 | 逐次実行 | Ruby |
| pre-commit | Python中心だが言語横断のフック共有に強み | 逐次実行 | Python |
| Lefthook | 言語非依存 | 並列実行 | なし（単一バイナリ） |

pre-commitは複数リポジトリ間でフック定義を共有する用途に強く、Lefthookはローカルでの実行速度とリポジトリ単位での構造化された実行に強い、という使い分けが語られている。

## 出典

- [GitHub - evilmartians/lefthook](https://github.com/evilmartians/lefthook)
- [lefthook/docs/configuration.md](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md)
- [lefthook/docs/install.md](https://github.com/evilmartians/lefthook/blob/master/docs/install.md)
- [Lefthook at Evil Martians](https://evilmartians.com/opensource/lefthook)
- [Ditch Husky: Speed Up Git Hooks with Lefthook](https://recca0120.github.io/en/2026/03/08/lefthook-git-hooks/)
- [Lefthook: knock your team's code back into shape — Evil Martians](https://evilmartians.com/chronicles/lefthook-knock-your-teams-code-back-into-shape)
- [Pre-commit vs Lefthook vs Husky: Best Git Hooks Manager 2026](https://www.pistack.xyz/posts/2026-04-26-pre-commit-vs-lefthook-vs-husky-git-hooks-management-guide-2026/)

#lefthook #git #cli #ツール
