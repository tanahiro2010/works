// 各デッキを完結した HTML 1 枚にして dist/slides/<slug>/index.html へ置く。
//
// marp も ippon-slides も「CSS と JS を内包した <!doctype html> 文書」を吐く。
// React のツリーには載せられないので、ビルド済みの静的ファイルとして
// React の出力の隣に並べ、一覧からは素の <a href> で飛ばす。
//
// vp build が dist/ を空にするので、必ずプリレンダの後に実行すること。

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "ippon-slides";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const marpBin = fileURLToPath(new URL("../node_modules/.bin/marp", import.meta.url));
const gdgTheme = path.join(repoRoot, ".marp/gdg.css");

const slides = JSON.parse(fs.readFileSync(path.join(repoRoot, "slides.json"), "utf8"));

/** デッキが参照する画像フォルダを出力先に複製する。 */
const copyImages = (srcDir, outDir) => {
  for (const name of ["img", "images", "assets"]) {
    const from = path.join(srcDir, name);
    if (!fs.existsSync(from)) continue;
    fs.cpSync(from, path.join(outDir, name), { recursive: true });
  }
};

/** Marp。テーマ gdg はリポジトリの .marp/gdg.css から読み込む。 */
const buildMarp = (srcDir, outDir) => {
  execFileSync(
    marpBin,
    [
      "--allow-local-files",
      "--theme-set",
      gdgTheme,
      "--html",
      path.join(srcDir, "slide.md"),
      "-o",
      path.join(outDir, "index.html"),
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
};

/** ippon-slides。outDir を渡すと画像の相対パスを出力先基準に直してくれる。 */
const buildIppon = (srcDir, outDir) => {
  const md = fs.readFileSync(path.join(srcDir, "slide.md"), "utf8");
  const { html } = render(md, { baseDir: srcDir, outDir });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
};

const build = () => {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ が無い。vp build と prerender の後に実行すること");
  }

  const all = Object.values(slides).flatMap((group) => group.slides);
  let built = 0;
  const failed = [];

  for (const slide of all) {
    const srcDir = path.join(repoRoot, slide.dir);
    const outDir = path.join(distDir, "slides", slide.slug);
    fs.mkdirSync(outDir, { recursive: true });

    try {
      if (slide.renderer === "marp") buildMarp(srcDir, outDir);
      else buildIppon(srcDir, outDir);
      copyImages(srcDir, outDir);
      built += 1;
    } catch (err) {
      failed.push({ slug: slide.slug, message: err.stderr?.toString().trim() || err.message });
    }
  }

  console.log(`built ${built}/${all.length} decks -> dist/slides/`);
  if (failed.length > 0) {
    for (const f of failed) console.error(`  FAILED ${f.slug}: ${f.message}`);
    process.exit(1);
  }
};

build();
