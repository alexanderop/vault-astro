import { getCollection, type CollectionEntry } from "astro:content";
import { buildBacklinksMap, type Backlink } from "@/features/backlinks/lib/backlink-resolver";
import {
  buildGlobalGraphData,
  buildLocalGraphData,
  createGraphBuildContext,
  type GraphBuildContext,
  type GraphData,
} from "@/features/graph/lib/graph-data-builder";
import { buildTagIndex, type TagEntry } from "@/features/tags/lib/tag-index";
import { buildTypeIndex, type TypeEntry } from "@/features/types/lib/type-index";
import { buildSearchIndex, type SearchEntry } from "@/features/search/lib/search-index";
import {
  createCollectionNoteResolver,
  getPublishedNotes,
  type NoteResolver,
} from "@/lib/content-resolver";
import { buildNoteLinksIndex, type NoteLinksIndex } from "@/lib/note-links";

interface BuildSiteData {
  notes: CollectionEntry<"notes">[];
  resolver: NoteResolver;
  searchIndex: SearchEntry[];
  linksByNote: NoteLinksIndex;
  backlinksMap: Map<string, Backlink[]>;
  graphByNote?: Map<string, GraphData>;
  globalGraph?: GraphData;
  tagIndex: TagEntry[];
  typeIndex: TypeEntry[];
}

let cachedBuildSiteDataPromise: Promise<BuildSiteData> | null = null;

function isPerfLoggingEnabled(): boolean {
  return process.env.DEBUG_BUILD_PERF === "1";
}

async function withPerfLog<T>(label: string, action: () => Promise<T> | T): Promise<T> {
  const start = performance.now();
  const result = await action();

  if (isPerfLoggingEnabled()) {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    console.info(`[build-perf] ${label}: ${duration}ms`);
  }

  return result;
}

function precomputeGraphData(context: GraphBuildContext): Map<string, GraphData> {
  const graphByNote = new Map<string, GraphData>();

  for (const note of context.notes) {
    graphByNote.set(note.id, buildLocalGraphData(context, note.id));
  }

  return graphByNote;
}

async function buildSiteData(): Promise<BuildSiteData> {
  const notes = await withPerfLog("note collection load", async () =>
    getPublishedNotes(await getCollection("notes")),
  );
  const resolver = await withPerfLog("resolver creation", () =>
    createCollectionNoteResolver(notes),
  );
  const linksByNote = await withPerfLog("note-links index build", () =>
    buildNoteLinksIndex(notes, resolver),
  );
  const backlinksMap = await withPerfLog("backlinks build", () =>
    buildBacklinksMap(notes, linksByNote, resolver),
  );
  const searchIndex = await withPerfLog("search index build", () =>
    buildSearchIndex(notes, resolver),
  );
  const graphContext = createGraphBuildContext(notes, linksByNote);
  const [graphByNote, globalGraph, tagIndex, typeIndex] = await Promise.all([
    withPerfLog("graph precompute", () => precomputeGraphData(graphContext)),
    withPerfLog("global graph build", () => buildGlobalGraphData(graphContext)),
    withPerfLog("tag index build", () => buildTagIndex(notes)),
    withPerfLog("type index build", () => buildTypeIndex(notes)),
  ]);

  return {
    notes,
    resolver,
    searchIndex,
    linksByNote,
    backlinksMap,
    graphByNote,
    globalGraph,
    tagIndex,
    typeIndex,
  };
}

export async function getBuildSiteData(): Promise<BuildSiteData> {
  if (!cachedBuildSiteDataPromise) {
    cachedBuildSiteDataPromise = buildSiteData().catch((error: unknown) => {
      cachedBuildSiteDataPromise = null;
      throw error;
    });
  }

  return cachedBuildSiteDataPromise;
}

export function clearBuildSiteDataCache() {
  cachedBuildSiteDataPromise = null;
}
