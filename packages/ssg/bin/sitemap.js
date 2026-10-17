#!/usr/bin/env node
/**
 * dist を歩いて sitemap.xml / robots.txt / llms.txt を書く。
 *
 * ビルドの最後に実行する。React のプリレンダ分も、marp / ippon のデッキも、
 * Markdown から起こした記事も、出来上がった index.html を数えるだけで拾える。
 */
import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const site = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** dist 配下の index.html を URL パスに直して集める。 */
const collect = (dir, base = "/") => {
  const urls = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "assets") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      urls.push(...collect(full, `${base}${entry.name}/`));
    } else if (entry.name === "index.html") {
      urls.push({ loc: base, lastmod: fs.statSync(full).mtime.toISOString().slice(0, 10) });
    }
  }
  return urls;
};

const urls = collect(distDir).sort((a, b) => a.loc.localeCompare(b.loc));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${esc(new URL(u.loc, site.url).href)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`,
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);

fs.writeFileSync(
  path.join(distDir, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site.url).href}\n`,
);

// llms.txt: クロールする LLM にサイトの地図を平文で渡す。
const llms = `# ${site.title}

> ${site.description}

著者: ${site.author} (${site.authorUrl})

## ページ

${urls.map((u) => `- ${new URL(u.loc, site.url).href}`).join("\n")}
`;
fs.writeFileSync(path.join(distDir, "llms.txt"), llms);

console.log(`wrote sitemap.xml / robots.txt / llms.txt (${urls.length} URL)`);
