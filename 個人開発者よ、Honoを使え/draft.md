# 個人開発者よ、Honoを使え

## 概要
これはタイトル通りの記事を書くためのドラフトです。
あくまで記事を書くための情報をまとめただけのものです。
これを読み込んだあなたは、ZennやQiitaに投稿するために作者目線となって記事を作成してください。
記事は同フォルダのarticle.mdに、スライドはHono Conference用テーマ（./sampleにあるやつ）を倣って同フォルダのslide.mdに作成してください。
また、作成する順番としてはslide -> articleでお願いします。
イメージとしては、articleは発表の内容を拡張して書く記事って感じです。
それぞれのセクションごとの文章量を増やし、もしそのネタが技術的側面を持っているのなら発表以上に技術要素を追加したり（そのためにセクションを追加したりもする）して欲しいです。

## 30分発表のスライドを作るに当たって
適度に画像を挿入したり、コードを挿入したりして、見やすいスライドを作ってください。
Chromeとか動かしてスクショ撮るのもOKです。
また、他のプロジェクトから画像を持ってくるのもOKです。
発表は30分枠。情報を詰め込むより、Renovelという一つの実例を通して話を進める。

**なお、実際に適当なプロジェクトを作ってレスポンス速度の測定などもしてください**

## 記事を書くに当たって
記事はスライドの各セクションごとを増量し、そして技術的側面を追加して書くことを意識してください。
また、記事の中では画像を使うことはできません。
Mermaidなどで図を作ることはできます。

## 記事・スライド共通ドラフト
- 発表の中心メッセージ
  - Honoなら、HTMLを返すだけの小さな構成から始めて、捨てずにフルスタックアプリまで育てられる
  - 個人開発で最も貴重なのは、CPUやメモリよりも開発者自身の時間と認知負荷
  - Honoの「軽さ」を速度だけでなく、以下の少なさとして話す
    - 学ぶ概念の少なさ
    - 依存関係の少なさ
    - ブラウザに送るJavaScriptの少なさ
    - デプロイと運用の手数の少なさ
- タイトル
  - 題名：個人開発者よ、Honoを使え
  - 発表場所：Hono Conference 2026 in Tokyo
  - 発表者：田中博悠 / Hirohisa Tanaka / tanahiro2010
- 自己紹介
  - 所属：三田学園高等学校 1年生
  - Hono Conference 2026のコアスタッフの一人
  - 趣味
    - 個人開発
    - インターン
    - 競プロ
    - 音楽
    - バンジージャンプ
  - 好きなフレームワーク
    - Hono
    - React
    - Ruby on Rails
  - 立場
    - 実務も勉強中
    - 個人開発では何度も技術選定に失敗してきた人
- 個人開発の敵は「複雑さ」
  - 問いかけ
    - みなさんは、個人開発に何を使っていますか？
  - 選択肢はたくさんある
    - Next.js
    - Nuxt
    - TanStack Start
    - React SPA
    - など
  - どれも正しい選択になり得る
  - ただし個人開発では、「将来必要かもしれない」複雑さを最初から背負ってしまいがち
    - フロントエンドとAPIの境界
    - 状態同期
    - データ取得
    - ハイドレーション
    - キャッシュ
    - デプロイ先
  - ここで一言
    - 「それ、Honoでいいじゃん」
  - 話す際の注意
    - 他人の個人開発を「オーバースペック」と断定する話はメインにしない
    - 見えていない要件や、開発者の習熟度という別の利点があるため
- 昔の自分の失敗
  - Next.jsにハマっていた頃、小説投稿サイトを作った
  - React Query / TanStack Queryは使わず、`useEffect`でAPI Routesから大量にデータを取得していた
  - Vercel + Neonで、リージョンも十分に考えていなかった
  - APIリクエストとクライアント側の処理が増え、最初のロードが最悪1分程度かかった
  - 軽量化しても救いきれず、そのプロジェクトは没になった
  - ここで「Next.jsが悪い」と結論づけない
    - フレームワークよりも、当時の自分の設計とプロダクトの要求が合っていなかったことが本質
    - そもそも非同期を理解してなかったのも大きいと思う
      - まあ理解した後に改善してなお没になったのだけど...
  - ここで伝えたい一言
    - 「Next.jsを使ったから失敗したのではない。必要になる前から、SPA的な複雑さを自分で背負ってしまった」
