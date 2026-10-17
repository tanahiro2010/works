import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { matchRoute } from "./routes.tsx";

export { routes } from "./routes.tsx";

export function render(pathname: string): { html: string; title: string } {
  const route = matchRoute(pathname);
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
}
