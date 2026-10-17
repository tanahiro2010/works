import type { SiteConfig } from "./head.d.ts";

export interface OgItem {
  /** カードに出す見出し。frontmatter の summary を優先して渡す。 */
  title: string;
  label?: string;
  date?: string;
}

export function createOgRenderer(site: SiteConfig): Promise<(item: OgItem) => Buffer>;
