import type { CollectionEntry } from "astro:content";
import { normalizeLookupValue, toStringList } from "./content-utils";
import { isPublishedWikiEntry } from "./wiki";

interface ParsedWikilink {
  isEmbed: boolean;
  target: string;
  heading?: string;
  blockRef?: string;
  alias?: string;
}

export interface ResolvedContentEntry {
  id: string;
  publicPath: string;
  title: string;
  type: string;
  publish: boolean;
  slug?: string;
  permalink?: string;
  aliases: string[];
  filePath?: string;
  body?: string;
  data?: Record<string, unknown>;
}

export interface ResolveSuccess {
  status: "resolved";
  entry: ResolvedContentEntry;
}

export interface ResolveMissing {
  status: "missing";
  target: string;
}

export interface ResolveAmbiguous {
  status: "ambiguous";
  target: string;
  matches: ResolvedContentEntry[];
}

export type ResolveResult = ResolveSuccess | ResolveMissing | ResolveAmbiguous;

interface ResolverMaps {
  byId: Map<string, ResolvedContentEntry[]>;
  bySlug: Map<string, ResolvedContentEntry[]>;
  byPermalink: Map<string, ResolvedContentEntry[]>;
  byBasename: Map<string, ResolvedContentEntry[]>;
  byAlias: Map<string, ResolvedContentEntry[]>;
}

function resolveByMap(map: Map<string, ResolvedContentEntry[]>, key: string): ResolveResult | null {
  const matches = map.get(key) ?? [];
  if (matches.length === 0) return null;
  if (matches.length === 1) return { status: "resolved", entry: matches[0] };
  return { status: "ambiguous", target: key, matches };
}

export interface ContentResolver {
  entries: ResolvedContentEntry[];
  resolve: (target: string) => ResolveResult;
  resolveAttachment: (target: string) => string | null;
  resolveExcalidraw: (target: string) => string | null;
}

export type NoteResolver = Pick<ContentResolver, "entries" | "resolve">;

const WIKILINK_REGEX = /!?\[\[([^\]]+)\]\]/g;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"]);
const EXCALIDRAW_SOURCE_EXTENSION = ".excalidraw";

function getBasename(value: string): string {
  return normalizeLookupValue(value).split("/").at(-1) ?? normalizeLookupValue(value);
}

function toTitle(entry: CollectionEntry<"notes">): string {
  const title = entry.data.title;
  const name = entry.data.name;
  return typeof title === "string" && title.trim().length > 0
    ? title
    : typeof name === "string" && name.trim().length > 0
      ? name
      : (entry.id.split("/").at(-1) ?? entry.id);
}

function normalizePermalink(permalink?: string): string | undefined {
  if (!permalink || typeof permalink !== "string") return undefined;
  const normalized = normalizeLookupValue(permalink);
  return normalized.length > 0 ? normalized : undefined;
}

function toResolvedEntry(entry: CollectionEntry<"notes">): ResolvedContentEntry {
  const aliases = [
    ...toStringList(entry.data.aliases),
    ...(typeof entry.data.title === "string" ? [entry.data.title] : []),
    ...(typeof entry.data.name === "string" ? [entry.data.name] : []),
  ];
  const slug = typeof entry.data.slug === "string" ? entry.data.slug : undefined;
  const permalink = normalizePermalink(
    typeof entry.data.permalink === "string" ? entry.data.permalink : undefined,
  );

  return {
    id: entry.id,
    publicPath: permalink ?? entry.id,
    title: toTitle(entry),
    type: typeof entry.data.type === "string" ? entry.data.type : inferEntryType(entry.id),
    publish: isPublishedNote(entry.id, entry.data.publish),
    slug,
    permalink,
    aliases,
    body: entry.body,
    data: entry.data as Record<string, unknown>,
  };
}

export function inferEntryType(id: string): string {
  const folder = id.split("/")[0];

  if (folder === "authors") return "author";
  if (folder === "podcasts") return "podcast";
  if (folder === "newsletters") return "newsletter";
  if (folder === "tweets") return "tweet";
  if (folder === "notes") return "note";
  if (folder === "sources") return "source";

  return folder;
}

function addLookup(
  map: Map<string, ResolvedContentEntry[]>,
  key: string | undefined,
  entry: ResolvedContentEntry,
) {
  if (!key) return;

  const normalizedKey = normalizeLookupValue(key);
  if (!normalizedKey) return;

  map.set(normalizedKey, [...(map.get(normalizedKey) ?? []), entry]);
}

