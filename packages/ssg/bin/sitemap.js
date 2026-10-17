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

// llms.txt: クロールする LLM にサイトの中身を平文で渡す。
// URL を並べるだけだと何のページか分からないので、タイトルと説明を添える。
// 一覧用の JSON があればそこから引く。
const describe = () => {
  const index = new Map();
  for (const name of ["src/data/articles.json", "src/data/slides.json"]) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const items = data.articles ?? Object.values(data).flatMap((g) => g.slides ?? []);
    for (const item of items) index.set(item.path, item);
  }
  return index;
};

const described = describe();

const entry = (u) => {
  const item = described.get(u.loc);
  const url = new URL(u.loc, site.url).href;
  if (!item) return `- [${u.loc === "/" ? site.title : u.loc}](${url})`;
  const date = item.date ? ` (${item.date})` : "";
  const desc = item.description ? `: ${item.description}` : "";
  return `- [${item.title || item.name}](${url})${date}${desc}`;
};

const llms = `# ${site.title}

> ${site.description}

著者: ${site.author} (${site.authorUrl})
言語: 日本語
${site.sameAs?.length ? `関連: ${site.sameAs.join(" / ")}\n` : ""}
## ページ

${urls.map(entry).join("\n")}
`;
fs.writeFileSync(path.join(distDir, "llms.txt"), llms);

console.log(`wrote sitemap.xml / robots.txt / llms.txt (${urls.length} URL)`);
