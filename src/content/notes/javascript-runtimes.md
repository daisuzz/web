---
created: "2026-10-12T10:40:00+09:00"
---
# JavaScriptランタイム

JavaScript/TypeScriptランタイムまわりのノートを束ねるハブノート。Node.jsの代替として登場したランタイムと、それを支えるJSエンジン。

## ランタイム

- [[deno]] — V8 + Rust（Tokio）。Node.jsの作者が自らの設計を反省して作り直したもので、デフォルト拒否のパーミッションモデルが最大の特徴。
- [[bun]] — [[javascript-core]] + Zig。ランタイム・パッケージマネージャー・バンドラー・テストランナーを単一バイナリにまとめたNode.jsのdrop-in replacement。

## JSエンジン

- [[javascript-core]] — WebKit/Safariのエンジン。Node.jsやDenoが使うV8ではなくこちらを採用したのが[[bun]]。

## 比較

| | JSエンジン | システム層 | デフォルトの権限 |
|---|---|---|---|
| Node.js | V8 | C/C++ + libuv | フルアクセス |
| [[deno]] | V8 | Rust + Tokio | 拒否（`--allow-*`で許可） |
| [[bun]] | [[javascript-core]] | Zig（一部Rustへ移行中） | フルアクセス |

（比較表の中身は[[deno]]の「他ランタイムとの違い」から）

#javascript #typescript #ランタイム #moc
