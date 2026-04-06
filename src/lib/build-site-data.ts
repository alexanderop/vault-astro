import { getCollection, type CollectionEntry } from "astro:content";
import { SITE } from "@/config";
import { buildBacklinksMap, type Backlink } from "@/features/backlinks/lib/backlink-resolver";
import {
  buildLocalGraphData,
  createGraphBuildContext,
  type GraphBuildContext,
  type GraphData,
} from "@/features/graph/lib/graph-data-builder";
import { buildSearchIndex, type SearchEntry } from "@/features/search/lib/search-index";
import {
  createCollectionNoteResolver,
  getPublishedNotes,
  type NoteResolver,
} from "@/lib/content-resolver";
import { buildNoteLinksIndex, type NoteLinksIndex } from "@/lib/note-links";

export interface BuildSiteData {
  notes: CollectionEntry<"notes">[];
  resolver: NoteResolver;
  searchIndex: SearchEntry[];
  linksByNote: NoteLinksIndex;
  backlinksMap: Map<string, Backlink[]>;
  graphByNote?: Map<string, GraphData>;
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
    SITE.showBacklinks
      ? buildBacklinksMap(notes, linksByNote, resolver)
      : new Map<string, Backlink[]>(),
  );
  const searchIndex = await withPerfLog("search index build", () =>
    SITE.showSearch ? buildSearchIndex(notes, resolver) : [],
  );
  const graphByNote = await withPerfLog("graph precompute", () => {
    if (!SITE.showGraph) {
      return undefined;
    }

    return precomputeGraphData(createGraphBuildContext(notes, linksByNote));
  });

  return {
    notes,
    resolver,
    searchIndex,
    linksByNote,
    backlinksMap,
    graphByNote,
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
