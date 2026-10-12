---
created: "2026-10-12T10:30:00+09:00"
---
# Gradle

Gradleまわりのノートを束ねるハブノート。Java生態系のビルドツールとしてはMavenと並ぶ選択肢で、Javaのハブノートから辿れる。

## 基礎

- [[gradle-basics]] — Project/Taskのモデルと、Initialization→Configuration→Executionの3フェーズ。以下のノートはすべてこの上に乗る。

## 高速化

- [[gradle-daemon]] — ビルド後もプロセスを残して再利用する長寿命デーモン。JVMのクラスロードとJITのウォームアップのコストを次回ビルドに持ち越せるのが効く。
- [[configuration-cache]] — Configurationフェーズの結果自体をキャッシュし、変更がなければフェーズを丸ごとスキップする。

## ビルドの構成・共通化

- [[composite-builds]] — `includeBuild()`で独立したビルドを丸ごと含める。設定は共有せず隔離されたまま、依存関係を置換できる。
- [[convention-plugins]] — 複数プロジェクトに共通する設定を1つのプラグインにまとめる。置き場所はbuildSrcかincluded build（[[composite-builds]]）。

#gradle #ビルド #moc
