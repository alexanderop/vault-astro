import { describe, expect, it } from "vitest";
import { buildBacklinksMap } from "@/features/backlinks/lib/backlink-resolver";
import {
  buildLocalGraphData,
  createGraphBuildContext,
} from "@/features/graph/lib/graph-data-builder";
import { buildSidebarTree } from "@/features/navigation/lib/sidebar-tree";
import { buildSearchIndex } from "@/features/search/lib/search-index";
import { draftNote, noteWithLinks, publishedNote } from "../helpers/note-fixtures";

describe("publish:false filtering", () => {
  it("excludes unpublished notes across sidebar, search, backlinks, and graph", () => {
    const notes = [
      noteWithLinks("published", ["linked"], { title: "Published Note" }),
      publishedNote("linked", { title: "Linked Note" }),
      draftNote("draft", { body: "[[linked]]", title: "Draft Note" }),
    ];

    expect(
      buildSidebarTree(notes).flatMap((node) => [
        node.key,
        ...node.children.map((child) => child.key),
      ]),
    ).not.toContain("draft");
    expect(buildSearchIndex(notes).map((entry) => entry.slug)).not.toContain("draft");
    expect(buildBacklinksMap(notes).get("linked")).toEqual([
      { href: "/published", title: "Published Note" },
    ]);
    expect(
      buildLocalGraphData(createGraphBuildContext(notes), "linked").nodes.map((node) => node.id),
    ).not.toContain("draft");
  });
});
