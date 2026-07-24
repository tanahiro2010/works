#!/usr/bin/env python3
"""Post-process claat-exported index.html files.

Ten fixes are applied:

1. Escape unescaped HTML tags inside inline <code>...</code> spans. claat's
   markdown renderer leaves backtick spans like `<html>` as
   `<code><html></code>`, which the browser parses as real <html>/<body>/<head>
   tags and breaks the document. We rewrite them to `<code>&lt;html&gt;</code>`.

2. Wrap blockquote-style note paragraphs in <aside class="..."> boxes. Older
   claat versions converted `> **Note:** ...` markdown into
   `<aside class="note">...</aside>`; the current version emits a plain <p>,
   so the styled callout box is lost. We re-wrap any
   `<p><strong>Keyword:</strong>...</p>` whose keyword matches a known callout
   label, including an immediately following <ul>/<ol> list when present.

3. Wrap <pre> code blocks with an optional filename label and a toolbar that
   provides copy and light/dark theme buttons.

4. Annotate `diff <language>` fenced code blocks so the browser can apply
   diff line styling and nested language syntax highlighting. Code fences may
   also use `<language>:<filename>` to show a filename label above the block.

5. Repair markdown links left behind when claat strips standalone <button>
   wrappers. Button syntax such as `<button>\n[label](url)\n</button>` can
   otherwise become plain text instead of a `<paper-button>`. Image download
   links are also restored to `<paper-button>` links with a `download`
   attribute.

6. Convert the first row of each claat-generated table from data cells into a
   semantic <thead> containing <th> cells, and wrap remaining rows in <tbody>.

7. Inject local CSS and JS that make code blocks light by default, style the
   toolbar buttons, preserve the dark-mode toggle, add a full outline to
   callouts, and render tables with bordered, tinted header rows.

8. Add the repository favicon from assets/favicon.png.

9. Convert bare http(s) URLs in prose into links.

10. Inject Open Graph and Twitter card meta tags from the source claat markdown.
   og:title uses the first H1, og:description uses the summary frontmatter, and
   og:image uses the first markdown image.
"""

import argparse
import html as html_lib
import json
import os
import re
import sys
from pathlib import Path

ASIDE_KEYWORDS = {
    "Note": "warning",
    "Notice": "warning",
    "Tip": "special",
    "Tips": "special",
    "Hint": "special",
    "補足": "special",
    "Warning": "warning",
    "Warn": "warning",
    "Caution": "warning",
    "Troubleshooting": "troubleshooting",
}

SKIP_LINKIFY_TAGS = {"a", "code", "pre", "script", "style"}
TRAILING_URL_PUNCTUATION = ".,;:!?)\\]}、。！？）】」』"

STYLE_ID = "claat-local-preprocessor-style"
SCRIPT_ID = "claat-local-preprocessor-script"
FAVICON_ID = "claat-local-favicon"
OGP_META_ID_PREFIX = "claat-local-ogp-"
SITE_BASE_URL = "https://edu.gdgoc-osaka.jp"

CODE_TOOLBAR = """<div class="claat-code-toolbar" aria-label="Code block actions">
  <button class="claat-code-button claat-toggle-code-theme" type="button" aria-label="Use dark code theme" title="Use dark code theme">
    <span class="material-icons" aria-hidden="true">dark_mode</span>
  </button>
  <button class="claat-code-button claat-copy-code" type="button" aria-label="Copy code" title="Copy code">
    <span class="material-icons" aria-hidden="true">content_copy</span>
  </button>
</div>"""

CODE_FILENAME_LABEL_TEMPLATE = '<div class="claat-code-filename">{filename}</div>\n'

