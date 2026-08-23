---
created: 2026-08-21
---

# WebRTC

ブラウザやネイティブアプリ間でプラグイン不要のリアルタイム音声・映像・データ通信を実現するオープンな標準技術。W3C（ブラウザ向けAPI）とIETF（プロトコル）が共同で標準化している。

## 解決しようとした課題

WebRTC登場以前、ブラウザでのリアルタイム通信（音声・映像通話）は、Adobe FlashやJavaアプレット、SIP用のブラウザプラグイン、あるいはSkypeのような専用ネイティブアプリなど、プラグインや個別インストールを前提にした断片的なエコシステムに頼っていた。これらはバグやセキュリティリスクを抱えやすく、ユーザー体験も悪かった。

Googleは2010年にVoIP技術を持つスウェーデンの企業Global IP Solutions（GIPS）を買収し、2011年にエコーキャンセレーションなどのコア技術をオープンソース化。これをベースにプラグイン不要でブラウザネイティブにリアルタイム通信を行える仕組みとして標準化が進められたのがWebRTCの始まり。2021年にW3C勧告（Recommendation）となり正式な標準になった。

## 提供している機能

- **`getUserMedia`**: カメラ・マイクなどのメディアデバイスへのアクセスをブラウザの許可ダイアログ越しに取得し、`MediaStream`として扱う。
- **`RTCPeerConnection`**: 2つのエンドポイント間でピアツーピア接続を確立し、音声・映像ストリームを送受信するWebRTC APIの中核。
- **`RTCDataChannel`**: 音声・映像に限らず任意のバイナリ/テキストデータをピア間でやり取りできるチャネル。
- **NATトラバーサル**: ICE/STUN/TURNの仕組みにより、NATやファイアウォール越しでも可能な限り直接的な経路で接続を確立する。

## 仕組み

### シグナリングとSDP Offer/Answer

WebRTC自体は、接続を始める前に「相手が誰か」「どうやって繋ぐか」をやり取りする手段（シグナリング）を規定していない。シグナリングはWebSocketやHTTPなど任意の手段をアプリ側で用意する必要がある。

接続確立の流れ:

1. 発信側が`RTCPeerConnection`を作り、`createOffer()`でSDP（Session Description Protocol）形式のOffer（対応コーデック・メディア種別・ICE candidateなどを記述した接続提案）を生成する。
2. `setLocalDescription()`でOfferを自分のローカル設定として登録し、シグナリングチャネル経由で相手に送る。
3. 受信側は受け取ったOfferを`setRemoteDescription()`で登録し、`createAnswer()`でAnswerを生成、`setLocalDescription()`で登録してからシグナリングチャネルで発信側に返す。
4. 発信側はAnswerを`setRemoteDescription()`で登録する。

### ICE / STUN / TURN によるNATトラバーサル

多くのクライアントはNAT配下にあり、グローバルIPを直接持たない。ICE（Interactive Connectivity Establishment）はSTUNとTURNを組み合わせて、実際に通信可能な経路（candidate）を探索・選択する仕組み。

- **STUN (Session Traversal Utilities for NAT)**: NAT越しのホストが自分のグローバルIP・ポートを知るための軽量なプロトコル。両者がSTUNで得たグローバルアドレスを交換できれば、サーバーを経由せず直接P2P接続できる。
- **TURN (Traversal Using Relays around NAT)**: STUNだけでは直接経路を作れない（対称型NATなど）場合のフォールバック。TURNサーバーが両者の間でメディアを中継する。直接P2Pではなくなる分、サーバー負荷・帯域コストがかかる。
- ICEはSTUN/TURNを使って集めた複数のcandidateの中から、実際に疎通する最良の経路を選ぶ。

### セキュリティ

WebRTCは暗号化が必須で、無効化するオプションが存在しない。メディアストリームはSRTP、鍵交換とピア認証はDTLSが担い、DataChannelもDTLS上のSCTPとして暗号化された状態でやり取りされる。

