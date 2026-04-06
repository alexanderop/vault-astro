import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { collectFilesRecursive } from "./filesystem";

const CONTENT_ROOT = resolve("./src/content/notes");
const PUBLIC_ROOT = resolve("./public/excalidraw");
const EXCALIDRAW_SVG_SUFFIX = ".excalidraw.svg";

function collectExcalidrawSvgFiles(root: string): string[] {
  return collectFilesRecursive(root, (entry) => entry.name.endsWith(EXCALIDRAW_SVG_SUFFIX));
}

export function syncExcalidrawAssets(contentRoot = CONTENT_ROOT, publicRoot = PUBLIC_ROOT): void {
  for (const file of collectExcalidrawSvgFiles(contentRoot)) {
    const relativePath = file.slice(contentRoot.length + 1).replaceAll("\\", "/");
    const targetPath = `${publicRoot}/${relativePath}`;

    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(file, targetPath);
  }
}