- Renovelを見せる
  - 過去の小説投稿サイトを、現在の自分なりの設計で作り直したのがRenovel
  - 実装済みの機能
    - 小説の投稿・閲覧
    - 認証
    - 検索
    - 本棚
    - いいね・評価・フォロー
    - 通知
    - 分析
    - 共同編集
    - Fork
    - モデレーション
  - 現在のワーキングツリーの規模
    - 約9,800行
    - 27個のJSX View
    - 9個のroute module
  - 技術スタック
    - Runtime：Bun
    - Webフレームワーク：Hono
    - DB：PostgreSQL
    - ORM：Drizzle
    - UI：Hono JSX + Kiwa UI(Hono用の`shadcn/ui`的なやつ)
    - ReactもNext.jsも使っていない
  - 見せ方
    - 最初にUIのデモを見せる
    - その後に技術スタックを公開する
    - 「Honoでもここまで作れる」を先に体感してもらう
- Honoで複雑さを後払いする
  - Renovelのフロントエンド方針
    - `hono/jsx`でHTMLをSSRする
    - リンクとHTMLフォームで機能を成立させる
    - ページ遷移を避けたい操作だけ`hono/jsx/dom`のislandにする
    - ページ全体はSSRのままにする
  - リクエストの流れ
    - `GET /novel`
      - Hono route
      - Application Service / Repository
      - `hono/jsx`でHTMLを生成
      - ブラウザに完成したHTMLを返す
      - 必要な部品だけislandとして起動
  - 利点
    - 初期表示のためだけのJSON APIを作らなくてよい
    - フロントエンドとバックエンドを別アプリ・別デプロイにしなくてもよい
  - 注意
    - 責務分割まで不要になるわけではない
    - Renovel自体はPresentation / Application / Domain / Infrastructureを分けている
    - 「アプリを分けない」と「設計を分けない」は別の話
- SSRファースト + 必要なところだけHooks
  - Honoには`hono/jsx`が内蔵されており、サーバーでHTMLをレンダリングできる
  - `hono/jsx/dom`でブラウザ上のClient Componentsも書ける
  - Reactと互換または部分互換のAPIがある
    - `useState`
    - `useEffect`
    - `useReducer`
    - `useMemo`
    - など
  - Renovelでisland化しているもの
    - いいね
    - フォロー
    - 評価
    - 本棚追加
    - 本棚から削除
  - 現在の生成済みislands bundleは圧縮前で約32KB
    - サイズは必ず発表直前に再計測する
  - サーバーが返すNo-JS fallback
    - JavaScriptが動かなくても通常のHTMLフォームとして操作できる
    - サンプルコードは`sample1.tsx`
  - ブラウザでその部分だけ強化
    - `useState` + `fetch`でリロードなしの操作に変える
    - サンプルコードは`sample2.tsx`
    - 実際のRenovelでは、失敗時のロールバックや多重送信の防止も行っている
- SEOに強い、とは何か
  - SEOはフレームワーク名で決まるものではない
  - 重要なのは、各URLの以下の情報が最初のHTMLで返ること
    - 本文
    - `title`
    - `description`
    - `canonical`
    - OGP
  - Hono JSXではリクエストごとにそのHTMLを直接生成できる
  - SPAの後からmetaを書き換える方式より、SNSのembedやJS実行を待たないクローラーにも扱いやすい
  - ReactやNext.jsでもSSRにより同様のことはできる
  - Honoの利点
    - ページ全体のReact hydrationを前提にせず、SSRと局所的なクライアントUIを選べる
- Workers + D1で運用まで小さくする
  - HonoはCloudflare Workers向けのテンプレートがある
  - 最小構成ではHono appをexportし、`wrangler deploy`するだけ
  - D1はWorkerからbindingとして参照できる
    - アプリとDB接続の統合がシンプル
  - 2026年9月時点のWorkers Free
    - 1日10万リクエスト
  - 2026年9月時点のD1 Free
    - 1日500万行read
    - 1日10万行write
    - ストレージ合計5GB
    - 利用していない時間のcompute課金なし
    - D1からのデータ転送課金なし
  - 表現上の注意
    - 「世界最強」ではなく、「小規模な個人開発が無料枠に収まりやすい」と表現する
  - RenovelとWorkers + D1の関係
    - 現在のRenovelはBun + PostgreSQL
    - 現状のままWorkers + D1へデプロイできるわけではない
    - Renovelはアプリ構成の実例として扱う
    - Workers + D1は別の小さな持ち帰り用サンプルで実演する
