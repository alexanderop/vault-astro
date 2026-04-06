import type { CollectionEntry } from "astro:content";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

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

const CONTENT_ROOT = resolve("./src/content/notes");
const ATTACHMENTS_ROOT = resolve("./public/attachments");
const WIKILINK_REGEX = /!?\[\[([^\]]+)\]\]/g;
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"]);
const EXCALIDRAW_SOURCE_EXTENSION = ".excalidraw";
const EXCALIDRAW_SVG_SUFFIX = ".excalidraw.svg";
const EXCALIDRAW_PUBLIC_DIR = "excalidraw";

let cachedFilesystemResolver: ContentResolver | null = null;

function normalizeLookupValue(value: string): string {
  return value
    .replaceAll("\\", "/")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/i, "")
    .toLowerCase();
}

function normalizePublicPath(value: string): string {
  const normalized = normalizeLookupValue(value);
  return normalized.replace(/^notes\//, "");
}

function getBasename(value: string): string {
  return normalizeLookupValue(value).split("/").at(-1) ?? normalizeLookupValue(value);
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  return [];
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

function parseScalar(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`(?:^|\\n)${key}:\\s*["']?([^"'\n]+)["']?`, "m"));
  return match?.[1]?.trim();
}

function parseList(frontmatter: string, key: string): string[] {
  const blockMatch = frontmatter.match(
    new RegExp(`(?:^|\\n)${key}:\\s*\\n((?:\\s*-\\s.*\\n?)*)`, "m"),
  );
  if (blockMatch && blockMatch[1].trim().length > 0) {
    return blockMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) =>
        line
          .slice(2)
          .trim()
          .replace(/^["']|["']$/g, ""),
      )
      .filter(Boolean);
  }

  const inlineMatch = frontmatter.match(new RegExp(`(?:^|\\n)${key}:\\s*\\[([^\\]]*)\\]`, "m"));
  if (!inlineMatch) return [];

  return inlineMatch[1]
    .split(",")
    .map((value) => value.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function extractFrontmatter(raw: string): { frontmatter: string; body: string } {
  if (!raw.startsWith("---\n")) {
    return { frontmatter: "", body: raw };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { frontmatter: "", body: raw };
  }

  return {
    frontmatter: raw.slice(4, end),
    body: raw.slice(end + 5),
  };
}

function inferIdFromFilePath(filePath: string, contentRoot = CONTENT_ROOT): string {
  return normalizePublicPath(filePath.slice(contentRoot.length + 1).replace(/\.md$/i, ""));
}

function inferEntryType(id: string): string {
  const folder = id.split("/")[0];

  if (folder === "authors") return "author";
  if (folder === "podcasts") return "podcast";
  if (folder === "newsletters") return "newsletter";
  if (folder === "tweets") return "tweet";
  if (folder === "notes") return "note";

  return folder;
}

function collectFiles(root: string): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectAttachmentCandidates(root: string): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectAttachmentCandidates(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function collectContentAssets(root: string): string[] {
  if (!existsSync(root)) return [];

  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectContentAssets(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function createAttachmentResolver(
  attachmentsRoot = ATTACHMENTS_ROOT,
): (target: string) => string | null {
  const candidates = collectAttachmentCandidates(attachmentsRoot);
  const byPath = new Map<string, string[]>();
  const byBasename = new Map<string, string[]>();

  for (const file of candidates) {
    const relPath = file.slice(attachmentsRoot.length + 1).replaceAll("\\", "/");
    const normalizedPath = normalizeLookupValue(relPath);
    const basename = getBasename(relPath);

    byPath.set(normalizedPath, [...(byPath.get(normalizedPath) ?? []), relPath]);
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), relPath]);
  }

  return (target: string) => {
    const normalizedTarget = normalizeLookupValue(target);
    const pathMatches = byPath.get(normalizedTarget) ?? [];
    if (pathMatches.length === 1) {
      return `/attachments/${pathMatches[0]}`;
    }

    const basenameMatches = byBasename.get(getBasename(target)) ?? [];
    if (basenameMatches.length === 1) {
      return `/attachments/${basenameMatches[0]}`;
    }

    return null;
  };
}

function createExcalidrawResolver(contentRoot = CONTENT_ROOT): (target: string) => string | null {
  const candidates = collectContentAssets(contentRoot)
    .filter((file) => file.endsWith(EXCALIDRAW_SVG_SUFFIX))
    .map((file) => file.slice(contentRoot.length + 1).replaceAll("\\", "/"));
  const byPath = new Map<string, string[]>();
  const byBasename = new Map<string, string[]>();

  for (const relPath of candidates) {
    const normalizedPath = normalizeLookupValue(relPath.replace(/\.svg$/i, ""));
    const basename = getBasename(relPath.replace(/\.svg$/i, ""));

    byPath.set(normalizedPath, [...(byPath.get(normalizedPath) ?? []), relPath]);
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), relPath]);
  }

  return (target: string) => {
    const normalizedTarget = normalizeLookupValue(target);
    const pathMatches = byPath.get(normalizedTarget) ?? [];
    if (pathMatches.length === 1) {
      return `/${EXCALIDRAW_PUBLIC_DIR}/${pathMatches[0]}`;
    }

    const basenameMatches = byBasename.get(getBasename(target)) ?? [];
    if (basenameMatches.length === 1) {
      return `/${EXCALIDRAW_PUBLIC_DIR}/${basenameMatches[0]}`;
    }

    return null;
  };
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