## グループ通話でのスケーリング: Mesh / SFU / MCU

WebRTCのRTCPeerConnectionは1対1の接続が基本単位なので、3人以上のグループ通話では接続トポロジの設計が必要になる。

- **Mesh（フルメッシュP2P）**: 参加者全員が互いに直接接続する。サーバー不要でシンプルだが、参加者数の2乗で接続数・送信帯域が増えるため、実用上4〜6人程度が上限とされる。
- **SFU（Selective Forwarding Unit）**: 各参加者は自分のストリームをSFUサーバーに1本だけ送り、SFUがそれを他の参加者に転送する。ストリームの合成・デコードはせず転送のみなのでサーバー負荷が比較的軽く、数十〜100人規模の会議で使われる。
- **MCU（Multipoint Control Unit）**: サーバー側で全参加者のストリームをデコード・合成し、1本の合成済みストリームとして配信する。クライアント側の負荷は下がるがサーバーのCPUコストが大きい。

## 実装方法

### ブラウザ側の最小実装イメージ

シグナリングはWebSocketなど任意の手段で自前実装する。以下は発信側の骨格。

```javascript
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:turn.example.com:3478", username: "user", credential: "pass" },
  ],
});

// マイク・カメラの取得とトラック追加
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
stream.getTracks().forEach((track) => pc.addTrack(track, stream));

// ICE candidateが見つかるたびにシグナリングサーバー経由で相手に送る
pc.onicecandidate = (event) => {
  if (event.candidate) {
    signalingSocket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
  }
};

// 相手のトラックを受信したときの処理
pc.ontrack = (event) => {
  remoteVideoElement.srcObject = event.streams[0];
};

// Offerを生成してシグナリングサーバー経由で送信
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signalingSocket.send(JSON.stringify({ type: "offer", sdp: pc.localDescription }));
```

受信側は`signalingSocket`経由で受け取ったOfferを`setRemoteDescription()`し、`createAnswer()`→`setLocalDescription()`した上でAnswerを送り返す。相手から届いたICE candidateは`pc.addIceCandidate()`で登録する。

### サーバーサイドの実装

WebRTC自体はブラウザ間のP2P用プロトコル/APIであり、サーバーサイドのSDKは「シグナリングサーバー」「TURNサーバー」「SFU/MCU」いずれかの役割を実装するためのものになる。

- シグナリングサーバー: WebSocketサーバーでOffer/Answer/ICE candidateのJSONを中継するだけなので、任意の言語・フレームワークで自作できる。
- TURNサーバー: `coturn`のようなOSS実装をデプロイして使うのが一般的。
- SFU: `mediasoup`（Node.js）、`Janus`（C）、`LiveKit`（Go）、`Pion`（Go製WebRTCライブラリ）などのOSSがある。多くはブラウザとはWebRTCで、内部処理は各言語のライブラリで実装する。

## 出典

- [WebRTC: Real-Time Communication in Browsers - W3C](https://www.w3.org/TR/webrtc/)
- [WebRTC is now a W3C and IETF standard - web.dev](https://web.dev/articles/webrtc-standard-announcement)
- [10 Years after Inception, WebRTC Becomes an Official Web Standard - InfoQ](https://www.infoq.com/news/2021/04/webrtc-official-web-standard/)
- [Global IP Solutions - Wikipedia](https://en.wikipedia.org/wiki/Global_IP_Solutions)
- [Getting started with peer connections - webrtc.org](https://webrtc.org/getting-started/peer-connections)
- [Signaling | WebRTC for the Curious](https://webrtcforthecurious.com/docs/02-signaling/)
- [RTCPeerConnection: createOffer() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer)
- [Using WebRTC data channels - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels)
- [WebRTC Network Topology: Mesh, SFU, MCU - antmedia.io](https://antmedia.io/webrtc-network-topology/)

#webrtc #websocket #p2p #network #streaming
