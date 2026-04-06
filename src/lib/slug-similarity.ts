import type { CollectionEntry } from "astro:content";

import { getNoteTitle } from "@/lib/notes";

export function slugSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0;
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower === bLower) return 1;
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8;

  const aTokens = aLower.split(/[\s\-/]+/).filter(Boolean);
  const bTokens = bLower.split(/[\s\-/]+/).filter(Boolean);
  const matches = aTokens.filter((t) => bTokens.some((bt) => bt.includes(t) || t.includes(bt)));
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  return matches.length / Math.max(aTokens.length, bTokens.length);
}

export function findSimilarNotes(
  slug: string,
  notes: CollectionEntry<"notes">[],
  maxResults = 5,
): CollectionEntry<"notes">[] {
  if (!slug) return [];

  return notes
    .map((note) => ({
      note,
      score: Math.max(slugSimilarity(slug, note.id), slugSimilarity(slug, getNoteTitle(note))),
    }))
    .filter((s) => s.score > 0.2)
    .toSorted((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.note);
}