function createResolver(entries: ResolvedContentEntry[]): ContentResolver {
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

  const resolveAttachment = createAttachmentResolver();
  const resolveExcalidraw = createExcalidrawResolver();

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
    resolveAttachment,
    resolveExcalidraw,
  };
}

export function getPublishedNotes(notes: CollectionEntry<"notes">[]): CollectionEntry<"notes">[] {
  return notes.filter((note) => isPublishedNote(note.id, note.data.publish));
}

export function createCollectionContentResolver(
  notes: CollectionEntry<"notes">[],
): ContentResolver {
  return createResolver(notes.map(toResolvedEntry));
}

export function createFilesystemContentResolver(options?: {
  contentRoot?: string;
  attachmentsRoot?: string;
}): ContentResolver {
  const contentRoot = options?.contentRoot ? resolve(options.contentRoot) : CONTENT_ROOT;
  const attachmentsRoot = options?.attachmentsRoot
    ? resolve(options.attachmentsRoot)
    : ATTACHMENTS_ROOT;
  const entries = collectFiles(contentRoot).map((filePath) => {
    const raw = readFileSync(filePath, "utf8");
    const { frontmatter, body } = extractFrontmatter(raw);
    const title = parseScalar(frontmatter, "title") ?? parseScalar(frontmatter, "name");
    const name = parseScalar(frontmatter, "name");
    const slug = parseScalar(frontmatter, "slug");
    const permalink = normalizePermalink(parseScalar(frontmatter, "permalink"));
    const aliases = [
      ...parseList(frontmatter, "aliases"),
      ...(title ? [title] : []),
      ...(name ? [name] : []),
    ];
    const publish = !/(?:^|\n)publish:\s*false\b/m.test(frontmatter);
    const id = inferIdFromFilePath(filePath, contentRoot);

    return {
      id,
      publicPath: permalink ?? id,
      title: title ?? id.split("/").at(-1) ?? id,
      type: parseScalar(frontmatter, "type") ?? inferEntryType(id),
      publish: isPublishedNote(id, publish),
      slug,
      permalink,
      aliases,
      body,
      filePath,
    } satisfies ResolvedContentEntry;
  });

  const resolver = createResolver(entries);

  return {
    ...resolver,
    resolveAttachment: createAttachmentResolver(attachmentsRoot),
    resolveExcalidraw: createExcalidrawResolver(contentRoot),
  };
}

export function getFilesystemContentResolver(): ContentResolver {
  if (cachedFilesystemResolver) {
    return cachedFilesystemResolver;
  }

  cachedFilesystemResolver = createFilesystemContentResolver();
  return cachedFilesystemResolver;
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
