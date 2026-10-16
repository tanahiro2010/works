import "./style.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { matchRoute } from "./routes.tsx";

const container = document.getElementById("root")!;
const route = matchRoute(window.location.pathname);

if (route) {
  const { Component } = route;
  const app = (
    <StrictMode>
      <Component />
    </StrictMode>
  );
  // Prerendered pages ship markup to hydrate; `vp dev` serves an empty root.
  if (container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
} else {
  console.warn(`No route registered for ${window.location.pathname}`);
}
