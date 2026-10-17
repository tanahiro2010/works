// slide.md の frontmatter から slug / title / date を取り出す。
//
// 足りないぶんは自動で補う。中央に一覧を持たないので、デッキのフォルダを
// 足せばそれだけでサイトに載る。
//
//   slug  : frontmatter の `slug:` → 無ければフォルダ名（URL エンコードされる）
//   title : frontmatter の `title:` → 無ければフォルダ名
//   date  : frontmatter の `date:` → 無ければ slide.md が git に入った日
//           → git が無い環境ではファイルの更新日時

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";

/** 「2026年7月17日」「2026/08/06」「2026-07-30」などを YYYY-MM-DD に揃える。 */
export const normalizeDate = (raw) => {
  const s = String(raw)
    .trim()
    .replace(/^["']|["']$/g, "");
  const ymd = s.match(/(\d{4})\s*[年/.-]\s*(\d{1,2})\s*[月/.-]\s*(\d{1,2})/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  const ym = s.match(/(\d{4})\s*[年/.-]\s*(\d{1,2})/);
  if (ym) return `${ym[1]}-${ym[2].padStart(2, "0")}-01`;
  return "";
};

const parseFrontmatter = (md) => {
  const block = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return {};
  const fields = {};
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return fields;
};

/** slide.md が最初にコミットされた日。リネームも追う。 */
const gitAddedDate = (repoRoot, relPath) => {
  try {
    return execFileSync(
      "git",
      ["log", "--follow", "--diff-filter=A", "--format=%ad", "--date=short", "-1", "--", relPath],
      { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return "";
  }
};

export const readSlideMeta = ({ repoRoot, relDir, folder, file }) => {
  const md = fs.readFileSync(file, "utf8");
  const fm = parseFrontmatter(md);

  const date =
    normalizeDate(fm.date) ||
    gitAddedDate(repoRoot, `${relDir}/slide.md`) ||
    fs.statSync(file).mtime.toISOString().slice(0, 10);

  return {
    slug: fm.slug || folder,
    title: fm.title || folder,
    date,
    hasSlug: Boolean(fm.slug),
  };
};
