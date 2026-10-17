---
marp: true
theme: honoconf
paginate: true
size: 16:9
title: 個人開発者チャン、Honoを使ってみないカナ？
description: Hono Conference 2026のおじさん構文版だヨ😊
slug: use-hono
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

  .panel {
      box-sizing: border-box;
      padding: 14px 28px;
      border-left: 3px solid rgba(255, 99, 48, 0.5);
      background: transparent;
  }

  .panel h3 { margin-top: 0; }

  .feature-grid,
  .choice-grid,
  .measure-grid,
  .profile-grid {
      display: grid;
      gap: 18px;
  }

  .feature-grid,
  .choice-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .profile-grid { grid-template-columns: 1.25fr 1fr; }
  .measure-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }

  .mini-panel {
      padding: 14px 0 18px;
      border-bottom: 1px solid var(--hc-line);
  }

  .mini-panel b {
      display: block;
      margin-bottom: 8px;
      color: var(--hc-red);
      font-size: 25px;
  }

  .mini-panel span {
      color: var(--hc-muted);
      font-size: 18px;
  }

  .big-statement {
      max-width: 1050px;
      color: var(--hc-white);
      font-size: 62px;
      font-weight: 900;
      line-height: 1.12;
  }

  .big-statement em {
      color: var(--hc-red);
      font-style: normal;
  }

  .flow {
      display: flex;
      align-items: stretch;
      gap: 14px;
      margin-top: 24px;
  }

  .flow-step {
      flex: 1;
      min-width: 0;
      padding: 16px 4px 20px;
      border-bottom: 1px solid var(--hc-line);
  }

  .flow-step b {
      display: block;
      margin-bottom: 8px;
      color: var(--hc-red);
      font-family: var(--hc-mono);
      font-size: 16px;
  }

  .flow-step span { font-size: 20px; }
  .flow-arrow { align-self: center; color: var(--hc-red); font-size: 28px; font-weight: 900; }

  .layers {
      display: grid;
      gap: 10px;
      width: 900px;
      margin: 20px auto 0;
  }

  .layer {
      display: grid;
      grid-template-columns: 220px 1fr;
      align-items: baseline;
      padding: 14px 24px;
      border-bottom: 1px solid var(--hc-line);
  }

  .layer b { color: var(--hc-red); }

  .measure {
      padding: 18px 0;
      border-bottom: 1px solid var(--hc-line);
  }

  .measure b {
      display: block;
      color: var(--hc-red);
      font-size: 48px;
      line-height: 1;
  }

  .measure span { color: var(--hc-muted); font-size: 17px; }

  .screen-frame {
      overflow: hidden;
      border: 1px solid var(--hc-line);
      border-radius: 20px;
      background: #f8f8f8;
  }

  .screen-frame img { display: block; width: 100%; }

  .steps {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 30px;
  }

  .step {
      padding: 22px;
      border-left: 1px solid var(--hc-line);
  }

  .step b {
      display: block;
      margin-bottom: 18px;
      color: transparent;
      font-size: 54px;
      line-height: 1;
      -webkit-text-stroke: 2px var(--hc-red);
  }

  .step span { font-size: 20px; font-weight: 700; }

  .note {
      margin-top: 16px;
      color: var(--hc-muted);
      font-size: 16px;
  }

  .intro-panel { width: 54%; }

  .intro-photo {
      position: absolute;
      top: 164px;
      right: 96px;
      width: 330px;
      height: 430px;
      object-fit: cover;
      border: 1px solid var(--hc-line);
      border-radius: 24px;
      box-shadow: 18px 18px 0 rgba(255, 99, 48, 0.16);
  }

  section > .favorite-message {
      position: absolute !important;
      left: 50%;
      width: calc(100% - 176px);
      bottom: 106px;
      z-index: 2;
      transform: translateX(-50%);
      text-align: center;
      font-size: 54px;
      line-height: 1.16;
  }

  .favorite-frameworks-grid .mini-panel b { font-size: 32px; }
  .favorite-frameworks-grid .mini-panel span { font-size: 21px; }

  .failure-flow {
      margin-top: 42px;
      gap: 24px;
  }

  .failure-flow .flow-step {
      padding: 20px 0 28px;
  }

  .failure-flow .flow-step b { margin-bottom: 20px; }
  .failure-flow .flow-step span { font-size: 25px; line-height: 1.6; }

  .failure-transition {
      margin-top: 48px;
      color: var(--hc-muted);
      font-size: 24px;
  }

  .failure-stack {
      width: 100%;
      gap: 0;
      margin: 12px 0 0;
  }

  .failure-stack .layer {
      grid-template-columns: 220px minmax(0, 1fr);
      column-gap: 32px;
      padding: 14px 0;
      font-size: 26px;
  }

  .failure-request {
      display: flex;
      align-items: center;
      gap: 28px;
      margin-top: 28px;
      font-size: 25px;
  }

  .failure-context {
      margin-top: 18px;
      color: var(--hc-muted);
      font-size: 21px;
      line-height: 1.55;
  }

  .failure-takeaway {
      margin-top: 26px;
      padding-left: 18px;
      border-left: 3px solid var(--hc-red);
      font-size: 23px;
      line-height: 1.5;
  }