- Next.js / TanStack Start / Honoの使い分け
  - Next.jsが向く場合
    - Reactの大きなエコシステムを使いたい
    - ページ全体に複雑なクライアント状態がある
    - React Server Components、Server Actions、画像最適化、キャッシュなどの機能を積極的に利用したい
    - チームがNext.jsに慣れている
  - TanStack Startが向く場合
    - 型付きのroute tree、loader、client navigationが欲しい
    - React / Solidによるフルスタックなアプリモデルを使いたい
    - Server Functionsによる型安全な境界が欲しい
  - Honoが向く場合
    - HTTPメソッド、URL、`Request` / `Response`を直接的に書きたい
    - SSR中心で、クライアントの操作は局所的
    - アプリモデルをフレームワークに決めすぎてほしくない
    - Workers / D1などのランタイム機能を近い距離で使いたい
    - ある程度Reactっぽい文法が使えてAPIも同じ言語で書きたくて運営にそこまで費用をかけたくなくて別にそこまでReactの巨大なエコシステムを必要としない個人開発
      - 該当する例
        - CRUDがメインで画面の動きが少ない個人開発ってだいたいこれ
      - 該当しない例
        - FigmaとかCanvaみたいなバリバリ動的に画面を動かすやつ
  - 伝え方
    - 「TanStack StartよりHonoが優れている」ではない
    - 「自分にはHonoの直接的な書き方の方が合っていた」と話す
- 持ち帰りとまとめ
  - 聴衆に持ち帰ってもらうのは、特定のAPIの暗記ではなく以下の作り方
    - まずHTMLを返す
    - まずフォームで動かす
    - 必要な場所だけJavaScriptを足す
    - そのままWorkersへ持っていく
  - 持ち帰り用に、小さなGitHubリポジトリを用意する
    - Hono JSXによるSSR
    - D1のCRUD
    - JavaScriptがなくても動くHTMLフォーム
    - `hono/jsx/dom`の小さなisland
    - `wrangler deploy`で公開できる構成
    - SPAやより大きなフレームワークへ進む判断基準
    - 最後のスライドにQRコードを載せる
  - 最後の一言
    - 「Honoを盲目的に使え、ではない」
    - 「個人開発者よ、複雑さを後払いできる道具としてHonoを使え」
- 発表で実測してから使う数値
  - 以下は発表直前に同じ環境で再計測する
  - 数値のない「軽い」は言わない
  - 計測対象
    - Renovelのサーバーbundle size
    - islands bundleの圧縮前 / gzipサイズ
    - ページごとのJavaScript転送量
    - コールドスタート後のTTFB
    - `wrangler deploy`にかかる時間
    - 最小サンプルのWorker bundle sizeとstartup time
    - 月額コストの想定ケース
- 主張時の注意
  - Honoの軽さと、自分の実装の速さを混同しない
  - Next.jsの機能の多さを単純な欠点としない
    - 必要な人にとってはそれが利点
  - Reactはバックエンド分離やSPAを強制しない
  - SSRを使ってもReactの利点は消えない
  - TanStack StartにもSSR、Server Functions、Progressive Enhancement、Cloudflare向けデプロイがある
  - SEOはフレームワーク名ではなく、実際に返すHTMLと運用で決まる
  - すべてのサイトにHonoだけが最適とは言わない




## コードサンプル
  - `sample1.tsx`：サーバーが返すNo-JS fallback

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

  - `sample2.tsx`：ブラウザでその部分だけ強化

    ```tsx
    /** @jsxImportSource hono/jsx/dom */
    import { useState } from "hono/jsx"

    export function LikeButton({ action, liked: initialLiked, count: initialCount }) {
      const [liked, setLiked] = useState(initialLiked)
      const [count, setCount] = useState(initialCount)

      async function toggle() {
        const next = !liked
        setLiked(next)
        setCount((value) => value + (next ? 1 : -1))
        await fetch(action, { method: "POST" })
      }

      return <button onClick={toggle}>♥ {count}</button>
    }
    ```

- 参考資料
  - Hono JSX: https://hono.dev/docs/guides/jsx
  - Hono Client Components: https://hono.dev/docs/guides/jsx-dom
  - Hono on Cloudflare Workers: https://hono.dev/docs/getting-started/cloudflare-workers
  - Cloudflare Workers Pricing: https://developers.cloudflare.com/workers/platform/pricing/
  - Cloudflare D1 Pricing: https://developers.cloudflare.com/d1/platform/pricing/
  - TanStack Start: https://tanstack.com/start/latest
