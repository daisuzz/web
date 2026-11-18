---
created: "2026-11-18T10:00:00+09:00"
---
# TLSフィンガープリンティング

TLSハンドシェイクでクライアントが最初に送る **ClientHello** の中身（TLSバージョン、暗号スイートの一覧、拡張の一覧、署名アルゴリズム、ALPNなど）から、「どのソフト・ライブラリが通信しているか」を推定する手法。ClientHelloは暗号化される前に平文で送られるので、通信の中身を復号しなくても観測できる。

ブラウザ、OSのTLSスタック、言語ごとのHTTPクライアント、マルウェアなどは、それぞれ暗号スイートや拡張の組み合わせが違う。そのため、ClientHelloの特徴を短い文字列（指紋）にまとめると、クライアントの種類をある程度区別できる。

## 代表的な方式

- **JA3**: Salesforceで公開された方式（JA3/JA3S）。ClientHelloの各フィールドを、送られてきた順番のまま連結してMD5を取る。
- **[[ja4]]**: JA3の作者によるFoxIOの後継方式。並べ替えてからハッシュを取るので、順番のランダム化に強い。QUICにも対応している。
- **[[ja4-plus]]**: JA4と同じ考え方を、TLSサーバー・HTTP・SSH・TCP・証明書などに広げたファミリー。
- JARM: サーバー側にClientHelloを何度か送り、その応答からサーバーの指紋を取る能動的な方式。

## JA3が効きにくくなった経緯

- 「cipher stunting」: 暗号スイートの順番をランダムにしてJA3の検知を避ける手口が出てきた。
- 2023年、Chromiumが **TLS拡張の順番をランダム化** した。サーバー側が「Chromeの指紋は変わらない」と思い込んで、それに依存したロジックを作るのを防ぐのが目的。順番をそのままハッシュするJA3では、Chromeの指紋が接続ごとにばらつくようになった。
- これらを受けて、順番に依存しないJA4が作られた。

## 用途

- ボット検知: User-Agentとの食い違い（Chromeを名乗っているのにPythonのライブラリの指紋、など）を見る
- マルウェアやC2通信の検出、脅威ハンティング
- WAF・CDNでのトラフィック分類（[[ja4-waf]]）

## 限界

- 同じTLSライブラリを使うクライアントは同じ指紋になる。指紋だけでは1つのアプリに特定できない。
- curl-impersonateのように、ブラウザの指紋を真似るツールがある。
- ソフトの更新で指紋は変わる。
- 指紋を取れるのはTLSを終端する地点だけ。リバースプロキシやCDNの後ろでは、元のクライアントの指紋は見えない（終端した側が計算してヘッダーで渡す必要がある）。

## 出典

- [FoxIO-LLC/ja4 README](https://github.com/FoxIO-LLC/ja4)
- [TLS Fingerprinting with JA3 and JA3S (Salesforce Engineering)](https://medium.com/salesforce-engineering/tls-fingerprinting-with-ja3-and-ja3s-247362855967)
- [The State of TLS Fingerprinting (Fastly)](https://www.fastly.com/blog/the-state-of-tls-fingerprinting-whats-working-what-isnt-and-whats-next)
- [Chrome Platform Status: Randomize TLS ClientHello extension order](https://chromestatus.com/feature/5124606246518784)
- [What is JA4 fingerprinting (Peakhour)](https://www.peakhour.io/learning/fingerprinting/what-is-ja4-fingerprinting/)

#tls #security #fingerprinting #bot-detection
