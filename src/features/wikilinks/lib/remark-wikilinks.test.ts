import { fileURLToPath } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { createFilesystemContentResolver } from "@/lib/content-resolver";
import { remarkWikilinks } from "@/features/wikilinks/lib/remark-wikilinks";

const contentRoot = fileURLToPath(new URL("../../../../test/fixtures/content", import.meta.url));
const attachmentsRoot = fileURLToPath(
  new URL("../../../../test/fixtures/attachments", import.meta.url),
);
const resolver = createFilesystemContentResolver({ contentRoot, attachmentsRoot });

function processTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkWikilinks({ resolver })(tree);
  return tree;
}

describe("remarkWikilinks", () => {
  it("resolves a basic wikilink into a link node", () => {
    const tree = processTree("[[beta]]");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/beta",
          children: [{ type: "text", value: "beta" }],
        },
      ],
    });
  });

  it("supports aliased heading links", () => {
    const tree = processTree("[[alpha#Section Heading|Read more]]");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/alpha#section-heading",
          children: [{ type: "text", value: "Read more" }],
        },
      ],
    });
  });

  it("marks missing links with fallback html", () => {
    const tree = processTree("[[missing-note]]");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        { type: "html", value: '<span class="obsidian-missing-link">missing-note</span>' },
      ],
    });
  });

  it("resolves image embeds against attachments", () => {
    const tree = processTree("![[assets/diagram.png|Architecture Diagram]]");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        {
          type: "html",
          value:
            '<img src="/attachments/assets/diagram.png" alt="Architecture Diagram" class="obsidian-image-embed" loading="lazy" />',
        },
      ],
    });
  });
});
