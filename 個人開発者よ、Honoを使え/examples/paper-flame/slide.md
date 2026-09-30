---
marp: true
theme: default
paginate: true
size: 16:9
style: |

  :root {
    --pf-paper: #fffdf8;
    --pf-ink: #17110f;
    --pf-muted: #6d625e;
    --pf-soft: #f5eee6;
    --pf-line: #dfd2c7;
    --pf-flame: #e94724;
    --pf-flame-dark: #b72d18;
    --pf-code-bg: #211815;
    --pf-code-text: #f9efe7;
    --pf-serif: "Yu Mincho", "Hiragino Mincho ProN", "Source Han Serif JP",
      "Noto Serif CJK JP", serif;
    --pf-sans: "Inter", "Helvetica Neue", "Hiragino Sans", "Yu Gothic", Meiryo,
      sans-serif;
    --pf-mono: "SFMono-Regular", "Roboto Mono", "Cascadia Code", Consolas,
      monospace;
  }
  
  section {
    width: 1280px;
    height: 720px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
    padding: 76px 92px 78px;
    background:
      linear-gradient(90deg, rgba(233, 71, 36, 0.08) 0 2px, transparent 2px 100%),
      linear-gradient(180deg, rgba(223, 210, 199, 0.22) 0 1px, transparent 1px 100%),
      var(--pf-paper);
    background-size: 100% 100%, 100% 36px, 100% 100%;
    color: var(--pf-ink);
    font-family: var(--pf-sans);
    font-size: 27px;
    line-height: 1.58;
    letter-spacing: 0;
    word-break: keep-all;
    line-break: strict;
    overflow-wrap: anywhere;
  }
  
  section::before {
    content: "";
    position: absolute;
    inset: 24px;
    border: 1px solid rgba(183, 45, 24, 0.32);
    pointer-events: none;
  }
  
  section::after {
    color: var(--pf-flame);
    font-family: var(--pf-mono);
    font-size: 14px;
    font-weight: 700;
    right: 40px;
    bottom: 30px;
  }
  
  h1,
  h2,
  h3 {
    margin: 0;
    color: var(--pf-ink);
    text-wrap: balance;
  }
  
  h1 {
    max-width: 980px;
    font-family: var(--pf-serif);
    font-size: 72px;
    font-weight: 800;
    line-height: 1.03;
  }
  
  h2 {
    font-family: var(--pf-serif);
    font-size: 49px;
    font-weight: 800;
    line-height: 1.12;
    padding-bottom: 16px;
    border-bottom: 3px solid var(--pf-flame);
  }
  
  h3 {
    color: var(--pf-flame-dark);
    font-size: 24px;
    font-weight: 800;
  }
  
  p {
    margin: 0;
  }
  
  strong {
    color: var(--pf-flame-dark);
    font-weight: 800;
  }
  
  em {
    color: var(--pf-muted);
    font-style: normal;
  }
  
  a {
    color: var(--pf-flame-dark);
    text-decoration: none;
    border-bottom: 2px solid rgba(233, 71, 36, 0.35);
  }
  
  ul,
  ol {
    margin: 0;
    padding-left: 1.15em;
  }
  
  li {
    margin: 0.22em 0;
  }
  
  li::marker {
    color: var(--pf-flame);
    font-weight: 800;
  }
  
  blockquote {
    margin: 6px 0 0;
    padding: 22px 28px;
    border-left: 7px solid var(--pf-flame);
    background: rgba(245, 238, 230, 0.72);
    color: var(--pf-ink);
    font-family: var(--pf-serif);
    font-size: 34px;
    line-height: 1.38;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 23px;
  }
  
  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--pf-line);
  }
  
  th {
    color: var(--pf-flame-dark);
    text-align: left;
    font-weight: 800;
  }
  
  code {
    padding: 0.12em 0.34em;
    border-radius: 4px;
    background: var(--pf-soft);
    color: var(--pf-flame-dark);
    font-family: var(--pf-mono);
    font-size: 0.9em;
  }
  
  pre {
    margin: 2px 0 0;
    padding: 28px 32px;
    border-radius: 0;
    border-top: 6px solid var(--pf-flame);
    background: var(--pf-code-bg);
    color: var(--pf-code-text);
    font-family: var(--pf-mono);
    font-size: 22px;
    line-height: 1.5;
    box-shadow: 14px 14px 0 rgba(233, 71, 36, 0.14);
  }
  
  pre code {
    padding: 0;
    background: transparent;
    color: inherit;
    font-size: inherit;
  }
  
  footer {
    position: absolute;
    left: 92px;
    bottom: 30px;
    color: var(--pf-muted);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  
  .kicker {
    color: var(--pf-flame-dark);
    font-family: var(--pf-mono);
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .note {
    color: var(--pf-muted);
    font-size: 21px;
  }
  
  .stamp {
    display: inline-block;
    width: fit-content;
    padding: 8px 13px;
    border: 2px solid var(--pf-flame);
    color: var(--pf-flame-dark);
    font-family: var(--pf-serif);
    font-size: 25px;
    font-weight: 800;
    transform: rotate(-2deg);
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 4px;
  }
  
  .panel {
    min-height: 146px;
    padding: 22px 24px;
    border: 1px solid var(--pf-line);
    background: rgba(255, 253, 248, 0.82);
  }
  
  .panel b {
    display: block;
    margin-bottom: 8px;
    color: var(--pf-flame-dark);
    font-family: var(--pf-serif);
    font-size: 29px;
    line-height: 1.18;
  }
  
  section.title {
    justify-content: center;
    padding: 86px 100px 86px;
    background:
      linear-gradient(90deg, transparent 0 68%, rgba(233, 71, 36, 0.1) 68% 100%),
      var(--pf-paper);
  }
  
  section.title::before {
    inset: 32px;
    border-width: 2px;
  }
  
  section.title h1 {
    max-width: 880px;
    font-size: 90px;
  }
  
  section.title h1 strong {
    color: var(--pf-flame);
  }
  
  section.title p {
    max-width: 720px;
    margin-top: 14px;
    color: var(--pf-muted);
    font-size: 27px;
    font-weight: 700;
  }
  
  section.title .meta {
    position: absolute;
    left: 100px;
    bottom: 78px;
    color: var(--pf-flame-dark);
    font-family: var(--pf-mono);
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }
  
  section.section {
    justify-content: center;
    padding-left: 116px;
    background:
      linear-gradient(90deg, var(--pf-flame) 0 18px, transparent 18px 100%),
      var(--pf-paper);
  }
  
  section.section h1 {
    max-width: 1000px;
    font-size: 86px;
  }
  
  section.section h1::before {
    content: attr(data-chapter);
    display: block;
    margin-bottom: 22px;
    color: var(--pf-flame);
    font-family: var(--pf-mono);
    font-size: 28px;
    line-height: 1;
    letter-spacing: 0.14em;
  }
  
  section.code {
    background:
      linear-gradient(90deg, rgba(233, 71, 36, 0.12) 0 3px, transparent 3px 100%),
      var(--pf-paper);
  }
  
  section.code h2 {
    border-bottom: 0;
    padding-bottom: 0;
  }
  
  section.split {
    display: grid;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    grid-template-rows: auto 1fr;
    column-gap: 54px;
    row-gap: 24px;
  }
  
  section.split h2 {
    grid-column: 1 / -1;
  }
  
  .compare {
    grid-column: 1;
    grid-row: 2;
    display: grid;
    gap: 14px;
  }
  
  .compare > div {
    padding: 18px 20px;
    border-left: 6px solid var(--pf-flame);
    background: rgba(245, 238, 230, 0.74);
  }
  
  .talk-points {
    grid-column: 2;
    grid-row: 2;
  }
  
  section.closing {
    justify-content: center;
    align-items: flex-start;
    background:
      linear-gradient(180deg, transparent 0 64%, rgba(233, 71, 36, 0.1) 64% 100%),
      var(--pf-paper);
  }
  
  section.closing h1 {
    max-width: 980px;
    font-size: 88px;
  }
  
  section.closing p {
    margin-top: 18px;
    color: var(--pf-muted);
    font-size: 28px;
    font-weight: 700;
  }
  
  section.closing .stamp {
    margin-top: 30px;
  }
title: Paper Flame theme preview
description: Hono Conference向けMarpテーマ案
---

<!-- _class: title -->
<!-- _paginate: false -->

<div class="kicker">Hono Conference / Theme Proposal</div>

# 個人開発者よ、<strong>Hono</strong>を使え

白い紙面、大胆な和文タイポグラフィ、朱赤のアクセントで見せる編集デザイン風テーマ

<div class="meta">30 min technical session / Paper Flame</div>

---

<!-- _class: section -->
<!-- _paginate: false -->

<h1 data-chapter="01">小さく始めて<br>大きく育てます</h1>

---

## なぜ Hono から話すのか

<div class="stamp">通常スライド</div>

- ルーティング、型、安全な拡張をひとつの文脈で話せます
- Cloudflare Workers から Node.js まで、同じ手触りで試せます
- 30 分の登壇では、余白を残して要点だけを強く置きます

<div class="grid">
<div class="panel"><b>軽い</b>導入の心理的コストを下げます</div>
<div class="panel"><b>速い</b>デモの体感を崩しにくいです</div>
<div class="panel"><b>広い</b>実行環境を選びやすいです</div>
</div>

---

<!-- _class: code -->

## コードは暗く、紙面は明るく

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/hello/:name", (c) => {
  const name = c.req.param("name");
  return c.json({ message: `Hello, ${name}!` });
});

export default app;
```

<footer>Code layout</footer>

---

<!-- _class: split -->

## 2 カラムで比較を速く読む

<div class="compare">
<div><strong>Before</strong><br>フレームワークごとに構成とデプロイの作法を覚えます</div>
<div><strong>After</strong><br>同じ Handler の感覚で、実行環境だけを差し替えます</div>
</div>

<div class="talk-points">

### 登壇で強調したいこと

- 「薄い」だけで終わらせず、型のつながりまで見せます
- Hono を選ぶ理由を、個人開発の速度に引き寄せます
- 長く見ても疲れにくいよう、朱赤は要所に絞ります

</div>

---

<!-- _class: closing -->
<!-- _paginate: false -->

# 明日つくるものを<br>今日デプロイしましょう

Hono は、小さな個人開発を止めないための道具です

<div class="stamp">Thank you!</div>
