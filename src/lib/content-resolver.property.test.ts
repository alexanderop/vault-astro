import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  isImageTarget,
  isPublishedNote,
  parseWikilink,
  slugifyWikilinkFragment,
} from "@/lib/content-resolver";
import { PROPERTY_TEST_SETTINGS } from "../../test/helpers/property-test";

const tokenArbitrary = fc
  .array(
    fc.constantFrom(
      ..."-_ abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""),
    ),
    {
      minLength: 1,
      maxLength: 16,
    },
  )
  .map((chars) => chars.join("").trim())
  .filter((value) => value.length > 0);

const wikilinkShapeArbitrary = fc
  .record({
    isEmbed: fc.boolean(),
    target: tokenArbitrary,
    alias: fc.option(tokenArbitrary, { nil: undefined }),
    fragment: fc.oneof(
      fc.constant({ kind: "none" as const }),
      tokenArbitrary.map((heading) => ({ kind: "heading" as const, value: heading })),
      tokenArbitrary.map((blockRef) => ({ kind: "blockRef" as const, value: blockRef })),
    ),
  })
  .map(({ alias, fragment, isEmbed, target }) => {
    const fragmentText =
      fragment.kind === "none"
        ? ""
        : fragment.kind === "heading"
          ? `#${fragment.value}`
          : `#^${fragment.value}`;
    const aliasText = alias ? `|${alias}` : "";
    const raw = `${isEmbed ? "!" : ""}[[${target}${fragmentText}${aliasText}]]`;

    return {
      raw,
      expected: {
        alias,
        blockRef: fragment.kind === "blockRef" ? fragment.value : undefined,
        heading: fragment.kind === "heading" ? fragment.value : undefined,
        isEmbed,
        target,
      },
    };
  });

const imageExtensionArbitrary = fc.constantFrom(
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "webp",
  "bmp",
  "ico",
);
const nonImageExtensionArbitrary = fc.constantFrom("md", "txt", "json", "astro", "ts");
const caseVariantArbitrary = (value: string) =>
  fc.array(fc.boolean(), { minLength: value.length, maxLength: value.length }).map((flags) =>
    value
      .split("")
      .map((char, index) => (flags[index] ? char.toUpperCase() : char.toLowerCase()))
      .join(""),
  );

describe("content resolver properties", () => {
  it("parses generated wikilink shapes into the expected fields", () => {
    fc.assert(
      fc.property(wikilinkShapeArbitrary, ({ expected, raw }) => {
        expect(parseWikilink(raw)).toEqual(expected);
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("slugifies fragments into lowercase URL-safe values", () => {
    fc.assert(
      fc.property(tokenArbitrary, (fragment) => {
        const slug = slugifyWikilinkFragment(fragment);

        expect(slug).toBe(slug.toLowerCase());
        expect(slug).not.toMatch(/\s/);
        expect(slug).toMatch(/^[a-z0-9-]*$/);
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("matches image targets case-insensitively by known extension", () => {
    fc.assert(
      fc.property(
        tokenArbitrary,
        imageExtensionArbitrary.chain(caseVariantArbitrary),
        (name, ext) => {
          expect(isImageTarget(`${name}.${ext}`)).toBe(true);
        },
      ),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("excludes explicit drafts and Excalidraw files from publication", () => {
    fc.assert(
      fc.property(tokenArbitrary, fc.boolean(), fc.boolean(), (name, publish, excalidraw) => {
        const id = excalidraw ? `Excalidraw/${name}.excalidraw` : `notes/${name}`;

        expect(isPublishedNote(id, publish)).toBe(publish && !excalidraw);
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("does not classify common non-image extensions as image targets", () => {
    fc.assert(
      fc.property(tokenArbitrary, nonImageExtensionArbitrary, (name, ext) => {
        expect(isImageTarget(`${name}.${ext}`)).toBe(false);
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });
});
