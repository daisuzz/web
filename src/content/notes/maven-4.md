---
created: "2026-09-22"
---
# Maven 4

[[maven]]の次期メジャーバージョン。POMスキーマ（モデルバージョン4.0.0）を20年以上ほぼ凍結したまま進化させてきた反省から、後方互換性を保ちつつビルドの仕組み自体を刷新することを目的にしている。

## Build POMとConsumer POM

Maven 3までは1つの`pom.xml`が「ビルドに必要な情報」と「依存先（consumer）に必要な情報」を両方兼ねていた。Maven 4はこれを分離する。

- **Build POM**: リポジトリにコミットする従来通りのPOM。プラグイン設定・プロパティなどビルドに必要な全情報を持つ
- **Consumer POM**: ビルド時にMavenが自動生成し、リモートリポジトリにはこちらをデプロイする。親POM参照を解決済みの値に展開（flatten）し、BOMのimportも展開、実際に使われているtransitive依存関係・managed依存関係だけを残した「軽量版」

| 内容 | Build POM | Consumer POM |
|---|---|---|
| モデルバージョン | 4.1.0 | 4.0.0 |
| サードパーティ依存関係情報 | ○ | ○ |
| プロパティ | ○ | × |
| プラグイン設定 | ○ | × |
| リポジトリ情報 | ○ | ○ |
| デプロイ設定 | ○ | ○ |

Consumer POM生成（flatten）自体はデフォルト無効で、`maven.consumer.pom.flatten`をtrueにすると有効化される。

## モデルバージョン4.1.0

新しい名前空間`http://maven.apache.org/POM/4.1.0`を使うPOMモデル。新要素の追加・一部要素の非推奨化が行われるが、Build POM側でのみ使え、Consumer POMは引き続き4.0.0で生成される。既存の4.0.0形式のPOMはそのままビルドでき、4.1.0への移行は任意。

### modules→subprojects

Java 9のJava Platform Module Systemの「module」との用語衝突を避けるため、`<modules>`（非推奨だが使用可能）に代わり`<subprojects>`要素が導入された。「マルチモジュールプロジェクト」ではなく「マルチプロジェクト構成」という呼び方が推奨されている。

### 自動バージョニング（親推論）

モデル4.1.0では`<parent><relativePath>..</relativePath></parent>`や、さらに省略した`<parent/>`だけで親の`groupId`/`artifactId`/`version`を自動推論できるようになった（2005年からの積年の要望、MNG-624）。サブプロジェクト間の依存関係でも同様にバージョン省略が可能。`packaging`が`pom`で`<subprojects>`/`<modules>`が未指定なら、直下に`pom.xml`を持つサブディレクトリを自動検出する機能も追加された。

### 新しいartifact type

依存関係の`<type>`に、クラスパス/モジュールパスへの配置を明示的に制御する`classpath-jar`/`modular-jar`/`classpath-processor`（annotation processor用）/`modular-processor`が追加された。デフォルトの`jar`/`processor`はヒューリスティックに配置先を決めるが、新しい型は開発者が明示的に制御できる。2025年10月時点ではmaven-compiler-plugin（4.0.0-beta-3以降）のみ対応。

### `bom`パッケージング型

親POMと「依存関係バージョン一覧だけを持つBOM」を区別するための専用パッケージング型。`<classifier>`付きBOMのimportにも対応した。同一reactor内のBOMをimportすると警告が出る（将来的にエラー化予定）。

### `<sources>`要素

従来の`<sourceDirectory>`/`<testSourceDirectory>`に代わり、`<source><scope>main/test</scope><directory>...</directory></source>`を複数書けるようになった。Build Helper Pluginなしで複数ソースディレクトリ・include/exclude・マルチリリースJava・Javaモジュールのソース階層に対応する。

### rootDirectoryと公式プロパティ

`.mvn`ディレクトリの存在、または`<project root="true">`属性（model 4.1.0）でプロジェクトルートを明示できるようになった。`${project.rootDirectory}`（POM定義基準、`.mvn`か`root`属性がなければ値を持たない）、`${session.topDirectory}`（実行時のカレントディレクトリ、常に値を持つ）、`${session.rootDirectory}`の3つが公式プロパティとして提供され、これまで使われていた非公式の内部プロパティは廃止・非推奨になった。

## 依存関係管理の変更

- **CI-friendly変数の完全サポート**: `${revision}`のような変数を`flatten-maven-plugin`なしでバージョンに使えるようになった。コマンドライン（`-Drevision=...`）・`.mvn/maven.config`・親POMのいずれでも定義可能で、任意の変数名を使える
- **Maven Resolver 2.0**: 150以上の修正・改善を含む新しい依存関係解決ライブラリ。Java 17化に伴いJavaネイティブHTTPクライアントを採用。プラグインが直接resolverを叩く形から、Maven APIの裏に隠蔽される設計に変更された

## Reactor（マルチプロジェクトビルド）の改善

- `--also-make`が効かなかった長年のバグ（MNG-6863）が修正された
- `--resume`/`-r`で失敗したサブプロジェクトから再開でき、成功済みサブプロジェクトの再ビルドはスキップされる
- サブフォルダ単位のビルドに対応（MNG-6118）
- 全サブプロジェクトのSNAPSHOTタイムスタンプが統一される（MNG-6754）
- `installAtEnd`/`deployAtEnd`のデフォルトが`true`になり、全サブプロジェクトが成功した場合のみdeployされるようになった
- 「通常のビルドは`mvn clean install`ではなく`mvn verify`を使うべき」という推奨が明記された

