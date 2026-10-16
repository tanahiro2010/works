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
:root { --gdg-university: 'Hono Conference 2026'; }
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# 個人開発者よ、**Hono**を使え

複雑さを前払いしないWebアプリ設計

---

<!-- _class: lead -->

# それ、最初からReactが必要ですか?

---

## 今日話すこと

1. 個人開発が重くなりがちな理由
2. 小説投稿サイトで感じた違和感
3. Honoで小さく始める設計
4. React / Next.jsを呼ぶ判断基準

---

<!-- _class: section -->

# 01. 個人開発、重くなりがち

---

## 作りたいものは小さいのに

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 24px;">
  <div style="padding: 24px; border-left: 8px solid var(--gdg-green); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">作りたいもの</h3>
    <ul>
      <li>作品を投稿したい</li>
      <li>記事を読ませたい</li>
      <li>フォームを受けたい</li>
      <li>メッセージを送受信したい</li>
    </ul>
  </div>
  <div style="padding: 24px; border-left: 8px solid var(--gdg-red); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">なぜか考え始めるもの</h3>
    <ul>
      <li>Client State</li>
      <li>fetch / cache / hydration</li>
      <li>API分離</li>
      <li>Server / Client境界</li>
    </ul>
  </div>
</div>

---

<!-- _class: lead -->

> 個人開発の敵は  
> 技術的負債だけではなく  
> **完成前に燃え尽きること**

---

## 今日の主張

<div style="display: flex; align-items: center; justify-content: center; gap: 22px; margin-top: 42px;">
  <div style="padding: 26px 32px; border: 3px solid var(--gdg-blue); border-radius: 12px; font-weight: 700;">Honoで始める</div>
  <div style="font-size: 42px; color: var(--gdg-blue);">→</div>
  <div style="padding: 26px 32px; border: 3px solid var(--gdg-green); border-radius: 12px; font-weight: 700;">必要なJSを足す</div>
  <div style="font-size: 42px; color: var(--gdg-green);">→</div>
  <div style="padding: 26px 32px; border: 3px solid var(--gdg-yellow); border-radius: 12px; font-weight: 700;">理由ができたらReact</div>
</div>

<div style="margin-top: 40px; font-size: 1.25em; text-align: center; font-weight: 700;">
Reactを使わないのではなく、使う理由が生まれるまで使わない
</div>

---

<!-- _class: section yellow -->

# 02. 小説投稿サイトで感じたこと

---

## 題材: 個人開発の小説投稿サイト

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 28px;">
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-blue); border-radius: 8px;">一覧</div>
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-blue); border-radius: 8px;">詳細</div>
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-green); border-radius: 8px;">投稿</div>
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-green); border-radius: 8px;">編集</div>
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-yellow); border-radius: 8px;">コメント</div>
  <div style="padding: 22px; background: #F8F9FA; border-top: 5px solid var(--gdg-red); border-radius: 8px;">管理画面</div>
</div>

<div style="margin-top: 34px; font-size: 1.2em; text-align: center;">
主役は「クライアント状態」より、サーバーにある作品データでした
</div>

---

## Next.jsで自然に伸びた経路

```text
Browser
↓
JavaScript起動
↓
fetch
↓
API
↓
DB
↓
JSON
↓
state更新
↓
render
```

---

## Hono SSRで短くできた経路

<div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 42px;">
  <div style="padding: 24px 30px; border: 3px solid var(--gdg-blue); border-radius: 12px; font-weight: 700;">Browser</div>
  <div style="font-size: 40px; color: var(--gdg-blue);">→</div>
  <div style="padding: 24px 30px; border: 3px solid var(--gdg-green); border-radius: 12px; font-weight: 700;">Hono</div>
  <div style="font-size: 40px; color: var(--gdg-green);">→</div>
  <div style="padding: 24px 30px; border: 3px solid var(--gdg-yellow); border-radius: 12px; font-weight: 700;">DB</div>
  <div style="font-size: 40px; color: var(--gdg-yellow);">→</div>
  <div style="padding: 24px 30px; border: 3px solid var(--gdg-red); border-radius: 12px; font-weight: 700;">HTML</div>
</div>

<div style="margin-top: 48px; font-size: 1.25em; text-align: center; font-weight: 700;">
読む・投稿する・編集するだけなら、この経路で十分なことが多い
</div>

---

## 投稿処理はこれで成立します

```text
HTML Form
↓
POST
↓
DB更新
↓
Redirect
↓
GET
```

<div style="margin-top: 28px; font-size: 1.2em;">
フォーム状態管理やJSON APIを、最初から全画面に持ち込まなくてもいいです
</div>

---

<!-- _class: section green -->

# 03. 例で考える技術選定

---

## ポートフォリオで考える

| 作りたい体験 | 選択 |
| --- | --- |
| アニメーションごりごり | React、わかる |
| アニメーションごりごりなだけ | Next.js、本当に要る? |
| 少し動く | Hono + 必要なJSでもよさそう |
| ほぼ動かない | Honoでよくない? |

---

## チャットで考える

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 24px;">
  <div style="padding: 24px; background: #F8F9FA; border-top: 5px solid var(--gdg-green); border-radius: 8px;">
    <h3 style="margin-top: 0;">ただのチャット</h3>
    <ul>
      <li>WebSocketをつなぐ</li>
      <li>sendする</li>
      <li>messageでDOMに足す</li>
    </ul>
  </div>
  <div style="padding: 24px; background: #F8F9FA; border-top: 5px solid var(--gdg-red); border-radius: 8px;">
    <h3 style="margin-top: 0;">Slackっぽいチャット</h3>
    <ul>
      <li>スレッド</li>
      <li>未読管理</li>
      <li>リッチエディタ</li>
      <li>複数ペイン</li>
    </ul>
  </div>
