import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkHighlights, remarkComments } from "@/features/highlights/lib/remark-highlights";

function highlightTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkHighlights()(tree);
  return tree;
}

function commentTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkComments()(tree);
  return tree;
}

describe("remarkHighlights", () => {
  it("converts ==text== to <mark> html node", () => {
    const tree = highlightTree("==highlighted==");
    const paragraph = tree.children[0];
    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [{ type: "html", value: "<mark>highlighted</mark>" }],
    });
  });

  it("preserves surrounding text", () => {
    const tree = highlightTree("before ==middle== after");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([
      { type: "text", value: "before " },
      { type: "html", value: "<mark>middle</mark>" },
      { type: "text", value: " after" },
    ]);
  });

  it("handles multiple highlights in one line", () => {
    const tree = highlightTree("==one== and ==two==");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([
      { type: "html", value: "<mark>one</mark>" },
      { type: "text", value: " and " },
      { type: "html", value: "<mark>two</mark>" },
    ]);
  });

  it("leaves text without highlights unchanged", () => {
    const tree = highlightTree("no highlights here");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "no highlights here" }]);
  });

  it("does not treat single = as highlight", () => {
    const tree = highlightTree("a = b and c = d");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "a = b and c = d" }]);
  });
});

describe("remarkComments", () => {
  it("strips %%comment%% from text", () => {
    const tree = commentTree("%%hidden%%");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "" }]);
  });

  it("preserves surrounding text", () => {
    const tree = commentTree("before %%hidden%% after");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "before  after" }]);
  });

  it("strips multiple comments", () => {
    const tree = commentTree("%%one%% visible %%two%%");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: " visible " }]);
  });

  it("leaves text without comments unchanged", () => {
    const tree = commentTree("no comments here");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "no comments here" }]);
  });

  it("does not treat single % as comment", () => {
    const tree = commentTree("100% done and 50% left");
    const children = (tree.children[0] as { children: unknown[] }).children;
    expect(children).toMatchObject([{ type: "text", value: "100% done and 50% left" }]);
  });
});
