---
created: "2026-08-29"
---
# Configuration Cache (Gradle)

Configurationフェーズ（[[gradle-basics]]参照）の結果そのものをキャッシュし、変更がなければ次回以降のビルドでConfigurationフェーズを丸ごとスキップしてExecutionフェーズに進む機能。

## バージョンの位置づけ

| バージョン | 状態 |
|---|---|
| Gradle 6.6（2020年） | 実験的機能として導入。デフォルト無効・本番非推奨 |
| Gradle 7.0〜8.0 | incubating（試験提供）。オプトインで有効化可能 |
| **Gradle 8.1**（2023年4月） | **stable化**。以降は他のGradle機能と同じ後方互換性保証の対象 |
| Gradle 9.0（2025年） | まだデフォルト無効。互換性のない機能が検出されなければCLIが有効化を推奨表示するようになった。`gradle init`で作る新規プロジェクトはデフォルトで有効 |
| Gradle 10（予定） | デフォルト有効化が目標 |

## 仕組み

初回ビルド時にConfigurationフェーズを実行してタスクグラフ（DAG）を構築した後、そのタスクグラフのバイナリスナップショットを`.gradle/configuration-cache`にシリアライズして保存する。次回以降のビルドで、キャッシュキーに関わる入力（build scriptの内容、`gradle.properties`、コマンドライン引数、環境変数など）が前回と変わっていなければ、Configurationフェーズをスキップしてキャッシュからタスクグラフを復元し、Executionフェーズに直接進む。

キャッシュミス時も、書き込んだキャッシュをそのまま読み込んでから実行する実装になっており、ヒット時とミス時で実行経路が分岐しないようになっている。

### 他のキャッシュ層との違い

Gradleには複数の異なるキャッシュ層があり、それぞれ対象と保存場所が異なる。

- **Configuration Cache**（このノート）: Configurationフェーズの結果（タスクグラフ）そのものをプロセスをまたいでディスクにキャッシュする
- **Incremental build（up-to-date判定）**: [[gradle-basics]]が扱う、タスクの入出力ファイルの変化を検知してタスクの実行自体をスキップする仕組み。Configurationフェーズは毎回実行される点がConfiguration Cacheと異なる
- **[[gradle-daemon]]のインメモリキャッシュ**: プロセスを常駐させることで[[jvm-class-loading]]や[[jit-compilation]]のコストを持ち越す。Configuration Cacheはディスクに永続化される点、デーモンを介さないビルド呼び出しでも効く点が異なる

## 有効化方法

```properties
# gradle.properties
org.gradle.configuration-cache=true
```

コマンドラインで都度指定する場合:

```bash
./gradlew build --configuration-cache
./gradlew build --no-configuration-cache   # gradle.propertiesで有効でも一時的に無効化
```

## ビルドロジック側の制約

タスクグラフをシリアライズする都合上、以下が要求される。

- `Project`・`Gradle`・`Settings`・`ClassLoader`・`Thread`などはシリアライズ不可。タスクの実行時（execution time）にこれらのオブジェクトを参照してはいけない
- タスクアクション内で`project.version`のようなプロジェクトのプロパティ・extension・extra propertiesに直接アクセスすると、暗黙的に`Project`オブジェクトを捕捉してしまいNG。必要な値は事前にタスクの入力プロパティとして明示的にモデル化する必要がある
- 設定時に登録して実行時にトリガーされる`BuildListener`・`TaskExecutionListener`のようなビルドリスナーは使用不可。代わりにBuild Servicesを使ってタスク間の状態共有や実行イベントの監視を行う

これらの制約に違反しているプラグインは互換性がない。Gradle 9では、互換性がない場合にビルドモードを自動的にグレースフルにダウングレードする機能が入った。

## 出典

- [Configuration Cache | Gradle User Manual](https://docs.gradle.org/current/userguide/configuration_cache.html)
- [Enabling and Configuring the Configuration Cache | Gradle User Manual](https://docs.gradle.org/current/userguide/configuration_cache_enabling.html)
- [Configuration Cache Requirements for your Build Logic | Gradle User Manual](https://docs.gradle.org/current/userguide/configuration_cache_requirements.html)
- [What's new in Gradle 9.0.0 | Gradle](https://gradle.org/whats-new/gradle-9/)
- [State of the Configuration Cache - On the Road to Gradle 9 | Gradle Blog](https://blog.gradle.org/road-to-configuration-cache)
- [Introducing Configuration Caching | Gradle Blog](https://blog.gradle.org/introducing-configuration-caching)

#gradle #ビルド
