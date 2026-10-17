import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { matchRoute, type Route } from "./routes.ts";

export interface Rendered {
  html: string;
  title: string;
}

/** SSR エントリ。各アプリの entry-server.tsx から routes を渡して呼ぶ。 */
export function createRender(routes: Route[]) {
  return function render(pathname: string): Rendered {
    const route = matchRoute(routes, pathname);
    if (!route) {
      throw new Error(`No route registered for ${pathname}`);
    }
    const { Component } = route;
    return {
      html: renderToString(
        <StrictMode>
          <Component />
        </StrictMode>,
      ),
      title: route.title,
    };
  };
}
