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

## React SSG

This app is React 19 prerendered to static HTML at build time — there is no server at runtime.

- `src/routes.tsx` is the single source of truth. Add a `{ path, title, Component }` entry and the build emits `dist/<path>/index.html` for it.
- `src/main.tsx` is the browser entry: it hydrates the prerendered markup, and falls back to `createRoot` under `vp dev`, where `index.html` has an empty `#root`.
- `src/entry-server.tsx` is the SSR entry, built to the gitignored `.vite-ssg/` and consumed by `scripts/prerender.ts`.
- `vp run build` runs all four steps: `tsc`, client build, SSR build, prerender. Plain `vp build` only produces the unrendered client bundle.
- Keep components render-safe on the server: no `window`/`document` access outside effects, or the prerender step throws.
