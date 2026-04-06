import type { CollectionEntry } from "astro:content";
import { wikilinks } from "./markdown-factory";

type NoteData = CollectionEntry<"notes">["data"];

export interface NoteFixtureOptions {
  body?: string;
  data?: Partial<NoteData>;
}

export interface NoteBuilderOptions extends NoteFixtureOptions {
  id?: string;
  publish?: boolean;
  title?: string;
}

export interface NoteDefinition {
  id: string;
  body?: string;
  targets?: string[];
  publish?: boolean;
  title?: string;
  data?: Partial<NoteData>;
}

function fallbackTitleFromId(id: string): string {
  return id.split("/").at(-1) ?? id;
}

function buildNoteData(id: string, options: NoteBuilderOptions): NoteData {
  const { data = {}, publish = true, title } = options;

  return {
    publish,
    title: title ?? data.title ?? fallbackTitleFromId(id),
    ...data,
  } as NoteData;
}

export function noteFactory(options: NoteBuilderOptions = {}): CollectionEntry<"notes"> {
  const id = options.id ?? "note";

  return {
    id,
    body: options.body ?? "",
    collection: "notes",
    data: buildNoteData(id, options),
  } as CollectionEntry<"notes">;
}

export function createNoteFixture(
  id: string,
  { body = "", data = {} }: NoteFixtureOptions = {},
): CollectionEntry<"notes"> {
  return noteFactory({ id, body, data });
}

export function publishedNote(
  id: string,
  options: Omit<NoteBuilderOptions, "id" | "publish"> = {},
): CollectionEntry<"notes"> {
  return noteFactory({ ...options, id, publish: true });
}

export function draftNote(
  id: string,
  options: Omit<NoteBuilderOptions, "id" | "publish"> = {},
): CollectionEntry<"notes"> {
  return noteFactory({
    ...options,
    id,
    publish: false,
    data: { ...options.data, publish: false },
  });
}

export function hiddenNote(
  id: string,
  options: Omit<NoteBuilderOptions, "id"> = {},
): CollectionEntry<"notes"> {
  return noteFactory({
    ...options,
    id,
    data: { ...options.data, nav_hidden: true },
  });
}

export function authorNote(
  id: string,
  options: Omit<NoteBuilderOptions, "id"> = {},
): CollectionEntry<"notes"> {
  const name = options.data?.name ?? options.title ?? fallbackTitleFromId(id);

  return noteFactory({
    ...options,
    id,
    title: options.title ?? undefined,
    data: { ...options.data, name, title: options.data?.title },
  });
}

export function noteWithLinks(
  id: string,
  targets: string[],
  options: Omit<NoteBuilderOptions, "id" | "body"> = {},
): CollectionEntry<"notes"> {
  return noteFactory({
    ...options,
    id,
    body: wikilinks(...targets),
  });
}

export function notesFromDefinitions(definitions: NoteDefinition[]): CollectionEntry<"notes">[] {
  return definitions.map(({ body, data, id, publish, targets, title }) =>
    noteFactory({
      id,
      body: body ?? (targets ? wikilinks(...targets) : ""),
      data,
      publish,
      title,
    }),
  );
}
