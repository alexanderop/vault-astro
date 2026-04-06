import { describe, expect, it } from "vitest";
import { buildBacklinksMap } from "@/features/backlinks/lib/backlink-resolver";
import { createCollectionNoteResolver } from "@/lib/content-resolver";
import { buildNoteLinksIndex } from "@/lib/note-links";
import { draftNote, publishedNote } from "../../../../test/helpers/note-fixtures";

describe("buildBacklinksMap", () => {
  it("deduplicates backlinks and excludes unpublished sources", () => {
    const notes = [
      publishedNote("alpha", { title: "Alpha Note" }),
      publishedNote("beta", {
        body: "[[alpha]]\n\nRepeated [[alpha]] reference.",
        title: "Beta Note",
      }),
      draftNote("draft", {
        body: "[[alpha]]",
        title: "Draft Note",
      }),
    ];

    const resolver = createCollectionNoteResolver(notes);
    const linksByNote = buildNoteLinksIndex(notes, resolver);

    expect(buildBacklinksMap(notes).get("alpha")).toEqual([{ href: "/beta", title: "Beta Note" }]);
    expect(buildBacklinksMap(notes, linksByNote, resolver).get("alpha")).toEqual([
      { href: "/beta", title: "Beta Note" },
    ]);
  });
});
