---
marp: true
theme: default
paginate: true
size: 16:9
title: HonoConf 2026 theme preview
description: honoconf.devの2026サイトをモチーフにしたMarpテーマ
style: |
  :root {
    --hc-black: #111113;
    --hc-panel: #18181a;
    --hc-panel-strong: #202023;
    --hc-white: #f7f7f7;
    --hc-muted: #aaaaaa;
    --hc-line: #343438;
    --hc-red: #ff6330;
    --hc-red-deep: #d8461d;
    --hc-code: #0f0f10;
    --hc-green: #8adf8a;
    --hc-yellow: #f4d35e;
    --hc-font: Geist, "Noto Sans JP", "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif;
    --hc-mono: "SFMono-Regular", "Roboto Mono", Menlo, Consolas, monospace;
  }

  section {
    width: 1280px;
    height: 720px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 112px 88px 70px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      radial-gradient(circle at 85% 20%, rgba(255, 90, 31, 0.12), transparent 30%),
      var(--hc-black);
    background-size: 48px 48px, 48px 48px, auto, auto;
    color: var(--hc-white);
    font-family: var(--hc-font);
    font-size: 27px;
    font-weight: 500;
    line-height: 1.5;
    letter-spacing: 0;
    word-break: keep-all;
    line-break: strict;
    overflow-wrap: anywhere;
  }

  section::before {
    content: "Hono Conference 2026";
    position: absolute;
    top: 28px;
    left: 34px;
    width: auto;
    height: auto;
    color: var(--hc-red);
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
    z-index: 2;
  }

  section::after {
    content: attr(data-marpit-pagination);
    position: absolute;
    right: 38px;
    bottom: 26px;
    color: var(--hc-muted);
    font-family: var(--hc-mono);
    font-size: 13px;
    font-weight: 700;
  }

  section > * {
    position: relative;
    z-index: 1;
  }

  h1,
  h2,
  h3 {
    margin: 0;
    color: var(--hc-white);
    font-weight: 700;
    letter-spacing: 0;
    text-wrap: balance;
  }

  h1 {
    margin-bottom: 28px;
    font-size: 64px;
    line-height: 1.08;
  }

  h2 {
    margin-bottom: 28px;
    font-size: 48px;
    line-height: 1.08;
  }

  h3 {
    margin: 18px 0 10px;
    color: var(--hc-red);
    font-size: 26px;
    line-height: 1.2;
  }

  p { margin: 0 0 20px; }
  strong { color: var(--hc-red); font-weight: 750; }
  section h1 strong,
  section h2 strong { color: var(--hc-red); }
  a { color: var(--hc-white); text-decoration-color: var(--hc-red); }

  ul,
  ol {
    margin: 8px 0 18px 1.15em;
    padding: 0;
  }

  li { margin: 9px 0; }
  li::marker { color: var(--hc-red); }

  blockquote {
    margin: 20px 0;
    padding: 22px 28px;
    border-left: 6px solid var(--hc-red);
    border-radius: 0 16px 16px 0;
    background: var(--hc-panel);
    color: #dedede;
  }

  code {
    border-radius: 3px;
    background: #242424;
    color: var(--hc-red);
    font-family: var(--hc-mono);
    padding: 0.08em 0.32em;
  }

  pre {
    margin: 10px 0 0;
    padding: 24px 28px;
    border: 1px solid var(--hc-line);
    border-radius: 16px;
    background: var(--hc-code);
    box-shadow: 0 22px 60px rgba(0, 0, 0, 0.45);
    color: #f7f7f7;
    font-size: 18px;
    line-height: 1.48;
  }

  pre code {
    padding: 0;
    background: transparent;
    color: inherit;
  }

  .hljs-comment,
  .hljs-quote { color: #777777; }
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-literal { color: #ff5a55; }
  .hljs-string,
  .hljs-regexp { color: var(--hc-green); }
  .hljs-number,
  .hljs-symbol { color: var(--hc-yellow); }
  .hljs-title,
  .hljs-function .hljs-title,
  .hljs-built_in { color: #8ac7ff; }
  .hljs-variable,
  .hljs-params,
  .hljs-property { color: #efb0ff; }

  section table {
    width: 100%;
    margin-top: 12px;
    border-collapse: separate;
    border-spacing: 0 8px;
    background: transparent;
    color: var(--hc-white);
    font-size: 23px;
  }

  section table th,
  section table td {
    padding: 14px 20px;
    border: 0;
    text-align: left;
  }

  section table thead th {
    background: var(--hc-red);
    color: var(--hc-black);
    font-size: 15px;
    font-weight: 900;
    text-transform: uppercase;
  }

  section table thead th:first-child {
    width: 155px;
    border-radius: 12px 0 0 12px;
  }

  section table thead th:last-child {
    border-radius: 0 12px 12px 0;
  }

  section table tbody td {
    background: var(--hc-panel);
    color: #dedede;
  }

  section table tbody td:first-child {
    border-left: 5px solid var(--hc-red);
    border-radius: 12px 0 0 12px;
    color: var(--hc-red);
    font-family: var(--hc-mono);
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
  }

  section table tbody td:last-child {
    border-right: 1px solid var(--hc-line);
    border-radius: 0 12px 12px 0;
  }

  footer {
    position: absolute;
    right: 64px;
    bottom: 24px;
    color: var(--hc-muted);
    font-size: 12px;
  }

  section.title {
    justify-content: space-between;
    padding: 72px 84px;
    background:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      radial-gradient(circle at 85% 20%, rgba(255, 90, 31, 0.12), transparent 30%),
      var(--hc-black);
    background-size: 48px 48px, 48px 48px, auto, auto;
  }

  section.title::before {
    content: none;
  }

  section.title::after { content: none; }

  section.title h1 {
    max-width: 1040px;
    margin: 0;
    font-size: 103px;
    line-height: 0.98;
    font-weight: 900;
  }

  section.title h1 strong { color: var(--hc-red); }

  section.title .top-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 3;
    color: var(--hc-muted);
    font-size: 17px;
    font-weight: 700;
    text-transform: uppercase;
  }

  section.title .top-meta .event { color: var(--hc-red); }

  section.title .title-wrap {
    position: relative;
    z-index: 3;
  }

  section.title .outline {
    color: transparent;
    -webkit-text-stroke: 2px var(--hc-red);
  }

  section.title .accent { color: var(--hc-red); }

  section.title .title-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    position: relative;
    z-index: 3;
  }

  section.title .speaker {
    font-size: 22px;
    line-height: 1.45;
  }

  section.title .speaker strong {
    color: var(--hc-white);
    font-size: 25px;
  }

  section.title .speaker span { color: #888888; }

  section.title .hono-mark {
    color: rgba(255, 99, 48, 0.17);
    font-size: 88px;
    font-weight: 900;
    line-height: 0.8;
  }

  section.title .accent-line {
    position: absolute;
    left: 84px;
    top: 133px;
    width: 140px;
    height: 6px;
    border-radius: 999px;
    background: var(--hc-red);
  }

  section.title .square {
    position: absolute;
    right: -120px;
    top: 185px;
    width: 310px;
    height: 310px;
    border-radius: 42px;
    background: var(--hc-red);
    opacity: 0.93;
    transform: rotate(18deg);
  }

  section.title .circle {
    position: absolute;
    right: 240px;
    top: -100px;
    width: 190px;
    height: 190px;
    border: 32px solid var(--hc-red);
    border-radius: 50%;
    opacity: 0.25;
  }

  section.section {
    justify-content: center;
    align-items: center;
    text-align: center;
    background:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      radial-gradient(circle at 50% 46%, rgba(255, 99, 48, 0.18), transparent 30%),
      var(--hc-black);
    background-size: 48px 48px, 48px 48px, auto, auto;
  }

  section.section::after { content: none; }

  section.section h1 {
    max-width: 1020px;
    font-size: 68px;
  }

  section.section h1::after {
    content: "";
    display: block;
    width: 132px;
    height: 8px;
    margin: 30px auto 0;
    background: var(--hc-red);
  }

  .chapter-number {
    position: absolute;
    z-index: 0;
    right: 72px;
    bottom: -66px;
    color: transparent;
    font-family: var(--hc-font);
    font-size: 270px;
    font-weight: 900;
    line-height: 1;
    -webkit-text-stroke: 3px rgba(255, 99, 48, 0.28);
  }

  .chapter-label {
    margin-bottom: 20px;
    color: var(--hc-red);
    font-family: var(--hc-mono);
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .type-ghost {
    position: absolute;
    z-index: 0;
    color: transparent;
    font-family: var(--hc-font);
    font-size: 74px;
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    -webkit-text-stroke: 2px rgba(255, 99, 48, 0.16);
    pointer-events: none;
  }

  .type-ghost.stats-word {
    right: 66px;
    bottom: 46px;
  }

  .type-ghost.compare-word {
    right: 54px;
    top: 94px;
    font-size: 56px;
  }

  .vertical-type {
    position: absolute;
    z-index: 0;
    right: 24px;
    top: 148px;
    color: rgba(255, 99, 48, 0.42);
    font-family: var(--hc-mono);
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    writing-mode: vertical-rl;
  }

  .type-caption {
    position: absolute;
    left: 88px;
    top: 82px;
    z-index: 2;
    color: var(--hc-red);
    font-family: var(--hc-mono);
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .geo {
    position: absolute;
    z-index: 0;
    pointer-events: none;
  }

  .geo.ring {
    width: 150px;
    height: 150px;
    border: 22px solid rgba(255, 99, 48, 0.13);
    border-radius: 50%;
  }

  .geo.round-square {
    width: 170px;
    height: 170px;
    border: 2px solid rgba(255, 99, 48, 0.2);
    border-radius: 30px;
    transform: rotate(16deg);
  }

  .geo.solid-square {
    width: 116px;
    height: 116px;
    border-radius: 24px;
    background: rgba(255, 99, 48, 0.1);
    transform: rotate(-14deg);
  }

  .geo.pill {
    width: 122px;
    height: 18px;
    border-radius: 999px;
    background: rgba(255, 99, 48, 0.42);
  }

  .chapter-ring {
    left: -64px;
    top: 112px;
  }

  .stats-square {
    right: -62px;
    top: 250px;
  }

  .code-ring {
    right: 42px;
    bottom: -78px;
  }

  .compare-square {
    left: -54px;
    bottom: 44px;
  }

  .takeaway-ring {
    right: 64px;
    top: 76px;
  }

  .takeaway-pill {
    right: 120px;
    top: 244px;
  }

  .closing-square {
    right: 122px;
    bottom: 92px;
  }

  section.lead {
    justify-content: center;
    align-items: center;
    text-align: center;
    background:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      radial-gradient(circle at 72% 28%, rgba(255, 99, 48, 0.16), transparent 30%),
      var(--hc-black);
    background-size: 48px 48px, 48px 48px, auto, auto;
  }

  section.lead::after { content: none; }

  section.lead h1 {
    max-width: 1000px;
    font-size: 76px;
  }

  section.split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 26px 34px;
  }

  section.split::before {
    content: "Hono Conference 2026";
    position: absolute;
    top: 28px;
    left: 34px;
    width: auto;
    height: auto;
    color: var(--hc-red);
    font-size: 17px;
    font-weight: 800;
    text-transform: uppercase;
  }

  section.split > h1,
  section.split > h2 {
    grid-column: 1 / -1;
  }

  .panel {
    height: 100%;
    box-sizing: border-box;
    padding: 28px 30px;
    border: 1px solid var(--hc-line);
    border-radius: 18px;
    background: var(--hc-panel);
  }

  .panel h3 { margin-top: 0; }

  .eyebrow {
    margin-bottom: 16px;
    color: var(--hc-red);
    font-family: var(--hc-mono);
    font-size: 15px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .underline {
    text-decoration-line: underline;
    text-decoration-color: var(--hc-red);
    text-decoration-thickness: 0.16em;
    text-underline-offset: 0.08em;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    margin-top: 26px;
  }

  .stat {
    padding: 24px;
    border: 1px solid var(--hc-line);
    border-radius: 16px;
    background: var(--hc-panel);
  }

  .stat b {
    display: block;
    margin-bottom: 10px;
    color: var(--hc-red);
    font-size: 48px;
    line-height: 1;
  }

  .stat span {
    color: var(--hc-muted);
    font-size: 18px;
  }
---

<!-- _class: title -->
<!-- _paginate: false -->

<div class="circle"></div>
<div class="square"></div>
<div class="accent-line"></div>

<div class="top-meta">
  <span class="event">Hono Conference 2026</span>
  <span>30 min session</span>
</div>

<div class="title-wrap">

# 個人開発者よ、<br><span class="outline">Honoを</span><span class="accent">使え。</span>

</div>

<div class="title-footer">
  <div class="speaker"><strong>田中 博悠</strong><br><span>@tanahiro2010</span></div>
  <div class="hono-mark">H.</div>
</div>

---

<!-- _class: section -->
<!-- _paginate: false -->

<div class="chapter-label">Chapter 01 / Why Hono?</div>
<div class="chapter-number">01</div>
<div class="geo ring chapter-ring"></div>

# なぜ個人開発に<br>Honoなのか

---

## <span class="underline">速く始める</span>だけではありません

Honoは、小さなAPIからプロダクトの成長まで同じ書き味で付き合えます

<div class="type-ghost stats-word">SMALL / FAST / ANYWHERE</div>
<div class="geo solid-square stats-square"></div>

<div class="stats">
  <div class="stat"><b>14kB</b><span>小さなコアから始めます</span></div>
  <div class="stat"><b>Web</b><span>標準APIをそのまま使えます</span></div>
  <div class="stat"><b>Any</b><span>複数のランタイムへ運べます</span></div>
</div>

---

## 最初のAPIは、これだけです

<div class="vertical-type">Minimal API / TypeScript</div>
<div class="geo ring code-ring"></div>

```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.json({ message: `Hello, ${name}!` })
})

export default app
```

---

<!-- _class: split -->

<div class="type-ghost compare-word">BUILD / SHIP</div>
<div class="geo round-square compare-square"></div>

## 2つの視点を並べて話せます

<div class="panel">

### 個人開発者の視点

- 構成を決めすぎずに始められます
- 型の恩恵をすぐ受けられます
- デプロイ先を後から選べます

</div>

<div class="panel">

### プロダクトの視点

- Web標準を中心に育てられます
- ミドルウェアを段階的に足せます
- 実行環境をまたいで再利用できます

</div>

---

## 30分で持ち帰ってほしいこと

<div class="geo ring takeaway-ring"></div>
<div class="geo pill takeaway-pill"></div>

| Point | Message |
| --- | --- |
| Start | まず1本のAPIを動かしてみましょう! |
| Grow | 必要になった境界だけ追加できます |
| Ship | 小さな個人開発こそ、すぐ公開しましょう! |

> フレームワーク選びを、開発を始めない理由にしないでください

---

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="geo solid-square closing-square"></div>

# Build fast.<br><strong>Ship with Hono.</strong>
