import { describe, expect, it } from "vitest";
import { searchEntriesFactory, searchEntryFactory } from "./search-entry-factory";

describe("searchEntryFactory", () => {
  it("builds readable defaults from the slug", () => {
    expect(searchEntryFactory({ slug: "astro-guide" })).toEqual({
      href: "/astro-guide",
      slug: "astro-guide",
      title: "Astro Guide",
      type: "note",
      tags: [],
      summary: "Astro Guide summary",
      preview: "Astro Guide preview",
    });
  });

  it("supports batches of focused overrides", () => {
    expect(
      searchEntriesFactory([
        { slug: "astro-guide", tags: ["astro"] },
        { slug: "react-hooks", summary: "Hooks guide" },
      ]),
    ).toEqual([
      {
        href: "/astro-guide",
        slug: "astro-guide",
        title: "Astro Guide",
        type: "note",
        tags: ["astro"],
        summary: "Astro Guide summary",
        preview: "Astro Guide preview",
      },
      {
        href: "/react-hooks",
        slug: "react-hooks",
        title: "React Hooks",
        type: "note",
        tags: [],
        summary: "Hooks guide",
        preview: "React Hooks preview",
      },
    ]);
  });

  it("can generate a default batch by count", () => {
    expect(searchEntriesFactory(2).map((entry) => entry.slug)).toEqual(["note-1", "note-2"]);
  });
});
