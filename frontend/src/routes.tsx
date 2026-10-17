import type { ComponentType } from "react";
import { Index } from "./pages/index.tsx";

export interface Route {
  /** Prerendered URL path. Must start with `/`. */
  path: string;
  /** Becomes the `<title>` of the generated HTML. */
  title: string;
  Component: ComponentType;
}

/**
 * Every route listed here gets its own static HTML file at build time.
 *
 * `/slides/*` は React のルートではない。scripts/build-decks.js が marp / ippon の
 * 出力をそのまま dist/slides/ に置く領域なので、ここに足さないこと。
 */
export const routes: Route[] = [{ path: "/", title: "slides / tanahiro2010", Component: Index }];

export function matchRoute(pathname: string): Route | undefined {
  const normalized = pathname.replace(/\/index\.html$/, "/").replace(/(.+)\/$/, "$1");
  return routes.find((route) => route.path === normalized);
}
