import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkCallouts } from "@/features/callouts/lib/remark-callouts";

function processTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkCallouts()(tree);
  return tree;
}

describe("remarkCallouts", () => {
  it("wraps standard callouts with the expected html shell", () => {
    const tree = processTree("> [!tip] Quick Tip\n> Ship the test first.");

    expect(tree.children[0]).toMatchObject({
      type: "html",
      value: expect.stringContaining('class="callout callout-tip callout-color-success"'),
    });
    expect(tree.children[1]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Ship the test first." }],
    });
    expect(tree.children[2]).toMatchObject({ type: "html", value: "</div></div>" });
  });

  it("renders foldable callouts as closed details blocks", () => {
    const tree = processTree("> [!warning]- Heads up\n> Hidden by default.");

    expect(tree.children[0]).toMatchObject({
      type: "html",
      value: expect.stringContaining("<details"),
    });
    expect((tree.children[0] as { value: string }).value).not.toContain(" open");
    expect(tree.children[2]).toMatchObject({ type: "html", value: "</div></details>" });
  });
});
