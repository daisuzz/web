---
created: "2026-09-30T12:00:00+09:00"
---
# Cloudflare R2

CloudflareのS3互換オブジェクトストレージ。最大の特徴は**egress（インターネットへのデータ転送）が無料**なこと。非構造化データを大量に置いて配信する用途向け。

## 特徴

- **S3互換API**: 既存のS3 SDKや `aws` CLIが、エンドポイント（`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`）を差し替えるだけで使える。[[cloudflare-workers]]からはbinding（`env.MY_BUCKET.get/put`）でも使える
- **egress無料**: どのストレージクラスでも、インターネットへの転送料金はかからない。料金はストレージ容量と操作回数だけ
- **強整合**: 書き込み直後の読み込み、メタデータ更新、削除、一覧（list）は、すべてグローバルに即時反映される。同じキーに複数のクライアントが書き込んだ場合は、最後に完了したものが勝つ。整合性が遅れるのは、APIキーの権限変更（最大1分）だけ
  - ただし、カスタムドメインで公開してCDNキャッシュを有効にした場合は、キャッシュの分だけ整合性が緩む。削除や上書きをしても、キャッシュが切れるかパージするまでは古いものが返る。404もキャッシュされる。bindingやS3 API経由のアクセスはキャッシュを通らないので影響しない
- **耐久性**: 年間イレブンナイン（99.999999999%）

## 用途

公式が挙げている用途:

- クラウドネイティブなアプリのストレージ、Webコンテンツ（画像・動画・静的アセット）
- ポッドキャストのエピソード
- データレイク（分析・ビッグデータ）。R2 Data CatalogでApache Icebergのカタログをバケットに組み込めば、Spark、Snowflake、R2 SQLからクエリできる
- 機械学習のモデル成果物、データセット、ログなど、バッチ処理の出力先

## ストレージクラス

| クラス | 最低保存期間 | 取り出し料金 | 向いているもの |
|---|---|---|---|
| Standard | なし | なし | 頻繁にアクセスするデータ（デフォルト） |
| Infrequent Access | 30日 | あり | アーカイブ、バックアップ、たまにしか見られないUGC |

- ライフサイクルルールでStandardからInfrequent Accessへ自動で移せる。逆方向（IA → Standard）はライフサイクルではできず、`CopyObject` で `x-amz-storage-class` を指定する
- IAに置いたオブジェクトは、30日以内に消したり置き換えたりしても30日分課金される

## 料金（2026年9月時点）

| 項目 | Standard | Infrequent Access |
|---|---|---|
| ストレージ | $0.015 / GB-月 | $0.01 / GB-月 |
| Class A操作（書き込み・list系） | $4.50 / 100万回 | $9.00 / 100万回 |
| Class B操作（読み込み系） | $0.36 / 100万回 | $0.90 / 100万回 |
| 取り出し | なし | $0.01 / GB |
| egress | 無料 | 無料 |

無料枠（Standardのみ）は、毎月ストレージ10GB-月、Class A 100万回、Class B 1,000万回。`PutObject` だけでなく `ListObjects` もClass A（高いほう）に入る。

## 配置

- デフォルトはAutomaticで、バケット作成リクエストを送った場所に近いリージョンに作られる
- Location Hint（`wnam`/`enam`/`weur`/`eeur`/`apac`/`oc`）で、主なアクセス元を指定できる。あくまでベストエフォート。同じ名前のバケットを作り直しても、最初の場所が使われる
- Jurisdictional Restrictions（現状は `eu`）を指定すると、GDPRなどのデータ所在地要件のために、その法域内での保存が保証される

## 公開・連携

- パブリックバケットにすると、中身をそのままインターネットに公開できる。`r2.dev` サブドメインはテスト用で、レート制限（毎秒数百リクエスト程度）がある。本番ではカスタムドメインをつなぎ、キャッシュやルールを設定する
- **イベント通知**: バケット内のオブジェクトが変わると[[cloudflare-queues]]にメッセージを送れる。prefix/suffixでフィルタでき、consumer Workerやpull consumerで処理する（例: アップロードされた画像のサムネイル生成）

## 制限（抜粋）

- 1オブジェクト: 最大5TiB弱（4.995TiB）
- 1リクエストでのアップロード: 5GiB弱まで。それより大きいものはマルチパート（最大10,000パート）
- 同じキーへの同時書き込み: 1回/秒（超えると429）
- バケット容量・オブジェクト数: 無制限。バケット数はアカウントあたり100万
- オブジェクトキーは1,024バイト、メタデータは8,192バイトまで

## [[cloudflare-developer-platform]]の中での位置づけ

ストレージのうち、大きなファイル・非構造化データの担当。構造化データなら[[cloudflare-d1]]、小さな設定値を高頻度で読むなら[[cloudflare-workers-kv]]。変更を[[cloudflare-queues]]に流して非同期処理につなげられる。

## 出典

- [Cloudflare R2 · Overview](https://developers.cloudflare.com/r2/)
- [Consistency model · Cloudflare R2 docs](https://developers.cloudflare.com/r2/reference/consistency/)
- [Storage classes · Cloudflare R2 docs](https://developers.cloudflare.com/r2/buckets/storage-classes/)
- [Pricing · Cloudflare R2 docs](https://developers.cloudflare.com/r2/pricing/)
- [Data location · Cloudflare R2 docs](https://developers.cloudflare.com/r2/reference/data-location/)
- [Limits · Cloudflare R2 docs](https://developers.cloudflare.com/r2/platform/limits/)
- [Event notifications · Cloudflare R2 docs](https://developers.cloudflare.com/r2/buckets/event-notifications/)

#cloudflare-workers #serverless #object-storage #s3
