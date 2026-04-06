import type { CollectionEntry } from "astro:content";
import { getEntryType } from "@/lib/content-resolver";

export interface TypeEntry {
  type: string;
  count: number;
}

export function buildTypeIndex(notes: CollectionEntry<"notes">[]): TypeEntry[] {
  const counts = new Map<string, number>();

  for (const note of notes) {
    const type = getEntryType(note);
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts, ([type, count]) => ({ type, count })).toSorted(
    (a, b) => b.count - a.count || a.type.localeCompare(b.type),
  );
}
