import { describe, expect, it } from "vitest";
import {
  buildSidebarTree,
  getSidebarDefaultOpenKeys,
} from "@/features/navigation/lib/sidebar-tree";
import {
  draftNote,
  hiddenNote,
  notesFromDefinitions,
  publishedNote,
} from "../../../../test/helpers/note-fixtures";

describe("buildSidebarTree", () => {
  it("wraps root-level notes under a notes folder", () => {
    const tree = buildSidebarTree(
      notesFromDefinitions([
        { id: "my-note", title: "My Note" },
        { id: "another-note", title: "Another Note" },
      ]),
    );

    expect(tree).toMatchObject([
      {
        key: "notes",
        name: "notes",
        children: [
          { key: "notes/another-note", title: "Another Note" },
          { key: "notes/my-note", title: "My Note" },
        ],
      },
    ]);
  });

  it("filters unpublished and hidden notes while keeping folders sorted before files", () => {
    const tree = buildSidebarTree([
      publishedNote("guides/testing/alpha", { title: "Alpha" }),
      publishedNote("guides/beta", { title: "Beta" }),
      hiddenNote("guides/hidden", { title: "Hidden" }),
      draftNote("guides/draft", { title: "Draft" }),
    ]);

    expect(tree).toMatchObject([
      {
        key: "guides",
        children: [
          {
            key: "guides/testing",
            children: [
              {
                key: "guides/testing/alpha",
                slug: "guides/testing/alpha",
                title: "Alpha",
              },
            ],
          },
          {
            key: "guides/beta",
            slug: "guides/beta",
            title: "Beta",
          },
        ],
      },
    ]);
  });
});

describe("getSidebarDefaultOpenKeys", () => {
  it("returns ancestor keys for the active note", () => {
    const tree = buildSidebarTree([
      publishedNote("guides/testing/alpha"),
      publishedNote("guides/beta"),
    ]);

    expect(getSidebarDefaultOpenKeys(tree, "guides/testing/alpha")).toEqual([
      "guides",
      "guides/testing",
    ]);
  });
});
