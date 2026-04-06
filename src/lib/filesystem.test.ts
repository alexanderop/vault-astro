import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { collectFilesRecursive } from "@/lib/filesystem";

const tempRoots: string[] = [];

function createTempDir(): string {
  const root = mkdtempSync(join(tmpdir(), "vault-filesystem-"));
  tempRoots.push(root);
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

describe("collectFilesRecursive", () => {
  it("collects nested files using the provided predicate", () => {
    const root = createTempDir();
    mkdirSync(join(root, "notes/deep"), { recursive: true });
    mkdirSync(join(root, "assets"), { recursive: true });
    writeFileSync(join(root, "notes/alpha.md"), "# Alpha");
    writeFileSync(join(root, "notes/deep/beta.md"), "# Beta");
    writeFileSync(join(root, "assets/diagram.png"), "png");

    const markdownFiles = collectFilesRecursive(root, (entry) => entry.name.endsWith(".md"))
      .map((file) => file.slice(root.length + 1).replaceAll("\\", "/"))
      .toSorted();

    expect(markdownFiles).toEqual(["notes/alpha.md", "notes/deep/beta.md"]);
  });

  it("returns an empty list when the root does not exist", () => {
    expect(collectFilesRecursive(join(tmpdir(), "vault-missing-root"), () => true)).toEqual([]);
  });
});
