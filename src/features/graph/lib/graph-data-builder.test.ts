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
        { id: "alpha", title: "Alpha Note" },
        { id: "beta", title: "Beta Note" },
        { id: "gamma", title: "Gamma Note" },
      ],
      edges: [
        { source: "alpha", target: "beta" },
        { source: "gamma", target: "alpha" },
      ],
    });
  });

  it("returns an empty graph when the current note is unpublished", () => {
    const notes = [publishedNote("alpha"), draftNote("draft")];

    expect(buildLocalGraphData(createGraphBuildContext(notes), "draft")).toEqual({
      nodes: [],
      edges: [],
    });
  });
});
