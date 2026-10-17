export interface SiteConfig {
  name: string;
  title: string;
  url: string;
  description: string;
  keywords: string[];
  author: string;
  authorUrl: string;
  sameAs: string[];
  twitter: string;
  themeColor: string;
  ogImage: string;
  /** RSS を出すサイトか。true のとき <link rel=alternate> を足す。 */
  feed?: boolean;
}

export interface HeadOptions {
  site: SiteConfig;
  title: string;
  description?: string;
  pathname: string;
  type?: "website" | "article";
  jsonLd?: unknown;
  noindex?: boolean;
  publishedAt?: string;
  modifiedAt?: string;
}

export interface ListItem {
  title: string;
  path: string;
}

export interface ArticleLike extends ListItem {
  description: string;
  date: string;
  updated?: string;
}

export function renderHead(options: HeadOptions): string;
export function personSchema(site: SiteConfig): Record<string, unknown>;
export function websiteSchema(site: SiteConfig): Record<string, unknown>;
export function blogPostingSchema(site: SiteConfig, article: ArticleLike): Record<string, unknown>;
export function itemListSchema(site: SiteConfig, items: ListItem[]): Record<string, unknown>;
