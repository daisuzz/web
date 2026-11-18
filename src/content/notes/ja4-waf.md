---
created: "2026-11-18T10:30:00+09:00"
---
# WAFでのJA4の活用

WAFやCDNで [[ja4]] を使うのは、主に **ボット対策** のため。IPアドレスやUser-Agentは簡単に変えられるが、JA4は「どのTLSライブラリで通信しているか」に紐づくので変えにくい。そこを判定材料に使う。

## 使い方のパターン

1. **攻撃で使われている指紋をブロックするか、チャレンジを出す**
   - クレデンシャルスタッフィングやスクレイピングで攻撃元のIPが分散していても、同じツールならJA4は同じになりやすい。その指紋を条件にしたカスタムルールを作る。
2. **正規の指紋をスキップする（許可リスト）**
   - 自社のモバイルアプリなど、身元が分かっているクライアントの指紋は、他のボット判定から外して誤検知を防ぐ。
3. **レートベースルールの集約キーにする**
   - 「IPごと」ではなく「JA4ごと」にリクエスト数を数える。IPを大量に使い分ける分散型の攻撃でも、まとめて検知できる。
4. **他の情報との食い違いを検知する**
   - User-AgentはChromeなのに、JA4はPythonのHTTPクライアントのもの、という組み合わせを怪しいと判定する。
5. **ログに残して分析する**
   - WAFのログにJA4を出しておくと、事後に「どのツールで攻撃されたか」を横断的に調べられる。

## 主要サービスの対応状況

### AWS

- **Amazon CloudFront**（2024年10月〜）: エッジでJA4を計算し、`CloudFront-Viewer-JA4-Fingerprint` ヘッダーでオリジンに渡せる。デフォルトでは送られないので、オリジンリクエストポリシーにこのヘッダーを追加する必要がある。追加料金はかからない。
- **AWS WAF**（2025年3月〜）: CloudFrontとALBの前段で、JA4を一致条件（`JA4Fingerprint`）に使える。JA3/JA4はレートベースルールの集約キーにも使える。web ACLのログにも出力される。標準のAWS WAF料金以外の追加料金はかからない。

ルールの例（AWS WAF、特定のJA4をブロックする）:

```json
{
  "Name": "block-ja4",
  "Priority": 0,
  "Action": { "Block": {} },
  "Statement": {
    "ByteMatchStatement": {
      "FieldToMatch": { "JA4Fingerprint": { "FallbackBehavior": "NO_MATCH" } },
      "PositionalConstraint": "EXACTLY",
      "SearchString": "t13d1516h2_8daaf6152771_e5627efa2ab1",
      "TextTransformations": [{ "Priority": 0, "Type": "NONE" }]
    }
  },
  "VisibilityConfig": { "SampledRequestsEnabled": true, "CloudWatchMetricsEnabled": true, "MetricName": "block-ja4" }
}
```

`FallbackBehavior` は、JA4を計算できなかったリクエストをどう扱うか（`MATCH` か `NO_MATCH`）の指定。

### Cloudflare

JA3/JA4の指紋を、WAFのカスタムルール、Bot Analytics、Workersで使える。公式ドキュメントにも「攻撃で使われた指紋をブロック/チャレンジする」「正規のモバイルアプリの指紋をSkipする」という例がある。Bot Managementの機能。ルール式でのフィールド名や対象プランは、公式ドキュメントを開けなかったため確認できていない。

### Azure

Azure Front DoorのWAFに、クライアントの指紋（client fingerprint）を一致条件に使う機能がある。

## 運用上の注意

- **JA4だけで判断しない**。同じブラウザやライブラリを使う正規ユーザーも同じ指紋になる。パス、国、レートなどの条件（AWSでいうscope-down）と組み合わせる。
- **いきなりBlockにしない**。まずCountモードでログを集め、自分のトラフィックでの指紋の分布をつかんでからBlockやChallengeに切り替える。
- 一律の403より、**CAPTCHAやChallengeのアクション** を優先する。誤検知したときの被害が小さい。
- **偽装には弱い**。2026年のDevelopersIOの検証では、指紋を固定したツールはJA4のレートルールで止められた。一方でJA4を偽装するツールには、AWS WAF Bot Control（Targeted）のようなより高度な判定が必要だった（Bot Controlは追加料金がかかる）。
- **計算できるのはTLSを終端する場所だけ**。CloudFrontの後ろのオリジンで使いたい場合は、エッジで計算した値をヘッダーで受け取る（[[tls-fingerprinting]]の限界も参照）。

## 出典

- [Amazon CloudFront launches support for JA4 fingerprinting](https://aws.amazon.com/about-aws/whats-new/2024/10/amazon-cloudfront-ja4-fingerprinting)
- [AWS WAF adds JA4 fingerprinting and aggregation on JA3 and JA4 fingerprints for rate-based rules](https://aws.amazon.com/about-aws/whats-new/2025/03/aws-waf-ja4-fingerprinting-aggregation-ja3-ja4-fingerprints-rate-based-rules)
- [JA4Fingerprint - AWS WAFV2 API Reference](https://docs.aws.eu/waf/latest/APIReference/API_JA4Fingerprint.html)
- [[アップデート]AWS WAFがJA4 フィンガープリントをサポートしました（DevelopersIO）](https://dev.classmethod.jp/articles/aws-waf-support-ja4-fingerprint/)
- [Testing Whether AWS WAF Can Detect and Restrict Bot Access from Scrapling（DevelopersIO）](https://dev.classmethod.jp/en/articles/aws-waf-scrapling-bot-detection/)
- [JA3 and JA4 fingerprints in AWS WAF and beyond（DoiT）](https://c.doit.com/blog/ja3-and-ja4-fingerprints-in-aws-waf-and-beyond)
- [Defend AWS Against Bots: Implementing JA4 Fingerprints](https://medium.com/@demianchuk.sergii/defend-aws-against-bots-implementing-ja4-fingerprints-250cce76f1a1)
- [Cloudflare: JA3/JA4 fingerprint](https://developers.cloudflare.com/bots/additional-configurations/ja3-ja4-fingerprint/)
- [What is client fingerprint matching for Azure Front Door?](https://docs.azure.cn/en-us/web-application-firewall/afds/client-fingerprint-match-condition)

#security #waf #bot-detection #fingerprinting #tls
