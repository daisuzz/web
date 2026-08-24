---
created: "2026-08-24"
updated: "2026-08-24"
---
# Convention Plugins (Gradle)

複数プロジェクトに共通するプラグイン適用・設定・デフォルト値をひとまとめにした、再利用可能なビルドロジック。大きい・マルチプロジェクトのビルドで、各サブプロジェクトの`build.gradle.kts`（Configurationフェーズで評価される。詳細は[[gradle-basics]]）に同じ`plugins {}`ブロックや設定を毎回コピペする代わりに、1つの独自プラグインとして書いて`apply`する。

## Precompiled script plugin

書き方として一般的なのは precompiled script plugin という形式。プラグイン用プロジェクトの`src/main/kotlin/`（Groovyなら`src/main/groovy/`）に置いた`.gradle.kts`（`.gradle`）ファイルがそのままプラグインになり、**ファイル名がプラグインIDになる**（例: `myproject.java-conventions.gradle.kts` → プラグインID `myproject.java-conventions`）。これを認識させるには、そのプロジェクト自身に`kotlin-dsl`プラグイン（Groovyなら`groovy-gradle-plugin`）を適用しておく必要がある。

## 置き場所: buildSrc か included build か

置き場所は`buildSrc/`か、[[composite-builds]]の`includeBuild()`で含めるビルド（慣習的に`build-logic/`と呼ばれる）の2択。

| | `buildSrc/` | included build（`build-logic/`など） |
|---|---|---|
| セットアップ | 特別な設定不要、自動的にクラスパスに乗る | `includeBuild()`が必要、やや手間 |
| ビルドキャッシュ | 中身をどこか1行変えるだけでルートビルド全体のキャッシュが無効化される | 別ビルドとして隔離されているため影響しない |
| プラグインの可視性 | `implementation`スコープで書いても他プロジェクトに露出してしまう | スコープ通りに隠蔽され、意図しない露出がない |

このキャッシュ無効化とスコープ漏れの2点が実務上効いてくるため、公式には「セットアップの手間はわずかに増えるが、composite buildを使う方を推奨する」とされている。`buildSrc`自体、実装上はGradleが自動的に管理する暗黙のincluded buildで、根底の仕組みは`includeBuild()`と同じ（詳細は[[composite-builds]]）。

## 出典

- [Convention Plugins | Gradle User Manual](https://docs.gradle.org/current/userguide/implementing_gradle_plugins_convention.html)
- [Sharing Build Logic using buildSrc | Gradle User Manual](https://docs.gradle.org/current/userguide/sharing_build_logic_between_subprojects.html)
- [Sharing build logic between subprojects Sample | Gradle](https://docs.gradle.org/current/samples/sample_convention_plugins.html)
- [buildSrc vs build-logic | Gradle Forums](https://discuss.gradle.org/t/buildsrc-vs-build-logic/46708)
- [How to use Composite builds as a replacement of buildSrc in Gradle | Bumble Tech](https://medium.com/bumble-tech/how-to-use-composite-builds-as-a-replacement-of-buildsrc-in-gradle-64ff99344b58)

#gradle #ビルド #kotlin
