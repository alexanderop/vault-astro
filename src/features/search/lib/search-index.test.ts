import { describe, expect, it } from "vitest";
import { buildSearchIndex } from "@/features/search/lib/search-index";
import { draftNote, hiddenNote, publishedNote } from "../../../../test/helpers/note-fixtures";

describe("buildSearchIndex", () => {
  it("filters unpublished and hidden notes and strips markdown from previews", () => {
    const index = buildSearchIndex([
      publishedNote("alpha", {
        body: "# Heading\nSee [[beta|Beta Note]] and `inline code`.\n%%hidden%%",
        title: "Alpha Note",
        data: { tags: ["testing"] },
      }),
      hiddenNote("beta", { title: "Beta Note" }),
      draftNote("draft", { title: "Draft Note" }),
    ]);

    expect(index).toHaveLength(1);
    expect(index[0]).toMatchObject({
      slug: "alpha",
      href: "/alpha",
      title: "Alpha Note",
      tags: ["testing"],
      preview: "Heading\nSee Beta Note and inline code.",
    });
  });
});
