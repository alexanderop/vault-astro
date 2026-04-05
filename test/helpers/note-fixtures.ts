import type { CollectionEntry } from "astro:content";

type NoteData = CollectionEntry<"notes">["data"];

interface NoteFixtureOptions {
  body?: string;
  data?: Partial<NoteData>;
}

export function createNoteFixture(
  id: string,
  { body = "", data = {} }: NoteFixtureOptions = {},
): CollectionEntry<"notes"> {
  return {
    id,
    body,
    collection: "notes",
    data: {
      publish: true,
      ...data,
    },
  } as CollectionEntry<"notes">;
}
