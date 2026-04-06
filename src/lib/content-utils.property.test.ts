import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { normalizeLookupValue } from "@/lib/content-utils";
import { PROPERTY_TEST_SETTINGS } from "../../test/helpers/property-test";

const pathLikeArbitrary = fc
  .array(
    fc.constantFrom(..."/\\._- abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
    {
      minLength: 0,
      maxLength: 40,
    },
  )
  .map((chars) => chars.join(""));

describe("normalizeLookupValue properties", () => {
  it("is idempotent and produces canonical path-like output", () => {
    fc.assert(
      fc.property(pathLikeArbitrary, (value) => {
        const normalized = normalizeLookupValue(value);

        expect(normalizeLookupValue(normalized)).toBe(normalized);
        expect(normalized).toBe(normalized.toLowerCase());
        expect(normalized).not.toContain("\\");
        expect(normalized).toBe(normalized.trim());

        if (normalized.length > 0) {
          expect(normalized.startsWith("/")).toBe(false);
          expect(normalized.endsWith("/")).toBe(false);
        }

        expect(normalized.toLowerCase().endsWith(".md")).toBe(false);
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });
});
