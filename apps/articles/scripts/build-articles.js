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
import katex from "katex";
import { blogPostingSchema, breadcrumbSchema, renderHead } from "@tanahiro2010/ssg/head";
import MarkdownIt from "markdown-it";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const articlesJson = fileURLToPath(new URL("../src/data/articles.json", import.meta.url));
const articleCss = fs.readFileSync(
  fileURLToPath(new URL("../styles/article.css", import.meta.url)),
  "utf8",
);

const site = JSON.parse(
  fs.readFileSync(fileURLToPath(new URL("../site.config.json", import.meta.url)), "utf8"),
);

const { articles } = JSON.parse(fs.readFileSync(articlesJson, "utf8"));

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const md = MarkdownIt({ html: true, linkify: true, typographer: false });
md.use(
  await Shiki({
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
    // 記事には gitignore のような Shiki が知らない言語指定も出てくる。
    // 落とさずプレーンテキストとして出す。
    fallbackLanguage: "text",
  }),
);

/**
 * `$$` で囲んだ行を数式にする。
 *
 * インラインの `$...$` は実装しない。記事には PHP の `$search` や
 * Makefile の `$$(seq ...)` が普通に出てくるので、拾いにいくと本文が壊れる。
 * ビルド時に KaTeX で HTML + MathML にするため、閲覧側に JS は要らない。
 */
md.block.ruler.before("fence", "math_block", (state, startLine, endLine, silent) => {
  const open = state.bMarks[startLine] + state.tShift[startLine];
  const openEnd = state.eMarks[startLine];
  if (state.src.slice(open, openEnd).trim() !== "$$") return false;

  let line = startLine;
  while (++line < endLine) {
    const from = state.bMarks[line] + state.tShift[line];
    if (state.src.slice(from, state.eMarks[line]).trim() === "$$") break;
  }
  if (line >= endLine) return false; // 閉じが無ければ数式として扱わない
  if (silent) return true;

  const body = state.getLines(startLine + 1, line, state.blkIndent, false).trim();
  const token = state.push("math_block", "", 0);
  token.content = body;
  token.map = [startLine, line + 1];
  state.line = line + 1;
  return true;
});

md.renderer.rules.math_block = (tokens, idx, _options, env) => {
  env.hasMath = true;
  try {
    return `<div class="math-block">${katex.renderToString(tokens[idx].content, {
      displayMode: true,
      output: "htmlAndMathml",
      throwOnError: true,
      strict: false,
    })}</div>\n`;
  } catch (err) {
    // 数式が壊れていてもビルドは止めない。原文をそのまま出して警告する。
    console.warn(`  WARN 数式を解釈できませんでした: ${err.message}`);
    return `<pre class="math-error">${esc(tokens[idx].content)}</pre>\n`;
  }
};

// mermaid はコードではなく図。ハイライトせずそのまま渡して、
// 描画はページ側の mermaid.js に任せる。
const highlightFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim().toLowerCase() === "mermaid") {
    env.hasMermaid = true;
    return `<pre class="mermaid">${esc(token.content)}</pre>\n`;
  }
  return highlightFence(tokens, idx, options, env, self);
};

/** 相対パスの画像を、出力先から見たパスに書き換えつつ実体をコピーする。 */
const copyAssets = (srcDir, outDir) => {
  for (const name of ["img", "images", "assets"]) {
    const from = path.join(srcDir, name);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(outDir, name), { recursive: true });
  }
};

const KATEX_LINK = '<link rel="stylesheet" href="/katex/katex.min.css">';

/** KaTeX の CSS とフォントを dist/katex/ に複製する。CDN には頼らない。 */
const copyKatex = () => {
  const from = fileURLToPath(new URL("../node_modules/katex/dist", import.meta.url));
  const to = path.join(distDir, "katex");
  fs.mkdirSync(to, { recursive: true });
  fs.copyFileSync(path.join(from, "katex.min.css"), path.join(to, "katex.min.css"));
  fs.cpSync(path.join(from, "fonts"), path.join(to, "fonts"), { recursive: true });
};

const MERMAID_SCRIPT = `<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "neutral" });
</script>`;

const page = (article, body, { hasMermaid, hasMath }) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
${renderHead({
  site,
  title: `${article.title} | ${site.title}`,
  description: article.description,
  pathname: article.path,
  type: "article",
  publishedAt: article.date,
  modifiedAt: article.updated,
  jsonLd: [
    blogPostingSchema(site, article),
    breadcrumbSchema(site, [
      { name: "Blog", path: "/" },
      { name: article.title, path: article.path },
    ]),
  ],
})}
<style>${articleCss}</style>
${hasMath ? KATEX_LINK : ""}
${hasMermaid ? MERMAID_SCRIPT : ""}
</head>
<body>
<main>
<a class="back" href="/">&larr; 記事一覧</a>
<article>
<header class="article-header">
<h1>${esc(article.title)}</h1>
<p class="meta"><time datetime="${esc(article.date)}">${esc(article.date)}</time></p>
</header>
<div class="prose">
${body}
</div>
</article>
<footer>© tanahiro2010</footer>
</main>
</body>
</html>
`;

/** RSS。記事が増えたら購読者に届くように、一覧と一緒に吐く。 */
const feed = (articles) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(site.title)}</title>
<link>${esc(site.url)}</link>
<description>${esc(site.description)}</description>
<language>ja</language>
<atom:link href="${esc(new URL("/feed.xml", site.url).href)}" rel="self" type="application/rss+xml"/>
${articles
  .map((a) => {
    const url = new URL(a.path, site.url).href;
    return `<item>
<title>${esc(a.title)}</title>
<link>${esc(url)}</link>
<guid isPermaLink="true">${esc(url)}</guid>
<pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate>
<description>${esc(a.description)}</description>
</item>`;
  })
  .join("\n")}
</channel>
</rss>
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
    const env = {};
    const body = md.render(markdown, env);

    fs.writeFileSync(
      path.join(outDir, "index.html"),
      page(article, body, { hasMermaid: env.hasMermaid, hasMath: env.hasMath }),
    );
    copyAssets(srcDir, outDir);
  }

  copyKatex();

  fs.writeFileSync(path.join(distDir, "feed.xml"), feed(articles));
  console.log(`built ${articles.length} article(s) -> dist/articles/ (+ feed.xml)`);
};

build();