LOCAL_STYLE = f"""<style id="{STYLE_ID}">
  google-codelab-step .instructions .claat-code-block {{
    position: relative;
    margin: 16px 0;
    background: #f1f3f4;
    border-radius: 0;
    overflow: hidden;
  }}

  google-codelab-step .instructions .claat-code-filename {{
    display: inline-flex;
    max-width: min(100%, 56ch);
    min-height: 42px;
    align-items: center;
    box-sizing: border-box;
    padding: 10px 18px;
    overflow: hidden;
    color: #3c4043;
    background: #e8eaed;
    border-radius: 6px 6px 0 0;
    font-family: "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.92rem;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }}

  google-codelab-step .instructions .claat-code-block pre {{
    margin: 0;
    padding: 18px 88px 18px 18px;
    color: #37474f;
    background: #f1f3f4;
    border-radius: 0;
  }}

  google-codelab-step .instructions .claat-code-block pre > code {{
    color: inherit;
    background: transparent;
    padding: 0;
  }}

  google-codelab-step .instructions .claat-code-toolbar {{
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 1;
    display: flex;
    gap: 14px;
    align-items: center;
  }}

  google-codelab-step .instructions .claat-code-button {{
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    border: 0;
    border-radius: 50%;
    color: #202124;
    background: transparent;
    cursor: pointer;
  }}

  google-codelab-step .instructions .claat-code-button:hover,
  google-codelab-step .instructions .claat-code-button:focus-visible {{
    background: rgba(60, 64, 67, 0.12);
    outline: none;
  }}

  google-codelab-step .instructions .claat-code-button .material-icons {{
    margin: 0;
    font-size: 24px;
    line-height: 1;
  }}

  google-codelab-step .instructions .claat-code-block pre .pln,
  google-codelab-step .instructions .claat-code-block pre .pun {{
    color: #37474f;
  }}

  google-codelab-step .instructions .claat-code-block pre .kwd,
  google-codelab-step .instructions .claat-code-block pre .typ,
  google-codelab-step .instructions .claat-code-block pre .tag {{
    color: #9334e6;
  }}

  google-codelab-step .instructions .claat-code-block pre .str,
  google-codelab-step .instructions .claat-code-block pre .atv {{
    color: #188038;
  }}

  google-codelab-step .instructions .claat-code-block pre .com {{
    color: #5f6368;
  }}

  google-codelab-step .instructions .claat-code-block pre .atn,
  google-codelab-step .instructions .claat-code-block pre .lit,
  google-codelab-step .instructions .claat-code-block pre .dec {{
    color: #1967d2;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] {{
    background: #28323f;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-code-filename {{
    color: #f1f3f4;
    background: #3c4658;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre {{
    color: #f8f9fa;
    background: #28323f;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-code-button {{
    color: #f8f9fa;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-code-button:hover,
  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-code-button:focus-visible {{
    background: rgba(248, 249, 250, 0.16);
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .str,
  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .atv {{
    color: #34a853;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .kwd {{
    color: #f538a0;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .com {{
    color: #bdc1c6;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .typ,
  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .tag {{
    color: #24c1e0;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .lit,
  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .dec {{
    color: #4285f4;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .pln,
  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] pre .pun {{
    color: #f8f9fa;
  }}

  google-codelab-step .instructions .claat-code-block pre > code.claat-diff-code {{
    display: block;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line {{
    display: block;
    min-height: 1.4em;
    margin: 0 -18px;
    padding: 0 18px;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-marker {{
    display: inline-block;
    width: 1ch;
    font-weight: 600;
    user-select: none;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line-add {{
    background: #dff7e8;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line-delete {{
    background: #fce8e6;
    -webkit-user-select: none;
    user-select: none;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line-hunk {{
    background: #e8f0fe;
    color: #1967d2;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line-add .claat-diff-marker {{
    color: #137333;
  }}

  google-codelab-step .instructions .claat-code-block .claat-diff-line-delete .claat-diff-marker {{
    color: #d93025;
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-diff-line-add {{
    background: rgba(52, 168, 83, 0.24);
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-diff-line-delete {{
    background: rgba(234, 67, 53, 0.28);
  }}

  google-codelab-step .instructions .claat-code-block[data-code-theme="dark"] .claat-diff-line-hunk {{
    background: rgba(66, 133, 244, 0.25);
    color: #8ab4f8;
  }}

  google-codelab:not([theme="minimal"]) google-codelab-step .instructions aside.warning {{
    border: 1px solid #ea8600;
    border-left-width: 4px;
  }}

  google-codelab:not([theme="minimal"]) google-codelab-step .instructions aside.troubleshooting {{
    border: 1px solid #d93025;
    border-left-width: 4px;
    border-color: #d93025;
    background: #fce8e6;
    color: #212124;
  }}

  google-codelab:not([theme="minimal"]) google-codelab-step .instructions aside.special,
  google-codelab:not([theme="minimal"]) google-codelab-step .instructions aside.tip {{
    border: 1px solid #137333;
    border-left-width: 4px;
  }}

  google-codelab #drawer ol li a {{
    transition:
      color 300ms ease-in-out,
      background 300ms ease-in-out,
      border-color 300ms ease-in-out,
      box-shadow 300ms ease-in-out;
  }}

  google-codelab #drawer ol li .step {{
    width: 100%;
    min-width: 0;
  }}

  google-codelab #drawer ol li .step > span {{
    min-width: 0;
  }}

  google-codelab #drawer .claat-step-nav-content {{
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
  }}

  google-codelab #drawer .claat-step-nav-title {{
    overflow-wrap: anywhere;
  }}

  google-codelab #drawer .claat-step-nav-outline {{
    display: block;
    max-height: 0;
    margin: 0 6px 0 44px;
    padding: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-4px);
    transition:
      max-height 260ms ease,
      margin-bottom 260ms ease,
      opacity 180ms ease,
      transform 220ms ease,
      padding-bottom 260ms ease;
  }}

  google-codelab #drawer ol li[selected] .claat-step-nav-outline {{
    max-height: 360px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    opacity: 1;
    transform: translateY(0);
  }}

  google-codelab #drawer .claat-step-nav-heading {{
    display: block;
    color: #5f6368;
    font-weight: 400;
    line-height: 18px;
    margin: 1px 0;
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
    overflow-wrap: anywhere;
    transition:
      background-color 180ms ease,
      color 180ms ease;
  }}

  google-codelab #drawer .claat-step-nav-heading:hover,
  google-codelab #drawer .claat-step-nav-heading:focus-visible {{
    background: #f1f3f4;
    color: #202124;
    outline: none;
  }}

  google-codelab #drawer .claat-step-nav-heading.is-active {{
    background: #e8eaed;
    color: #202124;
    font-weight: 500;
  }}

  google-codelab #drawer .claat-step-nav-heading-level-3 {{
    margin-left: 0;
    font-size: 12px;
  }}

  google-codelab #drawer .claat-step-nav-heading-level-4 {{
    margin-left: 14px;
    font-size: 11px;
  }}

  google-codelab-step .instructions table {{
    width: 100%;
    border: 1px solid #cbdced;
    border-collapse: collapse;
  }}

  google-codelab-step .instructions table th,
  google-codelab-step .instructions table td {{
    border: 1px solid #cbdced;
  }}

  google-codelab-step .instructions table > thead > tr > th {{
    background: #e8f0fe;
    font-weight: 700;
    text-align: center;
  }}

  @media (max-width: 640px) {{
    google-codelab-step .instructions .claat-code-filename {{
      max-width: calc(100% - 72px);
      min-height: 40px;
      padding: 9px 14px;
      font-size: 0.86rem;
    }}

    google-codelab-step .instructions .claat-code-block pre {{
      padding: 56px 14px 16px;
    }}

    google-codelab-step .instructions .claat-code-block .claat-diff-line {{
      margin: 0 -14px;
      padding: 0 14px;
    }}
  }}
</style>"""

