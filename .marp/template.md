---
marp: true
theme: gdg
paginate: true
size: 16:9
---

<script>
/* PowerPoint-style auto-shrink: iteratively reduce a slide's font size
   until its content stops overflowing. Also keeps the explicit opt-in
   <div class="fit">…</div> wrapper for finer-grained scaling. */
(() => {
  const MIN_FONT_PX = 12;
  const CODE_MIN_FONT_PX = 9;
  const STEP = 0.96;
  const MAX_ITERS = 40;
  const TOLERANCE = 1;
  let scheduled = false;

  const overflows = (el) =>
    el.scrollHeight > el.clientHeight + TOLERANCE ||
    el.scrollWidth  > el.clientWidth  + TOLERANCE;

  const shrinkElement = (el, minFontPx, shouldShrink = () => overflows(el)) => {
    if (!shouldShrink()) return;
    const base = parseFloat(getComputedStyle(el).fontSize) || 18;
    let size = base;
    for (let i = 0; i < MAX_ITERS && shouldShrink() && size > minFontPx; i++) {
      size *= STEP;
      el.style.fontSize = `${size}px`;
    }
  };

  const shrinkCodeBlocks = (section) => {
    for (const pre of section.querySelectorAll("pre")) {
      shrinkElement(pre, CODE_MIN_FONT_PX, () => overflows(pre) || overflows(section));
    }
  };

  const shrinkSection = (section) => {
    if (section.dataset.autofit === "skip") return;
    shrinkElement(section, MIN_FONT_PX, () => overflows(section));
  };

  const scaleFitBlocks = (root) => {
    for (const fit of root.querySelectorAll(".fit")) {
      if (!fit.scrollHeight) continue;
      const ratio = Math.min(1, fit.clientHeight / fit.scrollHeight);
      fit.style.transformOrigin = "top left";
      fit.style.transform = `scale(${ratio})`;
    }
  };

  const processSection = (section) => {
    if (!section.clientWidth || !section.clientHeight) return;
    scaleFitBlocks(section);
    shrinkCodeBlocks(section);
    shrinkSection(section);
  };

  const processVisibleSections = () => {
    scheduled = false;
    for (const section of document.querySelectorAll("section")) processSection(section);
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => requestAnimationFrame(processVisibleSections));
  };

  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  new MutationObserver(schedule).observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  schedule();
})();
</script>

<style>
/* Set once per deck — drives the colored university name on every title slide. */
:root { --gdg-university: 'University of Osaka'; }
</style>

<!-- _class: title -->
<!-- _paginate: false -->

# Chapter **Title** Goes Here.

This is where the subtitle can be displayed.

---

<!-- _class: title image -->
<!-- _paginate: false -->

# Chapter **Title** Goes Here.

![](../../assets/gdg_logo.png)

---

<!-- _class: lead -->

# Welcome to GDG

---

## Agenda

1. About Google Developer Groups
2. What we build
3. How to get involved
4. Q&A

---

<!-- _class: section -->

# 01. About GDG

---

## What is GDG?

Google Developer Groups are **community-led developer groups** that host events for developers interested in Google's developer technology.

- Open to everyone — students, professionals, hobbyists
- Local meetups, workshops, study jams
- Powered by Google, run by volunteers

> "Build with Google. Connect with developers." — *GDG community motto*

---

<!-- _class: section yellow -->

# 02. What we build

---

## Tech we love

| Area              | Tools                              |
| ----------------- | ---------------------------------- |
| Web               | Chrome, Lighthouse, Web Vitals     |
| Mobile            | Android, Flutter, Jetpack Compose  |
| Cloud             | Google Cloud, Firebase             |
| AI                | Gemini API, Vertex AI, TensorFlow  |

---

## Code example

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, GDG!" }],
});

