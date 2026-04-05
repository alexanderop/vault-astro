import { describe, expect, it } from "vitest";
import { buildSearchIndex } from "@/features/search/lib/search-index";
import { createNoteFixture } from "../../../../test/helpers/note-fixtures";

describe("buildSearchIndex", () => {
  it("filters unpublished and hidden notes and strips markdown from previews", () => {
    const index = buildSearchIndex([
      createNoteFixture("alpha", {
        body: "# Heading\nSee [[beta|Beta Note]] and `inline code`.\n%%hidden%%",
        data: { title: "Alpha Note", tags: ["testing"] },
      }),
      createNoteFixture("beta", { data: { title: "Beta Note", nav_hidden: true } }),
      createNoteFixture("draft", { data: { title: "Draft Note", publish: false } }),
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
