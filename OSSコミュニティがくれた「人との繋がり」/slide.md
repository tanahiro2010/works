---
marp: true
theme: gdg
paginate: true
size: 16:9
---

<script>
(() => {
  const MIN_FONT_PX = 12;
  const CODE_MIN_FONT_PX = 9;
  const STEP = 0.96;
  const MAX_ITERS = 40;
  const TOLERANCE = 1;
  let scheduled = false;

  const overflows = (el) =>
    el.scrollHeight > el.clientHeight + TOLERANCE ||
    el.scrollWidth > el.clientWidth + TOLERANCE;

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
  --gdg-university: 'Kotob Community';
}

section::before {
  content: 'OSC2026 Kyoto';
  background-image: none !important;
  padding-left: 0 !important;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) {
  background-image: none !important;
  padding-right: 80px !important;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 31px;
}

section.title::before {
  content: 'Kotob Community' !important;
  background-image: none !important;
  padding-left: 0 !important;
}

section.title::after {
  content: 'OSC2026 Kyoto' !important;
}

section.title h1 {
  font-size: 68px;
  max-width: 92%;
}

section.title {
  text-align: center !important;
  align-items: center;
}

section.title h1,
section.title h2,
section.title p {
  margin-left: auto;
  margin-right: auto;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h1,
section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h2 {
  display: block;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.18;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) h2 {
  font-size: 1.72em;
  margin-bottom: 18px;
}

section.lead h1 {
  font-size: 2.45em;
  line-height: 1.16;
}

section.lead p {
  font-size: 1.25em;
  line-height: 1.45;
}

section.section h1 {
  font-size: 2.25em;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) ul,
section:not(.title):not(.lead):not(.section):not(.invert):not(.split) ol {
  display: inline-block;
  text-align: left;
  margin-left: 0;
  font-size: 1.08em;
  line-height: 1.52;
}

.big {
  font-size: 2.02em;
  font-weight: 700;
  line-height: 1.2;
}

.note {
  color: var(--gdg-muted);
  font-size: 0.9em;
}

.with-image .big {
  font-size: 1.45em;
}

.profile {
  display: grid;
  grid-template-columns: 270px minmax(360px, 1fr);
  gap: 48px;
  align-items: center;
  justify-content: center;
  max-width: 820px;
  margin: 28px auto 0;
  text-align: left;
}

.profile img {
  width: 270px;
  height: 270px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 16px 38px rgba(32, 33, 36, 0.18);
}

.profile ul {
  font-size: 1.1em !important;
  line-height: 1.55 !important;
}

.kotob-logo {
  width: 220px;
  display: block;
  margin: 24px auto 0;
}

.kotob-logo-small {
  width: 150px;
  display: block;
  margin: 18px auto 0;
}

.hero-img {
  width: 66%;
  max-height: 300px;
  object-fit: contain;
  display: block;
  margin: 24px auto 0;
}

.hero-img-wide {
  width: 74%;
  max-height: 320px;
  object-fit: contain;
  display: block;
  margin: 22px auto 0;
}

.hero-img-tall {
  width: 56%;
  max-height: 340px;
  object-fit: contain;
  display: block;
  margin: 22px auto 0;
}

.flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 36px;
}

.flow div {
  padding: 18px 24px;
  border: 2px solid var(--gdg-blue);
  border-radius: 12px;
  font-weight: 600;
  background: #fff;
}

.arrow {
  color: var(--gdg-blue);
  font-size: 36px;
  font-weight: 700;
}

.three {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 28px;
}

.three > div {
  background: #fff;
  border-top: 5px solid var(--gdg-blue);
  border-radius: 8px;
  padding: 24px;
  min-height: 150px;
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# OSSコミュニティが<br>くれた<br>「**人との繋がり**」

## 高校生の僕が登壇する理由

オープンソースカンファレンス2026 Kyoto  
田中博悠 / tanahiro2010

---

<!-- _class: lead -->

# 高校生の僕が<br>登壇する理由

---

## 今日話すこと

<div class="big">
登壇から始まったOSSの話です
</div>

<div class="flow">
<div>登壇</div><span class="arrow">→</span><div>出会い</div><span class="arrow">→</span><div>OSS</div>
</div>

---

## 自己紹介

<div class="profile">
<img src="img/tanaka.png" alt="田中博悠の写真">

<ul>
<li>田中博悠</li>
<li>tanahiro2010</li>
<li>三田学園高等学校</li>
<li>高校一年生</li>
</ul>
</div>

---

<!-- _class: lead -->

# 高校生です

---

## いらない情報

- 趣味: イベントにプロポーザルを出す
- 最近: 高槻でハッピーバンジー
- 座右の銘: **なければ作ればいいじゃない**
- 失敗しても別に死なん

---

<!-- _class: lead -->

# 恐れを知らず<br>継続を知らない

---

## 得意分野

<div class="three">
<div><h3>Web</h3><p>メインはWeb系</p></div>
<div><h3>OSS</h3><p>最近かなり寄り道中</p></div>
<div><h3>CLI / AI</h3><p>気になったら触る</p></div>
</div>

---

## KotobというOSSを作っています

僕と友人で作っているOSSです

<img src="img/kotob.png" class="kotob-logo" alt="Kotob logo">

<div class="note">
今日ブースで実物を触れます
</div>

---

## Kotobとは

<div class="big">
Gemini APIを使ったCLI翻訳ツール
</div>

<img src="img/kotob.png" class="kotob-logo-small" alt="Kotob logo">

---

## 今日ブースも出しています

<div class="big">
あなたの初OSSコントリビュート、<br>Kotobでやってみませんか?
</div>

<div class="note">
気になったら触りに来てください
</div>

---

## まだ単純な機能しかない

だからこそ

<div class="big">
ポテンシャルがでかい
</div>

<div class="note">
感想もIssueも、機能案も、かなり助かります
</div>

---

<!-- _class: lead -->

# 登壇する人って<br>怖くないですか?

---

## 登壇者のイメージ

<div class="big">
度胸がすごそう
</div>

<img src="img/presenter-stage.png" class="hero-img" alt="登壇のイメージ">

---

## そして思う

<div class="big">
ネタ、どこから持ってきてるの?
</div>

---

## 登壇そのものも怖い

- 失敗したらどうしよう
- 話が飛んだらどうしよう
- スライド事故ったらどうしよう

---

## ここで普通なら

<div class="big">
僕も最初は怖かったです
</div>

---

<!-- _class: lead -->

# そんなことは<br>言わないぜ

---

## 僕の場合

<div class="big">
怖さより好奇心が先に走った
</div>

---

<!-- _class: lead -->

# ただし<br>失敗は普通にしました

---

<!-- _class: with-image -->

## 失敗その1

<div class="big">
画面が共有されていませんでした
</div>

<img src="img/screen-share-fail.png" class="hero-img-wide" alt="画面共有に失敗したイメージ">

---

## 失敗その2

<div class="big">
話につまりました
</div>

---

## 失敗その3

<div class="big">
後半を先輩に交代しました
</div>

---

## 他にも

- 噛む
- 資料が未完成
- アドリブで押し切る
- そして反省する

---

<!-- _class: with-image -->

## 正直へこむ

<div class="big">
心が折れる一歩手前くらい
</div>

<img src="img/heart-before-break.png" class="hero-img-wide" alt="心が折れる一歩手前のイメージ">

---

<!-- _class: lead -->

# でも<br>登壇って楽しい

---

## 感想がもらえる

聞いてくれた人が反応してくれる

---

<!-- _class: with-image -->

## 話が弾む

懇親会で会話が生まれる

<div class="note">
未成年なので飲酒はしていません
</div>

<img src="img/community-chat.png" class="hero-img-wide" alt="イベント後に会話が生まれるイメージ">

---

## 失敗の見方

<div class="big">
失敗はあとで話せるネタになる
</div>

---

<!-- _class: lead -->

# 最初に登壇した<br>きっかけは?

---

## 技術イベント参加

<div class="big">
今年3月からでした
</div>

---

<!-- _class: with-image -->

## Build with AI

初参加はGDG Greater Kwansaiのイベント

<img src="img/buildwithai.png" class="hero-img-wide" alt="Build with AIイベント画像">

---

## イベント後

<div class="big">
運営って面白そう
</div>

---

## チラチラ作戦

<div class="big">
運営してみたいな
</div>

---

## そして

<div class="big">
GDGスタッフになりました
</div>

---

## スタッフの仕事

<div class="big">
登壇もあるらしい
</div>

---

## 面白そう

<div class="big">
じゃあLT会を探そう
</div>

---

<!-- _class: with-image -->

## 初登壇

<div class="big">
Serverless LT会
</div>

<img src="img/serverless_lt.png" class="hero-img-wide" alt="Serverless LT会の画像">

---

## 初登壇の結果

<div class="big">
事故は起きませんでした
</div>

---

<!-- _class: with-image -->

## 2回目の登壇

<div class="big">
個人開発紹介LT会
</div>

<img src="img/alone_develop.png" class="hero-img-wide" alt="個人開発LT会の画像">

---

## そこでトラブル

<div class="big">
ラスト1分で気づく
</div>

---

<!-- _class: lead -->

# もちろん<br>私は憤りました

---

<!-- _class: lead -->

# でも<br>そこで出会いがありました

---

## 出会った人

<div class="big">
Bokuchiの開発者さん
</div>

---

## きっかけの形

<div class="big">
登壇したから出会えた
</div>

---

## 気になった

<div class="big">
そのOSSを見に行った
</div>

---

## すると

<div class="big">
脆弱性っぽいものを見つけた
</div>

---

## ここから

<div class="flow">
<div>登壇</div><span class="arrow">→</span><div>出会い</div><span class="arrow">→</span><div>OSS貢献</div>
</div>

---

## 報告しました

見つけたものを開発者へ伝えました

<img src="img/report-handoff.png" class="hero-img-wide" alt="報告を手渡すイメージ">

---

## 受理されました

<div class="big">
GHSAをもらいました
</div>

---

<!-- _class: lead -->

# でも大事なのは<br>中身より繋がりです

---

## 詳細は話しません

<div class="big">
悪用できる話はしません
</div>

---

<!-- _class: lead -->

# 脆弱性報告は<br>相手を殴ることではない

---

## 最低限の線引き

- 勝手に攻撃しない
- 必要以上に触らない
- 公開前に晒さない
- 報告先のルールを見る
- わからなければ詳しい人へ

---

<!-- _class: lead -->

# OSS貢献って<br>なんだろう

---

## 昔のイメージ

<div class="big">
PRを出すこと?
</div>

---

<!-- _class: lead -->

# 実際は<br>入口はもっと広い

---

## 報告も貢献

<div class="big">
バグ報告も貢献です
</div>

---

## 脆弱性報告も

<div class="big">
直すための情報を渡す
</div>

---

## ドキュメントも

<div class="big">
誤字修正も翻訳も貢献です
</div>

---

## 感想も

<div class="big">
使った感想は開発者に届く
</div>

---

## 紹介も

<div class="big">
使ったものを誰かに伝える
</div>

---

## スターは?

<div class="big">
スターは応援
</div>

---

## Issueは?

<div class="big">
Issueは貢献の入口
</div>

---

## PRは?

<div class="big">
PRはその先の一歩
</div>

---

## つまり

<div class="big">
使う人もOSSの一部です
</div>

---

<!-- _class: lead -->

# 学生でも<br>実績がなくても入れます

---

## 最初の一歩

<div class="big">
気づいたことを1つ伝える
</div>

---

## Kotobの場合

<div class="big">
感想だけでも嬉しい
</div>

<img src="img/kotob.png" class="kotob-logo-small" alt="Kotob logo">

---

<!-- _class: lead -->

# これも<br>OSS貢献なんだ

---

<!-- _class: section yellow -->

# OSS活動で得たもの

---

## もらえたもの

<div class="big">
感謝状をもらえた
</div>

---

## コントリビューター

<div class="big">
5人のうちの1人になった
</div>

---

## 一番大きい物

<div class="big">
BokuchiのTシャツ
</div>

---

<!-- _class: lead -->

# でも<br>本当に大きいのは人でした

---

## 斉田さん

<div class="big">
OSS開発者と繋がれた
</div>

---

## 誘われる

<div class="big">
イベントに行く理由ができた
</div>

---

## OSCも

<div class="big">
この登壇も繋がりの延長です
</div>

---

## さらに出会う

<div class="big">
面白いOSSにまた出会う
</div>

---

## さらに貢献

<div class="big">
また報告する
</div>

---

## 知り合いが増える

<div class="big">
会いに行く理由が増える
</div>

---

## 無限ループ

<div class="flow">
<div>出会う</div><span class="arrow">→</span><div>触る</div><span class="arrow">→</span><div>伝える</div><span class="arrow">→</span><div>また会う</div>
</div>

<img src="img/community-loop.png" class="hero-img-wide" alt="OSSコミュニティの循環">

---

## 楽しくなる

<div class="big">
開発がひとりじゃなくなる
</div>

---

## 相談できる

<div class="big">
困った時に聞ける人が増える
</div>

---

## 人生の先輩

<div class="big">
少し先を歩く人に会える
</div>

---

## 実利もある

<div class="big">
機会が増えることもあります
</div>

---

## 本音

<div class="big">
未来の自分が少し楽になるかも
</div>

---

<!-- _class: lead -->

# 一番大きいのは

一緒に笑える人  
相談できる人  
人生の先輩

---

<!-- _class: section green -->

# タイトル回収

---

## 最初は

<div class="big">
好奇心でした
</div>

---

## 今は

<div class="big">
繋がった人に会いたい
</div>

---

## 驚かせたい

<div class="big">
登壇して知り合いを驚かせたい
</div>

---

## 話しかけてほしい

<div class="big">
自分から話すのは苦手なので
</div>

---

## そして本音

<div class="big">
あわよくば見つけてください
</div>

---

<!-- _class: lead -->

# でも戻る

一緒に開発を楽しむために

---

<!-- _class: lead -->

# OSSは<br>人と繋がる場所です

---

## 明日できる一歩

<div class="flow">
<div>触れる</div><span class="arrow">→</span><div>気づく</div><span class="arrow">→</span><div>伝える</div>
</div>

---

## Kotobなら

<div class="big">
Starも立派な貢献です
</div>

共同創設者の僕が認めます

<img src="img/kotob.png" class="kotob-logo-small" alt="Kotob logo">

---

## ブースにも

<div class="big">
初OSSコントリビュート、<br>Kotobでどうですか?
</div>

Kotobで何か作る / 感想をIssueで投げる  
まずはStarでも大歓迎です

---

<!-- _class: lead -->

# Thank you!

ありがとうございました
