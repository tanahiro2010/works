---
published: true
---

# 個人開発者よ、Honoを使え

> 個人開発で最も貴重なのは、CPU やメモリよりも、開発者自身の時間と認知負荷です。

## この記事の結論

小説投稿サイト Renovel を、**必要になる前から複雑さを背負わない** 方針で作り直しました。Hono JSX で HTML を返し、動きが要る場所にだけ後から JavaScript を足す構成です。

- 最初からページ全体を SPA にしない。**初期表示のためだけに JSON API を増やさない**
- JavaScript なしでも動く形を先に作り、必要な場所だけ `hono/jsx/dom` で island にする
- 公開先は Cloudflare Workers + D1。小さく出して、必要になってから足す

扱う範囲はこれです。

| 観点 | 内容 |
| --- | --- |
| 失敗 | 「あとで必要かも」を先に実装してしまった話 |
| 構成 | Hono JSX / SSR / HTML フォーム / island |
| 配置 | Cloudflare Workers と D1 |
| 比較 | Hono、Next.js、TanStack Start の使い分け |

そして、この記事で一番伝えたいことを先に書いておきます。

**Hono を使えば何でも解決するわけではありません。** 効くのは「HTML を返すだけで始められるアプリ」の場合だけです。そこに限れば、フロントエンドと API の境界を最初から引かずに済み、必要になった場所にだけ後から複雑さを足せます。SEO もフレームワーク名では決まらず、最初に返す HTML の中身で決まります。

> この記事は Hono Conference 2026 の登壇内容をもとに、発表では触れきれなかった構成の詳細を足したものです。

---

## 1. この記事で扱うこと

- 個人開発で複雑さを先払いしてしまった失敗
- 小説投稿サイトRenovelの構成
- Hono JSXでHTMLを返す方法
- `hono/jsx/dom`を使った局所的なインタラクション
- SSR、HTMLフォーム、islandを組み合わせる考え方
- SEOと最初のHTMLの関係
- Cloudflare WorkersとD1を使った小さな公開先
- Hono、Next.js、TanStack Startの使い分け

## 2. 個人開発の敵は「複雑さ」

個人開発では、選択肢が多いこと自体は悪くありません。

Next.js、Nuxt、TanStack Start、React SPA、Rails、Hono。現在は、目的に応じてさまざまなフレームワークを選べます。どれも正しい選択になり得ますし、チームの経験やプロダクトの要件によって最適解は変わります。

問題は、まだ必要ではない複雑さまで、最初から一緒に背負ってしまうことです。

たとえば、次のようなものがあります。

- フロントエンドとAPIの境界
- 状態とデータ取得の同期
- hydrationとブラウザJavaScript
- キャッシュ戦略
- 複数のデプロイ先
- それぞれの監視や運用

ひとつひとつは有用な仕組みです。しかし、最初の画面を表示するだけなら、本当にすべて必要でしょうか。

個人開発で貴重なのは、サービスが大きくなったときに使える計算資源だけではありません。自分がコードを理解し、変更し、リリースするための時間も資源です。

## 3. 「あとで必要かも」を先に実装した

以前、Next.jsで小説投稿サイトを作っていました。

そのころの自分はNext.jsにかなりハマっていて、画面とAPI Routesを同じアプリに置けることを便利に感じていました。公開先にはVercel、データベースにはNeonのPostgreSQLを使っていました。

構成を単純化すると、次のような流れです。

```text
ブラウザ
  -> Vercel上のAPI
    -> NeonのPostgreSQL
  <- JSON
ブラウザで画面を組み立てる
```

ブラウザの`useEffect`からAPI Routesを呼び、返ってきたデータを使って画面を組み立てていました。React QueryやTanStack Queryでデータ取得を整理するのではなく、当時は自分で`useEffect`を増やしていく形でした。

アプリとデータベースのリージョン、つまり配置地域も十分に考えていませんでした。アプリとDBの距離が遠ければ、リクエストの往復は増えます。さらに、初期表示までに必要なAPIリクエストやブラウザ側の処理も増えていきます。

初期表示は、記憶では最悪で約1分でした。少なくとも30秒以上待ったことはあります。

