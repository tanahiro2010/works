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

/**
 * 指定したパスを最後にさわったコミットの時刻。
 *
 * フォルダ全体ではなく、その成果物を構成するファイルだけを渡すこと。
 * デッキのフォルダには article.md や README.md、sandbox まで同居しているので、
 * フォルダ単位で見ると「記事を直しただけ」でスライドの更新日時が動いてしまう。
 */
const gitUpdatedAt = (repoRoot, relPaths) => {
  const targets = relPaths.filter((rel) => fs.existsSync(path.join(repoRoot, rel)));
  if (targets.length === 0) return "";
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", ...targets], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

/** 対象パスの中で一番新しい更新時刻。git が使えない環境向け。 */
const newestMtime = (repoRoot, relPaths) => {
  let newest = 0;
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    const st = fs.statSync(p);
    if (!st.isDirectory()) {
      newest = Math.max(newest, st.mtimeMs);
      return;
    }
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      walk(path.join(p, entry.name));
    }
  };
  for (const rel of relPaths) walk(path.join(repoRoot, rel));
  return newest ? new Date(newest).toISOString() : "";
};

/** その成果物を構成するファイル。画像を差し替えたら更新扱いにしたい。 */
const ownedPaths = (relDir, relFile) => [
  relFile,
  `${relDir}/img`,
  `${relDir}/images`,
  `${relDir}/assets`,
];

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

  const owned = ownedPaths(relDir, relFile);
  const updated =
    toUtc(gitUpdatedAt(repoRoot, owned)) ||
    newestMtime(repoRoot, owned) ||
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