LOCAL_SCRIPT = f"""<script id="{SCRIPT_ID}">
(function () {{
  function setTheme(block, theme) {{
    var isDark = theme === 'dark';
    var toggle = block.querySelector('.claat-toggle-code-theme');
    block.dataset.codeTheme = isDark ? 'dark' : 'light';
    if (!toggle) return;
    toggle.setAttribute('aria-label', isDark ? 'Use light code theme' : 'Use dark code theme');
    toggle.setAttribute('title', isDark ? 'Use light code theme' : 'Use dark code theme');
    var icon = toggle.querySelector('.material-icons');
    if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  }}

  function copyText(text) {{
    if (navigator.clipboard && window.isSecureContext) {{
      return navigator.clipboard.writeText(text);
    }}
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return Promise.resolve();
  }}

  function diffCopyText(source) {{
    return source.replace(/\\n$/, '').split('\\n').reduce(function (lines, line) {{
      if (/^@@/.test(line) || /^(\\+\\+\\+|---)/.test(line)) return lines;
      var marker = line.charAt(0);
      if (marker === '-') return lines;
      if (marker === '+' || marker === ' ') {{
        var body = line.slice(1);
        if (marker === '+' && /^ [^\\s]/.test(body)) body = body.slice(1);
        lines.push(body);
        return lines;
      }}
      lines.push(line);
      return lines;
    }}, []).join('\\n');
  }}

  function codeTextForCopy(code) {{
    if (!code) return '';
    if (code.dataset && (code.dataset.claatDiff === 'true' || code.classList.contains('language-diff'))) {{
      return diffCopyText(code.dataset.claatDiffSource || code.textContent);
    }}
    return code.innerText;
  }}

  function escapeHtml(value) {{
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }}

  function prettyLine(value, language) {{
    var escaped = escapeHtml(value);
    if (!language || typeof window.prettyPrintOne !== 'function') return escaped;
    try {{
      return window.prettyPrintOne(escaped, language);
    }} catch (error) {{
      return escaped;
    }}
  }}

  function diffLineHtml(line, language) {{
    if (/^@@/.test(line)) {{
      return '<span class="claat-diff-line claat-diff-line-hunk">' + escapeHtml(line) + '</span>';
    }}

    var marker = line.charAt(0);
    var isFileHeader = /^(\\+\\+\\+|---)/.test(line);
    var className = 'claat-diff-line';
    if (!isFileHeader && marker === '+') className += ' claat-diff-line-add';
    if (!isFileHeader && marker === '-') className += ' claat-diff-line-delete';
    if (isFileHeader) className += ' claat-diff-line-hunk';

    if (marker === '+' || marker === '-' || marker === ' ') {{
      return (
        '<span class="' + className + '">' +
        '<span class="claat-diff-marker">' + escapeHtml(marker) + '</span>' +
        prettyLine(line.slice(1), language) +
        '</span>'
      );
    }}

    return '<span class="' + className + '">' + prettyLine(line, language) + '</span>';
  }}

  function enhanceDiffCodeBlocks() {{
    document.querySelectorAll('pre > code[data-claat-diff="true"], pre > code.language-diff').forEach(function (code) {{
      if (code.dataset.claatDiffEnhanced === 'true') return;
      var language = code.dataset.claatDiffLanguage || '';
      var source = code.textContent.replace(/\\n$/, '');
      code.dataset.claatDiffSource = source;
      code.classList.add('claat-diff-code');
      code.innerHTML = source.split('\\n').map(function (line) {{
        return diffLineHtml(line, language);
      }}).join('');
      code.dataset.claatDiffEnhanced = 'true';
    }});
  }}

  function normalizeText(value) {{
    return (value || '').replace(/\\s+/g, ' ').trim();
  }}

  function headingOutlineForStep(step, stepIndex) {{
    var headings = Array.prototype.slice.call(
      step.querySelectorAll('.instructions [data-claat-source-heading-level="3"], .instructions [data-claat-source-heading-level="4"]')
    );

    return headings.map(function (heading, index) {{
      var level = Number(heading.dataset.claatSourceHeadingLevel);
      if (!heading.id) {{
        heading.id = 'claat-section-' + stepIndex + '-' + index;
      }}
      return {{
        id: heading.id,
        level: level,
        text: normalizeText(heading.textContent)
      }};
    }}).filter(function (item) {{
      return item.text;
    }});
  }}

  function prepareDrawerStepContent(item) {{
    var step = item.querySelector('.step');
    if (!step) return null;

    var content = step.querySelector('.claat-step-nav-content');
    if (content) return content;

    var titleSource = step.firstElementChild;
    if (!titleSource) return null;

    content = document.createElement('span');
    content.className = 'claat-step-nav-content';

    var title = document.createElement('span');
    title.className = 'claat-step-nav-title';
    while (titleSource.firstChild) {{
      title.appendChild(titleSource.firstChild);
    }}

    content.appendChild(title);
    step.replaceChild(content, titleSource);
    return content;
  }}

  function renderDrawerStepOutline(item, outline) {{
    prepareDrawerStepContent(item);

    var outlineKey = JSON.stringify(outline);
    if (item.dataset.claatStepNavOutline === outlineKey) return;
    item.dataset.claatStepNavOutline = outlineKey;

    var existing = item.querySelector('.claat-step-nav-outline');
    if (existing) existing.remove();
    if (!outline.length) return;

    var container = document.createElement('span');
    container.className = 'claat-step-nav-outline';

    outline.forEach(function (heading) {{
      var row = document.createElement('span');
      row.className = 'claat-step-nav-heading claat-step-nav-heading-level-' + heading.level;
      row.dataset.claatSectionId = heading.id;
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.textContent = heading.text;
      row.addEventListener('click', activateDrawerSection);
      row.addEventListener('keydown', function (event) {{
        if (event.key !== 'Enter' && event.key !== ' ') return;
        activateDrawerSection(event);
      }});
      container.appendChild(row);
    }});

    item.appendChild(container);
  }}

  function selectedStepIndex(codelab) {{
    var selectedItem = codelab.querySelector('#drawer .steps ol li[selected]');
    if (!selectedItem) return -1;
    return Array.prototype.indexOf.call(selectedItem.parentNode.children, selectedItem);
  }}

  function selectedStep(codelab) {{
    var index = selectedStepIndex(codelab);
    var steps = codelab.querySelectorAll('google-codelab-step');
    return index >= 0 ? steps[index] : null;
  }}

  function scrollSelectedStepToSection(sectionId) {{
    var codelab = document.querySelector('google-codelab');
    if (!codelab || !sectionId) return;

    var step = selectedStep(codelab);
    var heading = document.getElementById(sectionId);
    if (step && heading && !step.contains(heading)) heading = null;
    if (!step || !heading) return;

    var stepRect = step.getBoundingClientRect();
    var headingRect = heading.getBoundingClientRect();
    var top = step.scrollTop + headingRect.top - stepRect.top - 20;
    if (typeof step.scrollTo === 'function') {{
      step.scrollTo({{ top: top, behavior: 'smooth' }});
    }} else {{
      step.scrollTop = top;
    }}
    updateActiveDrawerSection(codelab);
  }}

  function updateActiveDrawerSection(root) {{
    var codelab = root || document.querySelector('google-codelab');
    if (!codelab) return;

    var step = selectedStep(codelab);
    var selectedItem = codelab.querySelector('#drawer .steps ol li[selected]');
    if (!step || !selectedItem) return;

    var outlineRows = Array.prototype.slice.call(selectedItem.querySelectorAll('.claat-step-nav-heading'));
    if (!outlineRows.length) return;

    var headings = Array.prototype.slice.call(
      step.querySelectorAll('.instructions [data-claat-source-heading-level="3"], .instructions [data-claat-source-heading-level="4"]')
    ).filter(function (heading) {{
      return heading.id;
    }});
    if (!headings.length) return;

    var stepTop = step.getBoundingClientRect().top;
    var activeHeading = headings[0];
    headings.forEach(function (heading) {{
      if (heading.getBoundingClientRect().top - stepTop <= 72) activeHeading = heading;
    }});

    outlineRows.forEach(function (row) {{
      row.classList.toggle('is-active', row.dataset.claatSectionId === activeHeading.id);
    }});
  }}

  function attachStepScrollListeners(codelab) {{
    Array.prototype.slice.call(codelab.querySelectorAll('google-codelab-step')).forEach(function (step) {{
      if (step.dataset.claatSectionScrollObserver === 'true') return;
      step.dataset.claatSectionScrollObserver = 'true';
      step.addEventListener('scroll', function () {{
        window.requestAnimationFrame(function () {{
          updateActiveDrawerSection(codelab);
        }});
      }}, {{ passive: true }});
    }});
  }}

  function enhanceDrawerStepOutlines(root) {{
    var codelab = root || document.querySelector('google-codelab');
    if (!codelab) return false;

    var items = Array.prototype.slice.call(codelab.querySelectorAll('#drawer .steps ol li'));
    var steps = Array.prototype.slice.call(codelab.querySelectorAll('google-codelab-step'));
    if (!items.length || !steps.length) return false;

    items.forEach(function (item, index) {{
      renderDrawerStepOutline(item, steps[index] ? headingOutlineForStep(steps[index], index) : []);
    }});
    attachStepScrollListeners(codelab);
    updateActiveDrawerSection(codelab);
    return true;
  }}

  function observeDrawerStepOutlines() {{
    var codelab = document.querySelector('google-codelab');
    if (!codelab) return;

    enhanceDrawerStepOutlines(codelab);

    var drawer = codelab.querySelector('#drawer');
    if (!drawer || drawer.dataset.claatHeadingObserver === 'true') return;
    drawer.dataset.claatHeadingObserver = 'true';

    var scheduled = false;
    var observer = new MutationObserver(function () {{
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {{
        scheduled = false;
        enhanceDrawerStepOutlines(codelab);
      }});
    }});
    observer.observe(drawer, {{ attributes: true, attributeFilter: ['selected'], childList: true, subtree: true }});
  }}

  function startDrawerStepOutlineEnhancement() {{
    var attempts = 0;

    function tryEnhance() {{
      attempts += 1;
      observeDrawerStepOutlines();
      if (attempts >= 12 || document.querySelector('google-codelab #drawer .steps ol li')) return;
      window.setTimeout(tryEnhance, 200);
    }}

    tryEnhance();
  }}

  function activateDrawerSection(event) {{
    var section = event.currentTarget;
    if (!section || !section.dataset) return;
    event.preventDefault();
    event.stopPropagation();
    scrollSelectedStepToSection(section.dataset.claatSectionId);
  }}

  document.addEventListener('click', function (event) {{
    var copyButton = event.target.closest('.claat-copy-code');
    var themeButton = event.target.closest('.claat-toggle-code-theme');
    if (!copyButton && !themeButton) return;

    var block = event.target.closest('.claat-code-block');
    if (!block) return;

    if (copyButton) {{
      var code = block.querySelector('pre > code') || block.querySelector('pre');
      if (!code) return;
      copyText(codeTextForCopy(code)).then(function () {{
        var icon = copyButton.querySelector('.material-icons');
        if (!icon) return;
        icon.textContent = 'done';
        window.setTimeout(function () {{
          icon.textContent = 'content_copy';
        }}, 1200);
      }});
    }}

    if (themeButton) {{
      setTheme(block, block.dataset.codeTheme === 'dark' ? 'light' : 'dark');
    }}
  }});

  document.addEventListener('DOMContentLoaded', function () {{
    document.querySelectorAll('.claat-code-block').forEach(function (block) {{
      setTheme(block, block.dataset.codeTheme || 'light');
    }});
    enhanceDiffCodeBlocks();
    startDrawerStepOutlineEnhancement();
  }});
}}());
</script>"""


