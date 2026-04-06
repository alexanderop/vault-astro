import { readFileSync } from "node:fs";
import { extractFrontmatter, normalizeLookupValue } from "./content-utils";
import { collectFilesRecursive } from "./filesystem";
import {
  createEntriesContentResolver,
  inferEntryType,
  isPublishedNote,
  type ContentResolver,
  type NoteResolver,
  type ResolvedContentEntry,
} from "./content-resolver";

const CONTENT_ROOT = "src/content/notes";
const ATTACHMENTS_ROOT = "public/attachments";
const EXCALIDRAW_SVG_SUFFIX = ".excalidraw.svg";
const EXCALIDRAW_PUBLIC_DIR = "excalidraw";

let cachedFilesystemResolver: ContentResolver | null = null;
let cachedAssetResolver: Pick<ContentResolver, "resolveAttachment" | "resolveExcalidraw"> | null =
  null;

function getBasename(value: string): string {
  return normalizeLookupValue(value).split("/").at(-1) ?? normalizeLookupValue(value);
}

function normalizePublicPath(value: string): string {
  const normalized = normalizeLookupValue(value);
  return normalized.replace(/^notes\//, "");
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

function inferIdFromFilePath(filePath: string, contentRoot = CONTENT_ROOT): string {
  return normalizePublicPath(filePath.slice(contentRoot.length + 1).replace(/\.md$/i, ""));
}

function collectFiles(root: string): string[] {
  return collectFilesRecursive(root, (entry) => entry.name.endsWith(".md"));
}

function collectAttachmentCandidates(root: string): string[] {
  return collectFilesRecursive(root, () => true);
}

function collectContentAssets(root: string): string[] {
  return collectFilesRecursive(root, () => true);
}

function createRelativePathResolver(
  candidates: string[],
  toPublicPath: (relativePath: string) => string,
  normalizeCandidate: (relativePath: string) => string = (relativePath) => relativePath,
): (target: string) => string | null {
  const byPath = new Map<string, string[]>();
  const byBasename = new Map<string, string[]>();

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeCandidate(candidate);
    const normalizedPath = normalizeLookupValue(normalizedCandidate);
    const basename = getBasename(normalizedCandidate);

    byPath.set(normalizedPath, [...(byPath.get(normalizedPath) ?? []), candidate]);
    byBasename.set(basename, [...(byBasename.get(basename) ?? []), candidate]);
  }

  return (target: string) => {
    const normalizedTarget = normalizeLookupValue(target);
    const pathMatches = byPath.get(normalizedTarget) ?? [];
    if (pathMatches.length === 1) {
      return toPublicPath(pathMatches[0]);
    }

    const basenameMatches = byBasename.get(getBasename(target)) ?? [];
    if (basenameMatches.length === 1) {
      return toPublicPath(basenameMatches[0]);
    }

    return null;
  };
}

function createAttachmentResolver(
  attachmentsRoot = ATTACHMENTS_ROOT,
): (target: string) => string | null {
  const candidates = collectAttachmentCandidates(attachmentsRoot);
  const relativeCandidates = candidates.map((file) =>
    file.slice(attachmentsRoot.length + 1).replaceAll("\\", "/"),
  );

  return createRelativePathResolver(
    relativeCandidates,
    (relativePath) => `/attachments/${relativePath}`,
  );
}

function createExcalidrawResolver(contentRoot = CONTENT_ROOT): (target: string) => string | null {
  const candidates = collectContentAssets(contentRoot)
    .filter((file) => file.endsWith(EXCALIDRAW_SVG_SUFFIX))
    .map((file) => file.slice(contentRoot.length + 1).replaceAll("\\", "/"));

  return createRelativePathResolver(
    candidates,
    (relativePath) => `/${EXCALIDRAW_PUBLIC_DIR}/${relativePath}`,
    (relativePath) => relativePath.replace(/\.svg$/i, ""),
  );
}

function createAssetResolver(options?: {
  contentRoot?: string;
  attachmentsRoot?: string;
}): Pick<ContentResolver, "resolveAttachment" | "resolveExcalidraw"> {
  const contentRoot = options?.contentRoot ?? CONTENT_ROOT;
  const attachmentsRoot = options?.attachmentsRoot ?? ATTACHMENTS_ROOT;

  return {
    resolveAttachment: createAttachmentResolver(attachmentsRoot),
    resolveExcalidraw: createExcalidrawResolver(contentRoot),
  };
}

function getCachedAssetResolver(): Pick<
  ContentResolver,
  "resolveAttachment" | "resolveExcalidraw"
> {
  if (cachedAssetResolver) {
    return cachedAssetResolver;
  }

  cachedAssetResolver = createAssetResolver();
  return cachedAssetResolver;
}

function createFilesystemNoteResolver(options?: { contentRoot?: string }): NoteResolver {
  const contentRoot = options?.contentRoot ?? CONTENT_ROOT;
  const entries = collectFiles(contentRoot).map((filePath) => {
    const raw = readFileSync(filePath, "utf8");
    const { frontmatter, body } = extractFrontmatter(raw);
    const title = parseScalar(frontmatter, "title") ?? parseScalar(frontmatter, "name");
    const name = parseScalar(frontmatter, "name");
    const slug = parseScalar(frontmatter, "slug");
    const permalink = parseScalar(frontmatter, "permalink");
    const normalizedPermalink = permalink ? normalizeLookupValue(permalink) : undefined;
    const aliases = [
      ...parseList(frontmatter, "aliases"),
      ...(title ? [title] : []),
      ...(name ? [name] : []),
    ];
    const publish = !/(?:^|\n)publish:\s*false\b/m.test(frontmatter);
    const id = inferIdFromFilePath(filePath, contentRoot);

    return {
      id,
      publicPath: normalizedPermalink ?? id,
      title: title ?? id.split("/").at(-1) ?? id,
      type: parseScalar(frontmatter, "type") ?? inferEntryType(id),
      publish: isPublishedNote(id, publish),
      slug,
      permalink: normalizedPermalink,
      aliases,
      body,
      filePath,
    } satisfies ResolvedContentEntry;
  });

  return createEntriesContentResolver(entries);
}

export function createFilesystemContentResolver(options?: {
  contentRoot?: string;
  attachmentsRoot?: string;
}): ContentResolver {
  return {
    ...createFilesystemNoteResolver(options),
    ...createAssetResolver(options),
  };
}

export function getFilesystemContentResolver(): ContentResolver {
  if (cachedFilesystemResolver) {
    return cachedFilesystemResolver;
  }

  cachedFilesystemResolver = {
    ...createFilesystemNoteResolver(),
    ...getCachedAssetResolver(),
  };
  return cachedFilesystemResolver;
}
