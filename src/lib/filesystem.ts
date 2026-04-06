import { existsSync, readdirSync, type Dirent } from "node:fs";

export function collectFilesRecursive(
  root: string,
  shouldInclude: (entry: Dirent, fullPath: string) => boolean,
): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...collectFilesRecursive(fullPath, shouldInclude));
      continue;
    }

    if (entry.isFile() && shouldInclude(entry, fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}
