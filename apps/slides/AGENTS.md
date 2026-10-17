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

## スライドサイト構成

`/` の一覧は React SSG、`/slides/<slug>/` は marp / ippon-slides が吐いた完結 HTML。
両者は同じ `dist/` に同居するだけで、React 側はデッキに一切関与しない。

- `scripts/slides-meta.js` — slide.md の frontmatter から slug / title / date を読む。中央の一覧は持たない。
- デッキを足すときは `slides/speakerdeck/<名前>/slide.md` を置き、frontmatter に `slug:` を書くだけ。
  `slug:` は URL になるので一度公開したら変えないこと。無い場合はフォルダ名にフォールバックする。
- `date:` が無いデッキは slide.md が git に入った日を使う。CI の checkout は `fetch-depth: 0` が必須。
- `scripts/build.js` — `slides.json`（メタデータのみ）をリポジトリ root に生成。デッキ本文は入れない。
- `scripts/build-decks.js` — `slides/speakerdeck/*` を marp、`slides/slides/*` を ippon でビルドし `dist/slides/<slug>/` へ。
- 画像はデッキ直下の `img/`（`images/` `assets/` も可）に置き、slide.md からは `img/x.png` と相対で書くのが基本。
  デッキ内ならどこに置いてもよく、ビルド時に出力 HTML の参照を読んで `dist/slides/<slug>/` へ自動で複製する
  （参照どおりの場所に無ければファイル名で探す。`sandbox/` `codelab/` は見ない）。
- デッキの画像切れはローカルだと隣のフォルダに繋がって気付けないので、ビルド末尾に dist 基準で参照を検査し `WARN` を出す。
  テーマが使う `../../assets/...` は `.marp/assets/` を置けば `dist/assets/` に複製される（今は実体が無く WARN が出たまま）。
- `/slides/*` は React のルートではないので `routes.tsx` に足さないこと。

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
- `.github/workflows/deploy.yaml` deploys `main` on every change under `frontend/`. It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets.
- `compatibility_date` must not be newer than the bundled workerd supports, or `wrangler pages dev` refuses to start.
