import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkBlockRefs } from "@/features/embeds/lib/remark-block-refs";

describe("remarkBlockRefs", () => {
  it("strips the marker and stores the block id in hProperties", () => {
    const tree = fromMarkdown("Paragraph body ^block-1") as Root;

    remarkBlockRefs()(tree);

    expect(tree.children[0]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Paragraph body" }],
      data: {
        hProperties: {
          id: "^block-1",
        },
      },
    });
  });
});