console.log(message.content);
```

---

## Auto-fit overflowing content

<div class="fit">

Wrap a block in `<div class="fit">…</div>` and the embedded script scales it
down to fit the remaining vertical space (PowerPoint-style). Useful when
AI-generated content runs longer than expected.

- Paste long bullet lists without manually trimming
- Drop in verbose code samples
- Keep generous prose without breaking layout
- Combine with regular markdown — headings, lists, code, tables
- The element must be a direct child of `section` for height to resolve

</div>

---

<!-- _class: split -->

## Two-column layout

### Left column

- Bullet point one
- Bullet point two
- Bullet point three

### Right column

- Another bullet
- Yet another bullet
- One more bullet

---

<!-- _class: invert -->

## Dark slide

Use the `invert` class for emphasis or for code-heavy slides.

```bash
$ npm install -g @marp-team/marp-cli
$ marp template.md --pdf
```

---

<!-- _class: section green -->

# 03. Get involved

---

## Join us

- Find your local chapter at **gdg.community.dev**
- Follow your chapter on social
- Attend an event — most are free
- Volunteer as an organizer or speaker

---

<!-- _class: split -->

## Left image + right text

![w:480](../../assets/gdg_logo.png)

- Image lands in the left column (it appears first in source order)
- Text bullets flow into the right column
- Use `![w:480]` to keep the image inside the column

---

<!-- _class: split -->

## Right image + left text

- Put the text block first in source order
- Then the image — it falls into the right column
- Same `split` class, just swap the order

![w:480](../../assets/gdg_logo.png)

---

![bg cover](../../assets/gdg_logo.png)

<!-- _class: invert -->

## Full-bleed image

Use `![bg cover](...)` for a key visual. `bg`, `bg fit`, `bg cover`, and `bg left`/`bg right` cover the common cases.

---

<!-- _class: lead -->

> Good design is as **little** design as possible.
>
> - Dieter Rams

---

## Diagram / flow

<div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 32px;">
  <div style="padding: 24px 32px; border: 2px solid var(--gdg-blue); border-radius: 12px; font-weight: 600;">Idea</div>
  <div style="font-size: 40px; color: var(--gdg-blue);">→</div>
  <div style="padding: 24px 32px; border: 2px solid var(--gdg-green); border-radius: 12px; font-weight: 600;">Build</div>
  <div style="font-size: 40px; color: var(--gdg-green);">→</div>
  <div style="padding: 24px 32px; border: 2px solid var(--gdg-yellow); border-radius: 12px; font-weight: 600;">Ship</div>
  <div style="font-size: 40px; color: var(--gdg-yellow);">→</div>
  <div style="padding: 24px 32px; border: 2px solid var(--gdg-red); border-radius: 12px; font-weight: 600;">Learn</div>
</div>

Use inline HTML, an exported Mermaid image, or an SVG for process diagrams.

---

## Chart / graph

<svg viewBox="0 0 600 280" style="width: 100%; height: 280px;">
  <line x1="60" y1="240" x2="580" y2="240" stroke="#5F6368" stroke-width="2"/>
  <line x1="60" y1="20"  x2="60"  y2="240" stroke="#5F6368" stroke-width="2"/>
  <rect x="100" y="160" width="60" height="80"  fill="var(--gdg-blue)"/>
  <rect x="200" y="110" width="60" height="130" fill="var(--gdg-red)"/>
  <rect x="300" y="70"  width="60" height="170" fill="var(--gdg-yellow)"/>
  <rect x="400" y="40"  width="60" height="200" fill="var(--gdg-green)"/>
  <text x="130" y="260" text-anchor="middle" font-size="16">2023</text>
  <text x="230" y="260" text-anchor="middle" font-size="16">2024</text>
  <text x="330" y="260" text-anchor="middle" font-size="16">2025</text>
  <text x="430" y="260" text-anchor="middle" font-size="16">2026</text>
</svg>

Inline SVG keeps charts crisp at any export size; pre-rendered images also work.

---

## Takeaways

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px;">
  <div style="padding: 24px; border-top: 4px solid var(--gdg-blue); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">Community</h3>
    <p>GDG is global, local, and open to everyone.</p>
  </div>
  <div style="padding: 24px; border-top: 4px solid var(--gdg-green); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">Build</h3>
    <p>Web, mobile, cloud, and AI — pick your stack.</p>
  </div>
  <div style="padding: 24px; border-top: 4px solid var(--gdg-yellow); background: #F8F9FA; border-radius: 8px;">
    <h3 style="margin-top: 0;">Connect</h3>
    <p>Meetups, study jams, and hands-on workshops.</p>
  </div>
</div>

---

<!-- _class: lead -->

# Thank you!

Questions?
