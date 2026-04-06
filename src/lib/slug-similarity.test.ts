import { describe, expect, test } from "vitest";

import { publishedNote } from "../../test/helpers/note-fixtures";
import { findSimilarNotes, slugSimilarity } from "./slug-similarity";

describe("slugSimilarity", () => {
  test("returns 1 for exact match", () => {
    expect(slugSimilarity("hello", "hello")).toBe(1);
  });

  test("is case-insensitive", () => {
    expect(slugSimilarity("Hello", "hello")).toBe(1);
  });

  test("returns 0.8 when one string contains the other", () => {
    expect(slugSimilarity("react-hooks", "react-hooks-guide")).toBe(0.8);
    expect(slugSimilarity("getting-started-with-astro", "astro")).toBe(0.8);
  });

  test("scores based on token overlap", () => {
    const score = slugSimilarity("react-hooks", "react-patterns");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  test("returns 0 for completely unrelated strings", () => {
    expect(slugSimilarity("apple", "zebra")).toBe(0);
  });

  test("returns 0 when either string is empty", () => {
    expect(slugSimilarity("", "hello")).toBe(0);
    expect(slugSimilarity("hello", "")).toBe(0);
  });

  test("handles slash-separated paths", () => {
    const score = slugSimilarity("guides/react", "react");
    expect(score).toBeGreaterThan(0);
  });
});

describe("findSimilarNotes", () => {
  const notes = [
    publishedNote("react-hooks", { title: "React Hooks" }),
    publishedNote("react-patterns", { title: "React Patterns" }),
    publishedNote("astro-guide", { title: "Astro Guide" }),
    publishedNote("typescript-basics", { title: "TypeScript Basics" }),
    publishedNote("unrelated-zebra", { title: "Unrelated Zebra" }),
  ];

  test("returns empty array for empty slug", () => {
    expect(findSimilarNotes("", notes)).toEqual([]);
  });

  test("finds exact id match first", () => {
    const results = findSimilarNotes("react-hooks", notes);
    expect(results[0].id).toBe("react-hooks");
  });

  test("finds notes with partial token overlap", () => {
    const results = findSimilarNotes("react", notes);
    const ids = results.map((n) => n.id);
    expect(ids).toContain("react-hooks");
    expect(ids).toContain("react-patterns");
  });

  test("excludes notes below similarity threshold", () => {
    const results = findSimilarNotes("react-hooks", notes);
    const ids = results.map((n) => n.id);
    expect(ids).not.toContain("unrelated-zebra");
  });

  test("limits results to maxResults", () => {
    const results = findSimilarNotes("react", notes, 1);
    expect(results).toHaveLength(1);
  });

  test("matches against note title as well as id", () => {
    const titleNotes = [publishedNote("some-id", { title: "Astro Guide" })];
    const results = findSimilarNotes("astro", titleNotes);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("some-id");
  });
});
