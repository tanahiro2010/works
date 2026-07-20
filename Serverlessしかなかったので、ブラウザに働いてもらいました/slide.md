---
marp: true
theme: default
paginate: true
size: 16:9

style: |
  section {
    font-family: "BIZ UDPGothic","Noto Sans JP",sans-serif;
    background: #fafcff;
    color: #222;
    padding: 60px;
  }

  h1 {
    color:#2563eb;
    font-size:48px;
    margin-bottom:0.3em;
  }

  h2 {
    color:#2563eb;
  }

  strong{
    color:#2563eb;
  }

  code {
    background:#eef4ff;
    color:#1d4ed8;
  }

  pre {
    border-radius:16px;
    border:1px solid #dbeafe;
    background:#f8fbff;
    padding:18px;
  }

  blockquote{
    border-left:6px solid #2563eb;
    color:#444;
    background:#f4f8ff;
    padding:12px 20px;
  }

  table{
    font-size:24px;
  }

  .center{
    text-align:center;
  }

  .big{
    font-size:52px;
    font-weight:bold;
  }

  .small{
    font-size:22px;
    color:#666;
  }

  .accent{
    color:#2563eb;
    font-weight:bold;
  }

  .flow-row{
    display:flex;
    align-items:stretch;
    justify-content:center;
    gap:12px;
    margin-top:28px;
  }

  .flow-node{
    flex:1;
    min-width:0;
    border:2px solid #bfdbfe;
    border-radius:14px;
    background:#ffffff;
    padding:16px 12px;
    text-align:center;
    box-shadow:0 8px 18px rgba(37,99,235,.08);
  }

  .flow-node strong{
    display:block;
    font-size:23px;
    line-height:1.25;
  }

  .flow-node span{
    display:block;
    margin-top:8px;
    font-size:17px;
    color:#555;
    line-height:1.35;
  }

  .flow-arrow{
    display:flex;
    align-items:center;
    justify-content:center;
    color:#2563eb;
    font-size:34px;
    font-weight:700;
    min-width:34px;
  }

  .compact-flow{
    display:grid;
    grid-template-columns:1fr auto 1fr auto 1fr;
    align-items:center;
    gap:12px;
    margin-top:24px;
  }

  .endpoint{
    display:inline-block;
    border:2px solid #bfdbfe;
    border-radius:12px;
    background:#fff;
    padding:10px 18px;
    color:#1d4ed8;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:22px;
  }

---

# Serverlessしかなかったので、ブラウザに働いてもらいました

### PoWでランキングを守ってみた話

<div class="small">

Serverless LT

</div>

---

# 自己紹介

## 田中博悠 / tanahiro2010

- 三田学園高等学校 1年生
- TypeScript / Ruby
- Web / CLI
- 個人開発
- OSSに少し貢献
- 小説も書く

---

<div class="center">

# 皆さん

<div class="big">

自分の謎のこだわりと

環境制限のせいで

暴走したこと、ありますか？

</div>

</div>

---

<div class="center">

# 僕はあります

## ランキングを作りたかっただけなんです

</div>

---

# 作ったもの

## 「なんでも問題集」

匿名で問題を投げるサイト

|技術|採用|
|---|---|
|Frontend|Next.js|
|Database|Neon(PostgreSQL)|
|Hosting|Vercel|

> **全部サーバーレス**

---

# 機能は素朴

誰でも匿名で

問題を作って投げる場所

- 問題の作成
- 公開
- 解く
- ランキング

<div class="center">

## 力を入れたのは、解く場所とランキング

つまり今回の本題。

</div>

---

# 問題

## 解かれた数ランキングを作りたい

ぶっちゃけ、素直に増やすと死ぬ

<div class="compact-flow">

<div class="flow-node">
<strong>POST /solve</strong>
<span>解いた扱い</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>while(true)</strong>
<span>fetch連打</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>ランキング終了</strong>
<span>数字が壊れる</span>
</div>

</div>

<div class="center">

## APIだけだと弱い

</div>

---

# どうする？

- ログイン？
- CAPTCHA？
- Turnstile？
- Rate Limit？

<div class="center">

## どれも重い

</div>

---

# サーバーレスの縛り

- 重い処理は無理
- CPU時間が怖い
- DB直撃も怖い
- 課金も怖い
- でもログインは嫌

---

# 現実はもっと泥

- 起動待ちに怯える
- 権限設定で詰む
- ログ追跡がつらい
- 課金グラフを見る
- 夜中に眉間が寄る

---

<div class="center">

# 結論

## ブラウザに働かせる

</div>

---

<div class="center">

# PoWで殴る

</div>

以前Discord Botで

PoWを書いた記憶が蘇った。

---

# 全体の流れ

<div class="flow-row">

<div class="flow-node">
<strong>Browser</strong>
<span>お題を取る</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>PoW計算</strong>
<span>nonce探し</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>Verify</strong>
<span>結果を投げる</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>Server検証</strong>
<span>一瞬で見る</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>ランキング更新</strong>
<span>通れば加算</span>
</div>

</div>

---

# Challenge取得

<div class="endpoint">GET /api/works/:id/challenges</div>

返すもの

- prefix
- token(JWT)

端末で難易度を変える

- PC
- スマホ

---

# 検証

<div class="endpoint">POST /api/works/:id/challenges/:challengeId</div>

<div class="compact-flow">

<div class="flow-node">
<strong>送信</strong>
<span>nonce / token</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>サーバーで検証</strong>
<span>条件だけ見る</span>
</div>

<div class="flow-arrow">→</div>

<div class="flow-node">
<strong>ランキング更新</strong>
<span>成功だけ反映</span>
</div>

</div>

---

# 完璧？

<div class="center">

# もちろん穴はある

</div>

- UA偽装
- Bot突破
- 端末判定は雑
- 本気の攻撃は無理

でも、今回の狙いは

> **大量送信のコストを上げる**

ここだけ。

---

<div class="center">

# 実は……

</div>

## PoWを書きたかった

これが理由の半分くらい。

個人開発だからこそ

「面白そう」

で突っ込めるのが最高。

---

<div class="center">

# サーバーレスだから

# 「できない」

# ではなく

# **どう実現する？**

</div>

---

<div class="center">

# ご清聴ありがとうございました

GitHub・質問などぜひ

</div>
