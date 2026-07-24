#!/usr/bin/env python3
"""Post-process generated Marp HTML files.

- Add a favicon link pointing at the shared assets/favicon.png.
- Inject an `og:image` meta pointing at the first-slide PNG that
  `make slide` renders next to the HTML (default: ogp.png), and
  upgrade Marp's default `twitter:card` to `summary_large_image` so
  the image renders large in social previews. The og:image URL is
  made absolute using the repository's CNAME when available so that
  external scrapers can resolve it.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path


OGP_IMAGE_FILENAME = "ogp.png"
FALLBACK_BASE_URL = "https://gdsc-osaka.github.io/education"


def site_base_url(repo_root: Path) -> str:
    cname = repo_root / "CNAME"
    if cname.exists():
        host = cname.read_text(encoding="utf-8").strip()
        if host:
            return f"https://{host}"
    return FALLBACK_BASE_URL


def og_image_url(repo_root: Path, image_path: Path) -> str:
    try:
        rel = image_path.resolve().relative_to(repo_root)
    except ValueError:
        return image_path.name
    return f"{site_base_url(repo_root)}/{rel.as_posix()}"


def replace_or_insert(html: str, pattern: re.Pattern[str], tag: str) -> str:
    new_html, n = pattern.subn(tag, html, count=1)
    if n:
        return new_html
    if "</head>" in html:
        return html.replace("</head>", f"{tag}</head>", 1)
    return tag + "\n" + html


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: fix-slide-html.py path/to/slide.html", file=sys.stderr)
        return 2

    html_path = Path(sys.argv[1])
    repo_root = Path(__file__).resolve().parents[1]
    favicon = repo_root / "assets" / "favicon.png"
    favicon_href = os.path.relpath(favicon, html_path.parent).replace(os.sep, "/")

    html = html_path.read_text(encoding="utf-8")

    favicon_link = f'<link rel="icon" type="image/png" href="{favicon_href}">'
    favicon_pattern = re.compile(
        r'<link\b[^>]*rel=["\'][^"\']*\bicon\b[^"\']*["\'][^>]*>',
        re.IGNORECASE,
    )
    html = replace_or_insert(html, favicon_pattern, favicon_link)

    ogp_image_path = html_path.parent / OGP_IMAGE_FILENAME
    if ogp_image_path.exists():
        url = og_image_url(repo_root, ogp_image_path)
        og_tag = f'<meta property="og:image" content="{url}">'
        og_pattern = re.compile(
            r'<meta\b[^>]*property=["\']og:image["\'][^>]*>',
            re.IGNORECASE,
        )
        html = replace_or_insert(html, og_pattern, og_tag)

        twitter_tag = '<meta name="twitter:card" content="summary_large_image">'
        twitter_pattern = re.compile(
            r'<meta\b[^>]*name=["\']twitter:card["\'][^>]*>',
            re.IGNORECASE,
        )
        html = replace_or_insert(html, twitter_pattern, twitter_tag)
    else:
        print(
            f"{html_path}: {OGP_IMAGE_FILENAME} not found next to HTML; skipping og:image",
            file=sys.stderr,
        )

    html_path.write_text(html, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