def parse_markdown_metadata(markdown: str) -> dict[str, str]:
    metadata: dict[str, str] = {}

    for line in markdown.splitlines():
        if not line.strip():
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip().lower()
        if key:
            metadata[key] = value.strip()

    h1 = re.search(r"^#\s+(.+?)\s*$", markdown, re.MULTILINE)
    if h1:
        metadata["title"] = h1.group(1).strip()

    image = first_markdown_image(markdown)
    if image:
        metadata["image_alt"] = image[0]
        metadata["image"] = image[1]

    return metadata


def first_markdown_image(markdown: str) -> tuple[str, str] | None:
    markdown = re.sub(r"```.*?```", "", markdown, flags=re.DOTALL)
    markdown = re.sub(r"~~~.*?~~~", "", markdown, flags=re.DOTALL)
    pattern = re.compile(
        r"!\[(?P<alt>[^\]]*)\]\("
        r"(?P<target><[^>\n]+>|[^\s)\n]+)"
        r"(?:\s+['\"][^'\"]*['\"])?"
        r"\)"
    )
    match = pattern.search(markdown)
    if not match:
        return None

    target = match.group("target").strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1].strip()
    return match.group("alt").strip(), target


def load_markdown_metadata(source_md: str | None) -> dict[str, str]:
    if not source_md:
        return {}

    path = Path(source_md)
    if not path.exists():
        return {}

    return parse_markdown_metadata(path.read_text(encoding="utf-8"))


def load_markdown_code_fences(source_md: str | None) -> list[dict[str, str]]:
    if not source_md:
        return []

    path = Path(source_md)
    if not path.exists():
        return []

    return parse_markdown_code_fences(path.read_text(encoding="utf-8"))


def markdown_inline_to_text(value: str) -> str:
    value = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", value)
    value = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", value)
    code_spans: list[str] = []

    def preserve_code_span(match: re.Match) -> str:
        index = len(code_spans)
        code_spans.append(html_lib.escape(match.group(1)))
        return f"CLAATINLINECODE{index}TOKEN"

    # Keep punctuation inside inline code literal. In particular, underscores in
    # tool names such as `get_my_reservation` are content, not emphasis markers.
    value = re.sub(r"`([^`]*)`", preserve_code_span, value)
    value = re.sub(r"[*_~]+", "", value)
    for index, code_span in enumerate(code_spans):
        value = value.replace(f"CLAATINLINECODE{index}TOKEN", code_span)
    value = re.sub(r"<[^>]+>", "", value)
    return normalize_plain_text(value)


