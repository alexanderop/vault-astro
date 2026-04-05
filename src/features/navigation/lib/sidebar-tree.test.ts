import { describe, expect, it } from "vitest";
import {
  buildSidebarTree,
  getSidebarDefaultOpenKeys,
} from "@/features/navigation/lib/sidebar-tree";
import { createNoteFixture } from "../../../../test/helpers/note-fixtures";

describe("buildSidebarTree", () => {
  it("wraps root-level notes under a notes folder", () => {
    const tree = buildSidebarTree([
      createNoteFixture("my-note", { data: { title: "My Note" } }),
      createNoteFixture("another-note", { data: { title: "Another Note" } }),
    ]);

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
      createNoteFixture("guides/testing/alpha", { data: { title: "Alpha" } }),
      createNoteFixture("guides/beta", { data: { title: "Beta" } }),
      createNoteFixture("guides/hidden", { data: { nav_hidden: true, title: "Hidden" } }),
      createNoteFixture("guides/draft", { data: { publish: false, title: "Draft" } }),
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
      createNoteFixture("guides/testing/alpha"),
      createNoteFixture("guides/beta"),
    ]);

    expect(getSidebarDefaultOpenKeys(tree, "guides/testing/alpha")).toEqual([
      "guides",
      "guides/testing",
    ]);
  });
});
