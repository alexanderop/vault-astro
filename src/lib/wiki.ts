import type { CollectionEntry } from "astro:content";

export type WikiEntry = CollectionEntry<"notes">;

export function isSourceEntry(entry: WikiEntry): boolean {
  return entry.id.startsWith("sources/");
}

export function isPublishedWikiEntry(entry: WikiEntry): boolean {
  return entry.data.publish !== false && !isSourceEntry(entry);
}

export function getWikiRole(entry: WikiEntry): string | null {
  return typeof entry.data.wiki_role === "string" ? entry.data.wiki_role : null;
}

export function getWikiStatus(entry: WikiEntry): string | null {
  return typeof entry.data.status === "string" ? entry.data.status : null;
}

export function getSourceIds(entry: WikiEntry): string[] {
  const sourceIds = entry.data.source_ids;
  if (Array.isArray(sourceIds)) {
    return sourceIds.filter((value): value is string => typeof value === "string");
  }
  return [];
}

export function getRoleLabel(role: string): string {
  return role
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