def normalize_plain_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    value = html_lib.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def parse_markdown_step_headings(markdown: str) -> list[list[dict[str, str | int]]]:
    steps: list[list[dict[str, str | int]]] = []
    current: list[dict[str, str | int]] | None = None
    in_fence = False
    fence_char = ""
    fence_len = 0

    for line in markdown.splitlines():
        fence_match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if fence_match:
            fence = fence_match.group(1)
            if not in_fence:
                in_fence = True
                fence_char = fence[0]
                fence_len = len(fence)
            elif fence[0] == fence_char and len(fence) >= fence_len:
                in_fence = False
            continue

        if in_fence:
            continue

        step_match = re.match(r"^##\s+(?!#)(.+?)\s*$", line)
        if step_match:
            current = []
            steps.append(current)
            continue

        heading_match = re.match(r"^(#{3,4})\s+(.+?)\s*$", line)
        if heading_match and current is not None:
            text = markdown_inline_to_text(heading_match.group(2))
            if text:
                current.append({"level": len(heading_match.group(1)), "text": text})

    return steps


def load_markdown_step_headings(source_md: str | None) -> list[list[dict[str, str | int]]]:
    if not source_md:
        return []

    path = Path(source_md)
    if not path.exists():
        return []

    return parse_markdown_step_headings(path.read_text(encoding="utf-8"))


def annotate_source_headings(html: str, source_md: str | None) -> str:
    step_headings = load_markdown_step_headings(source_md)
    if not step_headings:
        return html

    step_pattern = re.compile(
        r"(?P<open><google-codelab-step\b[^>]*>)(?P<body>.*?)(?P<close></google-codelab-step>)",
        re.DOTALL | re.IGNORECASE,
    )
    heading_pattern = re.compile(
        r"(?P<open><h[2-4]\b[^>]*>)(?P<body>.*?)(?P<close></h[2-4]>)",
        re.DOTALL | re.IGNORECASE,
    )

    def annotate_step(match: re.Match) -> str:
        step_index = annotate_step.index
        annotate_step.index += 1
        expected = step_headings[step_index] if step_index < len(step_headings) else []
        if not expected:
            return match.group(0)

        expected_index = 0

        def annotate_heading(heading_match: re.Match) -> str:
            nonlocal expected_index
            if expected_index >= len(expected):
                return heading_match.group(0)

            actual_text = normalize_plain_text(heading_match.group("body"))
            expected_heading = expected[expected_index]
            if actual_text != expected_heading["text"]:
                return heading_match.group(0)

            expected_index += 1
            open_tag = set_or_append_attr(
                heading_match.group("open"),
                "data-claat-source-heading-level",
                str(expected_heading["level"]),
            )
            return open_tag + heading_match.group("body") + heading_match.group("close")

        body = heading_pattern.sub(annotate_heading, match.group("body"))
        return match.group("open") + body + match.group("close")

    annotate_step.index = 0  # type: ignore[attr-defined]
    return step_pattern.sub(annotate_step, html)


def parse_markdown_code_fences(markdown: str) -> list[dict[str, str]]:
    fences: list[dict[str, str]] = []
    lines = markdown.splitlines()
    i = 0

    while i < len(lines):
        match = re.match(r"^([ \t]*)(`{3,}|~{3,})(.*)$", lines[i])
        if not match:
            i += 1
            continue

        indent, fence, info = match.groups()
        fence_char = fence[0]
        fence_len = len(fence)
        closing_pattern = re.compile(rf"^{re.escape(indent)}{re.escape(fence_char)}{{{fence_len},}}\s*$")

        i += 1
        while i < len(lines) and not closing_pattern.match(lines[i]):
            i += 1
        if i < len(lines):
            i += 1

        fence_info = parse_code_fence_info(info.strip())
        fences.append(
            {
                "info": info.strip(),
                "language": fence_info["language"],
                "filename": fence_info["filename"],
                "is_diff": "true" if fence_info["is_diff"] else "",
                "diff_language": fence_info["language"] if fence_info["is_diff"] else "",
            }
        )

    return fences


def parse_code_fence_info(info: str) -> dict[str, str | bool]:
    result: dict[str, str | bool] = {"language": "", "filename": "", "is_diff": False}
    if not info:
        return result

    if info == "diff" or info.startswith("diff "):
        result["is_diff"] = True
        info = info[4:].strip()

    if not info:
        return result

    first_space = re.search(r"\s", info)
    first_token = info if not first_space else info[: first_space.start()]
    remainder = "" if not first_space else info[first_space.start() :].strip()

    if ":" in first_token:
        language, filename_start = first_token.split(":", 1)
        result["language"] = language
        result["filename"] = (filename_start + (" " + remainder if remainder else "")).strip()
        return result

    result["language"] = first_token
    return result


def load_codelab_metadata(html_path: str | None) -> dict[str, str]:
    if not html_path:
        return {}

    codelab_json = Path(html_path).resolve().parent / "codelab.json"
    if not codelab_json.exists():
        return {}

    try:
        data = json.loads(codelab_json.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}

    metadata: dict[str, str] = {}
    for source_key, target_key in (("title", "title"), ("summary", "summary")):
        value = data.get(source_key)
        if isinstance(value, str):
            metadata[target_key] = value
    return metadata


def resolve_relative_asset(source: str, source_md: str | None, html_path: str | None) -> str:
    if not source or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", source) or source.startswith(("/", "#")):
        return source
    if not source_md or not html_path:
        return source

    source_path = (Path(source_md).resolve().parent / source).resolve()
    html_dir = Path(html_path).resolve().parent
    return os.path.relpath(source_path, html_dir).replace(os.sep, "/")


