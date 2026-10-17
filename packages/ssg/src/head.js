// <head> の中身を組み立てる。プリレンダ（React のページ）と
// 記事ページの生成スクリプトの両方から呼ぶので、素の JS にしてある。

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const tag = (html) => html;

/**
 * @param {object} args
 * @param {object} args.site           site.config.json の中身
 * @param {string} args.title          そのページのタイトル
 * @param {string} [args.description]  そのページの説明
 * @param {string} args.pathname       `/` から始まる URL パス
 * @param {"website"|"article"} [args.type]
 * @param {object|object[]} [args.jsonLd] 構造化データ
 * @param {boolean} [args.noindex]
 * @param {string} [args.publishedAt]  ISO 日付。記事のとき
 * @param {string} [args.modifiedAt]
 */
export function renderHead({
  site,
  title,
  description = site.description,
  pathname,
  type = "website",
  jsonLd,
  noindex = false,
  publishedAt,
  modifiedAt,
}) {
  const canonical = new URL(pathname, site.url).href;
  const ogImage = new URL(site.ogImage, site.url).href;
  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return tag(`<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${site.keywords?.length ? `<meta name="keywords" content="${esc(site.keywords.join(", "))}">\n` : ""}<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="${
    noindex
      ? "noindex, nofollow"
      : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
  }">
<meta name="author" content="${esc(site.author)}">
<meta name="theme-color" content="${esc(site.themeColor)}">

<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="${esc(site.title)}">
<meta property="og:type" content="${esc(type)}">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${publishedAt ? `<meta property="article:published_time" content="${esc(publishedAt)}">\n` : ""}${modifiedAt ? `<meta property="article:modified_time" content="${esc(modifiedAt)}">\n` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${esc(site.twitter)}">
<meta name="twitter:creator" content="${esc(site.twitter)}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">

${site.feed ? `<link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${esc(new URL("/feed.xml", site.url).href)}">\n` : ""}${blocks
    .map(
      (b) =>
        `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`,
    )
    .join("\n")}`);
}

/** 著者。記事・サイト両方の構造化データから参照する。 */
export function personSchema(site) {
  return {
    "@type": "Person",
    name: site.author,
    url: site.authorUrl,
    sameAs: site.sameAs,
  };
}

export function websiteSchema(site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.title,
    url: site.url,
    description: site.description,
    inLanguage: "ja",
    author: personSchema(site),
  };
}

export function blogPostingSchema(site, article) {
  const url = new URL(article.path, site.url).href;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: article.date,
    dateModified: article.updated || article.date,
    inLanguage: "ja",
    author: personSchema(site),
    publisher: personSchema(site),
    image: new URL(site.ogImage, site.url).href,
    isAccessibleForFree: true,
    ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    ...(article.keywords?.length ? { keywords: article.keywords.join(", ") } : {}),
  };
}

/** 一覧ページ用。収録アイテムを ItemList で並べる。 */
export function itemListSchema(site, items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.title,
      url: new URL(item.path, site.url).href,
    })),
  };
}

/** 発表スライド1本。検索結果で「資料」として扱われるようにする。 */
export function presentationSchema(site, slide) {
  const url = new URL(slide.path, site.url).href;
  return {
    "@context": "https://schema.org",
    "@type": "PresentationDigitalDocument",
    name: slide.title,
    description: slide.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: slide.date,
    dateModified: slide.updated || slide.date,
    inLanguage: "ja",
    author: personSchema(site),
    publisher: personSchema(site),
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
  };
}

/** パンくず。検索結果にサイト内の階層が出るようになる。 */
export function breadcrumbSchema(site, trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, site.url).href,
    })),
  };
}

/**
 * 既にある <head> に meta を差し込む。
 *
 * marp や ippon-slides が吐いた HTML が対象。向こうが入れた title と
 * og:/twitter: は自前のものと二重になるので先に落とす。
 */
export function injectHead(html, headHtml, { lang = "ja" } = {}) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+[^>]*(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta\s+[^>]*name="description"[^>]*>\s*/gi, "");

  // marp は <html> にも各スライドの <section> にも en-US を付ける。
  // 中身は日本語なので、文書全体の lang をまとめて直す。
  out = out
    .replace(/<html([^>]*)\slang="[^"]*"/i, "<html$1")
    .replace(/<html(\s|>)/i, `<html lang="${lang}"$1`)
    .replace(/\slang="en(?:-[A-Za-z]+)?"/g, ` lang="${lang}"`);

  const i = out.search(/<\/head>/i);
  return i < 0 ? out : out.slice(0, i) + headHtml + "\n" + out.slice(i);
}
