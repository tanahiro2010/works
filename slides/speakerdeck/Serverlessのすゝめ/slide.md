---
marp: true
theme: gdg
paginate: true
size: 16:9
---

<script>
/* PowerPoint-style auto-shrink: iteratively reduce a slide's font size
   until its content stops overflowing. Also keeps the explicit opt-in
   <div class="fit">…</div> wrapper for finer-grained scaling. */
(() => {
  const MIN_FONT_PX = 12;
  const CODE_MIN_FONT_PX = 9;
  const STEP = 0.96;
  const MAX_ITERS = 40;
  const TOLERANCE = 1;
  let scheduled = false;
  const overflows = (el) => el.scrollHeight > el.clientHeight + TOLERANCE || el.scrollWidth > el.clientWidth + TOLERANCE;
  const shrinkElement = (el, minFontPx, shouldShrink = () => overflows(el)) => {
    if (!shouldShrink()) return;
    const base = parseFloat(getComputedStyle(el).fontSize) || 18;
    let size = base;
    for (let i = 0; i < MAX_ITERS && shouldShrink() && size > minFontPx; i++) {
      size *= STEP;
      el.style.fontSize = `${size}px`;
    }
  };
  const shrinkCodeBlocks = (section) => {
    for (const pre of section.querySelectorAll("pre")) shrinkElement(pre, CODE_MIN_FONT_PX, () => overflows(pre) || overflows(section));
  };
  const shrinkSection = (section) => {
    if (section.dataset.autofit === "skip") return;
    shrinkElement(section, MIN_FONT_PX, () => overflows(section));
  };
  const scaleFitBlocks = (root) => {
    for (const fit of root.querySelectorAll(".fit")) {
      if (!fit.scrollHeight) continue;
      const ratio = Math.min(1, fit.clientHeight / fit.scrollHeight);
      fit.style.transformOrigin = "top left";
      fit.style.transform = `scale(${ratio})`;
    }
  };
  const processSection = (section) => {
    if (!section.clientWidth || !section.clientHeight) return;
    scaleFitBlocks(section);
    shrinkCodeBlocks(section);
    shrinkSection(section);
  };
  const processVisibleSections = () => {
    scheduled = false;
    for (const section of document.querySelectorAll("section")) processSection(section);
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(processVisibleSections));
  };
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  new MutationObserver(schedule).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ["class"] });
  schedule();
})();
</script>

<style>
/* Set once per deck — drives the colored university name on every title slide. */
:root { --gdg-university: 'University of Osaka'; }
</style>

