---
title: Q. 底辺作家でも流行に乗れば舞えますか？ A. はい。分析ランキング分析AIを使えば
description: 小説家になろう公式APIを使ったランキング分析AI Botの紹介LT
author: 田中博悠 (tanahiro2010)
date: 2026-07-30
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
/* This is a DemoStage personal talk, not a GDG deck - hide the GDG brand block. */
section::before,
section.title::before {
  content: none !important;
  background-image: none !important;
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  padding: 0 !important;
}

:root {
  --talk-blue-soft: #E8F0FE;
  --talk-green-soft: #E6F4EA;
  --talk-red-soft: #FCE8E6;
  --talk-yellow-soft: #FEF7E0;
}

section {
  background: #F8F9FA;
}

section:not(.title):not(.lead):not(.split) {
  justify-content: center;
  align-items: center;
  padding-left: 96px;
  padding-right: 96px;
  text-align: center;
}

section.title {
  padding: 92px 94px 70px;
  background:
    linear-gradient(90deg, rgba(248, 249, 250, 0.98) 0%, rgba(248, 249, 250, 0.96) 45%, rgba(248, 249, 250, 0.1) 82%),
    url("img/novel-ai-hero.svg") center / cover no-repeat;
}

section.title h1 {
  max-width: 760px;
  font-size: 58px;
  line-height: 1.08;
  border-bottom: 0;
  padding-bottom: 0;
  margin-bottom: 24px;
}

section.title h2 {
  max-width: 690px;
  font-size: 34px;
  line-height: 1.35;
  font-weight: 500;
  color: var(--gdg-muted);
}

section.title .meta {
  margin-top: auto;
  color: var(--gdg-muted);
  font-size: 20px;
}

section.lead {
  background: #FFFFFF;
}

section.lead h1 {
  border-bottom: 0;
  font-size: 58px;
  line-height: 1.16;
  max-width: 1000px;
}

section.lead.accent-blue {
  background: var(--gdg-blue);
}

section.lead.accent-blue h1,
section.lead.accent-blue p {
  color: #FFFFFF;
}

section h2 {
  margin-bottom: 0.8em;
}

section:not(.title):not(.lead):not(.split) h2 {
  text-align: center;
}

section:not(.title):not(.lead):not(.split) h2,
section:not(.title):not(.lead):not(.split) > p,
section:not(.title):not(.lead):not(.split) > ul,
section:not(.title):not(.lead):not(.split) > ol,
section:not(.title):not(.lead):not(.split) > img,
section:not(.title):not(.lead):not(.split) > div {
  width: 100%;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  transform: translateX(72px);
}

.eyebrow {
  color: var(--gdg-blue);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.profile {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 44px;
  align-items: center;
  margin-top: 10px;
  max-width: 760px;
  text-align: left;
}

.profile img {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 50%;
  border: 10px solid #FFFFFF;
  box-shadow: 0 0 0 2px var(--gdg-line);
}

.profile-list {
  display: grid;
  gap: 16px;
}

.profile-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 18px;
  align-items: baseline;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gdg-line);
}

.label {
  color: var(--gdg-muted);
  font-size: 18px;
  font-weight: 700;
}

.large-copy {
  font-size: 32px;
  line-height: 1.45;
  max-width: 960px;
  margin-top: 34px;
  margin-bottom: 20px;
  text-align: center;
}

.two-up {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: stretch;
  max-width: 760px;
  text-align: left;
}

.panel {
  background: #FFFFFF;
  border: 1px solid var(--gdg-line);
  border-radius: 8px;
  padding: 24px 28px;
  text-align: left;
}

.panel.red {
  border-top: 8px solid var(--gdg-red);
}

.panel.green {
  border-top: 8px solid var(--gdg-green);
}

.panel.blue {
  border-top: 8px solid var(--gdg-blue);
}

.panel.yellow {
  border-top: 8px solid var(--gdg-yellow);
}

.panel h3 {
  color: var(--gdg-ink);
  font-size: 28px;
  margin-bottom: 12px;
}

.panel ul {
  margin-bottom: 0;
}

.big-number {
  color: var(--gdg-blue);
  font-size: 92px;
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0;
}

.metric-grid {
  display: grid;
  grid-template-columns: 0.88fr 1.12fr;
  gap: 42px;
  align-items: center;
  max-width: 760px;
  text-align: left;
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--gdg-line);
  border-radius: 8px;
  padding: 34px;
}

.url {
  color: var(--gdg-muted);
  font-size: 16px;
  white-space: nowrap;
}

.tiny-note {
  color: var(--gdg-muted);
  font-size: 16px;
  line-height: 1.5;
  margin-top: 16px;
}

.hero-image,
.diagram-image {
  width: 100%;
  display: block;
}

.future-grid {
  display: grid;
  grid-template-columns: 0.88fr 1.12fr;
  gap: 34px;
  align-items: center;
  max-width: 820px;
  transform: translateX(118px) !important;
  text-align: left;
}

.future-grid img {
  width: 100%;
  display: block;
}

.question-list {
  color: var(--gdg-muted);
  font-size: 17px;
  line-height: 1.55;
  margin-top: 14px;
}

.screenshot {
  display: block;
  max-width: 900px;
  max-height: 430px;
  margin: 8px auto 0;
  border-radius: 8px;
  border: 1px solid var(--gdg-line);
  background: #FFFFFF;
}

.closing-link {
  color: var(--gdg-muted);
  font-size: 24px;
  margin-top: 24px;
}

.no-border h1,
.no-border h2 {
  border-bottom: 0;
  padding-bottom: 0;
}

.center {
  text-align: center;
}

.center h2 {
  margin-left: auto;
  margin-right: auto;
}