def attrs_from_tag(tag: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for match in re.finditer(r"([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(['\"])(.*?)\2", tag, re.DOTALL):
        attrs[match.group(1).lower()] = html_lib.unescape(match.group(3))
    return attrs


def exported_image_src_for_alt(html: str, alt: str) -> str | None:
    if not alt:
        return None

    for match in re.finditer(r"<img\b[^>]*>", html, re.IGNORECASE):
        attrs = attrs_from_tag(match.group(0))
        if attrs.get("alt") == alt and attrs.get("src"):
            return attrs["src"]
    return None


def site_url_for_output_asset(source: str, html_path: str | None) -> str:
    if not source or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", source) or source.startswith("#"):
        return source

    if source.startswith("/"):
        return SITE_BASE_URL + source

    if not html_path:
        return f"{SITE_BASE_URL}/{source}"

    html_dir_name = Path(html_path).resolve().parent.name
    if html_dir_name and source != html_dir_name and not source.startswith(html_dir_name + "/"):
        source = f"{html_dir_name}/{source}"
    return f"{SITE_BASE_URL}/{source}"


def ogp_values(html: str, html_path: str | None, source_md: str | None) -> dict[str, str]:
    values: dict[str, str] = {}
    codelab_metadata = load_codelab_metadata(html_path)
    markdown_metadata = load_markdown_metadata(source_md)

    title = markdown_metadata.get("title") or codelab_metadata.get("title")
    if not title:
        title_match = re.search(r"<title>(.*?)</title>", html, re.DOTALL | re.IGNORECASE)
        if title_match:
            title = html_lib.unescape(re.sub(r"\s+", " ", title_match.group(1)).strip())

    description = markdown_metadata.get("summary") or codelab_metadata.get("summary")
    if not description:
        first_p = re.search(r"<google-codelab-step\b[^>]*>\s*<p>(.*?)</p>", html, re.DOTALL | re.IGNORECASE)
        if first_p:
            description = html_lib.unescape(re.sub(r"<[^>]+>", "", first_p.group(1))).strip()

    if title:
        values["og:title"] = title
        values["twitter:title"] = title
    if description:
        values["og:description"] = description
        values["twitter:description"] = description

    values["twitter:card"] = "summary_large_image"

    image = markdown_metadata.get("image")
    if image:
        image = exported_image_src_for_alt(html, markdown_metadata.get("image_alt", "")) or resolve_relative_asset(
            image,
            source_md,
            html_path,
        )
        image_url = site_url_for_output_asset(image, html_path)
        values["og:image"] = image_url
        values["twitter:image"] = image_url

    return values


def inject_ogp(html: str, values: dict[str, str]) -> tuple[str, int]:
    if not values:
        return html, 0

    total = 0
    for prop, value in values.items():
        meta_id = OGP_META_ID_PREFIX + prop.replace(":", "-")
        attr = "name" if prop.startswith("twitter:") else "property"
        content = html_lib.escape(value, quote=True)
        tag = f'<meta id="{meta_id}" {attr}="{prop}" content="{content}">'
        pattern = re.compile(
            r'<meta\b(?=[^>]*(?:property|name)=["\']' + re.escape(prop) + r'["\'])[^>]*>\n?',
            re.IGNORECASE,
        )
        html, n = pattern.subn("", html)
        total += n
        html, n = re.subn(
            r'(?=<(?:link|style)\b[^>]*id=["\'](?:'
            + re.escape(FAVICON_ID)
            + "|"
            + re.escape(STYLE_ID)
            + r')["\'])',
            tag + "\n",
            html,
            count=1,
            flags=re.IGNORECASE,
        )
        if n == 0:
            html, n = re.subn(r"</head>", tag + "\n</head>", html, count=1, flags=re.IGNORECASE)
        if n == 0:
            html = tag + "\n" + html
            n = 1
        total += n

    return html, total


def escape_codespans(html: str) -> tuple[str, int]:
    pattern = re.compile(r"<code>([^<>]*<[^<]*?)</code>")

    def escape(m: re.Match) -> str:
        inner = m.group(1)
        inner = inner.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        return f"<code>{inner}</code>"

    total = 0
    while True:
        html, n = pattern.subn(escape, html)
        if n == 0:
            return html, total
        total += n


def semanticize_table_headers(html: str) -> tuple[str, int]:
    """Turn claat's first table row into a semantic header row."""
    table_pattern = re.compile(
        r"<table(?P<attrs>\b[^>]*)>(?P<body>.*?)</table>",
        re.DOTALL | re.IGNORECASE,
    )
    first_row_pattern = re.compile(
        r"(?P<leading>\s*)(?P<header><tr\b[^>]*>.*?</tr>)(?P<rest>.*)\Z",
        re.DOTALL | re.IGNORECASE,
    )
    total = 0

    def replace_table(match: re.Match) -> str:
        nonlocal total
        body = match.group("body")
        if re.match(r"\s*<thead\b", body, re.IGNORECASE):
            return match.group(0)

        first_row = first_row_pattern.fullmatch(body)
        if not first_row:
            return match.group(0)

        header = re.sub(
            r"(<\s*/?\s*)td(?=[\s>])",
            r"\1th",
            first_row.group("header"),
            flags=re.IGNORECASE,
        )
        if header == first_row.group("header"):
            return match.group(0)

        total += 1
        result = (
            f'<table{match.group("attrs")}>'
            f'{first_row.group("leading")}<thead>\n{header}\n</thead>'
        )
        rest = first_row.group("rest")
        if rest.strip():
            result += f"\n<tbody>{rest}</tbody>"
        return result + "\n</table>"

    return table_pattern.sub(replace_table, html), total


def wrap_asides(html: str) -> tuple[str, int]:
    keys = "|".join(re.escape(k) for k in ASIDE_KEYWORDS)
    # <p><strong>Keyword:</strong>...</p> optionally followed by a single <ul>/<ol> block.
    # claat may keep the space after the marker inside <strong>, as in
    # <strong>Tips: </strong><code>...</code>.
    pattern = re.compile(
        r"<p><strong>\s*(?P<kw>" + keys + r"):?\s*</strong>"
        r"(?P<body>.*?)</p>"
        r"(?P<list>\s*<(?P<lt>ul|ol)[^>]*>.*?</(?P=lt)>)?",
        re.DOTALL,
    )

    total = 0

    def repl(m: re.Match) -> str:
        nonlocal total

        last_aside_open = html.rfind("<aside", 0, m.start())
        last_aside_close = html.rfind("</aside>", 0, m.start())
        if last_aside_open > last_aside_close:
            return m.group(0)

        klass = ASIDE_KEYWORDS[m.group("kw")]
        total += 1
        return f'<aside class="{klass}">{m.group(0)}</aside>'

    return pattern.sub(repl, html), total


def retag_troubleshooting_asides(html: str) -> tuple[str, int]:
    pattern = re.compile(
        r'<aside class="warning">(\s*<p><strong>\s*Troubleshooting:?\s*</strong>)',
        re.DOTALL,
    )
    return pattern.subn(r'<aside class="troubleshooting">\1', html)


def set_or_append_attr(tag: str, name: str, value: str) -> str:
    escaped_value = html_lib.escape(value, quote=True)
    pattern = re.compile(rf'\b{re.escape(name)}=(["\'])(.*?)\1', re.DOTALL)

    def repl(match: re.Match) -> str:
        return f'{name}={match.group(1)}{escaped_value}{match.group(1)}'

    tag, n = pattern.subn(repl, tag, count=1)
    if n:
        return tag
    return tag[:-1] + f' {name}="{escaped_value}">'


def append_class_attr(tag: str, class_name: str) -> str:
    pattern = re.compile(r'\bclass=(["\'])(.*?)\1', re.DOTALL)
    match = pattern.search(tag)
    if not match:
        return tag[:-1] + f' class="{class_name}">'

    classes = match.group(2).split()
    if class_name not in classes:
        classes.append(class_name)
    value = " ".join(classes)
    return pattern.sub(f'class={match.group(1)}{html_lib.escape(value, quote=True)}{match.group(1)}', tag, count=1)


def remove_attr(tag: str, name: str) -> str:
    return re.sub(rf'\s+\b{re.escape(name)}=(["\']).*?\1', "", tag, count=1, flags=re.DOTALL)


def normalize_code_language_attrs(code_tag: str, language: str) -> str:
    if not language:
        return code_tag

    language_class = f"language-{language}"
    code_tag = set_or_append_attr(code_tag, "language", language_class)

    class_match = re.search(r'\bclass=(["\'])(.*?)\1', code_tag, re.DOTALL)
    if not class_match:
        return code_tag[:-1] + f' class="{html_lib.escape(language_class, quote=True)}">'

    classes = [klass for klass in class_match.group(2).split() if not klass.startswith("language-")]
    classes.append(language_class)
    value = " ".join(classes)
    return re.sub(
        r'\bclass=(["\'])(.*?)\1',
        f'class={class_match.group(1)}{html_lib.escape(value, quote=True)}{class_match.group(1)}',
        code_tag,
        count=1,
        flags=re.DOTALL,
    )


def annotate_code_blocks(html: str, source_md: str | None) -> tuple[str, int, int]:
    fences = load_markdown_code_fences(source_md)
    code_index = 0
    diff_total = 0
    filename_total = 0
    pattern = re.compile(
        r"(?P<pre_tag><pre\b[^>]*>)(?P<between>\s*)(?P<code_tag><code\b[^>]*>)(?P<body>.*?</code>\s*</pre>)",
        re.DOTALL,
    )

    def repl(match: re.Match) -> str:
        nonlocal code_index, diff_total, filename_total

        fence = fences[code_index] if code_index < len(fences) else {}
        code_index += 1

        pre_tag = match.group("pre_tag")
        code_tag = match.group("code_tag")
        open_tag = match.group(0)[: match.start("body") - match.start()]
        has_diff_attr = bool(re.search(r'\b(?:class|language)=["\'][^"\']*\blanguage-diff\b', open_tag))
        is_diff = fence.get("is_diff") == "true" or has_diff_attr
        language = fence.get("language", "")
        filename = fence.get("filename", "")

        if language:
            code_tag = normalize_code_language_attrs(code_tag, language)

        if filename and "data-claat-filename=" not in pre_tag:
            pre_tag = set_or_append_attr(pre_tag, "data-claat-filename", filename)
            filename_total += 1

        if is_diff and 'data-claat-diff="true"' not in code_tag:
            code_tag = append_class_attr(code_tag, "claat-diff-code")
            code_tag = set_or_append_attr(code_tag, "data-claat-diff", "true")
            if language:
                code_tag = set_or_append_attr(code_tag, "data-claat-diff-language", language)
            diff_total += 1

        return pre_tag + match.group("between") + code_tag + match.group("body")

    return pattern.sub(repl, html), diff_total, filename_total


def wrap_code_blocks(html: str) -> tuple[str, int]:
    if 'class="claat-code-block"' in html:
        return html, 0

    pattern = re.compile(r"(?P<pre><pre\b(?P<attrs>[^>]*)>.*?</pre>)", re.DOTALL)

    def repl(m: re.Match) -> str:
        pre = m.group("pre")
        attrs = attrs_from_tag(m.group("pre")[: m.group("pre").find(">") + 1])
        filename = attrs.get("data-claat-filename", "")
        filename_label = ""
        if filename:
            filename_label = CODE_FILENAME_LABEL_TEMPLATE.format(filename=html_lib.escape(filename))
            pre = remove_attr(pre, "data-claat-filename")
        return (
            '<div class="claat-code-block" data-code-theme="light">\n'
            f"{filename_label}"
            f"{CODE_TOOLBAR}\n"
            f"{pre}\n"
            "</div>"
        )

    return pattern.subn(repl, html)


def repair_button_links(html: str) -> tuple[str, int]:
    br = r"<br\s*/?>"
    spacer = rf"(?:\s|{br})*"
    pattern = re.compile(
        rf"<(?P<tag>p|li)(?P<attrs>[^>]*)>"
        rf"{spacer}\[(?P<label>[^\]\n]+)\]\((?P<href>[^\s)]+)\){spacer}"
        rf"</(?P=tag)>",
        re.IGNORECASE,
    )

    def repl(m: re.Match) -> str:
        tag = m.group("tag")
        attrs = m.group("attrs")
        label = html_lib.escape(html_lib.unescape(m.group("label")))
        href = html_lib.escape(html_lib.unescape(m.group("href")), quote=True)
        button = (
            f'<a href="{href}" target="_blank">'
            f'<paper-button class="colored" raised>{label}</paper-button>'
            "</a>"
        )
        return f"<{tag}{attrs}>{button}</{tag}>"

    return pattern.subn(repl, html)


def repair_image_download_links(html: str) -> tuple[str, int]:
    pattern = re.compile(
        r'<a\b[^>]*\bhref=(?P<quote>["\'])(?P<href>img/[^"\']+\.(?:png|jpe?g|webp|svg))(?P=quote)[^>]*>'
        r"(?P<label>[^<]*画像をダウンロード[^<]*)</a>",
        re.IGNORECASE,
    )

    def repl(m: re.Match) -> str:
        href = html_lib.escape(html_lib.unescape(m.group("href")), quote=True)
        filename = html_lib.escape(Path(html_lib.unescape(m.group("href"))).name, quote=True)
        label = html_lib.escape(html_lib.unescape(m.group("label")).strip())
        return (
            f'<a href="{href}" download="{filename}">'
            f'<paper-button class="colored" raised>{label}</paper-button>'
            "</a>"
        )

    return pattern.subn(repl, html)


def linkify_bare_urls(html: str) -> tuple[str, int]:
    tag_pattern = re.compile(r"(<[^>]+>)")
    url_pattern = re.compile(r"https?://[^\s<>\"]+")
    stack: list[str] = []
    total = 0
    parts: list[str] = []

    def linkify_text(text: str) -> str:
        nonlocal total

        def repl(m: re.Match) -> str:
            nonlocal total
            url = m.group(0)
            trailing = ""
            while url and url[-1] in TRAILING_URL_PUNCTUATION:
                trailing = url[-1] + trailing
                url = url[:-1]
            if not url:
                return m.group(0)

            href = html_lib.escape(html_lib.unescape(url), quote=True)
            total += 1
            return f'<a href="{href}" target="_blank">{url}</a>{trailing}'

        return url_pattern.sub(repl, text)

    for part in tag_pattern.split(html):
        if not part:
            continue

        if part.startswith("<"):
            tag = re.match(r"</?\s*([a-zA-Z0-9-]+)", part)
            if tag:
                tag_name = tag.group(1).lower()
                is_end = part.startswith("</")
                is_self_closing = part.rstrip().endswith("/>")

                if tag_name in SKIP_LINKIFY_TAGS:
                    if is_end:
                        for i in range(len(stack) - 1, -1, -1):
                            if stack[i] == tag_name:
                                del stack[i:]
                                break
                    elif not is_self_closing:
                        stack.append(tag_name)

            parts.append(part)
            continue

        if stack:
            parts.append(part)
        else:
            parts.append(linkify_text(part))

    return "".join(parts), total


def favicon_href_for(html_path: str) -> str:
    repo_root = Path(__file__).resolve().parents[1]
    favicon = repo_root / "assets" / "favicon.png"
    html_dir = Path(html_path).resolve().parent
    return os.path.relpath(favicon, html_dir).replace(os.sep, "/")


def inject_favicon(html: str, href: str) -> tuple[str, int]:
    if f'id="{FAVICON_ID}"' in html:
        return html, 0

    favicon_link = f'<link id="{FAVICON_ID}" rel="icon" type="image/png" href="{href}">'
    html, n = re.subn(r"</head>", favicon_link + "\n</head>", html, count=1)
    if n == 0:
        html = favicon_link + "\n" + html
        n = 1
    return html, n


def inject_local_assets(html: str) -> tuple[str, int, int]:
    n_style = 0
    n_script = 0

    if f'id="{STYLE_ID}"' in html:
        html, n_style = re.subn(
            r'<style id="' + re.escape(STYLE_ID) + r'">.*?</style>',
            LOCAL_STYLE,
            html,
            count=1,
            flags=re.DOTALL,
        )
    else:
        html, n_style = re.subn(r"</head>", LOCAL_STYLE + "\n</head>", html, count=1)
        if n_style == 0:
            html = LOCAL_STYLE + "\n" + html
            n_style = 1

    if f'id="{SCRIPT_ID}"' in html:
        html, n_script = re.subn(
            r'<script id="' + re.escape(SCRIPT_ID) + r'">.*?</script>',
            lambda _m: LOCAL_SCRIPT,
            html,
            count=1,
            flags=re.DOTALL,
        )
    else:
        html, n_script = re.subn(r"</body>", lambda m: LOCAL_SCRIPT + "\n" + m.group(0), html, count=1)
        if n_script == 0:
            html = html + "\n" + LOCAL_SCRIPT + "\n"
            n_script = 1

    return html, n_style, n_script


def fix(
    html: str,
    html_path: str | None = None,
    source_md: str | None = None,
) -> tuple[str, int, int, int, int, int, int, int, int, int, int, int]:
    html, n_code = escape_codespans(html)
    html, _n_tables = semanticize_table_headers(html)
    html, n_aside = wrap_asides(html)
    html, n_retagged = retag_troubleshooting_asides(html)
    html, n_diff, n_filenames = annotate_code_blocks(html, source_md)
    html, n_blocks = wrap_code_blocks(html)
    html, n_buttons = repair_button_links(html)
    html, n_download_buttons = repair_image_download_links(html)
    n_buttons += n_download_buttons
    html, n_links = linkify_bare_urls(html)
    html = annotate_source_headings(html, source_md)
    html, n_ogp = inject_ogp(html, ogp_values(html, html_path, source_md))
    favicon_href = favicon_href_for(html_path) if html_path else "assets/favicon.png"
    html, n_favicon = inject_favicon(html, favicon_href)
    html, n_style, n_script = inject_local_assets(html)
    return (
        html,
        n_code,
        n_aside + n_retagged,
        n_diff,
        n_filenames,
        n_blocks,
        n_buttons,
        n_links,
        n_ogp,
        n_favicon,
        n_style,
        n_script,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Post-process claat-generated HTML files.")
    parser.add_argument("--source-md", "--source", dest="source_md", help="source claat markdown file")
    parser.add_argument("html_files", nargs="*")
    args = parser.parse_args()

    if not args.html_files:
        parser.print_usage(sys.stderr)
        return 2

    for path in args.html_files:
        with open(path, encoding="utf-8") as f:
            original = f.read()
        (
            fixed,
            n_code,
            n_aside,
            n_diff,
            n_filenames,
            n_blocks,
            n_buttons,
            n_links,
            n_ogp,
            n_favicon,
            n_style,
            n_script,
        ) = fix(original, path, args.source_md)
        if fixed != original:
            with open(path, "w", encoding="utf-8") as f:
                f.write(fixed)
        print(
            f"{path}: fixed {n_code} code spans, wrapped {n_aside} asides, "
            f"annotated {n_diff} diff blocks, labeled {n_filenames} code blocks, "
            f"enhanced {n_blocks} code blocks, "
            f"repaired {n_buttons} buttons, "
            f"linkified {n_links} URLs, "
            f"injected {n_ogp} OGP tags, {n_favicon} favicons, "
            f"{n_style} styles and {n_script} scripts"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
