import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// This script lives in <repo>/frontend/scripts, so resolve the slide folders
// against the repo root rather than whatever directory node was started in.
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const outFile = fileURLToPath(new URL("../src/data/slides.json", import.meta.url));

const slides = {
  slides: {
    path: "slides/slides",
    slides: [],
  },
  speakerdecks: {
    path: "slides/speakerdeck",
    slides: [],
  },
};

const getSlides = () => {
  Object.keys(slides).forEach((key) => {
    const dir = path.join(repoRoot, slides[key].path);
    const folders = fs
      .readdirSync(dir)
      .filter((file) => fs.statSync(path.join(dir, file)).isDirectory());

    folders.forEach((folder) => {
      const folderPath = path.join(dir, folder, "slide.md");
      if (!fs.existsSync(folderPath)) return;
      const slide = fs.readFileSync(folderPath, "utf-8");
      slides[key].slides.push({
        name: folder,
        content: slide,
      });
    });
  });
};

const build = () => {
  getSlides();
  fs.writeFileSync(outFile, JSON.stringify(slides, null, 2));
  console.log(
    `wrote ${path.relative(repoRoot, outFile)} ` +
      `(slides: ${slides.slides.slides.length}, speakerdecks: ${slides.speakerdecks.slides.length})`,
  );
};

build();
