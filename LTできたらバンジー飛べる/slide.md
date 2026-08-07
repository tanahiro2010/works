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
:root { --gdg-university: ''; }

section {
  justify-content: center;
  text-align: center;
  padding: 76px 104px;
  font-size: 34px;
  line-height: 1.42;
  background-color: #f8f9fa;
}

section::before,
section.title::before,
section.section::before,
section.lead::before {
  content: none !important;
  background-image: none !important;
}

section::after,
section.title::after,
section.section::after,
section.lead::after {
  color: rgba(32, 33, 36, 0.45);
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) {
  background-image: none;
  padding-right: 104px;
}

h1, h2, h3 {
  border-bottom: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  font-size: 64px;
  line-height: 1.12;
}

h2 {
  font-size: 52px;
}

p {
  margin: 0.32em 0;
}

section.title {
  background-image: none;
  padding: 88px 110px;
  text-align: center;
}

section.title h1 {
  max-width: 100%;
  font-size: 82px;
  line-height: 1.08;
}

section.title p {
  font-size: 30px;
  font-weight: 600;
  margin-top: 34px;
  color: var(--gdg-muted);
}

section.lead {
  background-image: none;
  padding: 90px 116px;
}

section.lead h1 {
  font-size: 78px;
  line-height: 1.12;
}

section.lead p {
  font-size: 38px;
}

section.statement h1 {
  font-size: 84px;
}

section.equality h1 {
  font-size: 58px;
}

.eq-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 34px;
  margin-top: 38px;
}

.eq-box {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  border-radius: 16px;
  background: #fff;
  border-top: 10px solid var(--gdg-red);
}

.eq-box:nth-child(2) {
  border-top-color: var(--gdg-green);
}

.eq-code {
  font-family: 'Roboto Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 46px;
  font-weight: 800;
  letter-spacing: 0;
}

.eq-caption {
  font-size: 30px;
  font-weight: 700;
}

section.photo {
  color: #fff;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.55);
}

section.photo h1,
section.photo h2,
section.photo p {
  color: #fff;
}

section.profile {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 58px;
  align-items: center;
  text-align: left;
}

section.profile h1 {
  font-size: 58px;
  margin-left: 0;
  margin-bottom: 20px;
}

section.profile img {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-copy {
  align-self: center;
}

section.profile ul {
  font-size: 30px;
  margin-top: 18px;
}

section.compare table {
  width: 100%;
  font-size: 25px;
  margin-top: 20px;
}

section.compare th,
section.compare td {
  text-align: center;
  padding: 0.48em 0.5em;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
  margin-top: 40px;
}

.card {
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 26px;
  border-radius: 14px;
  background: #fff;
  border-top: 10px solid var(--gdg-blue);
  font-size: 38px;
  font-weight: 700;
  line-height: 1.25;
}

.card:nth-child(2) { border-top-color: var(--gdg-yellow); }
.card:nth-child(3) { border-top-color: var(--gdg-green); }

.duo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 38px;
  margin-top: 42px;
}

.duo > div {
  border-radius: 16px;
  background: #fff;
  border-top: 10px solid var(--gdg-blue);
  padding: 34px 28px;
  min-height: 230px;
}

.duo > div:nth-child(2) {
  border-top-color: var(--gdg-red);
}

.label {
  color: var(--gdg-muted);
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 18px;
}

.big {
  font-size: 50px;
  font-weight: 800;
}

section.qr img {
  width: 360px;
  height: 360px;
  image-rendering: pixelated;
  margin: 18px auto 8px;
}

section.qr h1 {
  font-size: 60px;
}

section.qr p {
  font-size: 30px;
}

section.thanks {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 44px;
  align-items: center;
  text-align: left;
}

section.thanks h1 {
  font-size: 64px;
  margin-left: 0;
}

section.thanks p {
  font-size: 32px;
}

section.thanks img {
  width: 190px;
  height: 190px;
  image-rendering: pixelated;
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# LTできたら<br>**バンジー飛べる**

tanahiro2010 / 田中博悠

---

<!-- _class: profile -->

<img src="img/tanaka.png" alt="田中博悠">

<div class="profile-copy">

<h1>田中博悠</h1>

<ul>
  <li>tanahiro2010</li>
  <li>三田学園高等学校 1年生</li>
  <li>株式会社KOMPEITO</li>
  <li>Alpha+ Project</li>
  <li>趣味: バンジー / 読書</li>
  <li>最近: スカイダイビングに思いを馳せています</li>
</ul>

</div>

---

<!-- _class: lead -->

# LTしたことって、<br>ありますか?

---

<!-- _class: lead -->

# 僕はあります

というか、今してます

---

<!-- _class: lead -->

# そこで思ったんです

LTって、バンジーと似てるよねって

---

![bg cover](img/flying_tanaka.jpg)

<!-- _class: photo -->

# 人前に立つワクワク

## 下を見るワクワク

---

# 感覚の正体

<div class="duo">

<div>
  <div class="label">LT前</div>
  <div class="big">たぶん<br>緊張</div>
</div>

<div>
  <div class="label">バンジー前</div>
  <div class="big">たぶん<br>恐怖</div>
</div>

</div>

---

<!-- _class: lead -->

# でも僕には

どっちもワクワクです

---

<!-- _class: lead statement -->

# LTできる人は、<br>バンジーも飛べる

---

<!-- _class: compare -->

# まず、LTとバンジー

| 観点 | LT | バンジー |
| --- | --- | --- |
| 始まる前 | 緊張がピーク | 恐怖がピーク |
| 始まった後 | 体感は一瞬 | 体感は一瞬 |
| 終わった後 | またやりたい | また飛びたい |

---

<!-- _class: equality -->

# `===` は成立しなくても<br>`==` は成立します（たぶん）

<div class="eq-grid">

<div class="eq-box">
  <div class="eq-code">LT !== バンジー</div>
  <div class="eq-caption">厳密には違います</div>
</div>

<div class="eq-box">
  <div class="eq-code">LT == バンジー</div>
  <div class="eq-caption">ワクワクは同じです</div>
</div>

</div>

---

<!-- _class: compare -->

# 他の登壇活動と比べます

| 種類 | 長さ | 始まる前 | 終わった後 |
| --- | --- | --- | --- |
| LT | 5〜10分 | ピーク | またやりたい |
| セミナー / カンファレンス登壇 | 30分〜2時間 | だんだん薄れる | じっくり達成感 |
| ハンズオン講師 | 1時間〜 | 運用が始まる | 無事に終えたい |

---

# 一番近いのは、LT

<div class="cards">

<div class="card">短い</div>
<div class="card">始まる前が<br>ピーク</div>
<div class="card">終わると<br>またやりたい</div>

</div>

---

<!-- _class: lead -->

# バンジーを飛ぶコツ

先に人前で「飛べる」と宣言します

後に引けなくなるので、面白い!

---

<!-- _class: qr -->

# 宣言受付

![フォームQR](img/form.png)

このあと懇親会で、バンジー行く宣言を受け付けます

半分ネタ、半分本気です

---

<!-- _class: thanks -->

<div>

# Thank you!

一緒にバンジー飛んでくれる人探してます

飛ばなくても懇親会で話しかけてください

</div>

![フォームQR](img/form.png)
