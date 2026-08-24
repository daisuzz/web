---
created: "2026-08-24"
---
# クラスパス (Classpath)

JVM（実行時）やjavac（コンパイル時）が、ユーザー定義のクラスを探すために参照する**場所（jarファイル・ディレクトリ・zipファイル）のリスト**。`java -cp <path>`/`-classpath <path>`オプション、`CLASSPATH`環境変数、jarの場合は`MANIFEST.MF`内の`Class-Path`エントリで指定する。

[[jvm-class-loading]]の「ロード」段階——クラスローダーが`.class`ファイルをバイト列として読み込む処理——の「どこを探すか」を決めているのがクラスパス。JVMは次の順で探索し、最初に見つかったものを使う。

1. **Bootstrap classes**: JDKのコアクラス（`java.lang.String`など）
2. ~~Extension classes~~: かつて存在した拡張クラスパス機構（Java 9で廃止）
3. **Classpath**: `-cp`で指定した自前のディレクトリ・jar・zip。リストの先頭から順に探し、同名クラスが複数の場所にあっても最初に見つかったものだけが使われる

## ワイルドカードと「クラスパス地獄」

`mydir/*`のようにワイルドカードを書くと、そのディレクトリ直下の`.jar`ファイル全部を指定したのと同じ扱いになる。ただしサブディレクトリは再帰的に含まれず、`.class`ファイル単体もマッチしない。さらに**ワイルドカード展開されたjar群の読み込み順序はOSのファイルシステム依存で保証されない**——同名クラスが複数jarに存在する場合にどちらが読まれるか制御できない、という「classpath hell」と呼ばれる問題の温床になる。

## module path（Java 9〜）との違い

クラスパスは平坦でカプセル化のないただのリストで、同名クラスの衝突を機構として防げない。Java 9のJPMSで導入された**module path**はこれに対する答えで、`module-info.java`で明示的に`exports`/`requires`を宣言した「モジュール」というまとまり単位で依存関係を管理し、強いカプセル化を効かせる。

## 関連

[[gradle-daemon]]のWorker Daemonは、テスト実行時に別プロセスへ切り出すことでクラスパス汚染（テスト間・ビルド間でクラスパスの内容が混ざり合う）を防ぐ用途にも使われる。

## 出典

- [Setting the Class Path | Oracle](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/classpath.html)
- [PATH and CLASSPATH | The Java Tutorials, Oracle](https://docs.oracle.com/javase/tutorial/essential/environment/paths.html)
- [Classpath vs. Modulepath in Java | Baeldung](https://www.baeldung.com/java-classpath-vs-modulepath)

#jvm #java #classpath
