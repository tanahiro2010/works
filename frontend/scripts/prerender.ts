/**
 * Static site generation step.
 *
 * Runs after `vp build` (client) and `vp build --ssr` (server): renders every
 * route exported by `src/routes.tsx` to HTML and writes it into the client
 * bundle, so each route ships as a plain `index.html` that hydrates on load.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Route } from "../src/routes.tsx";

const root = fileURLToPath(new URL("..", import.meta.url));
const clientDir = path.join(root, "dist");
const serverDir = path.join(root, ".vite-ssg");

const template = await readFile(path.join(clientDir, "index.html"), "utf8");
const { render, routes } = (await import(
  pathToFileURL(path.join(serverDir, "entry-server.js")).href
)) as {
  render: (pathname: string) => { html: string; title: string };
  routes: Route[];
};

for (const route of routes) {
  const { html, title } = render(route.path);
  const page = template
    .replace("<!--app-html-->", html)
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`);

  const outFile = path.join(clientDir, route.path.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, page);
  console.log(`prerendered ${route.path} -> ${path.relative(root, outFile)}`);
}

await rm(serverDir, { recursive: true, force: true });
