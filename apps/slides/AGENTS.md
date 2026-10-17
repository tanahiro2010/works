<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## ワークスペース

bun ワークスペース。`apps/slides`（slides.tanahiro2010.com）と
`apps/articles`（blog.tanahiro2010.com）が `packages/ssg` を共有する。
lint / fmt / commit フックの設定はリポジトリルートの `vite.config.ts` に集約。
`vp check` はルートから走らせる。

`packages/ssg` が持っているもの:

- `client` / `server` — routes を渡すと hydrate / renderToString する
- `routes` — `Route` 型と `matchRoute`
- `frontmatter` — Markdown の frontmatter から slug / title / date / updated を読む
- `head` — meta / OGP / JSON-LD を組み立てる。`injectHead` は marp や ippon が
  吐いた HTML に後から差し込む用（lang も ja に直す）
- `bin/prerender.js` / `bin/sitemap.js` — アプリのディレクトリで `node` から実行する

## 記事（apps/articles）

記事は `slides/<group>/<名前>/article.md`。スライドと同じフォルダに同居する。

- **frontmatter に `published: true` が無い記事は出力されない。** 書き忘れは非公開に倒れる。
- slug は記事の `slug:` → 隣の `slide.md` の `slug:` → フォルダ名、の順で決まる。
  デッキと URL を揃えたいので slide.md のものを借りる。
- タイトルは記事の `title:` → 本文先頭の `# 見出し` → フォルダ名。
  見出しをタイトルに使った場合、本文からは落とす。
- 本文は `scripts/build-articles.js` が markdown-it + Shiki で HTML にして
  `dist/articles/<slug>/` に置く。React には載せない（載せると本文が
  まるごとクライアントのバンドルに入る）。

## スライドサイト構成

`/` の一覧は React SSG、`/slides/<slug>/` は marp / ippon-slides が吐いた完結 HTML。
両者は同じ `dist/` に同居するだけで、React 側はデッキに一切関与しない。

- frontmatter の読み取りは `packages/ssg` の `frontmatter` が持つ。中央の一覧は無い。
- デッキを足すときは `slides/speakerdeck/<名前>/slide.md` を置き、frontmatter に `slug:` を書くだけ。
  `slug:` は URL になるので一度公開したら変えないこと。無い場合はフォルダ名にフォールバックする。
- `date:` が無いデッキは slide.md が git に入った日を使う。CI の checkout は `fetch-depth: 0` が必須。
- `scripts/build.js` — `src/data/slides.json`（メタデータのみ）を生成。デッキ本文は入れない。
  `description` が frontmatter に無ければ本文から抜き、それも無理ならタイトルから作る。
- `scripts/build-decks.js` — `slides/speakerdeck/*` を marp、`slides/slides/*` を ippon でビルドし `dist/slides/<slug>/` へ。
- 画像はデッキ直下の `img/`（`images/` `assets/` も可）に置き、slide.md からは `img/x.png` と相対で書くのが基本。
  デッキ内ならどこに置いてもよく、ビルド時に出力 HTML の参照を読んで `dist/slides/<slug>/` へ自動で複製する
  （参照どおりの場所に無ければファイル名で探す。`sandbox/` `codelab/` は見ない）。
- デッキの画像切れはローカルだと隣のフォルダに繋がって気付けないので、ビルド末尾に dist 基準で参照を検査し `WARN` を出す。
  テーマが使う `../../assets/...` は `.marp/assets/` を置けば `dist/assets/` に複製される（今は実体が無く WARN が出たまま）。
- `/slides/*` は React のルートではないので `routes.tsx` に足さないこと。

## SEO / AIO

全ページが単体で meta / OGP / Twitter Card / canonical / JSON-LD を持つ。
デッキと記事は React を通らないので、生成スクリプト側で `injectHead` / `renderHead` を呼ぶ。

- 一覧: WebSite + ItemList / デッキ: PresentationDigitalDocument + BreadcrumbList
- 記事: BlogPosting(wordCount, keywords) + BreadcrumbList
- `sitemap.xml` / `robots.txt` / `llms.txt` は `bin/sitemap.js` が dist を歩いて作る
- 新しい出力を足したら、ビルド後に全ページを監査して欠落が無いか見ること

## デッキのビルドキャッシュ

`.deck-cache/` に slug ごとの HTML と manifest を置く。ハッシュは slide.md 本体に加え、
テーマ CSS・marp / ippon のバージョン・`build-decks.js`・`head.js`・`site.config.json` を含む。
**HTML に焼き込まれるものを増やしたら、ハッシュの材料にも足すこと。** 足し忘れると
古い HTML が残り続ける。画像はキャッシュに入れず毎回コピーする。

## React SSG

This app is React 19 prerendered to static HTML at build time — there is no server at runtime.

- `src/routes.tsx` is the single source of truth. Add a `{ path, title, Component }` entry and the build emits `dist/<path>/index.html` for it.
- `src/main.tsx` is the browser entry: it hydrates the prerendered markup, and falls back to `createRoot` under `vp dev`, where `index.html` has an empty `#root`.
- `src/entry-server.tsx` is the SSR entry, built to the gitignored `.vite-ssg/` and consumed by `scripts/prerender.ts`.
- `vp run build` runs all four steps: `tsc`, client build, SSR build, prerender. Plain `vp build` only produces the unrendered client bundle.
- Keep components render-safe on the server: no `window`/`document` access outside effects, or the prerender step throws.

## Deploy (Cloudflare Pages)

`wrangler.jsonc` points Pages at `dist/`, which only exists after the full prerender.

- `vp run deploy` — build + `wrangler pages deploy` from your machine.
- `vp run preview:cf` — serve `dist/` through workerd, the closest local match to production.
- `.github/workflows/deploy.yaml` が `main` への push で両アプリをデプロイする。
  `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` の Secrets が要る。
  そのアプリの入力が変わっていない push ではビルドもデプロイも飛ばす。
- `compatibility_date` must not be newer than the bundled workerd supports, or `wrangler pages dev` refuses to start.
