import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { getPublishedNotes } from "@/lib/content-resolver";
import { buildSearchIndex, type SearchEntry } from "@/features/search/lib/search-index";

export interface SiteShellData {
  notes: CollectionEntry<"notes">[];
  searchIndex: SearchEntry[];
}

export async function loadSiteShellData(): Promise<SiteShellData> {
  const notes = getPublishedNotes(await getCollection("notes"));

  return {
    notes,
    searchIndex: SITE.showSearch ? buildSearchIndex(notes) : [],
  };
}
