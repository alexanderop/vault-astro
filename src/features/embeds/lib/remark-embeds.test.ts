import { fileURLToPath } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Parent, Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkEmbeds } from "@/features/embeds/lib/remark-embeds";
import { createFilesystemContentResolver } from "@/lib/content-resolver.server";

const contentRoot = fileURLToPath(new URL("../../../../test/fixtures/content", import.meta.url));
const resolver = createFilesystemContentResolver({ contentRoot });

function processTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkEmbeds({ resolver })(tree);
  return tree;
}

function getParagraphChildren(tree: Root) {
  return (tree.children[0] as Parent).children;
}

describe("remarkEmbeds", () => {
  it("inlines note content inside an embed wrapper", () => {
    const tree = processTree("![[embedded]]");
    const children = getParagraphChildren(tree);

    expect(children[0]).toMatchObject({
      type: "html",
      value: '<div class="obsidian-embed" data-target="embedded">',
    });
    expect(children[1]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Before section." }],
    });
    expect(children.at(-1)).toMatchObject({
      type: "html",
      value: "</div>",
    });
  });

  it("supports section and block embeds", () => {
    const sectionTree = processTree("![[embedded#Section Heading]]");
    const blockTree = processTree("![[embedded#^embed-block]]");
    const sectionChildren = getParagraphChildren(sectionTree);
    const blockChildren = getParagraphChildren(blockTree);

    expect(sectionChildren[0]).toMatchObject({
      type: "html",
      value: '<div class="obsidian-embed" data-target="embedded">',
    });
    expect(sectionChildren[1]).toMatchObject({
      type: "heading",
      children: [{ type: "text", value: "Section Heading" }],
    });
    expect(sectionChildren[2]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Embedded section body." }],
    });

    expect(blockChildren[0]).toMatchObject({
      type: "html",
      value: '<div class="obsidian-embed" data-target="embedded">',
    });
    expect(blockChildren[1]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Embedded block paragraph ^embed-block" }],
    });
  });

  it("detects circular embeds", () => {
    const tree = processTree("![[circular]]");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        { type: "html", value: '<div class="obsidian-embed" data-target="circular">' },
        {
          type: "paragraph",
          children: [
            {
              type: "html",
              value:
                '<div class="obsidian-embed obsidian-embed--missing"><p>Embed not found: circular</p></div>',
            },
          ],
        },
        { type: "html", value: "</div>" },
      ],
    });
  });
});
