import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkTags } from "./remark-tags";

function process(md: string): Root {
  const tree = fromMarkdown(md);
  remarkTags()(tree);
  return tree;
}

function toHtml(tree: Root): string {
  return JSON.stringify(tree);
}

function getTags(md: string): string[] {
  const json = toHtml(process(md));
  const matches = [...json.matchAll(/data-tag=\\"([^"\\]+)\\"/g)];
  return matches.map((m) => m[1]);
}

function hasTagSpan(md: string, tag: string): boolean {
  const json = toHtml(process(md));
  return json.includes(`<span class=\\"obsidian-tag\\" data-tag=\\"${tag}\\">#${tag}</span>`);
}

describe("remarkTags", () => {
  it("converts a basic #tag", () => {
    expect(hasTagSpan("#javascript", "javascript")).toBe(true);
  });

  it("converts a nested tag with slashes", () => {
    expect(hasTagSpan("#web/frontend", "web/frontend")).toBe(true);
  });

  it("preserves surrounding text", () => {
    const tree = process("hello #tag world");
    const paragraph = tree.children[0];
    expect(paragraph.type).toBe("paragraph");
    if (paragraph.type === "paragraph") {
      const values = paragraph.children.map((c) =>
        c.type === "text" ? c.value : c.type === "html" ? c.value : "",
      );
      expect(values.join("")).toContain("hello");
      expect(values.join("")).toContain("world");
      expect(hasTagSpan("hello #tag world", "tag")).toBe(true);
    }
  });

  it("ignores numeric-only #123", () => {
    expect(getTags("text #123 more")).toEqual([]);
  });

  it("ignores bare #", () => {
    expect(getTags("a # b")).toEqual([]);
  });

  it("handles multiple tags in one line", () => {
    const tags = getTags("I like #typescript and #rust");
    expect(tags).toEqual(["typescript", "rust"]);
  });

  it("does not process tags inside headings", () => {
    // fromMarkdown parses `# heading` as a heading node; text inside has no `#`
    // But a paragraph with #tag should still work — headings are excluded by parent check
    const tree = fromMarkdown("# heading\n\n#tag");
    remarkTags()(tree);
    const json = JSON.stringify(tree);
    // The heading text should remain plain
    expect(json).not.toMatch(/data-tag=\\"heading\\"/);
    // The paragraph tag should be converted
    expect(json).toMatch(/data-tag=\\"tag\\"/);
  });
});
