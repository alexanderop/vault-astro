import type { CollectionEntry } from "astro:content";

export interface TagEntry {
  tag: string;
  count: number;
}

export function buildTagIndex(notes: CollectionEntry<"notes">[]): TagEntry[] {
  const counts = new Map<string, number>();

  for (const note of notes) {
    const tags = note.data.tags ?? [];
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([tag, count]) => ({ tag, count })).toSorted(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
}
