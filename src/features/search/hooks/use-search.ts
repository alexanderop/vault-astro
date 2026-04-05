import { useState, useMemo } from "react";
import type { SearchEntry } from "@/features/search/lib/search-index";

export function useSearch(entries: SearchEntry[]) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return entries;

    const terms = q.split(/\s+/);

    return entries
      .map((entry) => {
        const searchable = [entry.title, entry.summary, entry.slug, entry.preview, ...entry.tags]
          .join(" ")
          .toLowerCase();

        // Score: how many terms match
        const matchCount = terms.filter((term) => searchable.includes(term)).length;

        // Title matches score higher
        const titleBoost = terms.some((term) => entry.title.toLowerCase().includes(term)) ? 2 : 0;

        return { entry, score: matchCount + titleBoost };
      })
      .filter(({ score }) => score > 0)
      .toSorted((a, b) => b.score - a.score)
      .map(({ entry }) => entry);
  }, [query, entries]);

  return { query, setQuery, results };
}
