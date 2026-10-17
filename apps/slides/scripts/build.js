// slides.json（スライド一覧のメタデータ）を作る。
//
// デッキ本文はここには入れない。一覧ページが必要なのは見出しとリンク先だけで、
// 本文を入れると 300KB 近くがそのまま React のバンドルに乗ってしまう。
// デッキの HTML は scripts/build-decks.js が別途 dist/slides/ に書き出す。

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { readDocMeta } from "@tanahiro2010/ssg/frontmatter";

// This script lives in <repo>/apps/slides/scripts, so resolve the slide folders
// against the repo root rather than whatever directory node was started in.
const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const outFile = fileURLToPath(new URL("../src/data/slides.json", import.meta.url));

const slides = {
  slides: {
    path: "slides/slides",
    renderer: "ippon",
    slides: [],
  },
  speakerdecks: {
    path: "slides/speakerdeck",
    renderer: "marp",
    slides: [],
  },
};

/** 本文から説明文を作る。frontmatter に description が無いデッキ向け。 */
const excerptOf = (md) => {
  const body = md
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "")
    // script / style / コードブロックの中身は文章ではない。
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/^```[\s\S]*?^```/gm, "");

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    // 見出し・Marp/ippon のディレクティブ・HTML・画像・区切り・箇条書きは説明文にしない。
    if (!line) continue;
    if (/^[#>\-*|`+]/.test(line)) continue;
    if (/^(::|<|!\[|\/\/|\/\*|\*)/.test(line)) continue;
    // 英数字と記号だけの行はコードの断片とみなす。
    if (!/[ぁ-んァ-ヶ一-龠]/.test(line) && /[{};=()]/.test(line)) continue;

    const text = line
      // 本文中に素の <br> などが混ざるので、説明文からはタグを落とす。
      .replace(/<[^>]*>/g, " ")
      .replace(/[*_`[\]()]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // 著者名や日付だけの行は表紙の署名。説明文にはならない。
    if (/^(tanahiro2010|田中\s*博悠|Hirohisa\s+Tanaka)/i.test(text)) continue;
    if (/^[\d\s年月日/.·・-]+$/.test(text)) continue;
    if (text.replace(/[^ぁ-んァ-ヶ一-龠a-zA-Z]/g, "").length < 6) continue;

    if (text.length >= 8) return text.slice(0, 120);
  }
  return "";
};

const getSlides = () => {
  Object.keys(slides).forEach((key) => {
    const group = slides[key];
    const dir = path.join(repoRoot, group.path);
    const folders = fs
      .readdirSync(dir)
      .filter((file) => fs.statSync(path.join(dir, file)).isDirectory());

    folders.forEach((folder) => {
      const file = path.join(dir, folder, "slide.md");
      if (!fs.existsSync(file)) return;

      const relDir = `${group.path}/${folder}`;
      const meta = readDocMeta({ repoRoot, relDir, folder, file });
      if (!meta.hasSlug) {
        console.warn(`warn: ${folder} に slug: が無いのでフォルダ名を URL に使う`);
      }

      group.slides.push({
        name: folder,
        slug: meta.slug,
        description:
          meta.frontmatter.description ||
          excerptOf(fs.readFileSync(file, "utf8")) ||
          `${meta.title} ― tanahiro2010 の発表スライド`,
        title: meta.title,
        date: meta.date,
        updated: meta.updated,
        dir: relDir,
        path: `/slides/${meta.slug}/`,
        renderer: group.renderer,
      });
    });

    // 最近さわったフォルダが先頭。同時刻なら発表日が新しい方を先に。
    group.slides.sort((a, b) => b.updated.localeCompare(a.updated) || b.date.localeCompare(a.date));
    group.slides.forEach((slide, idx) => {
      slide.index = `${key}_${idx}`;
    });
  });
};

const build = () => {
  getSlides();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(slides, null, 2));
  console.log(
    `wrote ${path.relative(repoRoot, outFile)} ` +
      `(slides: ${slides.slides.slides.length}, speakerdecks: ${slides.speakerdecks.slides.length})`,
  );
};

build();
