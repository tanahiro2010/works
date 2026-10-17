import type { Route } from "@tanahiro2010/ssg/routes";
import { Index } from "./pages/index.tsx";

/**
 * Every route listed here gets its own static HTML file at build time.
 *
 * `/articles/*` は React のルートではない。scripts/build-articles.js が
 * Markdown から起こした HTML をそのまま置く領域なので、ここに足さないこと。
 */
export const routes: Route[] = [{ path: "/", title: "blog / tanahiro2010", Component: Index }];
