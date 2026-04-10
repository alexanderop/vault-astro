import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createCollectionContentResolver,
  createCollectionNoteResolver,
  extractWikilinks,
  getEntryHref,
  getPublishedNotes,
  getEntryType,
  isExcalidrawTarget,
  isImageTarget,
  isPublishedNote,
  parseWikilink,
  slugifyWikilinkFragment,
  targetToHref,
} from "@/lib/content-resolver";
import { createFilesystemContentResolver } from "@/lib/content-resolver.server";
import {
  authorNote,
  draftNote,
  noteFactory,
  publishedNote,
} from "../../test/helpers/note-fixtures";

const contentRoot = fileURLToPath(new URL("../../test/fixtures/content", import.meta.url));
const attachmentsRoot = fileURLToPath(new URL("../../test/fixtures/attachments", import.meta.url));

describe("content resolver helpers", () => {
  it("parses basic, aliased, heading, and block-ref wikilinks", () => {
    expect(parseWikilink("[[alpha]]")).toEqual({
      isEmbed: false,
      target: "alpha",
      heading: undefined,
      blockRef: undefined,
      alias: undefined,
    });
    expect(parseWikilink("[[alpha#Section Heading|Read more]]")).toEqual({
      isEmbed: false,
      target: "alpha",
      heading: "Section Heading",
      blockRef: undefined,
      alias: "Read more",
    });
    expect(parseWikilink("![[alpha#^block-id]]")).toEqual({
      isEmbed: true,
      target: "alpha",
      heading: undefined,
      blockRef: "block-id",
      alias: undefined,
    });
  });

  it("extracts wikilinks from markdown and slugifies heading fragments", () => {
    expect(extractWikilinks("See [[alpha]] and ![[beta#Section Heading|Preview]].")).toEqual([
      {
        isEmbed: false,
        target: "alpha",
        heading: undefined,
        blockRef: undefined,
        alias: undefined,
      },
      {
        isEmbed: true,
        target: "beta",
        heading: "Section Heading",
        blockRef: undefined,
        alias: "Preview",
      },
    ]);
    expect(slugifyWikilinkFragment("Section Heading! 2026")).toBe("section-heading-2026");
  });

  it("identifies image targets by extension", () => {
    expect(isImageTarget("diagram.png")).toBe(true);
    expect(isImageTarget("diagram.SVG")).toBe(true);
    expect(isImageTarget("note.md")).toBe(false);
  });

  it("identifies excalidraw targets and publication status", () => {
    expect(isExcalidrawTarget("system-design.excalidraw")).toBe(true);
    expect(isExcalidrawTarget("diagram.png")).toBe(false);
    expect(isPublishedNote("notes/alpha", true)).toBe(true);
    expect(isPublishedNote("Excalidraw/system-design.excalidraw", true)).toBe(false);
  });
});

describe("createCollectionContentResolver", () => {
  const notes = [
    publishedNote("notes/alpha", {
      title: "Alpha Note",
      data: {
        aliases: ["Alpha Alias"],
        slug: "alpha-note",
        permalink: "custom/alpha",
      },
    }),
    authorNote("authors/jane-doe", {
      data: {
        name: "Jane Doe",
      },
    }),
    draftNote("notes/draft", {
      title: "Draft Note",
    }),
    noteFactory({
      id: "Excalidraw/system-design.excalidraw",
      title: "System Design Diagram",
    }),
  ];
  const resolver = createCollectionContentResolver(notes);
  const noteResolver = createCollectionNoteResolver(notes);

  it("resolves by id, alias, slug, and permalink while excluding unpublished notes", () => {
    expect(resolver.resolve("notes/alpha")).toMatchObject({
      status: "resolved",
      entry: { id: "notes/alpha", publicPath: "custom/alpha" },
    });
    expect(resolver.resolve("Alpha Alias")).toMatchObject({
      status: "resolved",
      entry: { id: "notes/alpha" },
    });
    expect(resolver.resolve("alpha-note")).toMatchObject({
      status: "resolved",
      entry: { id: "notes/alpha" },
    });
    expect(resolver.resolve("custom/alpha")).toMatchObject({
      status: "resolved",
      entry: { id: "notes/alpha" },
    });
    expect(resolver.resolve("draft")).toEqual({
      status: "missing",
      target: "draft",
    });
    expect(noteResolver.resolve("Alpha Alias")).toMatchObject({
      status: "resolved",
      entry: { id: "notes/alpha" },
    });
  });

  it("builds hrefs and infers entry types correctly", () => {
    const resolved = resolver.resolve("notes/alpha");

    expect(resolved).toMatchObject({ status: "resolved" });
    if (resolved.status !== "resolved") {
      throw new Error("Expected notes/alpha to resolve");
    }

    expect(getEntryHref(resolved.entry)).toBe("/custom/alpha");
    expect(targetToHref(resolver, "notes/alpha", "Section Heading")).toBe(
      "/custom/alpha#section-heading",
    );
    expect(targetToHref(resolver, "notes/alpha", undefined, "block-id")).toBe(
      "/custom/alpha#^block-id",
    );
    expect(getEntryType(resolved.entry)).toBe("note");
    expect(getEntryType(notes[1])).toBe("author");
  });

  it("returns only published notes", () => {
    expect(getPublishedNotes(notes).map((note) => note.id)).toEqual([
      "notes/alpha",
      "authors/jane-doe",
    ]);
  });
});

describe("createFilesystemContentResolver", () => {
  const resolver = createFilesystemContentResolver({ contentRoot, attachmentsRoot });

  it("resolves fixture notes and attachments from the filesystem", () => {
    expect(resolver.resolve("alpha")).toMatchObject({
      status: "resolved",
      entry: { id: "alpha", title: "Alpha Note" },
    });
    expect(resolver.resolveAttachment("assets/diagram.png")).toBe(
      "/attachments/assets/diagram.png",
    );
    expect(resolver.resolveAttachment("diagram.png")).toBe("/attachments/assets/diagram.png");
    expect(resolver.resolveExcalidraw("system-design.excalidraw")).toBe(
      "/excalidraw/Excalidraw/system-design.excalidraw.svg",
    );
  });
});
