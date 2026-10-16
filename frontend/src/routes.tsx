import type { ComponentType } from "react";
import { App } from "./App.tsx";

export interface Route {
  /** Prerendered URL path. Must start with `/`. */
  path: string;
  /** Becomes the `<title>` of the generated HTML. */
  title: string;
  Component: ComponentType;
}

/** Every route listed here gets its own static HTML file at build time. */
export const routes: Route[] = [{ path: "/", title: "frontend", Component: App }];

export function matchRoute(pathname: string): Route | undefined {
  const normalized = pathname.replace(/\/index\.html$/, "/").replace(/(.+)\/$/, "$1");
  return routes.find((route) => route.path === normalized);
}
