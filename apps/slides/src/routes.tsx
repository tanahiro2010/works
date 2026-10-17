import type { Route } from "@tanahiro2010/ssg/routes";
import { Index } from "./pages/index.tsx";

/**
 * Every route listed here gets its own static HTML file at build time.
 *
 * `/slides/*` は React のルートではない。scripts/build-decks.js が marp / ippon の
 * 出力をそのまま dist/slides/ に置く領域なので、ここに足さないこと。
 */
export const routes: Route[] = [{ path: "/", title: "slides / tanahiro2010", Component: Index }];
