import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "@/lib/content-resolver";
import { buildNoteLinksIndex } from "@/lib/note-links";
import { getNoteTitle } from "@/lib/notes";

export interface GraphNode {
  id: string;
  title: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildLocalGraphData(
  notes: CollectionEntry<"notes">[],
  currentSlug: string,
): GraphData {
  const publishedNotes = getPublishedNotes(notes);
  if (!publishedNotes.some((note) => note.id === currentSlug)) {
    return { nodes: [], edges: [] };
  }

  const linkedByNote = buildNoteLinksIndex(publishedNotes);

  const neighborhood = new Set<string>([currentSlug]);

  for (const target of linkedByNote.get(currentSlug) ?? []) {
    neighborhood.add(target);
  }

  for (const [source, targets] of linkedByNote) {
    if (targets.has(currentSlug)) {
      neighborhood.add(source);
    }
  }

  const nodes = publishedNotes
    .filter((note) => neighborhood.has(note.id))
    .map((note) => ({
      id: note.id,
      title: getNoteTitle(note),
    }));

  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const [source, targets] of linkedByNote) {
    if (!neighborhood.has(source)) continue;

    for (const target of targets) {
      if (!neighborhood.has(target)) continue;

      const key = [source, target].toSorted().join("→");
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source, target });
    }
  }

  return { nodes, edges };
}