---

<!-- _class: title -->
<!-- _paginate: false -->

<div class="circle"></div>
<div class="square"></div>
<div class="accent-line"></div>

<div class="top-meta">
  <span class="event">Hono Conference 2026</span>
  <span>30分、お付き合いしてネ😉</span>
</div>

<div class="title-wrap">

# 開発者チャン💕<br><span class="outline">Honoを</span><span class="accent">使お😘</span>

</div>

<div class="title-footer">
  <div class="speaker"><strong>田中 博悠 / Hirohisa Tanaka</strong><br><span>@tanahiro2010</span></div>
  <div class="hono-mark">H.</div>
</div>

---

## 田中博悠ですヨ〜😊

<div class="panel intro-panel">

### 高校1年生なんだヨ😅

- 三田学園高等学校に通ってるヨ🏫
- Hono Conference 2026のコアスタッフです😊
- GDG Greater Kwansaiにもいるヨ✨
- Alpha+ Projectの4期生なんだナ😉
- 個人開発も、インターンも、競プロも💪
- 音楽とバンジーも好きなんだヨ🎵

</div>

<img class="intro-photo" src="img/flying_tanaka.jpg" alt="バンジージャンプをする田中博悠">

<div class="type-ghost stats-word">学生ダヨ / 作るヨ / 話すヨ</div>

---

<!-- _class: lead -->

## Hono ≒ バンジージャンプの数学的検証だヨ〜

### 発表しようとしたら別のプロポーザルが採択されたんだナ😅

---

<!-- _class: lead -->

# なんとネ <span class="red">66%成立😳</span>

## Hono ≒ バンジー、なんだナ😉

---

<!-- _class: lead -->

# ところが、ドッコイ‼️😅

---

<!-- _class: lead -->

# その話は、しないヨ〜😅

## プロポーザル、採択されなかったんだナ💦

### 気になったら、懇親会で声かけてネ😉

---

## 好きな <span class="red">フレームワーク</span> ありますか？

- **Hono**: 今日の主役
- **React**: UIを作るときの選択肢
- **Ruby on Rails**: 育てながら作れる一体型

<div class="big-statement favorite-message">でも技術選定には<br><em>何度も失敗</em>しました</div>

- 好きな技術と、必要な技術は同じとは限らない
- 「あとで使うかも」を先に実装してしまう

---

## アンケートの結果 個人開発では...

- **Next.js**: 大きなReactエコシステム
- **Nuxt**: Vueのフルスタック体験
- **TanStack Start**: 型付きルートとServer Functions
- **React SPA**: 自由なクライアント構成
- **Rails**: 成熟した一体型の開発体験
- **Hono**: Web標準に近い小さな入口

> 選択肢の多さではなく、必要な複雑さの量で選ぶ

---

<!-- _class: lead -->

<div class="geo ring chapter-ring"></div>

# 個人開発の敵は<strong>複雑さ</strong>

- 境界が増える
- 状態を同期する
- 実行場所(デプロイ先)を考える
- **お金**

---

# 「あとで必要かも」

## 最初から背負っていませんか？

<div class="type-ghost stats-word">増やす前に考える</div>

- **境界**: フロントエンドとAPIを分ける
- **同期**: 状態とデータ取得を揃える
- **実行**: hydrationとブラウザJSを管理する
- **性能**: キャッシュ戦略を考える
- **配備**: 複数のデプロイ先を扱う
- **運用**: 増えていく手数を引き受ける

> 便利な仕組みを必要になる前から持っていないか

---

## 小説投稿サイトを没にしました

<div class="flow failure-flow">
  <div class="flow-step"><b>01 / FETCH</b><span>ブラウザから<br>大量のAPIを呼ぶ</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>02 / WAIT</b><span>アプリとDBの<br>配置場所も未整理</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>03 / DROP</b><span>待ち時間を改善できず<br>開発を中止</span></div>
</div>

<div class="failure-transition">当時の構成を見てみます。</div>

