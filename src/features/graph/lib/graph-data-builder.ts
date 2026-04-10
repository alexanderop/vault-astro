import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "@/lib/content-resolver";
import { buildNoteLinksIndex, type NoteLinksIndex } from "@/lib/note-links";
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

export interface GraphBuildContext {
  linksByNote: NoteLinksIndex;
  notes: CollectionEntry<"notes">[];
  noteIds: Set<string>;
  noteTitles: Map<string, string>;
  sourcesByTarget: Map<string, Set<string>>;
}

export function createGraphBuildContext(
  notes: CollectionEntry<"notes">[],
  linksByNote?: NoteLinksIndex,
): GraphBuildContext {
  const publishedNotes = getPublishedNotes(notes);
  const resolvedLinksByNote = linksByNote ?? buildNoteLinksIndex(publishedNotes);
  const sourcesByTarget = new Map<string, Set<string>>();

  for (const [source, targets] of resolvedLinksByNote) {
    for (const target of targets) {
      const sources = sourcesByTarget.get(target) ?? new Set<string>();
      sources.add(source);
      sourcesByTarget.set(target, sources);
    }
  }

  return {
    linksByNote: resolvedLinksByNote,
    notes: publishedNotes,
    noteIds: new Set(publishedNotes.map((note) => note.id)),
    noteTitles: new Map(publishedNotes.map((note) => [note.id, getNoteTitle(note)] as const)),
    sourcesByTarget,
  };
}

function collectEdges(linksByNote: NoteLinksIndex, include: (id: string) => boolean): GraphEdge[] {
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const [source, targets] of linksByNote) {
    if (!include(source)) continue;
    for (const target of targets) {
      if (!include(target)) continue;
      const key = [source, target].toSorted((a, b) => a.localeCompare(b)).join("→");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source, target });
    }
  }

  return edges;
}

export function buildLocalGraphData(context: GraphBuildContext, currentSlug: string): GraphData {
  if (!context.noteIds.has(currentSlug)) {
    return { nodes: [], edges: [] };
  }

  const neighborhood = new Set<string>([currentSlug]);

  for (const target of context.linksByNote.get(currentSlug) ?? []) {
    neighborhood.add(target);
  }

  for (const source of context.sourcesByTarget.get(currentSlug) ?? []) {
    neighborhood.add(source);
  }

  const nodes = context.notes
    .filter((note) => neighborhood.has(note.id))
    .map((note) => ({
      id: note.id,
      title: context.noteTitles.get(note.id) ?? getNoteTitle(note),
    }));

  const edges = collectEdges(context.linksByNote, (id) => neighborhood.has(id));

  return { nodes, edges };
}

export function buildGlobalGraphData(context: GraphBuildContext): GraphData {
  const nodes = context.notes.map((note) => ({
    id: note.id,
    title: context.noteTitles.get(note.id) ?? getNoteTitle(note),
  }));

  const edges = collectEdges(context.linksByNote, (id) => context.noteIds.has(id));

  return { nodes, edges };
}