ここで「Next.jsが遅かった」と結論づけるのは正しくありません。待ち時間の原因を、要素ごとに計測していたわけでもないからです。非同期処理を理解していなかった自分の問題も大きく、あとから改善しても、プロジェクト自体は没にしました。

本質は、Next.jsを使ったことではありません。

必要になる前から、ブラウザでデータを取得して画面を組み立てるSPA的な複雑さを、自分で背負っていたことです。

## 4. 小さな例で考える

### 単位計算機にバックエンドは必要か

Googleで検索していたとき、とある単位計算機を見つけました。

入力された数値を計算するだけなら、ブラウザ上のJavaScriptだけで完結できます。

ところが、私が見た単位計算機は、入力のたびにバックエンドへ値を送り、レスポンスを待ってから結果を表示する構成になっていました。体感では、送信してから0.5秒ほど待ったあとに結果が表示されます。

0.5秒はベンチマークとして大きな数字ではないかもしれません。ただ、入力してすぐ結果が変わることを期待する計算機では、その小さな待ち時間が何度も発生します。使っている側としては、計算ではなく通信を待たされている感覚になります。

さらに、そのサイトはVercelにデプロイされていて、広告による収益化も行っているようでした。Vercelの無料プランには商用利用に関する条件があるため、収益化するなら有料プランを利用している可能性があります。

そこで私は、「この計算機は、Vercelの有料プランを支払えるほどの収益を生み出せているのだろうか」と疑問に思いました。広告収益よりもインフラ費用のほうが大きいなら、赤字運営になっているかもしれません。

もちろん、これは外から見た私の推測です。実際のアクセス数や広告収益、契約しているプランまでは分かりません。サイトの運営者を批判したいわけでもありません。

一方で、計算結果を保存したい、ユーザーごとの履歴を残したい、といった要件があればバックエンドは必要です。

ただ、そのサイトには、私が見た範囲では計算結果の保存やユーザーごとの履歴といった機能はありませんでした。だからこそ、「この処理は本当にバックエンドで行う必要があるのか」と感じました。

ここで伝えたいのは、そのサイトの実装が間違っているということではありません。実際には、広告計測、入力値の検証、将来の機能追加など、画面からは見えない理由があるかもしれません。

それでも、個人開発で同じような機能を作るなら、一度立ち止まって考えたいところです。バックエンドが不要な段階で、不要な通信まで増やしていないか。計算をブラウザで完結させれば、実装も構成も運用費も、もう少し小さくできるかもしれません。

### LPなのにReact SPA

もうひとつは、LPなのにReact SPAになっているケースです。

ページが複数あり、ブログもあり、ページごとに検索されたい。それなのに、ページごとの`title`や`description`がいつも同じになっている。

Reactを使っていること自体は、SEO対策ではありません。ページの内容を検索エンジンやSNSへ届けたいなら、各URLに対応した情報を用意し、それを最初のHTMLとして返す必要があります。

ここでも、Reactを使うなという話ではありません。要件に対して、最初からブラウザ側の構成が大きすぎないかを確認しよう、という話です。

## 5. そこでRenovelを作り直した

過去の小説投稿サイトを、今の自分なりの設計で作り直したものがRenovelです。

Renovelには、次のような機能があります。

- 小説の投稿と閲覧
- 認証
- 検索
- 本棚
- いいね、評価、フォロー
- 通知
- 分析
- 共同編集
- Fork
- モデレーション

現在の規模は、約1万行、27個のJSX View、9個のroute moduleです。ReactやNext.jsは使っていません。

技術スタックは次のとおりです。

- Runtime: Bun
- Webフレームワーク: Hono
- Database: PostgreSQL
- ORM: Drizzle
- UI: Hono JSX + Kiwa UI

Honoを使ったから画面が簡素になったわけではありません。見た目を作る技術と、HTMLをどのように届けるかは別の問題です。

## 6. Renovelの基本方針

Renovelでは、次の順番で機能を作るようにしています。

1. まずサーバーでHTMLを返す
2. リンクとHTMLフォームで機能を成立させる
3. ページ遷移を避けたい操作だけをブラウザで強化する
4. 必要になったらAPIやクライアント側の状態を増やす

