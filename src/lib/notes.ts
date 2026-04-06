import type { CollectionEntry } from "astro:content";
import { createCollectionNoteResolver, type NoteResolver } from "@/lib/content-resolver";

export function getNoteTitle(note: CollectionEntry<"notes">) {
  return note.data.title ?? note.data.name ?? note.id.split("/").at(-1) ?? note.id;
}

export function getNoteSummary(note: CollectionEntry<"notes">) {
  return note.data.summary ?? note.data.description ?? "";
}

export function getNoteHref(
  note: CollectionEntry<"notes">,
  notes?: CollectionEntry<"notes">[],
  resolver?: NoteResolver,
) {
  const noteResolver = resolver ?? (notes ? createCollectionNoteResolver(notes) : undefined);

  if (noteResolver) {
    const resolved = noteResolver.resolve(note.id);
    if (resolved.status === "resolved") {
      return `/${resolved.entry.publicPath}`;
    }
  }

  if (typeof note.data.permalink === "string" && note.data.permalink.trim().length > 0) {
    return `/${note.data.permalink.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  }

  return `/${note.id}`;
}

export function getNoteDate(note: CollectionEntry<"notes">): Date | null {
  const { date } = note.data;

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return date;
  }

  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

export function sortNotesByDateDesc(notes: CollectionEntry<"notes">[]) {
  return notes.toSorted((a, b) => {
    const dateA = getNoteDate(a)?.getTime() ?? 0;
    const dateB = getNoteDate(b)?.getTime() ?? 0;

    if (dateB !== dateA) {
      return dateB - dateA;
    }

    return getNoteTitle(a).localeCompare(getNoteTitle(b));
  });
}
