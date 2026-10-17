---
marp: true
theme: honoconf
paginate: true
size: 16:9
title: 個人開発者チャン、Honoを使ってみないカナ？
description: Hono Conference 2026のおじさん構文版だヨ😊
slug: use-hono
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
app.get('/novel', (c) => c.html(
  <NovelPage novel={novel} />
))
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
  return <button onClick={toggle}>♥</button>
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
<span
  data-island="like"
  data-props={JSON.stringify({ action, liked, count })}
>
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
import { useState } from 'hono/jsx'

export function LikeButton({ action, liked: initial, count: initialCount }) {
  const [liked, setLiked] = useState(initial)
  const [count, setCount] = useState(initialCount)

  async function toggle() {
    const next = !liked
    setLiked(next)
    setCount((value) => value + (next ? 1 : -1))
    await fetch(action, { method: 'POST' })
  }

  return <button onClick={toggle}>♥ {count}</button>
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
