import { describe, expect, it } from "vitest";
import { buildBacklinksMap } from "@/features/backlinks/lib/backlink-resolver";
import { createNoteFixture } from "../../../../test/helpers/note-fixtures";

describe("buildBacklinksMap", () => {
  it("deduplicates backlinks and excludes unpublished sources", () => {
    const notes = [
      createNoteFixture("alpha", { data: { title: "Alpha Note" } }),
      createNoteFixture("beta", {
        body: "[[alpha]]\n\nRepeated [[alpha]] reference.",
        data: { title: "Beta Note" },
      }),
      createNoteFixture("draft", {
        body: "[[alpha]]",
        data: { publish: false, title: "Draft Note" },
      }),
    ];

    expect(buildBacklinksMap(notes).get("alpha")).toEqual([{ href: "/beta", title: "Beta Note" }]);
  });
});
