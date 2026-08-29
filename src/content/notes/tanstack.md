---
created: 2026-08-29
---

# TanStack

Tanner Linsleyが中心になって開発しているオープンソースライブラリ群（TypeScriptベース）。単一のフレームワークではなく、「ヘッドレス（UIを持たない）・型安全・複数フレームワーク対応」という共通思想を持つ複数プロダクトの集合体。

## 構成プロダクト

| 名前 | 概要 | 成熟度（2026年8月時点） |
|---|---|---|
| Query | 非同期のサーバー状態管理。データフェッチ・キャッシュ・バックグラウンド再取得・重複排除を担う | stable |
| Router | 型安全性を軸に設計されたクライアントファーストのルーター。ファイルベース/コードベースのルーティングに対応。対象はReactとSolidのみ | stable |
| Table | テーブル・データグリッド構築用のヘッドレスUI | stable |
| Form | 状態管理とUIレンダリングを分離した、型安全なフォーム状態管理 | stable |
| Virtual | 大量要素リストの仮想化用ヘッドレスUI | stable |
| Start | TanStack RouterとViteを土台にしたフルスタックフレームワーク。SSR・サーバー関数・ストリーミング内蔵 | Release Candidate |
| DB | Queryのサーバーキャッシュとリレーショナルなインクリメンタルクエリを組み合わせた、ブラウザで動くリアクティブなクライアントストア | beta |
| AI | プロバイダ非依存の型安全なAI SDK（チャット・ツール呼び出し・エージェント機能） | beta |
| Store | 上記ライブラリの基盤となる状態管理プリミティブ | alpha |

Query/Table/Form/Virtual/StoreはReact/Vue/Solid/Svelte/Angular向けの公式アダプタを持つ。RouterとStartはReact/Solid限定。

## 設計思想

- **ヘッドレス**: 見た目（UI/マークアップ）を持たず、ロジックと状態管理だけを提供する。任意のデザインシステム上に自由に構築できる代わりに、`<table>`や`<input>`などのマークアップは自分で書く。
- **型安全性重視**: TypeScriptの型推論を最大限活用する設計が全プロダクトの共通軸。Routerは検索パラメータ（`?foo=1`）までエンドツーエンドで型推論される。
- **組み合わせ自由**: RouterなしでQueryだけ使う、StartなしでTableだけ使う、といった部分採用ができる。

## 他フレームワークとの比較

### Query（サーバー状態管理）

- **SWR**（Vercel製）: 圧倒的に軽量（約4KB、Queryの約1/3）。stale-while-revalidate戦略でシンプル。機能はQueryより少ない。
- **RTK Query**（Redux Toolkit付属）: Reduxストアと一体化。フェッチしたデータがReduxストアに乗る。Reduxに強く依存する。
- Queryはこの中で最も機能が豊富（devtools、楽観的更新、prefetch、SSRの細かい制御）で、フレームワーク非依存な点が差別化点。

### Router（ルーティング）

- **React Router v7**: 最大のエコシステムと実績。既存のReact Routerからの移行コストが低い。型安全性はTanStack Routerほど厳密ではない。
- **Next.js（App Router）**: ファイルベースルーティング＋SSR/API Routesがフレームワークに標準搭載。ルーティング単体の選択ではなく、フルスタックフレームワークとしての選択になる。
- TanStack Routerはパスパラメータ・検索パラメータまでエンドツーエンドで型推論される点、Queryとの統合を前提に設計されている点が特徴。

### Table

AG Gridのような完成品のUIコンポーネントとは対照的に、マークアップ・スタイルを一切持たないヘッドレス設計。ソート・フィルタ・ページネーションのロジックだけを提供し、見た目は完全に自分で書く。

### Form

React Hook FormやFormikと同じ枠だが、状態管理とUIレンダリングの分離をさらに徹底し、フィールド単位のきめ細かい再レンダリング制御と型安全性を重視する。

## 最小コード例

### Query

```tsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  )
}

function Todos() {
  const { isPending, error, data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then((res) => res.json()),
  })

  if (isPending) return 'Loading...'
  if (error) return 'Error: ' + error.message

  return <ul>{data.map((todo) => <li key={todo.id}>{todo.title}</li>)}</ul>
}
```

`queryKey`がキャッシュのキーになり、同じキーなら結果が自動で共有・再利用される。

### Router（ファイルベースルーティング）

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})

// src/routes/index.tsx（"/"に対応）
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div>Hello /</div>,
})

// main.tsx
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // プラグインが自動生成

const router = createRouter({ routeTree })

function App() {
  return <RouterProvider router={router} />
}
```

`src/routes/`配下のファイル構成がそのままURL構造になる。

### Table

v9で`useReactTable`が`useTable`に置き換わり、機能（フィルタリング・ソート等）を`tableFeatures()`で明示的に登録する方式に変わった（v8では全機能がバンドルされていた）。

```tsx
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
})

const columns = [
  { accessorKey: 'name', header: '名前' },
  { accessorKey: 'age', header: '年齢' },
]

function MyTable({ data }) {
  const table = useTable({ features, columns, data })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr key={group.id}>
            {group.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : header.column.columnDef.header}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{cell.getValue()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

`<table>`タグ自体は自分で書く必要がある代わりに、フィルタ・ソートなどの機能は`tableFeatures`に差し込むだけで拡張できる。

### Form

```tsx
import { useForm } from '@tanstack/react-form'

function MyForm() {
  const form = useForm({
    defaultValues: { firstName: '' },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field
        name="firstName"
        children={(field) => (
          <input
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <button type="submit">送信</button>
    </form>
  )
}
```

## バージョンについて

本ノートの内容は次のバージョンを前提にしている。

- `@tanstack/react-query` 5.102.8
- `@tanstack/react-router` 1.170.32
- `@tanstack/react-table` 9.2.4（2026年7月にv9がベータ公開され、v8から`useReactTable`→`useTable`・機能の明示登録などの破壊的変更が入っている。v8時代の`useReactTable`/`getCoreRowModel()`パターンで書かれた記事・チュートリアルも2026年8月時点ではまだ多い）
- `@tanstack/react-form` 1.33.5

## 出典

- [TanStack organization on GitHub](https://github.com/TanStack)
- [TanStack Query useQuery Reference](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery)
- [TanStack Router Comparison](https://tanstack.com/router/v1/docs/framework/react/comparison)
- [TanStack Table v9 migration skill (react-table)](https://github.com/TanStack/table/blob/main/packages/react-table/skills/migrate-v8-to-v9/SKILL.md)
- [TanStack Table v9 migration skill (table-core)](https://github.com/TanStack/table/blob/main/packages/table-core/skills/migrate-v8-to-v9/SKILL.md)
- [TanStack Table V9 Beta - InfoQ](https://www.infoq.com/news/2026/07/tanstack-table-v9-beta/)
- [TanStack Form Simple Example](https://tanstack.com/form/v1/docs/framework/react/examples/simple)
- [TanStack Query vs SWR vs RTK Query - Pi Stack](https://www.pistack.xyz/posts/2026-08-11-tanstack-query-vs-swr-vs-rtk-query-react-data-fetching-comparison/)
- [react-router v7 vs TanStack Router 2026 - PkgPulse](https://www.pkgpulse.com/guides/react-router-v7-vs-tanstack-router-2026)
- npm registry: `@tanstack/react-query`, `@tanstack/react-router`, `@tanstack/react-table`, `@tanstack/react-form` の各`latest`
