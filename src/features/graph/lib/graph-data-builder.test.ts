import { describe, expect, it } from "vitest";
import {
  buildLocalGraphData,
  createGraphBuildContext,
} from "@/features/graph/lib/graph-data-builder";
import { buildNoteLinksIndex } from "@/lib/note-links";
import { createNoteFixture } from "../../../../test/helpers/note-fixtures";

describe("buildLocalGraphData", () => {
  it("builds a local graph from published neighbors only", () => {
    const notes = [
      createNoteFixture("alpha", { body: "[[beta]]", data: { title: "Alpha Note" } }),
      createNoteFixture("beta", { body: "[[alpha]] [[draft]]", data: { title: "Beta Note" } }),
      createNoteFixture("gamma", { body: "[[alpha]]", data: { title: "Gamma Note" } }),
      createNoteFixture("draft", {
        body: "[[alpha]]",
        data: { publish: false, title: "Draft Note" },
      }),
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
    const notes = [
      createNoteFixture("alpha"),
      createNoteFixture("draft", { data: { publish: false } }),
    ];

    expect(buildLocalGraphData(createGraphBuildContext(notes), "draft")).toEqual({
      nodes: [],
      edges: [],
    });
  });
});
