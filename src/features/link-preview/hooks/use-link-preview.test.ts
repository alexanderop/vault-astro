import { describe, expect, it } from "vitest";
import {
  buildPreviewLookup,
  getPreviewPosition,
  normalizePreviewHref,
  resolvePreviewData,
} from "@/features/link-preview/hooks/use-link-preview";

describe("useLinkPreview helpers", () => {
  it("normalizes heading fragments for preview lookup", () => {
    expect(normalizePreviewHref("/notes/alpha#section-heading")).toBe("/notes/alpha");
  });

  it("resolves preview hits and fragment-stripped matches", () => {
    const lookup = buildPreviewLookup([
      { href: "/alpha", title: "Alpha", preview: "Alpha preview" },
    ]);

    expect(resolvePreviewData(lookup, "/alpha")).toEqual({
      href: "/alpha",
      title: "Alpha",
      preview: "Alpha preview",
    });
    expect(resolvePreviewData(lookup, "/alpha#details")).toEqual({
      href: "/alpha",
      title: "Alpha",
      preview: "Alpha preview",
    });
  });

  it("returns null for missing preview data", () => {
    const lookup = buildPreviewLookup([
      { href: "/alpha", title: "Alpha", preview: "Alpha preview" },
    ]);

    expect(resolvePreviewData(lookup, "/beta")).toBeNull();
    expect(resolvePreviewData(lookup, null)).toBeNull();
  });

  it("preserves empty previews after trimming", () => {
    const lookup = buildPreviewLookup([{ href: "/alpha", title: "Alpha", preview: "   " }]);

    expect(resolvePreviewData(lookup, "/alpha")).toEqual({
      href: "/alpha",
      title: "Alpha",
      preview: "",
    });
  });

  it("keeps the popup inside the viewport", () => {
    const position = getPreviewPosition(
      { left: 760, top: 580, bottom: 598 },
      { width: 320, height: 120 },
      { width: 800, height: 640 },
    );

    expect(position.left).toBe(468);
    expect(position.top).toBe(448);
  });
});
