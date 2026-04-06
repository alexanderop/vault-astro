import { describe, expect, it } from "vitest";
import {
  authorNote,
  draftNote,
  noteFactory,
  notesFromDefinitions,
  noteWithLinks,
  publishedNote,
} from "../note-fixtures";

describe("noteFactory", () => {
  it("uses readable defaults and derives the title from the note id", () => {
    expect(noteFactory({ id: "guides/getting-started" })).toMatchObject({
      id: "guides/getting-started",
      body: "",
      data: {
        publish: true,
        title: "getting-started",
      },
    });
  });

  it("lets explicit overrides win over defaults", () => {
    expect(
      noteFactory({
        id: "alpha",
        body: "Hello",
        title: "Alpha Note",
        data: { tags: ["astro"] },
      }),
    ).toMatchObject({
      body: "Hello",
      data: {
        publish: true,
        title: "Alpha Note",
        tags: ["astro"],
      },
    });
  });

  it("keeps preset helpers equivalent to the base builder", () => {
    expect(draftNote("draft", { title: "Draft Note" })).toEqual(
      noteFactory({
        id: "draft",
        publish: false,
        title: "Draft Note",
        data: { publish: false },
      }),
    );
  });

  it("supports relationship helpers for linked note graphs", () => {
    expect(noteWithLinks("alpha", ["beta", "gamma"], { title: "Alpha Note" })).toMatchObject({
      body: "[[beta]] [[gamma]]",
      data: {
        title: "Alpha Note",
      },
    });
  });

  it("builds note lists from compact definitions", () => {
    expect(
      notesFromDefinitions([
        { id: "alpha", title: "Alpha Note", targets: ["beta"] },
        { id: "beta", publish: false },
      ]),
    ).toEqual([
      publishedNote("alpha", { title: "Alpha Note", body: "[[beta]]" }),
      draftNote("beta"),
    ]);
  });

  it("creates author fixtures without requiring a title", () => {
    expect(authorNote("authors/jane-doe", { data: { name: "Jane Doe" } }).data).toMatchObject({
      publish: true,
      name: "Jane Doe",
      title: undefined,
    });
  });
});
