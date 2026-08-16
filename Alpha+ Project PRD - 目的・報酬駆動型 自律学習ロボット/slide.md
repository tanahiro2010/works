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
/* Set once per deck — drives the colored university name on every title slide. */
:root { --gdg-university: 'Purpose / Reward Driven Robotics'; }

/* This deck is not published under GDG. Keep the theme, remove GDG branding. */
section::before {
  content: 'Alpha+ Project';
  background-image: none !important;
  padding-left: 0 !important;
}

section.title::before {
  content: 'Alpha+ Project PRD';
  background-image: none !important;
  padding-left: 0 !important;
  left: 100px;
}

section.title::after {
  left: 100px;
}

section:not(.title):not(.lead):not(.section):not(.invert):not(.split) {
  padding-right: 80px;
  justify-content: center;
}

section.split,
section.invert {
  justify-content: center;
}

section.split {
  grid-template-rows: auto auto;
  align-content: center;
}

.wide {
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
}

.center-wide {
  width: 100%;
  min-height: 64vh;
  display: grid;
  place-items: center;
}

.center-wide h1,
.center-wide h2 {
  max-width: 1000px;
  text-align: center;
}

.hero-band {
  width: 100%;
  min-height: 270px;
  display: grid;
  align-items: center;
  background: #fff;
  border-top: 12px solid var(--gdg-blue);
  border-bottom: 12px solid var(--gdg-green);
  padding: 44px 64px;
}

.hero-band h1 {
  margin: 0;
}

.hero-band p {
  color: var(--gdg-muted);
  font-size: 28px;
  margin-top: 18px;
  text-align: center;
}

.hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  width: 78%;
  margin-top: 44px;
}

.hero-meta div {
  border-top: 6px solid var(--gdg-blue);
  background: #fff;
  border-radius: 8px;
  padding: 18px 20px;
}

.hero-meta strong {
  display: block;
  font-size: 22px;
}

.hero-meta span {
  color: var(--gdg-muted);
  font-size: 17px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  width: 100%;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  width: 100%;
}

.panel {
  background: #fff;
  border: 1px solid var(--gdg-line);
  border-radius: 8px;
  padding: 22px 24px;
}

.panel h3 {
  color: var(--gdg-ink);
  margin: 0 0 8px;
}

.panel p {
  margin: 0;
  color: var(--gdg-muted);
}

.tag {
  display: inline-block;
  color: var(--gdg-ink);
  background: var(--gdg-yellow);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 16px;
  font-weight: 700;
}

.flow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
  width: 100%;
}

.flow .step {
  background: #fff;
  border: 2px solid var(--gdg-line);
  border-radius: 8px;
  padding: 18px 16px;
  min-height: 150px;
}

.flow .step strong {
  display: block;
  margin-bottom: 8px;
  font-size: 22px;
}