<style>
section:has(> .stage) { background-image: none !important; padding-right: 80px !important; }
.stage { width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; gap: 32px; box-sizing: border-box; }
.duo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.trio { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.card { min-height: 210px; padding: 30px 32px; border: 3px solid var(--gdg-line); border-radius: 8px; background: #FFFFFF; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; }
.card.blue { border-top: 10px solid var(--gdg-blue); }
.card.red { border-top: 10px solid var(--gdg-red); }
.card.green { border-top: 10px solid var(--gdg-green); }
.card.yellow { border-top: 10px solid var(--gdg-yellow); }
.card h3 { color: var(--gdg-ink); font-size: 34px; font-weight: 700; margin: 0 0 16px; }
.card p { color: var(--gdg-text); font-size: 25px; line-height: 1.45; margin: 0; }
.card .mini { font-size: 20px; color: var(--gdg-muted); }
.big-word { font-size: 82px; line-height: 1.15; font-weight: 700; color: var(--gdg-ink); text-align: center; }
.big-word .blue { color: var(--gdg-blue); }
.big-word .red { color: var(--gdg-red); }
.subline { margin-top: 24px; font-size: 32px; line-height: 1.35; font-weight: 500; text-align: center; color: var(--gdg-muted); }
.arrow { flex: 0 0 auto; font-size: 54px; font-weight: 700; color: var(--gdg-blue); }
.flow-box { flex: 1 1 0; min-width: 0; min-height: 150px; padding: 24px 18px; border: 3px solid var(--gdg-blue); border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 27px; line-height: 1.3; font-weight: 700; box-sizing: border-box; }
.flow-box.green { border-color: var(--gdg-green); }
.flow-box.yellow { border-color: var(--gdg-yellow); }
.flow-box.red { border-color: var(--gdg-red); }
.stack { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.layer { padding: 13px 24px; border-radius: 6px; color: #FFFFFF; text-align: center; font-size: 25px; font-weight: 700; }
.layer.app { background: var(--gdg-blue); }
.layer.runtime { background: var(--gdg-green); }
.layer.os { background: #5F6368; }
.layer.network { background: #3C4043; }
.layer.hardware { background: var(--gdg-ink); }
.muted-layer { opacity: 0.22; }
.badge { display: inline-block; padding: 8px 16px; border-radius: 999px; background: var(--gdg-surface); color: var(--gdg-muted); font-size: 24px; font-weight: 700; }
.checklist { width: min(940px, 100%); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.check { padding: 18px 24px; border-left: 8px solid var(--gdg-yellow); background: #FFFFFF; font-size: 27px; font-weight: 600; }
.terminal { width: min(930px, 100%); padding: 32px 40px; border-radius: 8px; background: #1F1F1F; color: #F8F9FA; font-family: 'Roboto Mono', 'SF Mono', Menlo, Consolas, monospace; font-size: 27px; line-height: 1.65; box-sizing: border-box; }
.terminal .prompt { color: #81C995; }
.terminal .cmd { color: #8AB4F8; }
.terminal .comment { color: #9AA0A6; }
.small-note { font-size: 25px; color: var(--gdg-muted); text-align: center; }
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# **Serverless**のすゝめ

## Serverlessとオンプレの比較を添えて

Hirohisa Tanaka · 2026/09/30

---

<!-- _class: lead -->

# どうして自宅鯖なんてするの？

Serverlessの方が楽では？

---

<!-- _class: lead -->

# 面白そうだったから

---

## Serverlessを自分の言葉でいうと

<div class="stage"><div>
  <div class="big-word" style="font-size: 64px;">サーバーを触らずに<br><span class="blue">サービスを公開できる</span></div>
  <div class="subline">OS・ネットワーク・物理マシンの管理はプラットフォームに任せます</div>
</div></div>

---

## 今回の「オンプレ」

<div class="stage"><div>
  <div class="big-word" style="font-size: 70px;"><span class="red">学校に置いた</span><br>自分のサーバー</div>
  <div class="subline">企業のデータセンターではなく、個人で管理する1台を指します</div>
</div></div>

---

## 比べたのはこの5つ

<div class="stage" style="flex-direction: column; gap: 24px;">
  <div style="font-size: 46px; font-weight: 700; color: var(--gdg-blue);">コスト　・　開発のしやすさ</div>
  <div style="font-size: 46px; font-weight: 700; color: var(--gdg-green);">スケール　・　運用の難しさ</div>
  <div style="font-size: 46px; font-weight: 700; color: var(--gdg-red);">セキュリティ</div>
</div>

---

## 実際に使った環境

<div class="stage">
<table style="width: 100%; font-size: 25px;">
  <thead><tr><th></th><th>自分のサーバー</th><th>Serverless</th></tr></thead>
  <tbody>
    <tr><td>実行環境</td><td>Xeon E3-1200 v2 / 32GB RAM</td><td>Vercel 無料枠</td></tr>
    <tr><td>データ</td><td>SSD 1TB + HDDたくさん</td><td>Neon / Supabase 無料枠</td></tr>
    <tr><td>管理</td><td>Ubuntu Server 20.04から自分で</td><td>各プラットフォームに任せる</td></tr>
  </tbody>
</table>
</div>

---

<!-- _class: section -->

# 実例「やすみ？」

---

## 自分で面倒を見る範囲

<div class="stage" style="align-items: stretch;">
  <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 16px;"><div class="flow-box">Webアプリ「やすみ？」</div><div class="arrow" style="text-align: center; transform: rotate(90deg);">→</div><div class="flow-box green">Docker Compose</div></div>
  <div class="arrow">→</div>
  <div class="stack" style="flex: 1; justify-content: center;"><div class="layer app">アプリ</div><div class="layer runtime">Docker</div><div class="layer os">Ubuntu</div><div class="layer network">ネットワーク</div><div class="layer hardware">ハードウェア</div></div>
</div>

---

<!-- _class: lead -->

# デプロイしたい

ただそれだけなのに……

---

## オンプレの CI/CD

<div class="stage"><div class="flow-box">GitHub Actions</div><div class="arrow">→</div><div class="flow-box green">Self-hosted<br>Runner</div><div class="arrow">→</div><div class="flow-box yellow">Docker Build</div><div class="arrow">→</div><div class="flow-box red">Deploy</div></div>

<p class="small-note">「pushしたらデプロイ」の前に、Runnerの登録・権限・Secrets・Docker操作・死活監視が必要でした</p>

---

## Serverlessの CI/CD

<div class="stage"><div class="flow-box">GitHubに<br>push</div><div class="arrow">→</div><div class="flow-box green" style="flex: 1.35;">Build / Deploy<br><span style="font-size: 24px; color: var(--gdg-muted);">プラットフォーム側</span></div><div class="arrow">→</div><div class="flow-box yellow">公開</div></div>

<p class="small-note">GitHubと連携すれば、私が面倒を見るのはほぼアプリだけです</p>

---

## 同じアプリでも管理範囲が違います

<div class="stage duo">
  <div class="stack"><span class="badge" style="align-self: center;">Serverless</span><div class="layer app">アプリ</div><div class="layer runtime muted-layer">ランタイム</div><div class="layer os muted-layer">OS</div><div class="layer network muted-layer">ネットワーク</div><div class="layer hardware muted-layer">ハードウェア</div></div>
  <div class="stack"><span class="badge" style="align-self: center;">オンプレ</span><div class="layer app">アプリ</div><div class="layer runtime">ランタイム</div><div class="layer os">OS</div><div class="layer network">ネットワーク</div><div class="layer hardware">ハードウェア</div></div>
</div>

---

<!-- _class: lead -->

# 「再起動するだけ」が結構重い

---

## サーバー再起動後の確認

<div class="stage"><div class="checklist"><div class="check">Dockerコンテナは戻った？</div><div class="check">cloudflaredは起動した？</div><div class="check">DBは応答する？</div><div class="check">サイトは外から開ける？</div><div class="check">ログに異常はない？</div><div class="check">ダウンタイムは？</div></div></div>

<p class="small-note">再起動ボタンを押したあとは、1つずつ戻ったか確認します</p>

---

<!-- _class: lead -->

# Serverless は<br>Server **Less** ではない

---

## 「サーバーを考える範囲」を減らせます

<div class="stage"><div><div class="big-word"><span class="blue">サーバーはある</span></div><div class="subline">OS・ネットワーク・再起動・ハードウェアを<br>利用者が意識する場面が少ない</div></div></div>

---

## コストの考え方

<div class="stage">
<table style="width: 100%; font-size: 27px;">
  <thead><tr><th></th><th>Serverless</th><th>オンプレ</th></tr></thead>
  <tbody>
    <tr><td>始めるとき</td><td>無料枠から試せる</td><td>本体とストレージが必要</td></tr>
    <tr><td>動かすとき</td><td>利用量に応じて課金</td><td>電気代と回線費用</td></tr>
    <tr><td>壊れたとき</td><td>プラットフォーム側が管理</td><td>自分で修理・交換</td></tr>
  </tbody>
</table>
</div>

<p class="small-note">私のサーバーは学校設置のため電気代を直接払っていません。オンプレの電気代が無料という意味ではありません</p>

---

<!-- _class: section yellow -->

# オンプレの強み

---

## この自由度がやっぱり楽しい

<div class="stage" style="gap: 64px;">
  <div class="big-word" style="font-size: 66px; text-align: left; flex: 1;"><span class="blue">OSから</span><br>自分で触れる</div>
  <div style="font-size: 34px; line-height: 1.9; font-weight: 600; flex: 1;">好きなソフトを入れる<br>Dockerを好きに組む<br>PostgreSQLやRedisを立てる<br>常駐プロセスを動かす</div>
</div>

---

<!-- _class: invert -->

## SSHで「今」が見えます

<div class="stage"><div class="terminal"><div><span class="prompt">hiro@server:~$</span> <span class="cmd">docker ps</span></div><div><span class="prompt">hiro@server:~$</span> <span class="cmd">htop</span></div><div><span class="prompt">hiro@server:~$</span> <span class="cmd">journalctl -u docker</span></div><div><span class="prompt">hiro@server:~$</span> <span class="cmd">psql yasumi</span></div><div class="comment"># ログも設定も、その場で確認できます</div></div></div>

---

## Docker + Cloudflare Tunnel

<div class="stage"><div class="flow-box" style="flex: 0.85;">Internet</div><div class="arrow">→</div><div class="flow-box yellow" style="flex: 1.25;">Cloudflare<br>Tunnel</div><div class="arrow">→</div><div class="stack" style="flex: 1.7; gap: 12px;"><div class="layer app">app1.example.com → app1:3000</div><div class="layer runtime">app2.example.com → app2:8080</div><div class="layer os">api.example.com → api:4000</div></div></div>

<p class="small-note">ルーターで大量のポートを開けずに公開できます</p>

---

## 1台にたくさん載せられます

<div class="stage"><div class="stack" style="max-width: 700px;"><div class="layer app">サービス A</div><div class="layer runtime">サービス B</div><div class="layer os">サービス C</div><div class="layer network">サービス D</div><div class="layer hardware">1台のサーバー</div></div><div class="big-word" style="font-size: 62px; text-align: left; flex: 0.8;">「とりあえず<br>ここに載せる」</div></div>

---

## ただし落ちると全部落ちます

<div class="stage"><div class="flow-box red" style="font-size: 34px;">1台のサーバー<br>停止</div><div class="arrow" style="color: var(--gdg-red);">→</div><div class="stack" style="flex: 1.5; gap: 14px;"><div class="layer app">サービス A 停止</div><div class="layer runtime">サービス B 停止</div><div class="layer os">サービス C 停止</div></div></div>

<p class="small-note">CPU・RAM・ストレージもサービス同士で分け合います</p>

---

<!-- _class: section green -->

# 2つの「自由」

---

## 自由の向きが違います

<div class="stage duo" style="gap: 0; align-items: stretch;">
  <div style="min-height: 350px; padding: 28px 48px 24px 8px; border-right: 4px solid var(--gdg-line); text-align: center; display: flex; flex-direction: column; justify-content: center;"><div style="font-size: 30px; font-weight: 700;">Serverless</div><div class="big-word" style="font-size: 60px; margin: 24px 0;"><span class="blue">管理からの<br>自由</span></div><div style="font-size: 28px; line-height: 1.45;">OS・再起動・スケールを<br>任せられます</div></div>
  <div style="min-height: 350px; padding: 28px 8px 24px 48px; text-align: center; display: flex; flex-direction: column; justify-content: center;"><div style="font-size: 30px; font-weight: 700;">オンプレ</div><div class="big-word" style="font-size: 60px; margin: 24px 0;"><span class="red">制約からの<br>自由</span></div><div style="font-size: 28px; line-height: 1.45;">OS・Docker・ネットワークを<br>自分で決められます</div></div>
</div>

---

## どちらを選ぶ？

<div class="stage">
<table style="width: 100%; font-size: 26px;">
  <thead><tr><th>Serverlessを選びやすい</th><th>オンプレ / VPSを選びやすい</th></tr></thead>
  <tbody>
    <tr><td>Webアプリ / API / Bot</td><td>長時間実行 / 常駐プロセス</td></tr>
    <tr><td>Cron処理</td><td>動画処理 / 大容量ストレージ</td></tr>
    <tr><td>アクセス量が読めない</td><td>特殊なミドルウェアが必要</td></tr>
  </tbody>
</table>
</div>

---

## 両方使って分かったこと

<div class="stage"><div><div class="big-word" style="font-size: 66px;">Serverlessは<br><span class="blue">面倒を肩代わり</span>している</div><div class="subline">CI/CD ・ OS更新 ・ ネットワーク ・ DB ・ ログ ・ 障害対応</div></div></div>

---

## それでもオンプレを使う理由

<div class="stage"><div><div class="big-word"><span class="red">自分で触れる</span></div><div class="subline">SSH ・ Docker ・ OS ・ DB ・ ネットワーク</div><div class="subline" style="font-size: 42px; color: var(--gdg-ink); font-weight: 700;">サーバーそのものが教材になります</div></div></div>

---

<!-- _class: lead -->

<div style="font-size: 50px; line-height: 1.4; font-weight: 600;">Q. こんなに面倒なのに、<br>なぜオンプレを使うの？</div>

<div style="margin-top: 42px; font-size: 64px; line-height: 1.2; font-weight: 700; color: var(--gdg-red);">A. 面白いから</div>

---

<!-- _class: lead -->

# 結局どちらも使います

Serverlessでサービスを作り<br>オンプレでサーバーを楽しみます

---

<!-- _class: lead -->

# Thank you!

Serverlessもオンプレも面白いです!
