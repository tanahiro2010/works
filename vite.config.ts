// ワークスペース共通の lint / fmt / commit フック設定。
// 各アプリの vite.config.ts は Vite のプラグインだけを持つ。
import { defineConfig } from "vite-plus";

// slides/ はスライドの原稿置き場で、marp / ippon が吐いた HTML も混ざる。
// ツールの対象は apps/ と packages/ のソースだけに絞る。
const ignorePatterns = [
  "slides/**",
  "ippon-slides/**",
  ".agents/**",
  ".claat/**",
  ".marp/**",
  "**/dist/**",
  "**/.vite-ssg/**",
  "**/src/data/*.json",
];

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns },
  lint: {
    ignorePatterns,
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
