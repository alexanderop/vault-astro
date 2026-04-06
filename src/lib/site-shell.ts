import type { CollectionEntry } from "astro:content";
import type { SearchEntry } from "@/features/search/lib/search-index";
import { getBuildSiteData } from "@/lib/build-site-data";

export interface SiteShellData {
  notes: CollectionEntry<"notes">[];
  searchIndex: SearchEntry[];
}

export async function loadSiteShellData(): Promise<SiteShellData> {
  const { notes, searchIndex } = await getBuildSiteData();

  return {
    notes,
    searchIndex,
  };
}
