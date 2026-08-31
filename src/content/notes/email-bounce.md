---
created: 2026-08-31
---

# メールのバウンス（ハードバウンス/ソフトバウンス）

メール配信において、送信したメールが受信者に届かず送信者に差し戻される現象を「バウンス」と呼ぶ。バウンスは大きくハードバウンスとソフトバウンスの2種類に分類される。

## ハードバウンス

恒久的な配信失敗。メールが二度と届かないことが確定している状態を指す。

- 主な原因: 宛先メールアドレスが存在しない、ドメインが存在しない、受信側サーバーがそのアドレスへの配信を永続的に拒否している
- SMTPステータスコードは `5xx` 系（例: `550 No such user`）
- 対応: 該当アドレスは即座に配信リストから除外する。放置すると送信元のレピュテーション（評判）が下がり、他の正常な宛先へのメールまで迷惑メール判定されやすくなる

## ソフトバウンス

一時的な配信失敗。時間をおけば届く可能性がある状態を指す。

- 主な原因: 受信箱が満杯、受信側サーバーが一時的にダウン/過負荷、メールサイズが大きすぎる、一時的なグレーリスティングなど
- SMTPステータスコードは `4xx` 系（例: `450 Mailbox full`）
- 対応: 多くのメール配信プラットフォームは自動的に数回リトライする。同じアドレスで何度もソフトバウンスが続く場合は、実質的にハードバウンスと同様に扱いリストから除外することが推奨される

## まとめ

| | ハードバウンス | ソフトバウンス |
|---|---|---|
| 性質 | 恒久的 | 一時的 |
| SMTPコード | 5xx | 4xx |
| 主な原因 | アドレス不存在・存在しないドメイン | 受信箱満杯・サーバー障害 |
| 対応 | 即リスト除外 | リトライ、継続する場合は除外検討 |

## 出典

- [Hard Bounce vs. Soft Bounce: What's the Difference? | Mailchimp](https://mailchimp.com/resources/hard-bounce-vs-soft-bounce/)
- [Soft vs. Hard Bounces | Mailchimp](https://mailchimp.com/help/soft-vs-hard-bounces/)
- [Soft Bounce vs Hard Bounce Email: Meaning, Causes, Fixes (4xx vs 5xx)](https://messageflow.com/blog/soft-bounce-hard-bounce-email-marketing/)
- [Hard bounce vs soft bounce: Key differences | Braze](https://www.braze.com/resources/articles/hard-bounce-vs-soft-bounce)
