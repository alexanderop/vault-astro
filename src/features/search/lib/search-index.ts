import type { CollectionEntry } from "astro:content";
import { createCollectionContentResolver, getPublishedNotes } from "@/lib/content-resolver";
import { getNoteSummary, getNoteTitle } from "@/lib/notes";

export interface SearchEntry {
  href: string;
  slug: string;
  title: string;
  type: string;
  tags: string[];
  summary: string;
  /** First ~200 chars of content for preview */
  preview: string;
}

function stripMarkdown(content: string): string {
  return (
    content
      // Strip frontmatter
      .replace(/^---[\s\S]*?---\n?/, "")
      // Strip headings markers
      .replace(/^#{1,6}\s+/gm, "")
      // Strip wikilinks, keep display text
      .replace(/!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, alias) => alias ?? target)
      // Strip markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Strip emphasis
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
      // Strip code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Strip inline code
      .replace(/`([^`]+)`/g, "$1")
      // Strip callout syntax
      .replace(/^>\s*\[!.*?\].*$/gm, "")
      // Strip block refs
      .replace(/\s+\^[a-zA-Z0-9-]+\s*$/gm, "")
      // Strip comments
      .replace(/%%.*?%%/g, "")
      // Collapse whitespace
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

export function buildSearchIndex(notes: CollectionEntry<"notes">[]): SearchEntry[] {
  const publishedNotes = getPublishedNotes(notes);
  const resolver = createCollectionContentResolver(publishedNotes);

  return publishedNotes
    .filter((note) => !note.data.nav_hidden)
    .map((note) => {
      const plain = stripMarkdown(note.body ?? "");
      const resolved = resolver.resolve(note.id);
      const href = resolved.status === "resolved" ? `/${resolved.entry.publicPath}` : `/${note.id}`;

      return {
        href,
        slug: note.id,
        title: getNoteTitle(note),
        type: typeof note.data.type === "string" ? note.data.type : note.id.split("/")[0],
        tags: note.data.tags ?? [],
        summary: getNoteSummary(note),
        preview: plain.slice(0, 200),
      };
    });
}
