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
import { blogPostingSchema, breadcrumbSchema, renderHead } from "@tanahiro2010/ssg/head";
import { createMarkdown, esc } from "./markdown.js";

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

const md = await createMarkdown();

const { articles } = JSON.parse(fs.readFileSync(articlesJson, "utf8"));

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
  image: article.image,
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
