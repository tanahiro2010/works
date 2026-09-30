# Hono Conference Marp theme examples

30分枠の技術登壇で比較できるよう、方向性の異なる3案を用意しています。

| Theme | Direction | Best for |
| --- | --- | --- |
| `signal-red` | Honoの赤を強く出した高コントラストなメインステージ調 | 結論やメッセージを勢いよく見せる構成 |
| `runtime-dark` | ターミナルとランタイムを思わせるダークテーマ | コード、ログ、ライブデモを主役にする構成 |
| `paper-flame` | 白い紙面と朱赤を使った和文編集デザイン | 読みやすさと落ち着いたストーリーを重視する構成 |
| `honoconf-2026` | HonoConf 2026公式サイトの黒、白、赤、東京夜景を踏襲 | カンファレンス本番で公式サイトとの統一感を出す構成 |

各ディレクトリには次の2ファイルがあります。

- `slide.md`: frontmatter直後の `<style>` にテーマを埋め込んだ、単体で表示できる6枚の見本
- `theme.css`: テーマCSSだけを編集・再利用したい場合の参照用ファイル

VS CodeのMarp拡張には `.vscode/settings.json` から3テーマを登録済みです。
設定を反映するため、追加直後はMarpプレビューを開き直してください。

## Preview

対象テーマのディレクトリで次を実行します。

```bash
npx -p @marp-team/marp-cli@latest marp \
  --allow-local-files \
  --html ./slide.md \
  -o ./index.html
```

PDFにする場合は `--pdf` を追加してください。

```bash
npx -p @marp-team/marp-cli@latest marp \
  --allow-local-files \
  --pdf ./slide.md \
  -o ./slide.pdf
```
