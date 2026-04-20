import { describe, expect, it } from "vitest";
import {
  buildLocalGraphData,
  createGraphBuildContext,
} from "@/features/graph/lib/graph-data-builder";
import { buildNoteLinksIndex } from "@/lib/note-links";
import { draftNote, noteWithLinks, publishedNote } from "../../../../test/helpers/note-fixtures";

describe("buildLocalGraphData", () => {
  it("builds a local graph from published neighbors only", () => {
    const notes = [
      noteWithLinks("alpha", ["beta"], { title: "Alpha Note" }),
      noteWithLinks("beta", ["alpha", "draft"], { title: "Beta Note" }),
      noteWithLinks("gamma", ["alpha"], { title: "Gamma Note" }),
      draftNote("draft", { body: "[[alpha]]", title: "Draft Note" }),
    ];

    const linksByNote = buildNoteLinksIndex(notes);
    const context = createGraphBuildContext(notes, linksByNote);

    expect(buildLocalGraphData(context, "alpha")).toEqual({
      nodes: [
        { id: "alpha", title: "Alpha Note", cluster: "other", kind: "content" },
        { id: "beta", title: "Beta Note", cluster: "other", kind: "content" },
        { id: "gamma", title: "Gamma Note", cluster: "other", kind: "content" },
      ],
      edges: [
        { source: "alpha", target: "beta" },
        { source: "gamma", target: "alpha" },
      ],
      topTags: [],
    });
  });

  it("returns an empty graph when the current note is unpublished", () => {
    const notes = [publishedNote("alpha"), draftNote("draft")];

    expect(buildLocalGraphData(createGraphBuildContext(notes), "draft")).toEqual({
      nodes: [],
      edges: [],
      topTags: [],
    });
  });

  it("assigns each node a primary cluster from the global top tags", () => {
    const notes = [
      noteWithLinks("alpha", ["beta"], { data: { tags: ["ai", "tools"] } }),
      noteWithLinks("beta", ["alpha"], { data: { tags: ["ai"] } }),
      noteWithLinks("gamma", ["alpha"], { data: { tags: ["philosophy"] } }),
    ];

    const context = createGraphBuildContext(notes);
    const graph = buildLocalGraphData(context, "alpha");
    const clusters = Object.fromEntries(graph.nodes.map((n) => [n.id, n.cluster]));

    expect(graph.topTags).toContain("ai");
    expect(clusters.alpha).toBe("ai");
    expect(clusters.beta).toBe("ai");
    expect(clusters.gamma).toBe("philosophy");
  });
});
