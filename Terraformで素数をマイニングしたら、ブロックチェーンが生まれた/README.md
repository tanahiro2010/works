# Terraformで素数をマイニングしたら、ブロックチェーンが生まれた

## スライド

[slide.md](slide.md) を [ippon-slides](../ippon-slides) でビルドします。

```sh
node ../ippon-slides/bin/ippon.js build slide.md --html --pdf -o outputs/   # outputs/slide.html と slide.pdf
node ../ippon-slides/bin/ippon.js build slide.md --html -o outputs/ -w      # 編集しながらプレビュー
```

npm に公開したあとは `npx ippon-slides build slide.md --html --pdf -o outputs/` で同じことができます。