.flow .step span {
  color: var(--gdg-muted);
  font-size: 18px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.metric {
  background: #fff;
  border-left: 8px solid var(--gdg-blue);
  border-radius: 8px;
  padding: 18px 18px 16px;
}

.metric strong {
  display: block;
  font-size: 34px;
  line-height: 1;
}

.metric span {
  color: var(--gdg-muted);
  font-size: 16px;
}

.mini-dashboard {
  font-family: 'Roboto Mono', 'SF Mono', Menlo, Consolas, monospace;
  background: #1f1f1f;
  color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  font-size: 18px;
  line-height: 1.45;
}

.bar {
  height: 18px;
  background: var(--gdg-line);
  border-radius: 999px;
  overflow: hidden;
  margin: 8px 0 18px;
}

.bar > i {
  display: block;
  height: 100%;
  background: var(--gdg-green);
}

.problem-map {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  width: 100%;
  align-items: stretch;
}

.stack {
  display: grid;
  gap: 16px;
}

.large-quote {
  background: #fff;
  border-left: 12px solid var(--gdg-red);
  border-radius: 8px;
  padding: 34px 38px;
  font-size: 34px;
  line-height: 1.35;
  font-weight: 700;
}

.large-quote span {
  display: block;
  color: var(--gdg-muted);
  font-size: 22px;
  font-weight: 500;
  margin-top: 18px;
}

.route-card {
  background: #fff;
  border: 1px solid var(--gdg-line);
  border-radius: 8px;
  padding: 20px 22px;
}

.route-card strong {
  display: block;
  font-size: 24px;
  margin-bottom: 6px;
}

.route-card span {
  color: var(--gdg-muted);
}

.video-card {
  background: #1f1f1f;
  color: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  min-height: 310px;
  display: grid;
  align-content: space-between;
}

.video-card .play {
  width: 0;
  height: 0;
  border-top: 42px solid transparent;
  border-bottom: 42px solid transparent;
  border-left: 70px solid var(--gdg-red);
  margin: 26px auto;
}

.video-card a {
  color: #8ab4f8;
  border-bottom-color: #8ab4f8;
  overflow-wrap: anywhere;
}

.source-note {
  color: var(--gdg-muted);
  font-size: 16px;
  margin-top: 14px;
}
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# **Alpha+** Project PRD

目的・報酬駆動型 自律学習ロボット

<div class="hero-meta">

<div><strong>Problem</strong><span>タスク追加のたびに制御を書き直す</span></div>
<div><strong>Approach</strong><span>目的と報酬で行動を学習する</span></div>
<div><strong>Demo</strong><span>人を探して安全に近づく</span></div>

</div>

---

<!-- _class: lead -->

<div class="center-wide">

<div class="hero-band">

# タスクごとに制御を書くのを、やめたい

<p>目的と報酬を渡し、行動の獲得はロボット自身に任せます</p>

</div>

</div>

---

## いま困っていること

<div class="wide grid-3">

<div class="panel">

### 実装コストが積み上がる

移動、回避、追跡、探索を追加するたびに、制御ロジックをほぼ作り直します

</div>

<div class="panel">

### 環境変化に弱い

部屋のレイアウトや障害物が変わると、作り込んだ前提がすぐ崩れます

</div>

<div class="panel">

### 検証基盤がない

目的と報酬だけで現実のロボットが行動を獲得できるか、試す場所がありません

</div>

</div>

---

<!-- _class: section yellow -->

# 00. 現在の問題と要望

---

## 大会に出たい。でも毎回、書くものが違う

<div class="wide problem-map">

<div class="stack">

<div class="route-card">
<strong>RoboCup</strong>
<span>競技ごとに使う言語、SDK、制御の考え方が変わります</span>
</div>

<div class="route-card">
<strong>Kibo RPC</strong>
<span>宇宙ロボット向けの処理フローを、また別の形で組みます</span>
</div>

<div class="route-card">
<strong>個人ロボット</strong>
<span>大会とは別に、自分用の遊べるロボットも作ってみたい</span>
</div>

</div>

<div class="large-quote">

毎回ロジックを書くの、正直めんどくさい

<span>目的だけ渡して、あとは学習してくれる土台がほしいです</span>

</div>

</div>

---

## 個人的には、かくれんぼがしたい

<div class="wide grid-2">

<div class="large-quote">

友人が少なくても、ひとりでも、ちゃんとかくれんぼが成立する相手がほしい

<span>探す、見つける、追う、逃げる。それを現実のロボットでやりたいです</span>

</div>

<div class="panel">

### だから欲しいもの

- 「人を探して」と言えば探索してくれる
- 見つけたら安全な距離まで近づく
- 部屋や障害物が変わっても調整できる
- 新しい遊びや競技にも転用できる

</div>

</div>

---

## 事例: ARC Raiders が示していること

<div class="wide grid-2">

<div>

<svg viewBox="0 0 520 330" width="100%" role="img" aria-label="ARC Raiders AI example">
  <rect x="20" y="24" width="480" height="282" rx="18" fill="#fff" stroke="#DADCE0" stroke-width="2"/>
  <circle cx="126" cy="162" r="42" fill="#4285F4"/>
  <text x="126" y="170" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">Player</text>
  <rect x="330" y="112" width="96" height="96" rx="18" fill="#EA4335"/>
  <text x="378" y="154" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">ARC</text>
  <text x="378" y="182" text-anchor="middle" font-size="15" fill="#fff">Machine</text>
  <path d="M178 162 C230 84 295 84 342 122" fill="none" stroke="#FBBC04" stroke-width="8" stroke-linecap="round"/>
  <path d="M178 162 C238 238 302 240 344 196" fill="none" stroke="#34A853" stroke-width="8" stroke-linecap="round"/>
  <text x="260" y="58" text-anchor="middle" font-size="20" font-weight="700" fill="#1A1A1A">環境に応じて動きが変わる</text>
  <text x="260" y="286" text-anchor="middle" font-size="17" fill="#5F6368">物理・移動学習・従来AIを組み合わせた例</text>
</svg>

</div>

<div>

### ポイント

- 敵AIが「学習しているように見える」ほど動的に振る舞う
- 実際、最初は簡単に倒せた敵も、今はレイドを組まないと厳しいほど強くなっています
- マッチ中も、戦闘が長引くほど探索・追跡・位置取りの圧が増していくように感じます
- プレイヤー行動やマッチ由来のデータが、改善ループやML訓練に使われている点が重要です
- このPRDでは「データから敵が強くなり、現実の体験も変わる」事例として扱います

<p class="source-note">参考: 80 Level / GamesRadar+ / ARC Raiders公式Fair Play記事</p>

</div>

</div>

---

## Arc Raiders の敵AIはどう作られているか

<div class="wide grid-2">

<div class="panel">

### 確定している技術要素

- 手作業アニメーションだけではなく、物理シミュレーションと強化学習を組み合わせています
- 多脚ロボットが地形や障害物に合わせて、自然に歩く・走る・崩れる・立て直す動きを獲得します
- ロコモーションはニューラルネットワークで制御し、上位の行動判断はゲーム側のシステムで扱います
- 状況ごとに学習済みの制御を切り替え、ゲームとして破綻しないように調整しています

</div>

<div class="panel">

### 面白いところ

- 急旋回で体を振るような、手作業では作りづらい挙動が自然に出ます
- 開発中には、想定外の歩き方やジャンプなど、人間の予想を超える動きも起きています
- 機械学習のリアリティと、デザイナーが意図した難易度・行動パターンを両立させています
- Alpha+でも「目的と報酬から行動が生える」体験を現実ロボットで試したいです

</div>

</div>

<p class="source-note">参考: 80 Level / GDC "Learning to Move" セッション / GamesRadar+</p>

---

## サンプル動画

<div class="wide grid-2">

<div class="video-card">

<div>

### ARC Raiders Short

<div class="play"></div>

</div>

<div>

サンプルとして見る動画  
<a href="https://www.youtube.com/shorts/qaXpNkgHPSE">youtube.com/shorts/qaXpNkgHPSE</a>

</div>

</div>

<div class="panel">

### この動画で見たい観点

- プレイヤーが「敵が賢くなった」と感じる瞬間
- 移動、追跡、位置取りがどう見えるか
- マッチ中に圧が増していくように見えるか
- それを現実ロボットの探索・追跡タスクへどう落とすか

<p>このスライドでは、実装の断定ではなく「目指したい体験の近い例」として扱います</p>

</div>

</div>

---

<!-- _class: section -->

# 01. 何を作るのか

---

## ゴールは「目的を与えるだけ」

<div class="wide grid-2">

<div>

### 人間が渡すもの

- 目的: この地点へ移動する
- 報酬: 近づくほど高くする
- 制約: 衝突しない、速度を守る

</div>

<div>

### ロボットが獲得するもの

- どこへ進むか
- どう障害物を避けるか
- 人間と無機物をどう区別するか
- 目的達成までの行動戦略

</div>

</div>

---

## 初期に検証する5タスク

| タスク | 見たい能力 | 成功のイメージ |
| --- | --- | --- |
| 指定地点への移動 | 目的地への接近 | 無衝突で到達 |
| 障害物回避 | 周囲の認識と回避 | ぶつからず迂回 |
| 人間の認識 | Perception | 人と物を区別 |
| 人間の追跡 | 継続的な再探索 | 一定距離を保つ |
| かくれんぼの鬼 | 探索と追跡の統合 | 発見して近づく |

---

<!-- _class: section yellow -->

# 02. システム構成

---

## Robot は薄く、AI はサーバーへ

<div class="wide flow">

<div class="step">
<strong>Robot Client</strong>
<span>センサー送信とモーター実行に集中</span>
</div>

<div class="step">
<strong>Communication</strong>
<span>映像・距離・姿勢を上げ、行動コマンドを返す</span>
</div>

<div class="step">
<strong>Server AI</strong>
<span>学習、推論、モデル更新をまとめて担当</span>
</div>

<div class="step">
<strong>Safety Layer</strong>
<span>速度制限、衝突防止、非常停止を独立制御</span>
</div>

<div class="step">
<strong>Real World</strong>
<span>実機経験を次の学習に戻す</span>
</div>

</div>

---

## 学習ループ

<div class="wide">

<svg viewBox="0 0 1040 420" width="100%" role="img" aria-label="Simulation Training Transfer Real World Fine-Tuning loop">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#4285F4" />
    </marker>
  </defs>
  <rect x="35" y="120" width="190" height="120" rx="12" fill="#fff" stroke="#4285F4" stroke-width="4"/>
  <text x="130" y="168" text-anchor="middle" font-size="24" font-weight="700">Simulation</text>
  <text x="130" y="202" text-anchor="middle" font-size="18" fill="#5F6368">大量試行</text>
  <rect x="300" y="120" width="190" height="120" rx="12" fill="#fff" stroke="#EA4335" stroke-width="4"/>
  <text x="395" y="168" text-anchor="middle" font-size="24" font-weight="700">Training</text>
  <text x="395" y="202" text-anchor="middle" font-size="18" fill="#5F6368">RL / IL / Curriculum</text>
  <rect x="565" y="120" width="190" height="120" rx="12" fill="#fff" stroke="#FBBC04" stroke-width="4"/>
  <text x="660" y="168" text-anchor="middle" font-size="24" font-weight="700">Transfer</text>
  <text x="660" y="202" text-anchor="middle" font-size="18" fill="#5F6368">Sim-to-Real</text>
  <rect x="830" y="120" width="190" height="120" rx="12" fill="#fff" stroke="#34A853" stroke-width="4"/>
  <text x="925" y="168" text-anchor="middle" font-size="24" font-weight="700">Fine-Tuning</text>
  <text x="925" y="202" text-anchor="middle" font-size="18" fill="#5F6368">実機経験</text>
  <path d="M225 180 H290" stroke="#4285F4" stroke-width="5" marker-end="url(#arrow)" fill="none"/>
  <path d="M490 180 H555" stroke="#4285F4" stroke-width="5" marker-end="url(#arrow)" fill="none"/>
  <path d="M755 180 H820" stroke="#4285F4" stroke-width="5" marker-end="url(#arrow)" fill="none"/>
  <path d="M925 250 C925 350 130 350 130 250" stroke="#4285F4" stroke-width="5" marker-end="url(#arrow)" fill="none"/>
  <text x="530" y="345" text-anchor="middle" font-size="24" font-weight="700" fill="#1A1A1A">実世界の結果を、次の学習へ戻します</text>
</svg>

</div>

---

## 報酬設計の例

<div class="wide grid-2">

<div class="panel">

### Positive Reward

- 目的地点に近づく
- 人間を検出する
- 一定距離まで安全に接近する
- 無衝突で移動し続ける

</div>

<div class="panel">

### Negative Reward

- 障害物へ衝突する
- 目的地から遠ざかる
- その場で停滞する
- 接触距離まで近づきすぎる

</div>

</div>

---

<!-- _class: section green -->

# 03. デモで見せたいもの

---

## AI Robot Hide-and-Seek Demo

<div class="wide grid-2">

<div>

### 成功条件

対象となる人間を発見し、接触せず、一定距離まで近づけること

### ここで統合される能力

- 探索
- 人物認識
- 障害物回避
- 安全な接近
- 継続的な再探索

</div>

<div class="mini-dashboard">

AI Robot Dashboard
------------------
Task        Find target person
Episode     1,245,392
Reward      384.21
Success     73.4%
Battery     82%
Target      FOUND
Distance    4.2m
Model       v27

</div>

</div>

---

## 学習状況は見えるようにする

<div class="wide">

<span class="tag">Monitoring</span>

<div class="metric-row">

<div class="metric"><strong>1.2M</strong><span>Episodes</span></div>
<div class="metric"><strong>73%</strong><span>Success Rate</span></div>
<div class="metric"><strong>327h</strong><span>Training Time</span></div>
<div class="metric"><strong>v27</strong><span>Model Version</span></div>

</div>

<h3>成功率</h3>
<div class="bar"><i style="width:73%"></i></div>

<h3>実機 Fine-Tuning</h3>
<div class="bar"><i style="width:28%; background: var(--gdg-yellow)"></i></div>

<p>途中経過、過去モデルとの比較、行動ログ、実機映像を同じ画面で確認します</p>

</div>

---

<!-- _class: section red -->

# 04. リスクと設計方針

---

## 失敗しそうなところを先に潰す

| リスク | 何が起きるか | 初期方針 |
| --- | --- | --- |
| 初期学習問題 | 移動すら学べない | デモ操作、既存制御、Curriculumを使う |
| Sim-to-Real Gap | 実機で動かない | Domain Randomizationと実機Fine-Tuning |
| 破損リスク | 衝突・転倒で壊れる | Safety ControllerをAIから独立させる |
| 通信遅延 | 回避や追跡が遅れる | 遅延もランダム化して学習に含める |
| Reward Hacking | 意図しない抜け道を選ぶ | 研究対象としてログと比較で追う |

---

## Non-Goals

<div class="wide grid-2">

<div class="panel">

### やらないこと

- 人間への危害を目的にしない
- 武器や攻撃装置を載せない
- 公道や無許可の屋外で走らせない
- ロボット本体をゼロから作らない

</div>

<div class="panel">

### 割り切ること

- 完全な汎用人工知能は目指さない
- すべてをEnd-to-Endだけで解かない
- ハードウェアの物理限界は前提として扱う
- 安全層は学習AIと分離します

</div>

</div>

---

<!-- _class: lead -->

<div class="center-wide">

<div class="hero-band">

# 現実世界を、学習環境として扱えるか?

<p>シミュレーションと実機経験を往復させ、Sim-to-Real Gapを縮めます</p>

</div>

</div>

---

<!-- _class: lead -->

<div class="center-wide">

<div class="hero-band">

# Thank you!

<p>Alpha+ Project PRD</p>

</div>

</div>
