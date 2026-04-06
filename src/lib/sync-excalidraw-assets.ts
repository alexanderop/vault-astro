import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CONTENT_ROOT = resolve("./src/content/notes");
const PUBLIC_ROOT = resolve("./public/excalidraw");
const EXCALIDRAW_SVG_SUFFIX = ".excalidraw.svg";

function collectExcalidrawSvgFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectExcalidrawSvgFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(EXCALIDRAW_SVG_SUFFIX)) {
      files.push(fullPath);
    }
  }

  return files;
}

export function syncExcalidrawAssets(contentRoot = CONTENT_ROOT, publicRoot = PUBLIC_ROOT): void {
  for (const file of collectExcalidrawSvgFiles(contentRoot)) {
    const relativePath = file.slice(contentRoot.length + 1).replaceAll("\\", "/");
    const targetPath = `${publicRoot}/${relativePath}`;

    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(file, targetPath);
  }
}
