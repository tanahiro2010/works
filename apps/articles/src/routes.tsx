import { itemListSchema, websiteSchema } from "@tanahiro2010/ssg/head";
import type { Route } from "@tanahiro2010/ssg/routes";
import articlesData from "./data/articles.json";
import site from "../site.config.json";
import { Index } from "./pages/index.tsx";

/**
 * Every route listed here gets its own static HTML file at build time.
 *
 * `/articles/*` は React のルートではない。scripts/build-articles.js が
 * Markdown から起こした HTML をそのまま置く領域なので、ここに足さないこと。
 */
export const routes: Route[] = [
  {
    path: "/",
    title: site.title,
    description: site.description,
    jsonLd: [websiteSchema(site), itemListSchema(site, articlesData.articles)],
    Component: Index,
  },
];
