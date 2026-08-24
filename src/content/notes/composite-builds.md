---
created: "2026-08-24"
---
# Composite Builds (Gradle)

複数の独立したGradleビルドをまとめて1つとして扱う仕組み。`settings.gradle.kts`で`includeBuild()`を呼ぶことで、他のビルドをその場に含める。[[gradle-daemon]]が管理するタスクグラフの中に、別ビルドをそのまま組み込めるイメージ。

## マルチプロジェクトビルドとの違い

マルチプロジェクトビルド（サブプロジェクト）は1つの`settings.gradle.kts`の下で設定を共有するのに対し、composite buildは「サブプロジェクトの代わりに、独立したビルド丸ごとを含める」。含まれた各ビルド（included build）は**設定を共有せず、隔離された状態で実行される**——複合ビルド全体や他のincluded buildの設定に影響しない。

## 依存関係の置換 (dependency substitution)

繋がる仕組みは依存関係の置換。複合ビルド内のどこかが外部モジュールへの依存を持っていて、それがincluded buildの生成物と一致する場合、Gradleは自動的にその外部依存をincluded buildへのプロジェクト依存に置き換える。自動判定が期待通りでない場合は明示的に置換ルールを宣言することもできる。

## 主な用途

- **ライブラリとその利用側を同時に開発する**: ライブラリを公開（publish）しなくても、composite buildならローカルのソースをそのまま参照でき、変更が即座に利用側に反映される
- **大きなコードベースを独立したビルドに分割する**: それぞれを単体でIDEで開いて作業しつつ、全体としてもビルドできる（モノレポでよく使われる構成）
- **[[convention-plugins]]のようなビルドロジックを保持する場所として使う**（`build-logic`など）

## buildSrcとの関係

`buildSrc`自体、実装上は**Gradleが自動的に管理する暗黙のincluded build**であり、明示的に`includeBuild("build-logic")`する場合と根底の仕組みは同じ。composite buildという1つの機構の上に、「自動で含まれる特別扱いの`buildSrc`」と「自分で`includeBuild()`する任意の名前のビルド」という2つの使い方がある。詳細は[[convention-plugins]]を参照。

## 出典

- [Composite Builds (Included Builds) | Gradle User Manual](https://docs.gradle.org/current/userguide/composite_builds.html)
- [Introducing Composite Builds | Gradle Blog](https://blog.gradle.org/introducing-composite-builds)

#gradle #ビルド
