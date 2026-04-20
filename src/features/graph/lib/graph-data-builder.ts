import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "@/lib/content-resolver";
import { buildNoteLinksIndex, type NoteLinksIndex } from "@/lib/note-links";
import { getNoteTitle } from "@/lib/notes";

export const CLUSTER_OTHER = "other";
export const CLUSTER_TOP_N = 10;

export type GraphNodeKind = "content" | "author" | "catalog";

const CATALOG_WIKI_ROLES = new Set(["index", "overview", "log"]);

function getNoteKind(note: CollectionEntry<"notes">): GraphNodeKind {
  if (note.id.startsWith("authors/")) return "author";
  const role = note.data.wiki_role;
  if (role && CATALOG_WIKI_ROLES.has(role)) return "catalog";
  return "content";
}

export interface GraphNode {
  id: string;
  title: string;
  cluster: string;
  kind: GraphNodeKind;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  topTags: string[];
}

export interface GraphBuildContext {
  linksByNote: NoteLinksIndex;
  notes: CollectionEntry<"notes">[];
  noteIds: Set<string>;
  noteTitles: Map<string, string>;
  noteClusters: Map<string, string>;
  noteKinds: Map<string, GraphNodeKind>;
  sourcesByTarget: Map<string, Set<string>>;
  topTags: string[];
}

function computeTopTags(notes: CollectionEntry<"notes">[], n: number): string[] {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .toSorted((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, n)
    .map((entry) => entry.tag);
}

/** Primary cluster = first tag that falls in the global top-N; else CLUSTER_OTHER. Order of `tags` is significant. */
function pickCluster(tags: string[] | undefined, topTagSet: Set<string>): string {
  if (!tags) return CLUSTER_OTHER;
  for (const tag of tags) {
    if (topTagSet.has(tag)) return tag;
  }
  return CLUSTER_OTHER;
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

  const topTags = computeTopTags(
    publishedNotes.filter((n) => getNoteKind(n) === "content"),
    CLUSTER_TOP_N,
  );
  const topTagSet = new Set(topTags);
  const noteClusters = new Map(
    publishedNotes.map((note) => [note.id, pickCluster(note.data.tags, topTagSet)] as const),
  );
  const noteKinds = new Map(publishedNotes.map((note) => [note.id, getNoteKind(note)] as const));

  return {
    linksByNote: resolvedLinksByNote,
    notes: publishedNotes,
    noteIds: new Set(publishedNotes.map((note) => note.id)),
    noteTitles: new Map(publishedNotes.map((note) => [note.id, getNoteTitle(note)] as const)),
    noteClusters,
    noteKinds,
    sourcesByTarget,
    topTags,
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
    return { nodes: [], edges: [], topTags: context.topTags };
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
      cluster: context.noteClusters.get(note.id) ?? CLUSTER_OTHER,
      kind: context.noteKinds.get(note.id) ?? "content",
    }));

  const edges = collectEdges(context.linksByNote, (id) => neighborhood.has(id));

  return { nodes, edges, topTags: context.topTags };
}

export function buildGlobalGraphData(context: GraphBuildContext): GraphData {
  const nodes = context.notes.map((note) => ({
    id: note.id,
    title: context.noteTitles.get(note.id) ?? getNoteTitle(note),
    cluster: context.noteClusters.get(note.id) ?? CLUSTER_OTHER,
    kind: context.noteKinds.get(note.id) ?? "content",
  }));

  const edges = collectEdges(context.linksByNote, (id) => context.noteIds.has(id));

  return { nodes, edges, topTags: context.topTags };
}