section.split img {
  align-self: center;
}

section.split {
  align-content: center;
  padding-left: 96px;
  padding-right: 96px;
  text-align: center;
}

section.split > * {
  transform: translateX(56px);
}

section.split .side-copy {
  align-self: center;
  text-align: left;
}

section.split h2 {
  margin-bottom: 0.45em;
  text-align: center;
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# Q. 底辺作家でも流行に乗れば舞えますか？

## A. **はい**。ランキング分析AIを使えば

<p class="meta">DemoStage / 田中博悠 (tanahiro2010) / 2026-07-30</p>

---

## 自己紹介

<div class="profile">

<img src="img/tanaka.png" alt="田中博悠の写真">

<div>

<div class="profile-list">

<div class="profile-row"><span class="label">名前</span><span>田中博悠（たなかひろひさ） / tanahiro2010</span></div>
<div class="profile-row"><span class="label">学校</span><span>三田学園高等学校 1年生</span></div>
<div class="profile-row"><span class="label">趣味</span><span>読書 / バンジージャンプ / プログラミング</span></div>
<div class="profile-row"><span class="label">称号</span><span>サブカル性癖博士（怪文書執筆で読者から贈呈されました）</span></div>
<div class="profile-row"><span class="label">最近</span><span>一緒に バンジー / スカイダイビング 飛んでくれる人を探してます</span></div>

</div>

</div>

</div>

---

## 小説愛好会について

<div class="two-up">

<div>

小説家さんで構成されたコミュニティサーバーです

- メンバーのほとんどは小説を書く人
- エンジニアはほぼいない
- 今回のBotは、そこのメンバーの悩みから着想を得ました

</div>

<div class="panel blue">

### 今日の話
「好きなものを書く」と「読まれる型を知る」を、AIでどう橋渡しするか

</div>

</div>

---

<!-- _class: lead -->

# 皆さん、逆張りをしたことってありますか？

---

<!-- _class: lead -->

# 僕はずっと流行に逆張りしてきました

</div>

---

## 流行と好きな物語が、だいぶ逆でした

<div class="two-up">

<div class="panel red">

### 最近の流行

- 神様からチート能力
- 代償なしでハーレム
- 女性主人公
- なんらかのざまぁ
- ハッピーエンドに着地しやすい

</div>

<div class="panel blue">

### 僕が書く物語

- 主人公は人間から見たら悪
- 上位存在による人類の蹂躙とか
- 僕が女性を理解できないせいで女性キャラは出てこない
- メリーバッドエンド / バッドエンド

</div>

</div>

<p class="large-copy">好きなものは書ける。でも、ランキングの波とはだいぶ遠い</p>

---

<!-- _class: lead accent-blue -->

# でも、多少は僕も読まれてみたい

---

## だから作ったもの

<div class="two-up">

<div>

**小説家になろう公式APIを使ったランキング分析AI Bot**

- Daily / Monthly / Yearly / 四半期 のランキングをcronで分析
- 結果はDiscord webhookで指定チャンネルに送信
- 開発言語: **Go**
- 使用LLM: **Deni AI**

<p class="tiny-note">
Deni AI は友人からの提供。ChatGPT互換API、OpenAI / Anthropic / 主要ローカルLLMまで幅広く対応しています
</p>

</div>

<img class="diagram-image" src="img/bot-flow.svg" alt="ランキング分析Botの流れ">

</div>

<p class="tiny-note">
ノクターン（R18小説）作家の友人から「そっちも分析して」と頼まれ対応。チャンネルを分けて権限制御しています<br>
リポジトリ: github.com/tanahiro2010/analyze_narou / 今は20人くらいが自分のサーバーで利用中
</p>

---

## 実際の分析結果

Botが送ってくる分析結果はこんな感じです

<img class="screenshot" src="img/embed.png" alt="Discordに送られたランキング分析結果">

---

## 実際にこれで小説を書いてみました

<div class="metric-grid">

<div class="metric-card">

**「明日、婚約破棄される私が今夜やるべきたった一つのこと」**

<p class="url">ncode.syosetu.com/n4387mn</p>

</div>

<div>

<div class="big-number">100pt+</div>

投稿後 **1日で100pt突破**  
これまでの自分の小説ではありえない快挙です

流行に乗ることの大切さを、身をもって知りました

</div>

</div>

---

## 今後の展望

<div class="future-grid">

<div>

今のBotは、正直まだ **記憶を持たないBot** です

- 分析結果はDiscordに流れて終わり
- JSON保存はあるけど、横断的には使えていない
- 次は全部DBにためて、過去傾向まで話せるようにしたい

<div class="question-list">

「最近伸びているタグは?」<br>
「去年の同時期と比べて、タイトル傾向は?」<br>
「このあらすじは、どのジャンルに近い?」

</div>

</div>

<img src="img/future-agent.svg" alt="単発分析から小説分析エージェントへ進化する流れ">

</div>

---

## じゃあ、全部流行に乗るのが正義なのか？

<div class="two-up">

<div class="panel red">

### 答えは No です

したくもない流行にただ乗るだけだと、辛いだけです

</div>

<div class="panel green">

### ちょうどいい塩梅

書いた小説には、自分の好みの要素をちょっとだけトッピングしました

</div>

</div>

<p class="large-copy">何事も、妥協できる塩梅が大事です</p>

妥協できない、もしくはしたくないって？

---

<!-- _class: lead -->

# それなら、君が流行になればいい

---

<!-- _class: lead -->

# Thanks for listening!

<p class="closing-link">github.com/tanahiro2010/analyze_narou</p>
<p class="closing-link">
https://zenn.dev/tanahiro2010/articles/fdbebecbd9faa9
</p>
