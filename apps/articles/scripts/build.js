// articles.json（記事一覧のメタデータ）を作る。
//
// 記事は slides/<group>/<名前>/article.md に、スライドと同じフォルダで同居している。
// slug / title / date は隣の slide.md と同じ規則で決まるので、article.md 側の
// frontmatter に書くのは基本 `published: true` だけでよい。
//
// published が true でないものは一切出力しない（書き忘れ＝非公開に倒す）。

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter, readDocMeta } from "@tanahiro2010/ssg/frontmatter";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const outFile = fileURLToPath(new URL("../src/data/articles.json", import.meta.url));

const GROUPS = ["slides/slides", "slides/speakerdeck"];

const isPublished = (value) => String(value).trim().toLowerCase() === "true";

/** 隣の slide.md の frontmatter。slug はデッキと揃えたいので借りる。 */
const slideFrontmatter = (dir) => {
  const file = path.join(dir, "slide.md");
  return fs.existsSync(file) ? parseFrontmatter(fs.readFileSync(file, "utf8")) : {};
};

/** 本文先頭の `# 見出し` をタイトルに使う。 */
const headingOf = (md) => {
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const h1 = body.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : "";
};

/** 本文の最初の段落を抜き出して一覧の説明文にする。 */
const excerptOf = (md) => {
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  for (const block of body.split(/\r?\n\s*\r?\n/)) {
    const text = block.trim();
    if (!text || text.startsWith("#") || text.startsWith("```") || text.startsWith("<")) continue;
    return text
      .replace(/[*_`[\]()]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 120);
  }
  return "";
};

const collect = () => {
  const articles = [];
  let skipped = 0;

  for (const group of GROUPS) {
    const dir = path.join(repoRoot, group);
    if (!fs.existsSync(dir)) continue;

    for (const folder of fs.readdirSync(dir)) {
      const file = path.join(dir, folder, "article.md");
      if (!fs.existsSync(file) || fs.statSync(file).size === 0) continue;

      const relDir = `${group}/${folder}`;
      const meta = readDocMeta({ repoRoot, relDir, folder, file });

      if (!isPublished(meta.frontmatter.published)) {
        skipped += 1;
        continue;
      }

      const source = fs.readFileSync(file, "utf8");
      const slide = slideFrontmatter(path.join(dir, folder));

      // slug は記事 > デッキ > フォルダ名の順。デッキと URL を揃えたいので借りる。
      const slug = meta.frontmatter.slug || slide.slug || folder;

      articles.push({
        name: folder,
        slug,
        title: meta.frontmatter.title || headingOf(source) || folder,
        date: meta.date,
        updated: meta.updated,
        description: meta.frontmatter.description || excerptOf(source),
        dir: relDir,
        path: `/articles/${slug}/`,
      });
    }
  }

  articles.sort((a, b) => b.date.localeCompare(a.date));
  return { articles, skipped };
};

const { articles, skipped } = collect();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify({ articles }, null, 2));
console.log(`wrote src/data/articles.json (published: ${articles.length}, 非公開: ${skipped})`);
