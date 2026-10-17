// OGP 画像をビルド時に作る。
//
// ブラウザは使わない。SVG を組み立てて resvg でラスタライズするだけなので
// 1枚 10ms ほどで済み、CI に Chrome も日本語フォントも要らない。
// 日本語が出せるように、woff2 で配られている Noto Sans JP を TTF に戻して渡す。

import { createRequire } from "node:module";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const require = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;
const PADDING = 96;
const FONT_FAMILY = "Noto Sans JP";

/**
 * Noto Sans JP の配布サブセットに入っていない約物を、見た目の近い字に寄せる。
 * 入れ忘れるとカードに豆腐(⊠)が出る。増やすときは実際に描いて確かめること。
 */
const GLYPH_FALLBACK = [
  [/\u2015/g, "\u2014"], // ― → —
  [/\uff5e/g, "\u301c"], // ～ → 〜
];

const normalize = (s) =>
  GLYPH_FALLBACK.reduce((acc, [from, to]) => acc.replace(from, to), String(s ?? ""));

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * 文字幅の目安。SVG の <text> は折り返さないので自前で折る必要があり、
 * そのために 1 文字の幅を em 単位で見積もる。
 * 全角はほぼ 1em、ラテン文字と数字はおよそ半分。
 */
const charWidth = (ch) => {
  if (/[　-〿぀-ヿ㐀-䶿一-鿿＀-｠￠-￦]/.test(ch)) {
    return 1;
  }
  if (/[A-Za-z0-9]/.test(ch)) return 0.58;
  if (/\s/.test(ch)) return 0.32;
  return 0.5;
};

/** 指定した em 幅で折り返す。行数は maxLines まで、あふれたら末尾を … にする。 */
const wrap = (text, maxEm, maxLines) => {
  const lines = [];
  let line = "";
  let width = 0;

  for (const ch of String(text)) {
    const w = charWidth(ch);
    if (width + w > maxEm && line) {
      lines.push(line);
      if (lines.length === maxLines) break;
      line = "";
      width = 0;
    }
    line += ch;
    width += w;
  }
  if (lines.length < maxLines && line) lines.push(line);

  if (lines.length === maxLines) {
    const rest = String(text).slice(lines.join("").length);
    if (rest) lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}…`;
  }
  return lines;
};

/**
 * 使うサブセット。
 *
 * japanese だけだと `――`(U+2015) や各種ダッシュが豆腐になる。
 * この手の約物は latin 側に入っているので一緒に読む。
 */
const SUBSETS = ["japanese", "latin", "latin-ext"];

/** woff2 の Noto Sans JP を TTF に戻して一時ファイルに置く。resvg はパスしか受け取らない。 */
const prepareFonts = async () => {
  const { decompress } = require("wawoff2");
  const paths = [];

  for (const subset of SUBSETS) {
    const woff2 = fs.readFileSync(
      require.resolve(`@fontsource/noto-sans-jp/files/noto-sans-jp-${subset}-400-normal.woff2`),
    );
    // 中身が変われば長さも変わるので、ファイル名に入れて作り直しの判定にする。
    const ttfPath = path.join(os.tmpdir(), `ssg-nsjp-${subset}-${woff2.length}.ttf`);
    if (!fs.existsSync(ttfPath)) {
      fs.writeFileSync(ttfPath, Buffer.from(await decompress(woff2)));
    }
    paths.push(ttfPath);
  }
  return paths;
};

/**
 * @param {object} site site.config.json の中身
 * @returns {Promise<(item: {title: string, label?: string, date?: string}) => Buffer>}
 */
export async function createOgRenderer(site) {
  const fontFiles = await prepareFonts();
  const { Resvg } = require("@resvg/resvg-js");

  return function renderOg({ title, label = site.name, date = "" }) {
    const titleSize = 64;
    const lines = wrap(normalize(title), (WIDTH - PADDING * 2) / titleSize, 3);
    const lineHeight = titleSize * 1.35;
    // タイトルが縦に伸びるぶん、上を詰めて全体を中央寄りに保つ。
    const top = 300 - (lines.length - 1) * (lineHeight / 2);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
<rect x="${PADDING}" y="${top - 118}" width="72" height="6" fill="#0645ad"/>
<text x="${PADDING}" y="${top - 70}" font-family="${FONT_FAMILY}" font-size="26" fill="#555555" letter-spacing="3">${esc(normalize(label).toUpperCase())}</text>
${lines
  .map(
    (line, i) =>
      `<text x="${PADDING}" y="${top + i * lineHeight}" font-family="${FONT_FAMILY}" font-size="${titleSize}" font-weight="700" fill="#111111">${esc(line)}</text>`,
  )
  .join("\n")}
<text x="${PADDING}" y="${HEIGHT - 64}" font-family="${FONT_FAMILY}" font-size="28" fill="#555555">${esc(normalize(site.author))}</text>
<text x="${WIDTH - PADDING}" y="${HEIGHT - 64}" font-family="${FONT_FAMILY}" font-size="28" fill="#555555" text-anchor="end">${esc(date)}</text>
</svg>`;

    return new Resvg(svg, {
      font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT_FAMILY },
    })
      .render()
      .asPng();
  };
}
