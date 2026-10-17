import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { matchRoute, type Route } from "./routes.ts";

/** ブラウザ側のエントリ。各アプリの main.tsx から routes を渡して呼ぶ。 */
export function mount(routes: Route[], containerId = "root") {
  const container = document.getElementById(containerId)!;
  const route = matchRoute(routes, window.location.pathname);

  if (!route) {
    console.warn(`No route registered for ${window.location.pathname}`);
    return;
  }

  const { Component } = route;
  const app = (
    <StrictMode>
      <Component />
    </StrictMode>
  );

  // プリレンダ済みのページには中身があるので hydrate、vp dev は空なので createRoot。
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
