// slides.json（スライド一覧のメタデータ）を作る。
//
// デッキ本文はここには入れない。一覧ページが必要なのは見出しとリンク先だけで、
// 本文を入れると 300KB 近くがそのまま React のバンドルに乗ってしまう。
// デッキの HTML は scripts/build-decks.js が別途 dist/slides/ に書き出す。

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { readSlideMeta } from "./slides-meta.js";

// This script lives in <repo>/frontend/scripts, so resolve the slide folders
// against the repo root rather than whatever directory node was started in.
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const outFile = fileURLToPath(new URL("../../slides.json", import.meta.url));

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
      const meta = readSlideMeta({ repoRoot, relDir, folder, file });
      if (!meta.hasSlug) {
        console.warn(`warn: ${folder} に slug: が無いのでフォルダ名を URL に使う`);
      }

      group.slides.push({
        name: folder,
        slug: meta.slug,
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
  fs.writeFileSync(outFile, JSON.stringify(slides, null, 2));
  console.log(
    `wrote ${path.relative(repoRoot, outFile)} ` +
      `(slides: ${slides.slides.slides.length}, speakerdecks: ${slides.speakerdecks.slides.length})`,
  );
};

build();
