---
created: "2026-11-18T10:10:00+09:00"
---
# JA4

FoxIOが開発した、TLSクライアントの指紋を取る方式。JA3の後継（[[tls-fingerprinting]]）。ClientHelloから `a_b_c` 形式の文字列を作る。JA4以外の方式（JA4S、JA4Hなど）をまとめて [[ja4-plus]] と呼ぶ。

例: `t13d1516h2_8daaf6152771_e5627efa2ab1`

## アルゴリズム

### a: 人が読める部分

| 位置 | 意味 | 例 |
|---|---|---|
| 1文字 | トランスポート。`t`=TCP上のTLS、`q`=QUIC、`d`=DTLS | `t` |
| 2文字 | TLSバージョン。`supported_versions` 拡張(0x002b)があればその最大値、なければProtocol Version。`13`/`12`/`11`/`10`/`s3`/`s2`、DTLSは`d1`/`d2`/`d3`、不明なら`00` | `13` |
| 1文字 | SNI拡張があれば`d`（宛先がドメイン）、なければ`i`（宛先がIP） | `d` |
| 2文字 | 暗号スイートの数（99が上限） | `15` |
| 2文字 | 拡張の数（SNIとALPNも数える） | `16` |
| 2文字 | 最初のALPN値の先頭と末尾の文字。`h2`→`h2`、`http/1.1`→`h1`、ALPNがなければ`00` | `h2` |

### b: 暗号スイートのハッシュ

暗号スイートの4桁hex（小文字）を **hex順にソート** し、カンマでつなぐ。そのSHA256の先頭12文字。

```txt
002f,0035,009c,009d,1301,1302,1303,c013,c014,c02b,c02c,c02f,c030,cca8,cca9 → 8daaf6152771
```

### c: 拡張と署名アルゴリズムのハッシュ

1. 拡張の4桁hexを **ソート** する。SNI(0000)とALPN(0010)はaに入っているので除く。
2. `_` のあとに署名アルゴリズムを **出現順のまま（ソートしない）** つなげる。
3. そのSHA256の先頭12文字。

```txt
0005,000a,000b,000d,0012,0015,0017,001b,0023,002b,002d,0033,4469,ff01_0403,0804,0401,0503,0805,0501,0806,0601
→ e5627efa2ab1
```

### 共通のルール

- GREASE値（RFC 8701）はどこに出てきても無視する。
- 暗号スイートや拡張が1つもなければ、bやcはハッシュを取らずに `000000000000` にする。
- 生の値を出す raw 出力（ソート済み / 元の順番）も仕様に含まれている。

## JA3との違い

- **ソートしてからハッシュを取る**ので、Chromeの拡張順ランダム化や、暗号スイートの順番を変える回避策の影響を受けない。FoxIOの調査では、アプリやライブラリの違いは並び順より「どの暗号スイートを持っているか」に表れやすいとのこと。
- **QUIC・DTLSにも対応**（JA3はTCP上のTLSだけ）。
- **a/b/cに分かれている**ので、部分ごとに一致を見られる。例: 暗号スイートを1つずつ変えながらスキャンする攻撃者は、JA3だと指紋が毎回変わる。JA4ならbだけが変わる。GreyNoiseは、aとcをつないだ `JA4_ac` で追跡しているとのこと。
- aは人が読めるので、ハッシュが一致しなくても「TLS 1.3・SNIなし・ALPNなし」のような条件で絞り込める。
- SNIとALPNをcから除いているので、同じアプリならドメイン宛かIP宛か、ALPNが何かに関係なくcが同じになる。

## ライセンス

JA4（TLSクライアント指紋）だけは **BSD 3-Clause**（JA3と同じ）。FoxIOは特許を主張しないと明言している。JA4+の他の方式はライセンスが違う（[[ja4-plus]]）。

## 実装・対応製品

- FoxIO公式: Wiresharkプラグイン、Zeek、Rust製のCLI、NGINXモジュール
- Suricata、Apache Traffic Server（プラグイン）など
- CDN/WAF: Cloudflare、Amazon CloudFront、AWS WAF、Azure Front Door など（[[ja4-waf]]）

## 出典

- [JA4: TLS Client Fingerprinting (technical details)](https://github.com/FoxIO-LLC/ja4/blob/main/technical_details/JA4.md)
- [FoxIO-LLC/ja4 README](https://github.com/FoxIO-LLC/ja4)
- [JA4+ Network Fingerprinting (FoxIO)](https://medium.com/foxio/ja4-network-fingerprinting-9376fe9ca637)
- [Apache Traffic Server: JA4 Fingerprint Plugin](https://docs.trafficserver.apache.org/ja/latest/admin-guide/plugins/ja4_fingerprint.en.html)

#tls #security #fingerprinting #bot-detection
