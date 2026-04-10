import * as fc from "fast-check";
import { notesFromDefinitions, type NoteDefinition } from "./factories/note-factory";

export const segmentArbitrary = fc
  .array(fc.constantFrom(..."-abcdefghijklmnopqrstuvwxyz0123456789".split("")), {
    minLength: 1,
    maxLength: 10,
  })
  .map((chars) => chars.join(""));

export const noteIdArbitrary = fc
  .tuple(
    segmentArbitrary,
    fc.option(segmentArbitrary, { nil: undefined }),
    fc.option(segmentArbitrary, { nil: undefined }),
  )
  .map(([first, second, third]) => [first, second, third].filter(Boolean).join("/"));

export const noteDefinitionArbitrary = fc.record({
  id: noteIdArbitrary,
  nav_hidden: fc.boolean(),
  publish: fc.boolean(),
  title: segmentArbitrary,
});

export const linkedNoteDefinitionArbitrary = fc
  .uniqueArray(noteIdArbitrary, { minLength: 1, maxLength: 8 })
  .chain((ids) =>
    fc.array(
      fc.record({
        id: fc.constantFrom(...ids),
        publish: fc.boolean(),
        title: segmentArbitrary,
        targets: fc.subarray(ids, { minLength: 0, maxLength: Math.min(ids.length, 4) }),
      }),
      { minLength: ids.length, maxLength: ids.length },
    ),
  )
  .map((definitions) => {
    const deduped = new Map(definitions.map((definition) => [definition.id, definition]));
    return [...deduped.values()];
  });

export function noteDefinitionsToFixtures(definitions: NoteDefinition[]) {
  return notesFromDefinitions(definitions);
}
