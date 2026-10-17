#!/usr/bin/env node
/**
 * SSG のプリレンダ工程。アプリのディレクトリで実行する。
 *
 * `vp build`（クライアント）と `vp build --ssr`（サーバ）の後に走り、
 * entry-server が公開している routes を全部 HTML にして dist へ書き出す。
 * 各ルートが素の index.html として配信され、読み込み時に hydrate される。
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const clientDir = path.join(root, "dist");
const serverDir = path.join(root, ".vite-ssg");

const template = await readFile(path.join(clientDir, "index.html"), "utf8");
const { render, routes } = await import(
  pathToFileURL(path.join(serverDir, "entry-server.js")).href
);

for (const route of routes) {
  const { html, title } = render(route.path);
  const page = template
    .replace("<!--app-html-->", html)
    .replace(/<title>.*?<\/title>/, `<title>${escapeTitle(title)}</title>`);

  const outFile = path.join(clientDir, route.path.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, page);
}

console.log(`prerendered ${routes.length} route(s) -> dist/`);

await rm(serverDir, { recursive: true, force: true });

function escapeTitle(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