## ライフサイクルの変更

- **グラフからツリーへ**: 実行順の表現がMaven 3の（ほぼ一本道の）グラフから木構造に変更された。依存プロジェクトが特定フェーズ（`ready`）に達し次第ビルドを進める「concurrent builder」（`-b concurrent`）が使えるようになった。デフォルトの挙動自体はMaven 3と互換
- **`before:`/`after:`フェーズ**: 全フェーズに`before:`/`after:`という前後フェーズが追加され、`before:integration-test[100]`のように番号を付けてフェーズ内の実行順も制御できる。旧来の`pre-*`/`post-*`は非推奨（エイリアスとして残るのみ）
  - **挙動変更に注意**: Maven 3では`post-clean`にバインドしたプラグインは`mvn clean`実行時には走らなかった（明示的に`mvn post-clean`が必要）が、Maven 4では`mvn clean`実行時に`before:`/`after:`が常に実行されるため、`post-clean`にバインドしたプラグインも自動的に走るようになる
- **`all`/`each`フェーズ**: `each`は個々の（サブ）プロジェクトのライフサイクル全体をラップし、`all`は子サブプロジェクトの`all`も含めたプロジェクト全体のビルドを包む。`before:all`/`after:all`/`before:each`/`after:each`というフック的フェーズも追加され、マルチプロジェクト・concurrentビルドでのセットアップ/ティアダウンが書きやすくなった

## その他のワークフロー変更

- **Java 17必須**: Maven 4を実行するにはJava 17が必要（コンパイル対象のJavaバージョンとは別の話で、Toolchains経由で古いJDK向けビルドは引き続き可能）
- **アプリケーションメンテナンス**: 2010年から非推奨だったPlexus Containers（DI）を削除、`${pom.*}`式などレガシー機能も削除。Super POMのデフォルトプラグインバージョンが更新され、デフォルトバージョンに依存していると警告が出る
- **`--fail-on-severity`（`-fos`）**: 指定した重大度（例: `WARN`）以上のログが出たらビルドを失敗させるパラメータ
- **プロファイルの改善**: `-P?nonexistent`のように`?`を付けると、存在しないプロファイルを指定してもビルドを失敗させず情報メッセージだけ出す。`<activation><condition>`による条件式ベースのプロファイル活性化も追加された
- **プラグインAPI**: 大規模なAPI更新により、Maven 3推奨API未対応の古いMaven 2プラグインは動かなくなる。Plexusベースの依存性注入は完全廃止され、JSR-330への移行が必須に。immutableなプラグインモデルと刷新されたプラグインAPIが導入されたが、4.0.0時点ではまだ実験段階
- **暗号化の刷新**: 旧来の「難読化」に近かったパスワード暗号化に代わり、`mvnenc`という独立CLIツールベースの暗号化に刷新
- **Maven Shell（`mvnsh`）**: シェルを開いている間1つのMavenプロセスを常駐させ、毎回のJVM起動オーバーヘッドを避ける仕組み。プロセスプールを使う既存のMaven Daemon（`mvnd`、[[gradle-daemon]]に近い発想）とは別物
- **Maven Upgrade Tool**: POMのmodel 4.1.0への更新、非推奨機能の検出などを自動化する移行支援ツール

## Maven 3からの移行手順

公式ガイドは3段階の移行を推奨している。

1. **Prepare**: 最新のMaven 3.9系でビルドが通る状態にし、`versions-maven-plugin`の`display-plugin-updates`で全プラグインをMaven 3互換の最新版に上げておく
2. **Test**: Java 17環境を用意しMaven 4のRCを並行導入（Maven WrapperやEnforcer Pluginのバージョン指定、CI設定も更新）。Maven 4はMaven 2 API未使用のMaven 3.9互換プラグインなら基本的にそのまま動く想定
3. **Migrate**: Maven 3依存を外し、`<subprojects>`・親推論（`<parent/>`）・完全対応の`${revision}`などMaven 4固有の新機能を使い始める

トラブルシューティングとして、同じプラグインを重複宣言するとエラーになる点、`executionRootDirectory`/`multiModuleProjectDirectory`のような非公式プロパティが`${project.rootDirectory}`等に置き換わった点が挙げられている。

## バージョンについて

本ノートの内容は2026年9月22日時点で最新のMaven 4.0.0-rc-6を前提にしている。Maven 4.0.0はまだGA（正式版）がリリースされておらず、RCの間に内容が変わる可能性がある。GAがリリースされたら本ノートの内容も見直すこと。

## 出典

- [What's new in Maven 4? | Apache Maven](https://maven.apache.org/whatsnewinmaven4.html)
- [Starting with Maven 4 | Apache Maven](https://maven.apache.org/guides/mini/guide-migration-to-mvn4.html)
- [Apache Maven 4.0.0-rc-6 Release Notes | Apache Maven](https://maven.apache.org/docs/4.0.0-rc-6/release-notes.html)

#maven #ビルド #java