- ブラウザで取得してから画面を組み立てる
- API・アプリ・DBの距離をあとから考える

---

## 当時はNext.js + Vercel + Neon

<div class="layers failure-stack">
  <div class="layer"><b>Next.js</b><span>画面とAPI Routesを実装</span></div>
  <div class="layer"><b>Vercel</b><span>Next.jsアプリの公開先</span></div>
  <div class="layer"><b>Neon</b><span>データを保存するPostgreSQL</span></div>
</div>

<div class="failure-request"><span>ブラウザ</span><span class="flow-arrow">→</span><span>Vercel上のAPI</span><span class="flow-arrow">→</span><span>NeonのDB</span></div>

<div class="failure-context">useEffectでデータを取得し、ブラウザで画面を組み立てる。<br>アプリとDBのリージョン（配置地域）も未整理でした。</div>

<div class="failure-takeaway">Next.jsが悪いという話ではありません。<br>当時の自分の実装と構成の問題です。</div>

<div class="note">非同期処理とリージョンを十分に設計せず、原因を測る前に複雑さだけ増やしていました。</div>

---

<!-- _class: lead -->

<div class="geo solid-square closing-square"></div>

# 初期表示<br><strong>最悪で約1分。</strong>

### 言い過ぎかもしれないけど少なくとも30秒以上はした

---

## ただの単位計算機なのに

<div class="big-statement">技術スタックは、<br><em>Next.js</em></div>

<div class="flow">
  <div class="flow-step"><b>計算する</b><span>ブラウザで十分</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>送る</b><span>値をバックエンドへ</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>待つ</b><span>ロードが重い</span></div>
  <div class="flow-step"><b>収益</b><span>どこぞのAdsence</span></div>
</div>

- 計算はブラウザで完結できる
- 毎回APIへ送る理由がない
- 待ち時間だけが増えていく

<div class="note">広告収益化まで考えると、無料プランの利用条件も気になります。</div>

---

## LPなのにReact SPA

<div class="big-statement">ページは複数。ブログもある。<br>でも<em>metaはいつも同じ</em></div>

<div class="type-ghost stats-word">ページごとの情報</div><br>

- ページは複数ある
- ブログもある
- でもmetaはページごとに変わらない

---

<!-- _class: lead -->

<div class="geo ring chapter-ring"></div>

<div class="big-statement">それ、<em>Honoでいいじゃん</em></div>

---

## そこでReNovelを作り直しました

<div class="screen-frame">
  <img src="img/renovel-home.png" alt="Renovelのホーム画面">
</div>

- 投稿 / 閲覧 / 認証 / 検索
- 本棚 / いいね / 通知
- 見た目は、Honoだから制限されない

---

## この見た目はHonoで動いています

<div class="big-statement">割と中規模なアプリを<br><em>React / Next.jsなし</em> で動かす</div>

<div class="type-ghost stats-word">27 JSX VIEW / 9 ROUTE MODULE</div>

<br /><br />

- React / Next.jsなし
- HTML / Hono JSX中心で育てられる

---

## 構成はまずこれだけ

- **Runtime / Web**: Bun + Hono
- **Database / ORM**: PostgreSQL + Drizzle
- **View**: Hono JSX + Kiwa UI

---

<!-- _class: section -->
<!-- _paginate: false -->

<div class="chapter-label">Chapter 02 / 必要になってから複雑にしよう</div>
<div class="chapter-number">02</div>
<div class="geo ring chapter-ring"></div>

# 複雑さは<br>あとで払おうネ😘

最初からAPIとかゴリゴリに設計しなくても、
個人開発だからこそまずは〝単純〟に始めれる

- まずHTMLを返す
- 必要になったらフォームを強化する
- さらに必要なら、その部分だけJSを足す

---

## まずはHTMLを返せばいい

<div class="flow">
  <div class="flow-step"><b>GET /novel</b><span>URL + HTTP</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>APPLICATION</b><span>Use case</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>HONO JSX</b><span>HTML</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>BROWSER</b><span>HTML</span></div>
</div>

<br /><br />

- 初期表示はサーバーで完了(SSG)
- ブラウザ側の仕事を増やさない

---

<!-- _class: lead -->

<div class="geo ring chapter-ring"></div>

<div class="big-statement">初期表示のために<br><em>APIを作りすぎない</em></div>

- SSGだからこそ、HTMLで返せるものはHTMLで返す
- APIは、APIが必要なところに使う

---

## `hono/jsx`でHTMLを返す

<div class="big-statement">JSXを書いて、<br><em>サーバーでHTML</em>を作る</div>

