// Minimal static publishing for the isolated Coach Union 2.0 preview.
// No image re-encoding, Tailwind generation, or legacy SEO checks.
import { cp, mkdir, rm, copyFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const out = resolve(root, "dist");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = [
  "index.html",
  "coaches.html",
  "privacy.html",
  "otziw.html",
  "style.css",
  "enrollment.css",
  "tailwind.min.css",
  "app.js",
  "coachprogram-detailed-icu.pdf",
  "coachprogram.pdf"
];
const folders = ["img", "favikon", "fonts"];

for (const file of files) {
  const source = resolve(root, file);
  try {
    if ((await stat(source)).isFile()) {
      await copyFile(source, resolve(out, file));
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    console.log("Optional missing file:", file);
  }
}
for (const folder of folders) {
  const source = resolve(root, folder);
  try {
    if ((await stat(source)).isDirectory()) {
      await cp(source, resolve(out, folder), { recursive: true });
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    console.log("Optional missing directory:", folder);
  }
}
console.log("Coach Union 2.0 preview copied to dist/.");
