import { describe, expect, it } from "vitest";
import {
  buildNoteLinksIndex,
  extractWikilinkTargets,
  parseWikilink,
  slugifyWikilinkFragment,
  targetToHref,
} from "@/lib/note-links";
import { createCollectionContentResolver } from "@/lib/content-resolver";
import { createNoteFixture } from "../../test/helpers/note-fixtures";

describe("note-links helpers", () => {
  it("re-exports parsing helpers and extracts raw targets", () => {
    expect(parseWikilink("[[alpha#Section Heading|Read more]]")).toMatchObject({
      target: "alpha",
      heading: "Section Heading",
      alias: "Read more",
    });
    expect(slugifyWikilinkFragment("Section Heading!")).toBe("section-heading");
    expect(extractWikilinkTargets("See [[alpha]] and ![[beta#Part|Preview]]")).toEqual([
      "alpha",
      "beta",
    ]);
  });

  it("builds note hrefs from a resolver", () => {
    const resolver = createCollectionContentResolver([
      createNoteFixture("alpha"),
      createNoteFixture("beta", { data: { permalink: "custom/beta" } }),
    ]);

    expect(targetToHref("beta", "Section Heading", undefined, resolver)).toBe(
      "/custom/beta#section-heading",
    );
    expect(targetToHref("beta", undefined, "block-id", resolver)).toBe("/custom/beta#^block-id");
    expect(targetToHref("missing", undefined, undefined, resolver)).toBeNull();
  });
});

describe("buildNoteLinksIndex", () => {
  it("indexes only resolved links from published notes and ignores self-links", () => {
    const index = buildNoteLinksIndex([
      createNoteFixture("alpha", {
        body: "[[beta]] [[alpha]] [[missing]]",
      }),
      createNoteFixture("beta", {
        body: "[[alpha]]",
      }),
      createNoteFixture("draft", {
        body: "[[alpha]]",
        data: { publish: false },
      }),
    ]);

    expect([...index.entries()]).toEqual([
      ["alpha", new Set(["beta"])],
      ["beta", new Set(["alpha"])],
    ]);
  });
});