</div>

---

## ブログ・投稿サービスで考える

<div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-top: 42px;">
  <div style="padding: 22px 28px; border: 3px solid var(--gdg-blue); border-radius: 12px; font-weight: 700;">一覧</div>
  <div style="font-size: 36px; color: var(--gdg-blue);">→</div>
  <div style="padding: 22px 28px; border: 3px solid var(--gdg-green); border-radius: 12px; font-weight: 700;">詳細</div>
  <div style="font-size: 36px; color: var(--gdg-green);">→</div>
  <div style="padding: 22px 28px; border: 3px solid var(--gdg-yellow); border-radius: 12px; font-weight: 700;">投稿</div>
  <div style="font-size: 36px; color: var(--gdg-yellow);">→</div>
  <div style="padding: 22px 28px; border: 3px solid var(--gdg-red); border-radius: 12px; font-weight: 700;">編集</div>
</div>

<div style="margin-top: 46px; text-align: center; font-size: 1.25em; font-weight: 700;">
CRUD中心なら、サーバー状態をHTMLにするだけで強い
</div>

---

## 管理画面で考える

| UI | Hono SSR | React |
| --- | --- | --- |
| テーブル / 検索 / フォーム | 合いやすい | もちろん可能 |
| CSV出力 / 権限 / 承認 | 合いやすい | もちろん可能 |
| DnD / 複雑なグラフ操作 | つらくなる | 合いやすい |
| 画面全体の状態同期 | つらくなる | 合いやすい |

---

<!-- _class: section red -->

# 04. Honoで始める設計

---

## Server First / JavaScript on Demand

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 34px;">
  <div style="padding: 20px; background: #F8F9FA; border-top: 5px solid var(--gdg-blue); border-radius: 8px;">
    <h3 style="margin-top: 0;">Level 1</h3>
    <p>Hono + SSR + HTML Form</p>
  </div>
  <div style="padding: 20px; background: #F8F9FA; border-top: 5px solid var(--gdg-green); border-radius: 8px;">
    <h3 style="margin-top: 0;">Level 2</h3>
    <p>必要なところだけVanilla JS</p>
  </div>
  <div style="padding: 20px; background: #F8F9FA; border-top: 5px solid var(--gdg-yellow); border-radius: 8px;">
    <h3 style="margin-top: 0;">Level 3</h3>
    <p>複雑な島だけReact</p>
  </div>
  <div style="padding: 20px; background: #F8F9FA; border-top: 5px solid var(--gdg-red); border-radius: 8px;">
    <h3 style="margin-top: 0;">Level 4</h3>
    <p>必要ならAPI化・分離</p>
  </div>
</div>

---

## Routeに全部書かない

<div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 52px;">
  <div style="padding: 26px 36px; border: 3px solid var(--gdg-blue); border-radius: 12px; font-weight: 700;">Route</div>
  <div style="font-size: 42px; color: var(--gdg-blue);">→</div>
  <div style="padding: 26px 36px; border: 3px solid var(--gdg-green); border-radius: 12px; font-weight: 700;">Service</div>
  <div style="font-size: 42px; color: var(--gdg-green);">→</div>
  <div style="padding: 26px 36px; border: 3px solid var(--gdg-yellow); border-radius: 12px; font-weight: 700;">Repository / DB</div>
</div>

<div style="margin-top: 46px; text-align: center; font-size: 1.2em;">
HTMLを返すRouteとJSONを返すRouteで、同じServiceを使えるようにします
</div>

---

## HTMLから始めて、必要ならAPIへ

```tsx
app.get('/novels/:id', async (c) => {
  const novel = await novelService.find(c.req.param('id'))
  return c.html(<NovelPage novel={novel} />)
})

app.get('/api/novels/:id', async (c) => {
  const novel = await novelService.find(c.req.param('id'))
  return c.json(novel)
})
```

---

## 判断表

| まずHonoでよさそう | Reactが欲しい | Next.jsが欲しい |
| --- | --- | --- |
| 静的ページ | 複雑なClient State | React前提の大きめアプリ |
| フォーム中心 | リッチな操作UI | SSG / ISR |
| CRUD中心 | DnD / リッチエディタ | App Router / RSC |
| 管理画面 | リアルタイム同期UI | 画像最適化 |

---

<!-- _class: lead -->

> Honoで始めることは  
> 将来のReactを捨てることではない

---

## 持ち帰ってほしいこと

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px;">
  <div style="padding: 24px; border-top: 5px solid var(--gdg-blue); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">小さく始める</h3>
    <p>まずHono + HTMLで画面を返します</p>
  </div>
  <div style="padding: 24px; border-top: 5px solid var(--gdg-green); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">必要分だけ足す</h3>
    <p>JavaScriptは体験が必要とする場所へ置きます</p>
  </div>
  <div style="padding: 24px; border-top: 5px solid var(--gdg-yellow); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">理由で選ぶ</h3>
    <p>React / Next.jsは必要になった時に呼びます</p>
  </div>
</div>

---

<!-- _class: lead -->

# 個人開発者よ、Honoを使え

複雑さは、必要になってから導入しましょう!

