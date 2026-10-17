import { itemListSchema, websiteSchema } from "@tanahiro2010/ssg/head";
import type { Route } from "@tanahiro2010/ssg/routes";
import slidesData from "./data/slides.json";
import site from "../site.config.json";
import { Index } from "./pages/index.tsx";

const allSlides = Object.values(slidesData).flatMap((group) => group.slides);

/**
 * Every route listed here gets its own static HTML file at build time.
 *
 * `/slides/*` は React のルートではない。scripts/build-decks.js が marp / ippon の
 * 出力をそのまま dist/slides/ に置く領域なので、ここに足さないこと。
 */
export const routes: Route[] = [
  {
    path: "/",
    title: site.title,
    description: site.description,
    jsonLd: [websiteSchema(site), itemListSchema(site, allSlides)],
    Component: Index,
  },
];
