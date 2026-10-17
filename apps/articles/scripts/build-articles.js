// 公開記事を1本ずつ完結した HTML にして dist/articles/<slug>/index.html へ置く。
//
// スライドのデッキと同じ考え方で、本文は React のツリーに載せない。
// 載せると articles.json の中身がまるごとクライアントのバンドルに入ってしまう。
// 記事は読むだけのページなので、静的 HTML を一覧の隣に並べれば足りる。
//
// vp build が dist/ を空にするので、必ずプリレンダの後に実行すること。

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import Shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const articlesJson = fileURLToPath(new URL("../src/data/articles.json", import.meta.url));
const articleCss = fs.readFileSync(
  fileURLToPath(new URL("../styles/article.css", import.meta.url)),
  "utf8",
);

const { articles } = JSON.parse(fs.readFileSync(articlesJson, "utf8"));

const md = MarkdownIt({ html: true, linkify: true, typographer: false });
md.use(
  await Shiki({
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  }),
);

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 相対パスの画像を、出力先から見たパスに書き換えつつ実体をコピーする。 */
const copyAssets = (srcDir, outDir) => {
  for (const name of ["img", "images", "assets"]) {
    const from = path.join(srcDir, name);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(outDir, name), { recursive: true });
  }
};

const page = (article, body) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(article.title)} | blog.tanahiro2010.com</title>
${article.description ? `<meta name="description" content="${esc(article.description)}">\n` : ""}<meta property="og:title" content="${esc(article.title)}">
<meta property="og:type" content="article">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>${articleCss}</style>
</head>
<body>
<main>
<a class="back" href="/">&larr; 記事一覧</a>
<header class="article-header">
<h1>${esc(article.title)}</h1>
<p class="meta"><time datetime="${esc(article.date)}">${esc(article.date)}</time></p>
</header>
<div class="prose">
${body}
</div>
<footer>© tanahiro2010</footer>
</main>
</body>
</html>
`;

const build = () => {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ が無い。vp build とプリレンダの後に実行すること");
  }

  for (const article of articles) {
    const srcDir = path.join(repoRoot, article.dir);
    const outDir = path.join(distDir, "articles", article.slug);
    fs.mkdirSync(outDir, { recursive: true });

    const source = fs.readFileSync(path.join(srcDir, "article.md"), "utf8");
    const markdown = source
      .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
      // 先頭の `# 見出し` はページ上部に別途出すので本文からは落とす。
      .replace(/^\s*#\s+.+$/m, "");
    const body = md.render(markdown);

    fs.writeFileSync(path.join(outDir, "index.html"), page(article, body));
    copyAssets(srcDir, outDir);
  }

  console.log(`built ${articles.length} article(s) -> dist/articles/`);
};

build();
