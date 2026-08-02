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

  const overflows = (el) =>
    el.scrollHeight > el.clientHeight + TOLERANCE ||
    el.scrollWidth  > el.clientWidth  + TOLERANCE;

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
    for (const pre of section.querySelectorAll("pre")) {
      shrinkElement(pre, CODE_MIN_FONT_PX, () => overflows(pre) || overflows(section));
    }
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
  new MutationObserver(schedule).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  schedule();
})();
</script>

<style>
:root {
  --gdg-university: 'GDG Greater Kwansai';
}

section::before {
  content: 'Google I/O Extended Osaka 2026';
  background-image: none !important;
  padding-left: 0 !important;
}

section.title::before {
  content: '' !important;
  background-image: url('img/gdg_kwansai.png') !important;
  background-repeat: no-repeat !important;
  background-size: contain !important;
  background-position: left center !important;
  width: 260px !important;
  height: 80px !important;
  padding-left: 0 !important;
}

section.title::after {
  content: 'Google I/O Extended Osaka 2026' !important;
}

section.title {
  text-align: center !important;
  align-items: center;
}

section.title h1 {
  font-size: 76px;
  max-width: 92%;
  line-height: 1.1;
}

section.title h1,
section.title h2,
section.title p {
  margin-left: auto;
  margin-right: auto;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) {
  background-image: none !important;
  padding-right: 80px !important;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 30px;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h1,
section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h2 {
  display: block;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.18;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h2 {
  font-size: 1.65em;
  margin-bottom: 18px;
}

section.lead h1 {
  font-size: 2.7em !important;
  line-height: 1.16;
}

section.lead p {
  font-size: 1.5em !important;
  font-weight: 600;
}

.big {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.2;
}

.support {
  font-size: 1.26em;
  font-weight: 500;
  line-height: 1.45;
}

.note {
  color: var(--gdg-muted);
  font-size: 0.88em;
  line-height: 1.4;
}

.tiny-note {
  color: var(--gdg-muted);
  font-size: 0.68em !important;
  line-height: 1.35;
}

.profile {
  display: grid;
  grid-template-columns: 280px minmax(380px, 1fr);
  gap: 50px;
  align-items: center;
  justify-content: center;
  max-width: 880px;
  margin: 28px auto 0;
  text-align: left;
}

.profile img {
  width: 280px;
  height: 280px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 16px 38px rgba(32, 33, 36, 0.18);
}

.profile ul {
  font-size: 1.08em !important;
  line-height: 1.55 !important;
  margin: 0 !important;
}

.gdg-logo-small {
  width: 230px;
  max-height: 72px;
  object-fit: contain;
  display: block;
  margin: 0 auto 24px;
}

.flow {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  margin: 32px auto 0;
  max-width: 1050px;
}

.flow .node {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  min-height: 94px;
  padding: 16px 18px;
  border: 3px solid var(--gdg-blue);
  border-radius: 8px;
  background: #fff;
  font-size: 0.82em;
  font-weight: 700;
  line-height: 1.25;
}

.flow .node.green { border-color: var(--gdg-green); }
.flow .node.yellow { border-color: var(--gdg-yellow); }
.flow .node.red { border-color: var(--gdg-red); }

.arrow {
  display: flex;
  align-items: center;
  color: var(--gdg-blue);
  font-size: 28px;
  font-weight: 800;
}

.three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin: 28px auto 0;
  max-width: 980px;
  text-align: left;
}

.three > div {
  background: #fff;
  border-top: 6px solid var(--gdg-blue);
  border-radius: 8px;
  padding: 22px;
  min-height: 155px;
}

.three h3 {
  margin: 0 0 12px;
  font-size: 1.03em;
}

.three p {
  margin: 0;
  font-size: 0.72em;
  line-height: 1.45;
}

.compare {
  width: 94%;
  margin: 24px auto 0;
  border-collapse: collapse;
  font-size: 0.82em;
  text-align: left;
}

.compare th,
.compare td {
  border-bottom: 2px solid rgba(32, 33, 36, 0.12);
  padding: 15px 18px;
  vertical-align: top;
}

.compare th {
  color: var(--gdg-blue);
  font-size: 1.02em;
}

.compare td:first-child {
  font-weight: 700;
  color: var(--gdg-ink);
}

.two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  max-width: 1000px;
  margin: 30px auto 0;
  text-align: left;
}