これを「複雑さはあとで払う」と表現しています。

複雑さをなくすことはできません。アプリが成長すれば、データも状態も境界も増えていきます。

ただし、必要になる前に払わないことはできます。

## 7. Hono JSXでHTMLを返す

HonoにはJSXを使ってサーバー側でHTMLを生成する仕組みがあります。

ルートでデータを取得し、Viewへ渡し、完成したHTMLを返せます。

```tsx
/** @jsxImportSource hono/jsx */

app.get("/novel", (c) => c.html(<NovelPage novel={novel} />));
```

このコードで行っていることは、次のとおりです。

1. `/novel`へのリクエストを受ける
2. サーバー側で`novel`を取得する
3. `NovelPage`をHTMLへ変換する
4. 完成したHTMLをブラウザへ返す

初期表示のためだけに、ブラウザからJSON APIを呼ぶ必要はありません。APIが必要な機能ならAPIを作ればよいのですが、初期表示までAPIにする必要はない、という考え方です。

## 8. アプリは一つでも、責務は混ぜない

ここで、「複雑さが敵なのに、設計を分けるのか」と感じるかもしれません。

複雑さを減らすことは、何も分けないことではありません。最初から複数のサービスや複数のデプロイ単位を作らない、という意味です。

一つのアプリの中でも、画面、処理、データの責務は混ぜないようにします。

- Presentation: route、controller、JSX View
- Application: use case、query、service
- Domain: entity、value object、policy
- Infrastructure: Drizzle、PostgreSQL、repository

デプロイ単位は一つのまま、コードの責務は必要な範囲で分ける。個人開発では、このくらいの境界から始めるほうが扱いやすいことがあります。

## 9. SSR、HTMLフォーム、island

Renovelでは、ページ全体をSSRで返します。

本文を読む、ページを移動する、フォームを送信する、といった操作は、HTMLとサーバーで成立させます。

一方で、いいねや評価のように、ページ遷移なしで操作したい部分もあります。そのような部分だけをブラウザで動かします。

このように、HTMLの中にJavaScriptが必要な小さな領域を置く考え方を、islandと呼びます。

```text
ページ全体       -> SSRでHTML
リンク・送信      -> HTMLフォーム
いいね・評価      -> 小さなisland
```

ページ全体をSPAにするのではなく、JavaScriptが必要な場所だけを選びます。

## 10. `hono/jsx/dom`で局所的に動かす

ブラウザ側で動くUIは、`hono/jsx/dom`を使って書けます。

```tsx
/** @jsxImportSource hono/jsx/dom */
import { useState } from "hono/jsx";

export function LikeButton({ action, liked: initialLiked, count: initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
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

Renovelでisland化しているのは、いいね、フォロー、評価、本棚への追加、本棚からの削除です。

反対に、本文の表示やページ遷移までブラウザ側の状態管理に任せているわけではありません。

## 11. JavaScriptなしでも動く形を先に作る

islandを使う場合でも、最初からJavaScriptだけに依存する形にはしません。

まず、通常のHTMLフォームとして操作できる形を用意します。

```tsx
<span data-island="like" data-props={JSON.stringify({ action, liked, count })}>
  <form method="post" action={action}>
    <button type="submit">♥ {count}</button>
  </form>
