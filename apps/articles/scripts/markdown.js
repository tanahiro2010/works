// 記事本文の Markdown -> HTML。数式・mermaid・コードハイライトの設定を持つ。
//
// build-articles.js から切り出してあるのは、区切り記号の判定が壊れると
// 本文が黙って壊れるため。単体で動かして確かめられるようにしておく。

import Shiki from "@shikijs/markdown-it";
import katex from "katex";
import MarkdownIt from "markdown-it";

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function createMarkdown() {
  const md = MarkdownIt({ html: true, linkify: true, typographer: false });
  md.use(
    await Shiki({
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light",
      // 記事には gitignore のような Shiki が知らない言語指定も出てくる。
      // 落とさずプレーンテキストとして出す。
      fallbackLanguage: "text",
    }),
  );

  /**
   * 数式。区切りは LaTeX 標準の `\[...\]`（ブロック）と `\(...\)`（インライン）。
   *
   * `$` は使わない。記事には PHP の `$search` や Makefile の `$$(seq ...)` が
   * 普通に出てくるので、`$` を数式の目印にすると本文が壊れる。
   * ビルド時に KaTeX で HTML + MathML にするため、閲覧側に JS は要らない。
   */
  const renderMath = (src, displayMode) => {
    try {
      return katex.renderToString(src, {
        displayMode,
        output: "htmlAndMathml",
        throwOnError: true,
        strict: false,
      });
    } catch (err) {
      // 式が壊れていてもビルドは止めない。原文を出して警告する。
      console.warn(`  WARN 数式を解釈できませんでした: ${err.message}`);
      return null;
    }
  };

  md.block.ruler.before("fence", "math_block", (state, startLine, endLine, silent) => {
    const open = state.bMarks[startLine] + state.tShift[startLine];
    const firstLine = state.src.slice(open, state.eMarks[startLine]).trim();
    if (!firstLine.startsWith("\\[")) return false;

    // 1 行で閉じている場合。
    if (firstLine.endsWith("\\]") && firstLine.length > 3) {
      if (silent) return true;
      const token = state.push("math_block", "", 0);
      token.content = firstLine.slice(2, -2).trim();
      token.map = [startLine, startLine + 1];
      state.line = startLine + 1;
      return true;
    }

    let line = startLine;
    while (++line < endLine) {
      const from = state.bMarks[line] + state.tShift[line];
      if (state.src.slice(from, state.eMarks[line]).trim() === "\\]") break;
    }
    if (line >= endLine) return false; // 閉じが無ければ数式として扱わない
    if (silent) return true;

    const token = state.push("math_block", "", 0);
    token.content = state.getLines(startLine + 1, line, state.blkIndent, false).trim();
    token.map = [startLine, line + 1];
    state.line = line + 1;
    return true;
  });

  // escape より前に置く。`\(` は markdown では「( のエスケープ」なので、
  // 後ろに回すとただの丸括弧になってしまう。
  // インラインコード（`...`）の中は backticks が先に食べるのでここには来ない。
  md.inline.ruler.before("escape", "math_inline", (state, silent) => {
    if (!state.src.startsWith("\\(", state.pos)) return false;
    const close = state.src.indexOf("\\)", state.pos + 2);
    if (close < 0) return false;

    const content = state.src.slice(state.pos + 2, close).trim();
    if (!content) return false;
    if (!silent) {
      const token = state.push("math_inline", "", 0);
      token.content = content;
    }
    state.pos = close + 2;
    return true;
  });

  md.renderer.rules.math_block = (tokens, idx, _options, env) => {
    env.hasMath = true;
    const html = renderMath(tokens[idx].content, true);
    return html
      ? `<div class="math-block">${html}</div>\n`
      : `<pre class="math-error">${esc(tokens[idx].content)}</pre>\n`;
  };

  md.renderer.rules.math_inline = (tokens, idx, _options, env) => {
    env.hasMath = true;
    const html = renderMath(tokens[idx].content, false);
    return html ?? `<code class="math-error">${esc(tokens[idx].content)}</code>`;
  };

  // mermaid はコードではなく図。ハイライトせずそのまま渡して、
  // 描画はページ側の mermaid.js に任せる。
  const highlightFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (token.info.trim().toLowerCase() === "mermaid") {
      env.hasMermaid = true;
      return `<pre class="mermaid">${esc(token.content)}</pre>\n`;
    }
    return highlightFence(tokens, idx, options, env, self);
  };

  return md;
}
