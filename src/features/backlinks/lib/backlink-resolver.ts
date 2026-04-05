import type { CollectionEntry } from "astro:content";
import { createCollectionContentResolver } from "@/lib/content-resolver";
import { buildNoteLinksIndex } from "@/lib/note-links";
import { getNoteTitle } from "@/lib/notes";

export interface Backlink {
  href: string;
  title: string;
}

/**
 * Build a map from note slug → backlinks (notes that link to it).
 */
export function buildBacklinksMap(notes: CollectionEntry<"notes">[]): Map<string, Backlink[]> {
  const backlinks = new Map<string, Backlink[]>();
  const linksByNote = buildNoteLinksIndex(notes);
  const resolver = createCollectionContentResolver(notes);
  const titleBySlug = new Map(notes.map((note) => [note.id, getNoteTitle(note)] as const));

  for (const [sourceSlug, targets] of linksByNote) {
    const sourceTitle = titleBySlug.get(sourceSlug) ?? sourceSlug;
    const sourceResolved = resolver.resolve(sourceSlug);
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
