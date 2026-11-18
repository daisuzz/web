---
created: "2026-11-18T10:20:00+09:00"
---
# JA4+

[[ja4]] と同じ考え方（人も機械も読める、a_b_cのように部分に分ける）を、TLSクライアント以外にも広げたFoxIOの指紋の方式群。用途として、脅威アクターのスキャン検知、マルウェア検知、セッションハイジャック防止、DDoS検知、リバースシェル検知などが挙げられている。

## 方式の一覧

| 略称 | 対象 |
|---|---|
| JA4 | TLSクライアント（ClientHello） |
| JA4S | TLSサーバーの応答（ServerHello）/ セッション |
| JA4H | HTTPクライアント（メソッド、ヘッダー、Cookieなど） |
| JA4L / JA4LS | クライアントとサーバーの間のレイテンシ（光の距離から物理的な距離を推定する） |
| JA4X | X.509証明書（中身ではなく、証明書の作り方） |
| JA4SSH | SSHのトラフィック |
| JA4T / JA4TS | TCPクライアント / TCPサーバーの応答 |
| JA4TScan | TCPの能動的なスキャン |
| JA4D / JA4D6 | DHCP / DHCPv6 |
| JA4N | NTP |
| JA4Scan-TLS / JA4Scan-QUIC | TLS/QUICサーバーの能動的なスキャン |

## ライセンス

- **JA4（TLSクライアント）だけがBSD 3-Clause**。
- それ以外（JA4S、JA4L、JA4LS、JA4H、JA4X、JA4SSH、JA4T、JA4TS、JA4TScan、JA4D、JA4D6、JA4Scan-*、JA4N、今後追加されるもの）は **特許出願中で、FoxIO License 1.1**。
  - 学術目的や社内利用（自社を守るために使う）は許可されている。
  - JA4+の指紋を製品の機能として売る場合は、FoxIOのOEMライセンスが必要。
- 「JA4+」はFoxIOの商標。

CDNやWAFの製品が「JA4対応」とうたっているとき、ほとんどはBSDのJA4（TLSクライアント）だけを指している。

## 出典

- [FoxIO-LLC/ja4 README（一覧とLicensing節）](https://github.com/FoxIO-LLC/ja4)
- [JA4+ Network Fingerprinting (FoxIO)](https://medium.com/foxio/ja4-network-fingerprinting-9376fe9ca637)

#tls #security #fingerprinting
