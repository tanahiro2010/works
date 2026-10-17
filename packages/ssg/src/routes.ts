import type { ComponentType } from "react";

export interface Route {
  /** プリレンダされる URL。先頭は `/`。 */
  path: string;
  /** 生成される HTML の <title> になる。 */
  title: string;
  /** <meta name="description">。省略すると site.config.json の説明を使う。 */
  description?: string;
  /** そのページの構造化データ(JSON-LD)。 */
  jsonLd?: unknown;
  Component: ComponentType;
}

/** `/foo/`・`/foo/index.html`・`/foo` を同じものとして扱う。 */
export function matchRoute(routes: Route[], pathname: string): Route | undefined {
  const normalized = pathname.replace(/\/index\.html$/, "/").replace(/(.+)\/$/, "$1");
  return routes.find((route) => route.path === normalized);
}
