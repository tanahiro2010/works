#!/usr/bin/env node
/**
 * 一覧データから OGP 画像を作って dist/og/ に置く。アプリのディレクトリで実行する。
 *
 * カードの見出しは frontmatter の summary を優先する。発表タイトルは
 * 長いものが多く、そのまま入れると 3 行で切れて何の資料か分からなくなるため。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { createOgRenderer } from "@tanahiro2010/ssg/ogimage";

const root = process.cwd();
const distDir = path.join(root, "dist");
const site = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));

/** src/data/*.json から、画像を作る対象を集める。 */
const items = [];
for (const name of ["articles.json", "slides.json"]) {
  const file = path.join(root, "src/data", name);
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const list = data.articles ?? Object.values(data).flatMap((g) => g.slides ?? []);
  items.push(...list);
}

const render = await createOgRenderer(site);
const outDir = path.join(distDir, "og");
fs.mkdirSync(outDir, { recursive: true });

// 一覧ページ用。site.ogImage が指す先を実体として置く。
fs.writeFileSync(
  path.join(distDir, path.basename(site.ogImage)),
  render({ title: site.tagline || site.description, label: site.name }),
);

let count = 0;
const noSummary = [];
for (const item of items) {
  if (!item.slug) continue;
  if (!item.summary) noSummary.push(item.slug);
  fs.writeFileSync(
    path.join(outDir, `${item.slug}.png`),
    render({
      title: item.summary || item.title || item.name,
      label: site.name,
      date: item.date ?? "",
    }),
  );
  count += 1;
}

console.log(`wrote ${count} OGP 画像 -> dist/og/ (+ ${path.basename(site.ogImage)})`);
if (noSummary.length > 0) {
  console.log(
    `  note: summary 未設定が ${noSummary.length} 件。タイトルで代用しています` +
      `（${noSummary.slice(0, 3).join(", ")}${noSummary.length > 3 ? " ほか" : ""}）`,
  );
}
