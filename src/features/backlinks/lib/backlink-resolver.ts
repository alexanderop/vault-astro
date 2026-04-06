import type { CollectionEntry } from "astro:content";
import {
  createCollectionNoteResolver,
  getPublishedNotes,
  type NoteResolver,
} from "@/lib/content-resolver";
import { buildNoteLinksIndex, type NoteLinksIndex } from "@/lib/note-links";
import { getNoteTitle } from "@/lib/notes";

export interface Backlink {
  href: string;
  title: string;
}

/**
 * Build a map from note slug → backlinks (notes that link to it).
 */
export function buildBacklinksMap(
  notes: CollectionEntry<"notes">[],
  linksByNote?: NoteLinksIndex,
  resolver?: NoteResolver,
): Map<string, Backlink[]> {
  const publishedNotes = getPublishedNotes(notes);
  const backlinks = new Map<string, Backlink[]>();
  const noteResolver = resolver ?? createCollectionNoteResolver(publishedNotes);
  const resolvedLinksByNote = linksByNote ?? buildNoteLinksIndex(publishedNotes, noteResolver);
  const titleBySlug = new Map(publishedNotes.map((note) => [note.id, getNoteTitle(note)] as const));

  for (const [sourceSlug, targets] of resolvedLinksByNote) {
    const sourceTitle = titleBySlug.get(sourceSlug) ?? sourceSlug;
    const sourceResolved = noteResolver.resolve(sourceSlug);
    const href =
      sourceResolved.status === "resolved"
        ? `/${sourceResolved.entry.publicPath}`
        : `/${sourceSlug}`;
    for (const targetSlug of targets) {
      if (!backlinks.has(targetSlug)) {
        backlinks.set(targetSlug, []);
      }

      const existing = backlinks.get(targetSlug)!;
      // Deduplicate — only add one backlink per source note
      if (!existing.some((b) => b.href === href)) {
        existing.push({ href, title: sourceTitle });
      }
    }
  }

  return backlinks;
}
