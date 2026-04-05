import { fileURLToPath } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Parent, Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkCallouts } from "@/features/callouts/lib/remark-callouts";
import { remarkHighlights } from "@/features/highlights/lib/remark-highlights";
import { remarkTags } from "@/features/tags/lib/remark-tags";
import { remarkEmbeds } from "@/features/embeds/lib/remark-embeds";
import { remarkWikilinks } from "@/features/wikilinks/lib/remark-wikilinks";
import { createFilesystemContentResolver } from "@/lib/content-resolver";

const contentRoot = fileURLToPath(new URL("../fixtures/content", import.meta.url));
const attachmentsRoot = fileURLToPath(new URL("../fixtures/attachments", import.meta.url));
const resolver = createFilesystemContentResolver({ contentRoot, attachmentsRoot });

function processPipeline(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkCallouts()(tree);
  remarkHighlights()(tree);
  remarkTags()(tree);
  remarkEmbeds({ resolver })(tree);
  remarkWikilinks({ resolver })(tree);
  return tree;
}

describe("remark pipeline integration", () => {
  it("handles wikilinks and embeds inside a callout", () => {
    const tree = processPipeline(
      "> [!note] References\n> See [[beta]] and ![[embedded#Section Heading]].",
    );

    expect(tree.children[0]).toMatchObject({
      type: "html",
      value: expect.stringContaining('class="callout callout-note'),
    });
    const children = (tree.children[1] as Parent).children;

    expect(children[0]).toMatchObject({ type: "text", value: "See " });
    expect(children[1]).toMatchObject({
      type: "link",
      url: "/beta",
      children: [{ type: "text", value: "beta" }],
    });
    expect(children[2]).toMatchObject({ type: "text", value: " and " });
    expect(children[3]).toMatchObject({
      type: "html",
      value: '<div class="obsidian-embed" data-target="embedded">',
    });
    expect(children[4]).toMatchObject({
      type: "heading",
      children: [{ type: "text", value: "Section Heading" }],
    });
    expect(children[5]).toMatchObject({
      type: "paragraph",
      children: [{ type: "text", value: "Embedded section body." }],
    });
  });

  it("handles circular embeds without infinite loop", () => {
    const tree = processPipeline("![[circular]]");

    // circular.md embeds itself; the recursive embed should be caught
    // by the visited-set guard and rendered as a missing/broken embed.
    // The embed plugin splices html nodes into the paragraph's children.
    const paragraph = tree.children[0] as Parent;
    const allHtml = paragraph.children.filter((n) => n.type === "html");

    // The outer embed wrapper should be present
    expect(allHtml[0]).toMatchObject({
      type: "html",
      value: expect.stringContaining('class="obsidian-embed"'),
    });

    // Inside the embedded content, the recursive ![[circular]] should
    // produce a missing-embed indicator (circular guard triggered).
    // The recursive embed is nested inside a child paragraph.
    const nestedParagraph = paragraph.children.find((n) => n.type === "paragraph") as
      | Parent
      | undefined;
    expect(nestedParagraph).toBeDefined();
    expect(nestedParagraph!.children[0] as { type: string; value: string }).toMatchObject({
      type: "html",
      value: expect.stringContaining("obsidian-embed--missing"),
    });
  });

  it("resolves multiple wikilinks in one paragraph", () => {
    const tree = processPipeline("[[alpha]] and [[beta]]");

    const children = (tree.children[0] as Parent).children;

    expect(children[0]).toMatchObject({
      type: "link",
      url: "/alpha",
      children: [{ type: "text", value: "alpha" }],
    });
    expect(children[1]).toMatchObject({ type: "text", value: " and " });
    expect(children[2]).toMatchObject({
      type: "link",
      url: "/beta",
      children: [{ type: "text", value: "beta" }],
    });
  });

  it("passes plain markdown through unchanged", () => {
    const markdown = "# Hello\n\nJust a plain paragraph.";
    const tree = processPipeline(markdown);
    const reference = fromMarkdown(markdown) as Root;

    expect(tree).toEqual(reference);
  });

  it("processes highlights and tags in pipeline", () => {
    const tree = processPipeline("==highlighted== text with #topic");

    const children = (tree.children[0] as Parent).children;

    // ==highlighted== becomes <mark>highlighted</mark>
    expect(children[0]).toMatchObject({
      type: "html",
      value: "<mark>highlighted</mark>",
    });

    expect(children[1]).toMatchObject({
      type: "text",
      value: " text with ",
    });

    // #topic becomes a tag span
    expect(children[2]).toMatchObject({
      type: "html",
      value: expect.stringContaining('class="obsidian-tag"'),
    });
    expect(children[2]).toMatchObject({
      type: "html",
      value: expect.stringContaining('data-tag="topic"'),
    });
  });
});
