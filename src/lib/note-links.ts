import type { CollectionEntry } from "astro:content";
import {
  createCollectionContentResolver,
  extractWikilinks,
  getPublishedNotes,
  parseWikilink,
  slugifyWikilinkFragment,
  type ContentResolver,
} from "@/lib/content-resolver";

export { parseWikilink, slugifyWikilinkFragment };

export type NoteLinksIndex = Map<string, Set<string>>;

export function extractWikilinkTargets(markdown: string): string[] {
  return extractWikilinks(markdown)
    .map((link) => link.target)
    .filter(Boolean);
}

export function targetToHref(
  target: string,
  heading?: string,
  blockRef?: string,
  resolver?: ContentResolver,
): string | null {
  if (!resolver) return null;
  const resolved = resolver.resolve(target);
  if (resolved.status !== "resolved") {
    return null;
  }

  let href = `/${resolved.entry.publicPath}`;

  if (blockRef) {
    href += `#^${blockRef}`;
  } else if (heading) {
    href += `#${slugifyWikilinkFragment(heading)}`;
  }

  return href;
}

export function buildNoteLinksIndex(notes: CollectionEntry<"notes">[]): NoteLinksIndex {
  const publishedNotes = getPublishedNotes(notes);
  const resolver = createCollectionContentResolver(publishedNotes);
  const linkedByNote = new Map<string, Set<string>>();

  for (const note of publishedNotes) {
    const linkedSlugs = new Set<string>();

    for (const target of extractWikilinks(note.body ?? "")) {
      const resolved = resolver.resolve(target.target);
      if (resolved.status !== "resolved" || resolved.entry.id === note.id) continue;
      linkedSlugs.add(resolved.entry.id);
    }

    linkedByNote.set(note.id, linkedSlugs);
  }

  return linkedByNote;
}
