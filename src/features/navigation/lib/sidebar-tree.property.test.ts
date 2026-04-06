import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  buildSidebarTree,
  getSidebarDefaultOpenKeys,
  type SidebarTreeNode,
} from "@/features/navigation/lib/sidebar-tree";
import {
  noteDefinitionArbitrary,
  noteDefinitionsToFixtures,
} from "../../../../test/helpers/note-arbitraries";
import { PROPERTY_TEST_SETTINGS } from "../../../../test/helpers/property-test";

function collectTreeNodes(nodes: SidebarTreeNode[]): SidebarTreeNode[] {
  return nodes.flatMap((node) => [node, ...collectTreeNodes(node.children)]);
}

function findAncestorKeys(
  nodes: SidebarTreeNode[],
  slug: string,
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return ancestors;
    }

    const nested = findAncestorKeys(node.children, slug, [...ancestors, node.key]);
    if (nested) {
      return nested;
    }
  }

  return null;
}

describe("sidebar tree properties", () => {
  it("includes only published, visible notes and keeps folders before files", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(noteDefinitionArbitrary, {
          minLength: 1,
          maxLength: 12,
          selector: (note) => note.id,
        }),
        (definitions) => {
          const notes = noteDefinitionsToFixtures(
            definitions.map((definition) => ({
              id: definition.id,
              publish: definition.publish,
              title: definition.title,
              data: { nav_hidden: definition.nav_hidden },
            })),
          );
          const tree = buildSidebarTree(notes);
          const nodes = collectTreeNodes(tree);
          const visibleIds = definitions
            .filter((definition) => definition.publish && !definition.nav_hidden)
            .map((definition) => definition.id)
            .toSorted();
          const slugs = nodes.flatMap((node) => (node.slug ? [node.slug] : [])).toSorted();

          expect(slugs).toEqual(visibleIds);

          for (const node of nodes) {
            let sawFile = false;

            for (const child of node.children) {
              if (child.slug) {
                sawFile = true;
              } else {
                expect(sawFile).toBe(false);
              }
            }
          }
        },
      ),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("returns only strict ancestor keys for visible notes", () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(noteDefinitionArbitrary, {
            minLength: 1,
            maxLength: 10,
            selector: (note) => note.id,
          })
          .filter((definitions) =>
            definitions.some((definition) => definition.publish && !definition.nav_hidden),
          ),
        (definitions) => {
          const notes = noteDefinitionsToFixtures(
            definitions.map((definition) => ({
              id: definition.id,
              publish: definition.publish,
              title: definition.title,
              data: { nav_hidden: definition.nav_hidden },
            })),
          );
          const visibleSlug = definitions.find(
            (definition) => definition.publish && !definition.nav_hidden,
          )?.id;
          if (!visibleSlug) {
            throw new Error("Expected at least one visible note");
          }
          const tree = buildSidebarTree(notes);
          const openKeys = getSidebarDefaultOpenKeys(tree, visibleSlug);
          const expectedAncestors = findAncestorKeys(tree, visibleSlug);

          expect(openKeys).toEqual(expectedAncestors ?? []);
        },
      ),
      PROPERTY_TEST_SETTINGS,
    );
  });
});
