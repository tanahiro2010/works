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

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const distDir = fileURLToPath(new URL("../dist", import.meta.url));
const marpBin = fileURLToPath(new URL("../node_modules/.bin/marp", import.meta.url));
const gdgTheme = path.join(repoRoot, ".marp/gdg.css");

const slidesJson = fileURLToPath(new URL("../src/data/slides.json", import.meta.url));
const slides = JSON.parse(fs.readFileSync(slidesJson, "utf8"));

/** HTML が参照しているローカルのパスを集める（data: や http: は除く）。 */
const localRefs = (html) => {
  const plain = html.replace(/&quot;|&#34;/g, '"').replace(/&#39;/g, "'");
  const refs = new Set();
  for (const [, src] of plain.matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/g)) refs.add(src);
  for (const [, src] of plain.matchAll(/url\(\s*["']?([^)"']+)/g)) refs.add(src.trim());
  return [...refs].filter((ref) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref));
};

/** 画像置き場の慣例。デッキ直下にあればフォルダごと複製する。 */
const IMAGE_DIRS = ["img", "images", "assets"];

/** 中身を見に行かないフォルダ。sandbox は丸ごと別リポジトリのことがある。 */
const SKIP_DIRS = new Set(["node_modules", ".git", "sandbox", "codelab"]);

const copyImages = (srcDir, outDir) => {
  for (const name of IMAGE_DIRS) {
    const from = path.join(srcDir, name);
    if (!fs.existsSync(from)) continue;
    fs.cpSync(from, path.join(outDir, name), { recursive: true });
  }
};

/** デッキフォルダ内のファイルを「ファイル名 -> 実際の場所」で引けるようにする。 */
const indexByBasename = (dir) => {
  const found = new Map();
  const walk = (cur) => {
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(cur, entry.name));
      } else if (!found.has(entry.name)) {
        // 浅い場所にあるものを優先したいので、先に見つけた方を残す。
        found.set(entry.name, path.join(cur, entry.name));
      }
    }
  };
  walk(dir);
  return found;
};

/**
 * 出力 HTML が参照しているファイルを、デッキフォルダから拾って出力先に置く。
 *
 * slide.md が `outputs/x.png` のようにどこを指していても、サイトで配れる位置に
 * 自動で並ぶようにする。参照どおりの場所に無ければファイル名で探して、
 * 参照されているパスへ複製する（例: `outputs/img/a.png` を `img/a.png` として置く）。
 */
const placeReferencedAssets = (srcDir, outDir, html) => {
  let byName = null;

  for (const ref of localRefs(html)) {
    const rel = decodeURI(ref.split(/[?#]/)[0]);
    if (rel.startsWith("/")) continue; // サイト root 基準。デッキの持ち物ではない。

    const dest = path.resolve(outDir, rel);
    if (!dest.startsWith(outDir + path.sep)) continue; // デッキの外（テーマ資産など）
    if (fs.existsSync(dest)) continue;

    let from = path.resolve(srcDir, rel);
    if (!from.startsWith(srcDir + path.sep) || !fs.existsSync(from)) {
      byName ??= indexByBasename(srcDir);
      from = byName.get(path.basename(rel));
    }
    if (!from || !fs.existsSync(from)) continue;

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.cpSync(from, dest, { recursive: true });
  }
};

/** テーマ (.marp/gdg.css) が `../../assets/...` で参照する資産を dist/assets へ。 */
const copyThemeAssets = () => {
  const from = path.join(repoRoot, ".marp/assets");
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, path.join(distDir, "assets"), { recursive: true });
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

/**
 * ippon-slides。
 *
 * outDir には出力先ではなく srcDir を渡す。render は画像を
 * `relative(outDir, 実ファイル)` に書き換えるので、本物の出力先を渡すと
 * `../../../../slides/speakerdeck/.../img/x.png` という dist の外を指すパスになり、
 * ローカルのファイルとして開く分には繋がってもサイトからは必ず死ぬ。
 * srcDir 基準なら `img/x.png` のまま残り、copyImages が隣に置いた img/ と一致する。
 */
const buildIppon = (srcDir, outDir) => {
  const md = fs.readFileSync(path.join(srcDir, "slide.md"), "utf8");
  const { html } = render(md, { baseDir: srcDir, outDir: srcDir });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
};

/**
 * 出力 HTML がローカルに参照しているファイルのうち、dist に無いものを返す。
 *
 * ローカルでは隣のフォルダに繋がってしまうので、画像切れはサイトを開くまで気付けない。
 * dist の中だけを見ることで、サーバから配れるかどうかと同じ条件で確かめる。
 */
const missingAssets = (outDir, html) => {
  const missing = [];
  for (const ref of localRefs(html)) {
    const clean = decodeURI(ref.split(/[?#]/)[0]);
    const abs = clean.startsWith("/") ? path.join(distDir, clean) : path.resolve(outDir, clean);
    const inDist = abs === distDir || abs.startsWith(distDir + path.sep);
    if (!inDist || !fs.existsSync(abs)) missing.push(ref);
  }
  return missing;
};

const build = () => {
  if (!fs.existsSync(distDir)) {
    throw new Error("dist/ が無い。vp build と prerender の後に実行すること");
  }

  copyThemeAssets();

  const all = Object.values(slides).flatMap((group) => group.slides);
  let built = 0;
  const failed = [];
  /** 参照 -> それが切れているデッキの slug */
  const broken = new Map();

  for (const slide of all) {
    const srcDir = path.join(repoRoot, slide.dir);
    const outDir = path.join(distDir, "slides", slide.slug);
    fs.mkdirSync(outDir, { recursive: true });

    try {
      if (slide.renderer === "marp") buildMarp(srcDir, outDir);
      else buildIppon(srcDir, outDir);
      copyImages(srcDir, outDir);
      built += 1;

      const html = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      placeReferencedAssets(srcDir, outDir, html);
      for (const ref of missingAssets(outDir, html)) {
        if (!broken.has(ref)) broken.set(ref, []);
        broken.get(ref).push(slide.slug);
      }
    } catch (err) {
      failed.push({ slug: slide.slug, message: err.stderr?.toString().trim() || err.message });
    }
  }

  console.log(`built ${built}/${all.length} decks -> dist/slides/`);

  if (broken.size > 0) {
    console.warn(`  WARN ${broken.size} 件の参照が dist に無い（サイトでは画像切れになる）:`);
    for (const [ref, slugs] of broken) {
      const where =
        slugs.length > 3
          ? `${slugs.slice(0, 3).join(", ")} ほか${slugs.length - 3}件`
          : slugs.join(", ");
      console.warn(`    ${ref}  <- ${where}`);
    }
  }

  if (failed.length > 0) {
    for (const f of failed) console.error(`  FAILED ${f.slug}: ${f.message}`);
    process.exit(1);
  }
};

build();
