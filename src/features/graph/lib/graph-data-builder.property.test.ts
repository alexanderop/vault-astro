import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  buildLocalGraphData,
  createGraphBuildContext,
} from "@/features/graph/lib/graph-data-builder";
import { buildBacklinksMap } from "@/features/backlinks/lib/backlink-resolver";
import { buildNoteLinksIndex } from "@/lib/note-links";
import {
  linkedNoteDefinitionArbitrary,
  noteDefinitionsToFixtures,
} from "../../../../test/helpers/note-arbitraries";
import { PROPERTY_TEST_SETTINGS } from "../../../../test/helpers/property-test";

describe("graph and backlink properties", () => {
  it("keeps graph data within published notes and deduplicates undirected edges", () => {
    fc.assert(
      fc.property(linkedNoteDefinitionArbitrary, (definitions) => {
        const notes = noteDefinitionsToFixtures(definitions);
        const publishedIds = new Set(
          definitions.filter((definition) => definition.publish).map((definition) => definition.id),
        );
        const currentSlug = definitions[0]!.id;
        const context = createGraphBuildContext(notes, buildNoteLinksIndex(notes));
        const graph = buildLocalGraphData(context, currentSlug);

        if (!publishedIds.has(currentSlug)) {
          expect(graph).toEqual({ nodes: [], edges: [] });
          return;
        }

        for (const node of graph.nodes) {
          expect(publishedIds.has(node.id)).toBe(true);
        }

        const undirectedKeys = graph.edges.map((edge) =>
          [edge.source, edge.target].toSorted().join("→"),
        );
        expect(new Set(undirectedKeys).size).toBe(undirectedKeys.length);

        for (const edge of graph.edges) {
          expect(publishedIds.has(edge.source)).toBe(true);
          expect(publishedIds.has(edge.target)).toBe(true);
        }
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });

  it("deduplicates backlinks and excludes unpublished source notes", () => {
    fc.assert(
      fc.property(linkedNoteDefinitionArbitrary, (definitions) => {
        const notes = noteDefinitionsToFixtures(
          definitions.map((definition) => ({
            ...definition,
            targets: definition.targets.concat(
              definition.targets[0] ? [definition.targets[0]] : [],
            ),
          })),
        );
        const publishedIds = new Set(
          definitions.filter((definition) => definition.publish).map((definition) => definition.id),
        );
        const backlinks = buildBacklinksMap(notes, buildNoteLinksIndex(notes));

        for (const [target, entries] of backlinks) {
          expect(publishedIds.has(target)).toBe(true);

          const hrefs = entries.map((entry) => entry.href);
          expect(new Set(hrefs).size).toBe(hrefs.length);

          for (const entry of entries) {
            const sourceId = entry.href.replace(/^\//, "");
            expect(publishedIds.has(sourceId)).toBe(true);
          }
        }
      }),
      PROPERTY_TEST_SETTINGS,
    );
  });
});
