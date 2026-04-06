import { describe, expect, test } from "vitest";
import { noteFactory, publishedNote } from "../../test/helpers/note-fixtures";
import {
  getNoteDate,
  getNoteHref,
  getNoteSummary,
  getNoteTitle,
  sortNotesByDateDesc,
} from "./notes";

describe("getNoteTitle", () => {
  test("returns data.title when set", () => {
    const note = publishedNote("my-note", { title: "My Title" });
    expect(getNoteTitle(note)).toBe("My Title");
  });

  test("falls back to data.name when no title", () => {
    const note = noteFactory({ id: "my-note", data: { name: "My Name", title: undefined } });
    expect(getNoteTitle(note)).toBe("My Name");
  });

  test("falls back to last segment of id when no title or name", () => {
    const note = noteFactory({ id: "my-note", data: { title: undefined } });
    expect(getNoteTitle(note)).toBe("my-note");
  });

  test("handles nested id like guides/getting-started", () => {
    const note = noteFactory({ id: "guides/getting-started", data: { title: undefined } });
    expect(getNoteTitle(note)).toBe("getting-started");
  });
});

describe("getNoteSummary", () => {
  test("returns data.summary when set", () => {
    const note = publishedNote("n", { data: { summary: "A summary" } });
    expect(getNoteSummary(note)).toBe("A summary");
  });

  test("falls back to data.description", () => {
    const note = publishedNote("n", { data: { description: "A desc" } });
    expect(getNoteSummary(note)).toBe("A desc");
  });

  test("returns empty string when neither set", () => {
    const note = publishedNote("n");
    expect(getNoteSummary(note)).toBe("");
  });
});

describe("getNoteHref", () => {
  test("returns /${note.id} as default", () => {
    const note = publishedNote("some/path");
    expect(getNoteHref(note)).toBe("/some/path");
  });

  test("uses permalink when set, stripping leading/trailing slashes", () => {
    const note = publishedNote("n", { data: { permalink: "my-page" } });
    expect(getNoteHref(note)).toBe("/my-page");
  });

  test("handles permalink with extra slashes", () => {
    const note = publishedNote("n", { data: { permalink: "///my-page///" } });
    expect(getNoteHref(note)).toBe("/my-page");
  });
});

describe("getNoteDate", () => {
  test("returns Date when data.date is a valid Date", () => {
    const d = new Date("2025-01-15");
    const note = publishedNote("n", { data: { date: d } });
    expect(getNoteDate(note)).toBe(d);
  });

  test("parses string date", () => {
    const note = publishedNote("n", { data: { date: "2025-06-01" } });
    const result = getNoteDate(note);
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toContain("2025-06-01");
  });

  test("returns null when no date", () => {
    const note = publishedNote("n");
    expect(getNoteDate(note)).toBeNull();
  });

  test("returns null for invalid date string", () => {
    const note = publishedNote("n", { data: { date: "not-a-date" } });
    expect(getNoteDate(note)).toBeNull();
  });
});

describe("sortNotesByDateDesc", () => {
  test("sorts newer dates first", () => {
    const older = publishedNote("a", { data: { date: new Date("2024-01-01") }, title: "A" });
    const newer = publishedNote("b", { data: { date: new Date("2025-01-01") }, title: "B" });
    const sorted = sortNotesByDateDesc([older, newer]);
    expect(sorted[0].id).toBe("b");
    expect(sorted[1].id).toBe("a");
  });

  test("sorts alphabetically by title when dates are equal", () => {
    const d = new Date("2025-01-01");
    const beta = publishedNote("x", { data: { date: d }, title: "Beta" });
    const alpha = publishedNote("y", { data: { date: d }, title: "Alpha" });
    const sorted = sortNotesByDateDesc([beta, alpha]);
    expect(sorted[0].id).toBe("y");
    expect(sorted[1].id).toBe("x");
  });

  test("notes without dates sort last", () => {
    const dated = publishedNote("a", { data: { date: new Date("2025-01-01") }, title: "A" });
    const undated = publishedNote("b", { title: "B" });
    const sorted = sortNotesByDateDesc([undated, dated]);
    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
  });
});
