---
created: 2026-09-03
---

# Echo (Goのウェブフレームワーク)

Go標準ライブラリの`net/http`の上に構築された、ミニマリスト志向のWebフレームワーク。開発元はLabStack。最適化されたルーター・ミドルウェアエコシステム・リクエストバインディング・一元化されたエラーハンドリングを提供する。[[isucon-go-implementation]]で触れているとおり、ISUCONのGo初期実装で採用されることが多い。

## バージョン

- 2026年1月にv5がリリースされた。
- v4はセキュリティ更新・バグ修正が2026年12月31日まで継続される。2026年3月31日までは、v5のAPIを破壊してでも対応が必要な致命的な問題があれば対応する、という移行期間の位置付け。
- v5の主な破壊的変更:
  - `Context`がインターフェースから構造体(struct)に変更され、将来のマイナーバージョンでメソッドを追加しやすくなった
  - ロギングが独自インターフェースから標準の`log/slog`ベースに移行
  - ルーティング実装を差し替え可能にする`Router`インターフェースを新設
  - メソッド/関数シグネチャを整理してAPIの一貫性を向上
  - エラーハンドリングを`NewHTTPError(code, message)`に集約し、個別のHTTPエラー変数群を廃止

新規プロジェクトではv5への移行が案内されているが、周辺ライブラリ（`echo-contrib`等）のv5対応が追いついていないケースもあり、既存資産次第ではv4を継続利用するのも現実的な選択とされている。

## ルーティング

```go
e := echo.New()
e.GET("/api/users/:id", getUserHandler)
e.POST("/api/users", createUserHandler)

g := e.Group("/api")   // ルートグループ化
g.Use(authMiddleware)  // グループ単位でミドルウェアを適用
```

ハンドラは`func(c echo.Context) error`のシグネチャを持ち、エラーを返すとエラーハンドラ（デフォルトまたはカスタム設定した`HTTPErrorHandler`）に渡される。

## Context (`echo.Context`)

リクエスト全体（パスパラメータ・クエリ・ボディ・レスポンス書き込み）を1つの`c echo.Context`に集約している。

| メソッド | 用途 |
|---|---|
| `c.Param("id")` | パスパラメータ取得（`/users/:id`） |
| `c.QueryParam("page")` | クエリパラメータ取得 |
| `c.Bind(&req)` | JSON/form/XMLをstructへ自動バインド |
| `c.JSON(http.StatusOK, obj)` | JSONレスポンス送信 |
| `c.Cookie("session")` / `c.SetCookie(...)` | Cookie操作 |
| `c.Request()` / `c.Response()` | 生の`*http.Request`/`http.ResponseWriter`が必要な場合 |
| `c.Get("user")` / `c.Set("user", u)` | ミドルウェアからハンドラへ値を受け渡す |

v4以降ではジェネリクスを使ったヘルパーも用意されている（`echo.PathParam[int](c, "id")`で型変換、`echo.PathParamOr[int](c, "id", -1)`でデフォルト値付き取得など）。

## ミドルウェア

```go
e.Use(middleware.Logger())   // アクセスログ
e.Use(middleware.Recover())  // panic時に500を返す
```

Root（`e.Use`）・Group（`g.Use`）・Route単位の3レベルで適用できる。アクセスログ出力自体がオーバーヘッドになる場面（高負荷なベンチマーク環境など）では、Loggerミドルウェアを外す・軽量化するチューニングが行われることがある。

## データバインディング

`c.Bind()`はContent-Typeヘッダーに応じて`application/json`・`application/xml`・`application/x-www-form-urlencoded`を自動判別してstructへデコードする。パス・クエリ・ヘッダー・フォームの各フィールドは構造体タグが必須だが、JSON/XMLはタグを省略するとフィールド名にフォールバックする。

```go
type CreateUserRequest struct {
    Name  string `json:"name" form:"name"`
    Email string `json:"email" form:"email"`
}
```

単一のソースから明示的・型安全にバインドしたい場合は、`echo.QueryParamsBinder(c)`・`echo.PathValuesBinder(c)`・`echo.FormFieldBinder(c)`のようなfluentなビルダーAPIも用意されている（`Int64`/`MustInt64`/`Int64s`のような型ごとのメソッドを持つ）。

## バージョンについて

本ノートの内容はEcho v4系・v5系（2026年1月リリースのv5.0.0、2026年9月時点の最新はv5.0.4）を前提にしている。v4は2026年12月31日までセキュリティ更新・バグ修正が継続される見込み。

## 出典

- [GitHub - labstack/echo](https://github.com/labstack/echo)
- [Guide | Echo](https://echo.labstack.com/guide/)
- [Context | Echo](https://echo.labstack.com/guide/context/)
- [Binding - Echo](https://echo.labstack.com/guide/binding/)
- [Routing | Echo](https://echo.labstack.com/docs/routing)
- [pkg.go.dev - github.com/labstack/echo/v4](https://pkg.go.dev/github.com/labstack/echo/v4)
- [pkg.go.dev - github.com/labstack/echo/v5](https://pkg.go.dev/github.com/labstack/echo/v5)
- [API_CHANGES_V5.md](https://github.com/labstack/echo/blob/master/API_CHANGES_V5.md)
- [Release V5 is out · labstack/echo](https://github.com/labstack/echo/releases/tag/v5.0.0)
- [GitHub - labstack/echo at v5.0.4](https://github.com/labstack/echo/tree/v5.0.4)

#go #webフレームワーク