```tsx
/** @jsxImportSource hono/jsx */
app.get("/novel", (c) => c.html(<NovelPage novel={novel} />));
```

- JSXを書く
- サーバーでHTMLを作る
- ブラウザには完成したページを返す

---

## 一つのアプリで責務は混ぜない

<div class="layers">
  <div class="layer"><b>画面</b><span>route / controller / JSX view</span></div>
  <div class="layer"><b>処理</b><span>use case / query / service</span></div>
  <div class="layer"><b>データ</b><span>Drizzle / PostgreSQL</span></div>
</div>

<div class="type-ghost stats-word">一つのアプリで育てる</div>

- 最初からサービスを分割しない
- でも、画面・処理・データは混ぜない
- 必要になった境界だけ、あとから深くする

---

## ページ全体はSSR。動くのは一部分

- **SSR**: ページ全体をHTMLで返す
- **Forms**: リンクとHTMLフォームで動かす
- **Island**: 操作する部分だけJSを足す

- ページ全体: SSR
- 遷移や送信: HTML
- 局所的な操作: Island

---

## islandはHTMLの中の小さな島

<!--  -->
<div class="big-statement">HTMLの海に浮かぶ、<br><em>小さなインタラクション</em></div>

<div class="type-ghost stats-word">まずHTML / 必要なJS</div>

- HTMLの海に浮かぶ小さなUI
- ページ全体は動かさない
- 必要な場所だけブラウザで実行する

---

## `hono/jsx/dom`でそこだけ動かす

<div class="big-statement">ページ全体を動かさない。<br><em>必要な部分だけ</em>動かす</div>

```tsx
/** @jsxImportSource hono/jsx/dom */
export function LikeButton() {
  return <button onClick={toggle}>♥</button>;
}
```

- 全体をhydrationしない
- ボタン単位でJavaScriptを送る
- 操作する場所だけ状態を持つ

---

## 動かしたいところだけJSを足す

<div class="type-ghost stats-word">ReNovelで実際に使った場所</div>

<div class="big-statement">動かしたい場所だけ、<br><em>island</em>にする</div>

いいね　/　フォロー　/　評価　/　本棚追加　/　本棚削除

- 本文の表示: サーバー
- ページ遷移: HTML
- 局所的な操作: JavaScript

---

<!-- _class: small-code -->

## まずはJavaScriptなしで動かす

<div class="vertical-type">No-JS fallback / Server HTML</div>

- JavaScriptなしでもPOSTできる
- 失敗しても基本の操作は残る
- JavaScriptは操作感のために足す

```tsx
<span data-island="like" data-props={JSON.stringify({ action, liked, count })}>
  <form method="post" action={action}>
    <button type="submit">♥ {count}</button>
  </form>
</span>
```

- 状態をローカルで更新する
- 必要なエンドポイントだけ呼ぶ
- 失敗時の扱いは別途設計する

---

<!-- _class: small-code -->

## 必要な場所だけブラウザで強化する

```tsx
/** @jsxImportSource hono/jsx/dom */
import { useState } from "hono/jsx";

export function LikeButton({ action, liked: initial, count: initialCount }) {
  const [liked, setLiked] = useState(initial);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((value) => value + (next ? 1 : -1));
    await fetch(action, { method: "POST" });
  }

  return <button onClick={toggle}>♥ {count}</button>;
}
```

---

## ブラウザに送るJSを絞る

<div class="measure-grid">
  <div class="measure"><b>34750B</b><span>islands bundle<br>圧縮前</span></div>
  <div class="measure"><b>13301B</b><span>islands bundle<br>gzip</span></div>
</div>

<div class="type-ghost stats-word">測った結果</div>

- 圧縮前: 34,750 bytes
- gzip: 13,301 bytes
- 動く部分だけを送る

---

## サーバー側も測ってみる

<div class="measure-grid">
  <div class="measure"><b>0.33MB</b><span>server bundle<br>Bun minify</span></div>
  <div class="measure"><b>3.2ms</b><span>home TTFB<br>ウォーム中央値</span></div>
</div>

<div class="note">2026-09-23 ローカル開発環境で計測 / 初回home TTFB 117.7ms / 数値は登壇直前に再計測します</div>

- ローカル開発環境での計測
- ウォーム中央値: 3.2ms
- 本番性能の保証ではない

---

<!-- _class: lead -->

<div class="geo ring chapter-ring"></div>

## SEOは最初のHTMLから始まる

<div class="big-statement">各URLの情報が、<em>最初のHTML</em>に入っているか</div>

- 本文
- title / description
- canonical / OGP

---

## 最初のHTMLに何を入れる？

