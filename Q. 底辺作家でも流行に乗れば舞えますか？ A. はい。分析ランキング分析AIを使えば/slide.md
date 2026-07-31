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
/* This is a DemoStage personal talk, not a GDG deck — hide the GDG brand block. */
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

/* Center content slides both ways instead of letting them hug the top-left,
   and size text up so a short slide doesn't read as a small clump floating
   in empty space. */
section:not(.title):not(.lead):not(.split):not(.section):not(.invert) {
  background-image: none !important;
  padding-right: 80px !important;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 26px;
}

section:not(.title):not(.lead):not(.split):not(.section):not(.invert) h1,
section:not(.title):not(.lead):not(.split):not(.section):not(.invert) h2 {
  margin-left: auto;
  margin-right: auto;
}

section:not(.title):not(.lead):not(.split):not(.section):not(.invert) ul,
section:not(.title):not(.lead):not(.split):not(.section):not(.invert) ol {
  display: inline-block;
  text-align: left;
  margin-left: 0;
}

.tiny-note {
  color: var(--gdg-muted);
  font-size: 0.7em;
  font-weight: 400;
  line-height: 1.4;
  margin-top: 10px;
}

.profile {
  display: grid;
  grid-template-columns: 220px minmax(360px, 1fr);
  gap: 40px;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  margin: 20px auto 0;
  text-align: left;
}

.profile img {
  width: 220px;
  height: 220px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 16px 38px rgba(32, 33, 36, 0.18);
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# Q. 底辺作家でも流行に乗れば舞えますか？

## A. **はい**。分析ランキング分析AIを使えば

DemoStage / 田中博悠 (tanahiro2010)

---

## 自己紹介

<div class="profile">

<img src="img/tanaka.png" alt="田中博悠の写真">

<div>

名前: **田中博悠**（たなかひろひさ） / tanahiro2010
学校: 三田学園高等学校 1年生

趣味: 読書 / バンジージャンプ / プログラミング
称号: **サブカル性癖博士**（怪文書執筆で読者から贈呈されました）

最近: 一緒にバンジー飛んでくれる人を探してます

</div>

</div>

---

## 所属

- **GDG Greater Kwansai**
  Build with AIというイベントの後、Twitterで「運営参加してみたいな」と言い続けていたら誘われました
- **小説愛好会**
  小説家さんとワイワイ書きたくて、自分で立ち上げたコミュニティ
- **UniSchool**（unischool.jp）
  中高生が立ち上げた、学生の学びと学校を支える事業グループ。CTSとして参加中

---

## 小説愛好会について

小説家さんとワイワイしながら書きたくて、自分で立ち上げたコミュニティです

- 私の人見知り / コミュ障 が故に現在は申請制のクローズドサーバー
- 商業作家さんも在籍していて、学びが多い
- 今回開発したプログラムは、そこのメンバーの悩みから着想を得た

---

<!-- _class: lead -->

# 皆さん、逆張りをしたことってありますか？

---

## ずっと流行に逆張りしてきました

趣味で小説を書くとき、いつも流行には背を向けてきました

---

## なぜなら、最近の流行というのは...

- 大した努力もせずに神様からチート能力もらってハーレム
  - そしてそのチート能力には代償もない
- もしくはなんらかのざまぁが必ずあったり
- 主人公はほぼ正義
- ハッピーエンド

---

## 僕が好きな物語は...

- 主人公はどっちかというと悪
- 個人へのざまぁというより、人類へのざまぁ
- ハーレムなんてもってのほか、女性キャラは出てこない
- そしてほぼ、バッドエンド

---

## つまり、流行とは真逆の小説を書いてきました

- 自分の癖には刺さる、でも大衆には刺さらない
- ユニークな小説でウケている人もいる
- でもそれは文章力の化け物か、努力でフォロワーを増やしてきた人たち

---

## でも、多少は僕も読まれてみたい

ということで、気に入りませんが――**売名のために流行に乗ることにしました**

---

## 作ったもの

**小説家になろう公式APIを使ったランキング分析AI Bot**

- Daily / Monthly / Yearly / 四半期 のランキングをcronで分析
- 結果はDiscord webhookで指定チャンネルに送信
- 開発言語: **Go**
- 使用LLM: **Deni AI**（友人からの提供）
  - ChatGPT互換API、OpenAI / Anthropic / 主要ローカルLLMまで幅広く対応
  - 個人開発なので不安定なのはご愛嬌です

<p class="tiny-note">
ノクターン（R18小説）作家の友人から「そっちも分析して」と頼まれ対応。チャンネルを分けて権限制御しています<br>
リポジトリ: github.com/tanahiro2010/analyze_narou / 今は20人くらいが自分のサーバーで利用中
</p>

---

## 実際の分析結果

Botが送ってくる分析結果はこんな感じです

![w:820](img/embed.png)

---

## 実際にこれで小説を書いてみました

**「明日、婚約破棄される私が今夜やるべきたった一つのこと」**
https://ncode.syosetu.com/n4387mn/

投稿後**1日で100pt突破**
これまでの自分の小説ではありえない快挙です

流行に乗ることの大切さを、身をもって知りました

---

## じゃあ、全部流行に乗るのが正義なのか？

**答えはNoです**

- 書いた小説には、自分の好みの要素をちょっとだけトッピングしました
- したくもない流行にただ乗るだけだと、辛いだけ
- 何事も、妥協できる塩梅が大事です

妥協できない、もしくはしたくないって？

---

<!-- _class: lead -->

# それなら、君が流行になればいい

---

<!-- _class: lead -->

# Thanks for listening!

github.com/tanahiro2010/analyze_narou
