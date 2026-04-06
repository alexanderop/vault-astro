import { describe, expect, it } from "vitest";
import { resolveContentClasses } from "@/features/notes/lib/content-classes";

describe("resolveContentClasses", () => {
  it("returns only allowlisted content classes", () => {
    expect(
      resolveContentClasses(["content-compact", "content-serif", "max-w-screen-2xl", "px-0"]),
    ).toEqual(["content-compact", "content-serif"]);
  });

  it("returns an empty array when classes are missing", () => {
    expect(resolveContentClasses()).toEqual([]);
  });
});
