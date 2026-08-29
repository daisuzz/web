---
created: "2026-08-29"
---

# サーバー状態管理

フロントエンド（特にReact）の文脈で、アプリが持つ「状態(state)」を**クライアント状態**と**サーバー状態**の2種類に分けて考える発想。従来は状態管理といえばクライアント状態向けのツール（Redux等）で一括りに扱われていたが、サーバー状態は性質が異なるため専用の扱いが必要、という整理。

## クライアント状態とサーバー状態の違い

- **クライアント状態**: モーダルの開閉、フォーム入力途中の値、UIのテーマなど、アプリ（クライアント）が完全に所有・管理している状態。
- **サーバー状態**: サーバー側のデータベース等に実体があり、クライアントは「今表示するために一時的に借りてきているだけ」の状態（記事一覧、ユーザー情報など）。

## サーバー状態が難しい理由

サーバー状態は次のような性質を持ち、単に値を保持するだけのクライアント状態管理では素朴に解決できない。

- **非同期**: 取得に時間がかかり、失敗もありうる。
- **所有権がクライアントにない**: 他のユーザーや別タブの操作で、手元にあるコピーがいつの間にか古くなる（stale）。
- **キャッシュと同期が本質的な課題**: 同じデータを複数のコンポーネントが必要とする（重複リクエストの排除）、一定時間で再取得したい（stale-while-revalidate）、更新操作（mutation）の後にサーバー側の最新値と同期させたい、など。

これらを解決するには、フェッチ・キャッシュ・再検証・重複排除・楽観的更新といった専用の仕組みが必要になる。

## 専用ライブラリの登場

上記の仕組みをまとめて提供するのが、[[tanstack]]のQuery、SWR、RTK Query、Apollo Clientのようなライブラリで、これらは「状態管理ライブラリ」ではなく「サーバー状態管理ライブラリ（server-state library）」と呼ばれる。

Reactコミュニティでこの整理を広めたのはReact QueryメンテナのTkDodoらで、「サーバー状態をきちんと専用ツールに切り出すと、Reduxなどで管理すべき本当のクライアント状態はごく僅かしか残らない」という主張がよく引用される。サーバー状態管理ライブラリはクライアント状態管理ツールと排他的ではなく、併用も一般的。

## 出典

- [Does React Query replace Redux, MobX or other global state managers? (TanStack)](https://react-query.tanstack.com/guides/does-this-replace-client-state)
- [Server State vs Client State in React for Beginners (DEV Community)](https://dev.to/jeetvora331/server-state-vs-client-state-in-react-for-beginners-3pl6)
- [What is the pattern to keep client-state in sync with server-state (TanStack/query Discussion)](https://github.com/TanStack/query/discussions/3539)