.panel {
  border-radius: 8px;
  border-top: 6px solid var(--gdg-blue);
  background: #fff;
  padding: 25px;
  min-height: 210px;
}

.panel h3 {
  margin: 0 0 16px;
}

.panel ul {
  font-size: 0.78em !important;
  line-height: 1.5 !important;
}

.ok { border-top-color: var(--gdg-green); }
.ng { border-top-color: var(--gdg-red); }
.maybe { border-top-color: var(--gdg-yellow); }

.links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  max-width: 1000px;
  margin: 26px auto 0;
  text-align: left;
}

.link-box {
  border-left: 7px solid var(--gdg-blue);
  border-radius: 8px;
  background: #fff;
  padding: 18px 22px;
}

.link-box strong {
  display: block;
  font-size: 0.88em;
  margin-bottom: 6px;
}

.link-box code {
  font-size: 0.64em;
  word-break: break-all;
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# WebMCP、<br>実際どうなの？

## I/O Extendedで実装・登壇して分かったこと

田中博悠 / tanahiro2010

---

## 自己紹介

<div class="profile">
<img src="img/tanaka.png" alt="田中博悠の写真">

<ul>
<li>田中博悠 / tanahiro2010</li>
<li>株式会社KOMPEITO</li>
<li>GDG Greater Kwansai</li>
<li>Web / AI / なんか気になったやつ / とあるサイトで契約作家</li>
</ul>
</div>

---

## 最近の課題

<div class="big">
強制的にでも<br>一緒にバンジー飛んでくれる人を探してます
</div>

<div class="note">
※ 技術的な話には関係ありません
</div>

---

<!-- _class: lead -->

# WebMCPって、<br>知ってますか？

---

## 今日話すこと

<div class="flow">
<div class="node">MCP</div><span class="arrow">→</span>
<div class="node yellow">WebMCP</div><span class="arrow">→</span>
<div class="node green">Bridge</div><span class="arrow">→</span>
<div class="node red">個人の感想</div>
</div>

<div class="note">
技術解説半分、実装してみた体験談半分でいきます
</div>

---

## そもそもMCPとは？

<div class="big">
AI Agentに外部ツールをつなぐための<br>共通インターフェースです
</div>

<div class="three">
<div><h3>Agent</h3><p>使えるtoolを見つける</p></div>
<div><h3>Tool</h3><p>必要な処理を実行する</p></div>
<div><h3>Result</h3><p>結果をAgentへ返す</p></div>
</div>

---

## WebMCPとは？

<div class="big">
Webページの機能を<br>Agent向けtoolとして公開する仕組みです
</div>

- 宣言型: HTMLフォームにアノテーションしてtool化
- 命令型: JavaScriptからtoolを登録
- どちらも「ページの機能」をAgentに伝えます

---

## 何がうれしい？

<div class="two-col">
<div class="panel ok">
<h3>推測が減る</h3>
<ul>
<li>Agentがボタンや入力欄の意味を想像しなくていい</li>
<li>サイト側がtoolとして意図を宣言できる</li>
</ul>
</div>
<div class="panel ok">
<h3>実行が短くなる</h3>
<ul>
<li>クリックや入力を何手も再現しなくていい</li>
<li>tool callとして直接処理しやすい</li>
</ul>
</div>
</div>

---

## MCPとWebMCPの違い

<table class="compare">
<thead>
<tr><th></th><th>MCP</th><th>WebMCP</th></tr>
</thead>
<tbody>
<tr><td>対象</td><td>AI Agent全般</td><td>ブラウザ内蔵Agent中心</td></tr>
<tr><td>登録</td><td>Agent起動時に登録</td><td>ページを開いた時に登録</td></tr>
<tr><td>実行場所</td><td>ローカル / サービスサーバー</td><td>そのブラウザのそのページ内</td></tr>
</tbody>
</table>

---

## つまり何が違う？

<div class="big">
WebMCPは<br>「ページを開いている時だけ使える」
</div>

<div class="three">
<div><h3>タブを開く</h3><p>WebMCP toolが見える</p></div>
<div><h3>タブを離れる</h3><p>そのページのtoolは使えない</p></div>
<div><h3>戻ってくる</h3><p>また使えるようになる</p></div>
</div>

---

## 2026年8月時点のWebMCP

<div class="three">
<div><h3>提案中</h3><p>GoogleがChrome docsで紹介しているWeb標準ドラフト</p></div>
<div><h3>Origin Trial</h3><p>Chrome 149から参加可能</p></div>
<div><h3>ローカル検証</h3><p><code>chrome://flags/#enable-webmcp-testing</code></p></div>
</div>

<div class="tiny-note">
APIは今後変更される可能性があります
</div>

---

<!-- _class: lead -->

# で、ハンズオンでは<br>どうしたの？

---

## 作ったもの: WebMCP Bridge

<div class="big">
WebMCP対応ページを<br>MCP経由で既存Agentから呼べるようにしました
</div>

<div class="note">
やっていることは、わりとゴリ押しです
</div>

---

## なぜBridgeが必要だったか

<div class="three">
<div><h3>仕様の想定</h3><p>WebMCPはブラウザAgent向け</p></div>
<div><h3>ハンズオンの現実</h3><p>既存Agentから呼びたい</p></div>
<div><h3>解決策</h3><p>Extension + MCP Serverで橋渡し</p></div>
</div>

---

## WebMCP Bridgeの流れ

<div class="flow">
<div class="node">Webページ</div><span class="arrow">→</span>
<div class="node yellow">Extension</div><span class="arrow">→</span>
<div class="node">WebSocket</div><span class="arrow">→</span>
<div class="node green">MCP Server</div><span class="arrow">→</span>
<div class="node red">Agent</div>
</div>

<div class="note">
ページ内toolを検出して、Agentから呼べるtoolとして見せます
</div>

---

## 代表tool

<div class="two-col">
<div class="panel">
<h3><code>webmcp_discover_tools</code></h3>
<ul>
<li>WebMCP対応タブを調べる</li>
<li>ページ上のtool一覧を返す</li>
</ul>
</div>
<div class="panel">
<h3><code>webmcp_call_tool</code></h3>
<ul>
<li>toolIdとargsを指定する</li>
<li>Extension経由でページ内実行する</li>
</ul>
</div>
</div>

---

<!-- _class: lead -->

# ここまで作っておいて<br>言うのもなんですが

---

## メリットはちゃんとある

<div class="three">
<div><h3>推測が減る</h3><p>画面を読ませて当てるより、toolとして意図を渡せる</p></div>
<div><h3>実行時間が短い</h3><p>手順をなぞらず、目的の処理を直接呼びやすい</p></div>
<div><h3>目で確認できる</h3><p>ブラウザ上で動くので、結果を人間が見られる</p></div>
</div>

---

## でも個人的には刺さらなかった

<div class="two-col">
<div class="panel ng">
<h3>つらい</h3>
<ul>
<li>ブラウザ内蔵Agentを使う動機がまだ弱い</li>
<li>ページを開いている間だけ使える</li>
<li>既存Agent + ブラウザ操作との差が体感では大きくない</li>
</ul>
</div>
<div class="panel maybe">
<h3>惜しい</h3>
<ul>
<li>Agent全般から使えたら印象は変わりそう</li>
<li>WebがAgentに操作方法を名乗る思想は面白い</li>
</ul>
</div>
</div>

---

<!-- _class: lead -->

# 個人的には、<br>いらないと思うなぁ<br>（個人の感想）

---

## ただし

<div class="big">
ブラウザAgentを使い倒すドパガキには<br>かなり良いかも
</div>

<div class="support">
推測が減る、実行時間が短くなる<br>
この2つは普通に強いです
</div>

---

## 作ったもの

<img src="img/gdg_kwansai.png" class="gdg-logo-small" alt="GDG Kwansai logo">

<div class="links">
<div class="link-box"><strong>Codelab</strong><code>learn.gdgs.jp/webmcp-agent</code></div>
<div class="link-box"><strong>WebMCP Bridge MCP</strong><code>github.com/tanahiro2010/webmcp-bridge-mcp</code></div>
<div class="link-box"><strong>WebMCP Bridge Extension</strong><code>github.com/tanahiro2010/webmcp-bridge-extension</code></div>
<div class="link-box"><strong>connpass</strong><code>gdgkwansai.connpass.com/event/391029</code></div>
</div>

---

<!-- _class: lead -->

# Thanks for listening!
