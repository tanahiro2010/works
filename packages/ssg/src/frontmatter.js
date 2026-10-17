// Markdown の frontmatter から slug / title / date を取り出す。slide.md と
// article.md の両方で使う。
//
// 足りないぶんは自動で補う。中央に一覧を持たないので、デッキのフォルダを
// 足せばそれだけでサイトに載る。
//
//   slug  : frontmatter の `slug:` → 無ければフォルダ名（URL エンコードされる）
//   title : frontmatter の `title:` → 無ければフォルダ名
//   date  : frontmatter の `date:` → 無ければその Markdown が git に入った日
//           → git が無い環境ではファイルの更新日時
//   updated: デッキのフォルダを最後にさわったコミットの時刻（並び替え用）
//           → git が無い環境ではフォルダ内で一番新しいファイルの更新時刻

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

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

export const parseFrontmatter = (md) => {
  const block = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return {};
  const fields = {};
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return fields;
};

/** その Markdown が最初にコミットされた日。リネームも追う。 */
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

/** そのフォルダを最後にさわったコミットの時刻。 */
const gitUpdatedAt = (repoRoot, relDir) => {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", relDir], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

/** フォルダ内で一番新しいファイルの更新時刻。git が使えない環境向け。 */
const newestMtime = (dir) => {
  let newest = 0;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else newest = Math.max(newest, fs.statSync(p).mtimeMs);
    }
  };
  walk(dir);
  return newest ? new Date(newest).toISOString() : "";
};

/** `+09:00` 付きと `Z` 付きが混ざると文字列比較で並び順が壊れるので UTC に揃える。 */
const toUtc = (iso) => {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "" : new Date(t).toISOString();
};

/**
 * @param {object} args
 * @param {string} args.repoRoot リポジトリのルート
 * @param {string} args.relDir   リポジトリ相対のフォルダ（例 slides/speakerdeck/foo）
 * @param {string} args.folder   フォルダ名。slug / title のフォールバックに使う
 * @param {string} args.file     読む Markdown の絶対パス（slide.md か article.md）
 */
export const readDocMeta = ({ repoRoot, relDir, folder, file }) => {
  const md = fs.readFileSync(file, "utf8");
  const fm = parseFrontmatter(md);
  const relFile = `${relDir}/${path.basename(file)}`;

  const date =
    normalizeDate(fm.date) ||
    gitAddedDate(repoRoot, relFile) ||
    fs.statSync(file).mtime.toISOString().slice(0, 10);

  const updated =
    toUtc(gitUpdatedAt(repoRoot, relDir)) ||
    newestMtime(path.join(repoRoot, relDir)) ||
    toUtc(`${date}T00:00:00Z`);

  return {
    slug: fm.slug || folder,
    title: fm.title || folder,
    date,
    updated,
    hasSlug: Boolean(fm.slug),
    frontmatter: fm,
  };
};