- **Content**: 本文 / title / description
- **Identity**: canonical / OGP
- **Delivery**: JS実行を待たずに返す

ReactやNext.jsでもSSRで実現できます。Honoではページ全体のhydrationを前提にせず選べます

- フレームワーク名ではなく、返すHTMLを見る
- 各URLの情報を各URLで持つ
- 必要なJSだけを選ぶ

---

## Honoを小さく公開する

<div class="flow">
  <div class="flow-step"><b>APP</b><span>Hono appをexport</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>WORKERS</b><span>エッジでリクエストを処理</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>SHIP</b><span>`wrangler deploy`</span></div>
</div>

<div class="big-statement">まずはアプリを<br><em>小さく公開する</em></div>

- Hono appをexport
- `wrangler deploy`で公開
- 公開までの距離を短くする

---

## データが必要ならD1につなぐ

<div class="flow">
  <div class="flow-step"><b>REQUEST</b><span>Hono route</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>DATA</b><span>D1 binding</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>RESPONSE</b><span>HTML / JSON</span></div>
</div>

<div class="note">Renovel本体はBun + PostgreSQLです。Workers + D1は持ち帰り用の別サンプルです。</div>

- Renovel本体: Bun + PostgreSQL
- ここで紹介する構成: Workers + D1
- 別の選択肢として考える

---

## 個人開発のデプロイ先どうする？

<div class="flow">
  <div class="flow-step"><b>Next.js</b><span>Vercel / AWS など</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>Hono</b><span>Cloudflare Workers</span></div>
</div>

<div class="big-statement">小さく始めて、<br><em>収益化の余地</em>も残す</div>

<div class="note">Vercel Hobbyは商用利用に制限があります。Cloudflare Workersには無料枠があります。プランと利用条件は公開前に確認します。</div>

- 料金だけで決めない
- 商用利用の条件を確認する
- 無料枠・制限は公開前に確認する

---

## Cloudflareであとから払える基盤を作る

<div class="flow">
  <div class="flow-step"><b>FREE</b><span>無料枠から始める</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>EDGE</b><span>世界のエッジで動かす</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-step"><b>PAID</b><span>必要になったら払う</span></div>
</div>

<div class="big-statement">だからHonoは<br><em>Cloudflareと相性がいい</em></div>

- Web標準に近い
- 小さく公開しやすい
- 必要になったら構成を広げる

---

## どれが上かではなく必要なものを見る

- **Next.js**
  Reactの大きなエコシステム、RSC、Server Actions、画像最適化を使いたいとき

- **TanStack Start**
  型付きroute tree、loader、client navigation、Server Functionsが欲しいとき

- **Hono**
  SSR中心で、局所的な操作とWeb標準に近い実装をしたいとき

今の自分に必要なものを選びます。

---

## Honoが合うのはこんな個人開発

<div class="panel">

### 合いやすい

- CRUDが中心で画面の動きは局所的
- APIとSSRを同じ言語・同じアプリで書きたい
- Reactの巨大なエコシステムは必須ではない
- 運用コストと認知負荷を抑えたい

</div>

<div class="type-ghost stats-word">Renovelでの判断</div>

---

## こういうときは別の選択肢

<div class="panel">

### 別の選択肢も考える

- FigmaやCanvaのように画面全体が動く
- 大規模なクライアント状態が中心
- チームが別のフレームワークへ習熟している
- その機能群自体がプロダクトの強みになる

</div>

---

<!-- _class: section -->
<!-- _paginate: false -->

<div class="chapter-label">Chapter 03 / まず小さく作ってみる</div>
<div class="chapter-number">03</div>

# 小さく作ろうネ😊<br>必要な分だけ育てよ🌱

---

## まずはサーバーだけで動かしてみる

<div class="steps">
  <div class="step"><b>01</b><span>まずHTMLを返す</span></div>
  <div class="step"><b>02</b><span>まずフォームで動かす</span></div>
</div>

<div class="type-ghost stats-word">最初に返すもの</div>

---

## 必要になったらそこだけ足す

<div class="steps">
  <div class="step"><b>03</b><span>必要な場所だけJSを足す</span></div>
  <div class="step"><b>04</b><span>そのまま公開する</span></div>
</div>

<div class="type-ghost stats-word">必要な分だけ育てる</div>

---

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="geo solid-square closing-square"></div>

# Honoを使え、<br>という話ではありません

---

<!-- _class: lead -->
<!-- _paginate: false -->

<div class="geo ring chapter-ring"></div>

# 個人開発者よ<br><strong>複雑さをあとで払える<br>道具として</strong><br>Honoを使え。