</span>
```

JavaScriptが動かない場合でも、フォームを送信して処理できます。JavaScriptが使える場合だけ、リロードなしの操作へ強化します。

この順番にすると、最初からブラウザ側の状態管理にすべてを預けずに済みます。

実際のプロダクトでは、これだけで十分とは限りません。通信に失敗したときのロールバック、多重送信の防止、認証エラーの表示などは、別途設計する必要があります。

islandにすれば自動的に全部解決するのではなく、必要な場所だけに必要な状態を置ける、というのがポイントです。

## 12. 「軽い」を複数の意味で考える

Honoの軽さを、単純な速度だけで説明するのは不十分です。

Renovelで考えている「少なさ」には、次のようなものがあります。

- 学ぶ概念の少なさ
- 依存関係の少なさ
- ブラウザへ送るJavaScriptの少なさ
- アプリとAPIを分ける手数の少なさ
- デプロイと運用の手数の少なさ

たとえば、生成されたislands bundleは、計測時点で圧縮前約32KBでした。これは「必ず速い」という証明ではありません。ページ全体を動かすためのJavaScriptではなく、操作する部分だけを送る構成になっていることを確認するための数字です。

同様に、サーバーバンドルやTTFBも、計測環境と条件を添えて扱う必要があります。ローカル開発環境のウォームなTTFBを、そのまま本番性能として語ることはできません。

## 13. SEOはフレームワーク名で決まらない

SEOは、Honoだから強い、Next.jsだから弱い、という話ではありません。

重要なのは、各URLに対応する情報が最初のHTMLに含まれていることです。

- 本文
- `title`
- `description`
- `canonical`
- OGP

Hono JSXでは、リクエストごとに必要なデータを使ってHTMLを生成できます。

ReactやNext.jsでもSSRを使えば、同じことは実現できます。Honoの特徴は、ページ全体のReact hydrationを前提にせず、SSRと局所的なクライアントUIを自分で選びやすいことです。

## 14. Cloudflare WorkersとD1

ここまで説明したRenovel本体は、BunとPostgreSQLで動いています。

ここから紹介するCloudflare WorkersとD1は、Renovelをそのまま移行した話ではありません。Honoで小さなアプリを公開する別の選択肢です。

Hono appをexportし、`wrangler deploy`でWorkersへデプロイできます。

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.html("<h1>Hello, Hono!</h1>"));

export default app;
```

D1を使う場合は、Workerからbindingとして参照します。

```ts
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/books", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM books ORDER BY created_at DESC").all();

  return c.json(result.results);
});
```

WorkersとD1を使うと、アプリケーションとデータベースへの接続を、Cloudflareの設定とbindingでまとめられます。

2026年9月時点の料金や無料枠を前提にする場合でも、公開前に公式ドキュメントを確認してください。無料枠の条件や上限は変更される可能性があります。

大切なのは「世界最強の無料基盤」と言い切ることではありません。小規模な個人開発を、無料枠に収めながら小さく公開できる候補として検討できることです。

## 15. Honoが合うケース、合わないケース

### Honoを候補にしやすいケース

- CRUDが中心で、画面の動きは局所的
- SSRとAPIを同じ言語、同じアプリで書きたい
- `Request`、`Response`、HTTPメソッド、URLを直接扱いたい
- Reactの巨大なエコシステムが必須ではない
- WorkersやD1など、ランタイムの機能を近い距離で使いたい
- 運用コストと認知負荷を抑えたい

### 別の選択肢が自然なケース

- FigmaやCanvaのように画面全体が常に動く
- 大規模なクライアント状態がプロダクトの中心になる
- RSC、Server Actions、画像最適化などNext.jsの機能を積極的に使いたい
- 型付きroute treeやloader、client navigationが欲しい
- チームが別のフレームワークに習熟している

Next.js、TanStack Start、Honoをランキングにする必要はありません。

自分に必要な機能が何かを考え、その機能を一番自然に実装できるものを選べばよいです。自分の場合、RenovelではHonoの直接的な書き方が合っていました。

## 16. 持ち帰り

個人開発で、最初から将来のすべてを設計し切る必要はありません。

次の順番で始められないかを考えてみてください。

1. まずHTMLを返す
2. まずフォームで動かす
3. 必要な場所だけJavaScriptを足す
4. 必要になったらAPIや状態管理を増やす
5. そのまま小さく公開する

Honoを盲目的に使え、という話ではありません。

画面全体が動くなら、画面全体を動かす道具を選べばいい。HTML中心で始められるなら、最初は小さく始められる道具を選べばいい。

複雑さはなくせません。

でも、必要になる前に払わないことはできます。

個人開発者よ。複雑さをあとで払える道具として、Honoを使え。

## 参考資料

- [Hono JSX](https://hono.dev/docs/guides/jsx)
- [Hono JSX DOM](https://hono.dev/docs/guides/jsx-dom)
- [Hono on Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers)
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [TanStack Start](https://tanstack.com/start/latest)
