import type { SearchEntry } from "@/features/search/lib/search-index";

export interface SearchEntryFactoryOptions extends Partial<SearchEntry> {
  slug?: string;
}

function titleFromSlug(slug: string): string {
  return (
    slug
      .split("/")
      .at(-1)
      ?.split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ") ?? slug
  );
}

export function searchEntryFactory(options: SearchEntryFactoryOptions = {}): SearchEntry {
  const slug = options.slug ?? "note";
  const title = options.title ?? titleFromSlug(slug);

  return {
    href: options.href ?? `/${slug}`,
    slug,
    title,
    type: options.type ?? "note",
    tags: options.tags ?? [],
    summary: options.summary ?? `${title} summary`,
    preview: options.preview ?? `${title} preview`,
  };
}

export function searchEntriesFactory(
  countOrOverrides: number | SearchEntryFactoryOptions[] = [],
): SearchEntry[] {
  if (typeof countOrOverrides === "number") {
    return Array.from({ length: countOrOverrides }, (_, index) =>
      searchEntryFactory({ slug: `note-${index + 1}` }),
    );
  }

  return countOrOverrides.map((entry) => searchEntryFactory(entry));
}