export function createEntriesContentResolver(entries: ResolvedContentEntry[]): NoteResolver {
  const publishedEntries = entries.filter((entry) => entry.publish);
  const maps: ResolverMaps = {
    byId: new Map(),
    bySlug: new Map(),
    byPermalink: new Map(),
    byBasename: new Map(),
    byAlias: new Map(),
  };

  for (const entry of publishedEntries) {
    addLookup(maps.byId, entry.id, entry);
    addLookup(maps.bySlug, entry.slug, entry);
    addLookup(maps.byPermalink, entry.permalink, entry);
    addLookup(maps.byBasename, getBasename(entry.id), entry);

    for (const alias of entry.aliases) {
      addLookup(maps.byAlias, alias, entry);
    }
  }

  return {
    entries: publishedEntries,
    resolve(target: string): ResolveResult {
      const normalizedTarget = normalizeLookupValue(target);
      if (!normalizedTarget) {
        return { status: "missing", target };
      }

      return (
        resolveByMap(maps.byId, normalizedTarget) ??
        resolveByMap(maps.bySlug, normalizedTarget) ??
        resolveByMap(maps.byPermalink, normalizedTarget) ??
        resolveByMap(maps.byBasename, getBasename(normalizedTarget)) ??
        resolveByMap(maps.byAlias, normalizedTarget) ?? {
          status: "missing",
          target,
        }
      );
    },
  };
}

export function getPublishedNotes(notes: CollectionEntry<"notes">[]): CollectionEntry<"notes">[] {
  return notes.filter(
    (note) => isPublishedNote(note.id, note.data.publish) && isPublishedWikiEntry(note),
  );
}

export function createCollectionNoteResolver(notes: CollectionEntry<"notes">[]): NoteResolver {
  return createEntriesContentResolver(notes.map(toResolvedEntry));
}

export function createCollectionContentResolver(
  notes: CollectionEntry<"notes">[],
): ContentResolver {
  const resolver = createCollectionNoteResolver(notes);

  return {
    ...resolver,
    resolveAttachment() {
      return null;
    },
    resolveExcalidraw() {
      return null;
    },
  };
}

export function isImageTarget(target: string): boolean {
  const extension = target.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.has(extension);
}

export function isExcalidrawTarget(target: string): boolean {
  return normalizeLookupValue(target).endsWith(EXCALIDRAW_SOURCE_EXTENSION);
}

export function isPublishedNote(id: string, publish: boolean | undefined): boolean {
  return publish !== false && !isExcalidrawTarget(id);
}

export function slugifyWikilinkFragment(fragment: string): string {
  return fragment
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function parseWikilink(raw: string): ParsedWikilink {
  const isEmbed = raw.startsWith("!");
  const inner = raw.replace(/^!?\[\[|\]\]$/g, "");
  const [pathPart, alias] = inner.split("|").map((segment) => segment.trim());

  let target = pathPart;
  let heading: string | undefined;
  let blockRef: string | undefined;

  const hashIndex = pathPart.indexOf("#");
  if (hashIndex !== -1) {
    target = pathPart.slice(0, hashIndex);
    const fragment = pathPart.slice(hashIndex + 1);
    if (fragment.startsWith("^")) {
      blockRef = fragment.slice(1);
    } else {
      heading = fragment;
    }
  }

  return { isEmbed, target, heading, blockRef, alias };
}

export function extractWikilinks(markdown: string): ParsedWikilink[] {
  const matches: ParsedWikilink[] = [];
  const regex = new RegExp(WIKILINK_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdown)) !== null) {
    matches.push(parseWikilink(match[0]));
  }

  return matches;
}

export function getEntryHref(entry: Pick<ResolvedContentEntry, "publicPath">): string {
  return `/${entry.publicPath}`;
}

export function targetToHref(
  resolver: Pick<ContentResolver, "resolve">,
  target: string,
  heading?: string,
  blockRef?: string,
): string | null {
  const resolved = resolver.resolve(target);
  if (resolved.status !== "resolved") {
    return null;
  }

  let href = getEntryHref(resolved.entry);

  if (blockRef) {
    href += `#^${blockRef}`;
  } else if (heading) {
    href += `#${slugifyWikilinkFragment(heading)}`;
  }

  return href;
}

export function getEntryType(entry: CollectionEntry<"notes"> | ResolvedContentEntry): string {
  if ("type" in entry && typeof entry.type === "string") {
    return entry.type;
  }

  const rawType = "data" in entry ? entry.data?.type : undefined;
  return typeof rawType === "string" ? rawType : inferEntryType(entry.id);
}
