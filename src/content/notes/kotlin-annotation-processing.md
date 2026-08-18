---
created: "2026-08-18"
---
# Kotlinのアノテーション処理 (kapt / KSP)

Kotlinでコンパイル時のコード生成を行うための2つの手段、[[kapt]]と[[ksp]]を束ねるハブノート。どちらも土台にあるのはJava由来の[[annotation-processor]]という仕組みで、DIコンテナ（Dagger/Hilt）やORM（Room）のボイラープレート生成に使われている。

## 配下ノート

- [[annotation-processor]]: そもそもの土台となるJavaのコンパイル時プラグイン機構（`javax.annotation.processing`）。Dagger/Room/MapStructなど大半のプロセッサ資産はこの上に書かれている
- [[kapt]]: KotlinソースをJavaスタブに変換し、既存のJavaプロセッサ資産をそのままKotlinから使うためのアダプタ層。2015年から存在し、Kotlin 2系でもK2ベースに再実装されて使われ続けている
- [[ksp]]: kaptのJavaスタブ生成を経由せず、Kotlinコンパイラのシンボルモデルを直接処理するKotlinネイティブな後継。高速だがプロセッサ側の対応（KSP実装）が必要

## 選び方の目安

| 観点 | kapt | KSP |
|---|---|---|
| 既存のJavaプロセッサをそのまま使いたい | ◯ | ✕（KSP版が別途必要） |
| ビルド速度を優先したい | ✕ | ◯ |
| Kotlin固有の構文（デフォルト引数、拡張関数等）を処理に反映したい | ✕（スタブ化で失われる） | ◯ |

新規プロジェクトで両方選べる場合はKSP対応版のプロセッサがあればKSPを優先し、KSP版が存在しないプロセッサに限りkaptを使う、という判断が一般的。

#moc #kapt #ksp #kotlin #annotation-processor #ビルド
