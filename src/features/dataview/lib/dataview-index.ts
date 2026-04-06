import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  extractWikilinks,
  getEntryHref,
  type ContentResolver,
  type ResolvedContentEntry,
} from "../../../lib/content-resolver";
import { createFilesystemContentResolver } from "../../../lib/content-resolver.server";
import type {
  DataviewIndex,
  DataviewLink,
  DataviewPage,
  DataviewTask,
  DataviewTaskRow,
  FileContext,
} from "./dataview-types";

const DEFAULT_DATAVIEW_CONTENT_ROOT = resolve("./src/content/notes");

export interface CreateDataviewIndexOptions {
  contentRoot?: string;
  resolver?: ContentResolver;
}

let cachedIndex: DataviewIndex | null = null;

export function normalizeLookupValue(value: string): string {
  return value
    .replaceAll("\\", "/")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/i, "")
    .toLowerCase();
}

function collectMarkdownFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractFrontmatter(raw: string): { body: string; frontmatter: string } {
  if (!raw.startsWith("---\n")) {
    return { body: raw, frontmatter: "" };
  }

  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) {
    return { body: raw, frontmatter: "" };
  }

  return {
    body: raw.slice(end + 5),
    frontmatter: raw.slice(4, end),
  };
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)]),
    );
  }

  if (typeof value === "string") {
    const parsedDate = new Date(value);
    if (
      !Number.isNaN(parsedDate.getTime()) &&
      /^\d{4}-\d{2}-\d{2}(?:[tT].*)?$/.test(value.trim())
    ) {
      return parsedDate;
    }
  }

  return value;
}

function getTitle(frontmatter: Record<string, unknown>, relativePath: string): string {
  const title = frontmatter.title;
  const name = frontmatter.name;
  if (typeof title === "string" && title.trim().length > 0) return title;
  if (typeof name === "string" && name.trim().length > 0) return name;
  return basename(relativePath, ".md");
}

function getFrontmatterLines(frontmatter: string): string[] {
  return frontmatter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }

  return [];
}

function toTagList(value: unknown): string[] {
  return toStringList(value).map((item) => (item.startsWith("#") ? item : `#${item}`));
}

function inferDay(relativePath: string, frontmatter: Record<string, unknown>): Date | undefined {
  const dateField = frontmatter.date;
  if (dateField instanceof Date && !Number.isNaN(dateField.getTime())) {
    return dateField;
  }

  const fileName = basename(relativePath, ".md");
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (!match) return undefined;

  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function isPublished(frontmatter: Record<string, unknown>): boolean {
  return frontmatter.publish !== false;
}

function extractTaskTags(text: string): string[] {
  return [...text.matchAll(/(^|\s)(#[A-Za-z0-9/_-]+)/g)].map((match) => match[2]);
}

function extractTasks(body: string, page: DataviewPage): DataviewTaskRow[] {
  const lines = body.split("\n");
  const tasks: DataviewTaskRow[] = [];
  let currentSection: string | undefined;

  for (const [index, line] of lines.entries()) {
    const headingMatch = line.match(/^\s*#+\s+(.*)$/);
    if (headingMatch) {
      currentSection = headingMatch[1]?.trim() || undefined;
      continue;
    }

    const taskMatch = line.match(/^(\s*)-\s*\[([ xX-])\]\s+(.*)$/);
    if (!taskMatch) {
      continue;
    }

    const status = taskMatch[2];
    const text = taskMatch[3]?.trim() ?? "";
    const completed = status.toLowerCase() === "x";

    const task: DataviewTask = {
      checked: status !== " ",
      completed,
      line: index + 1,
      path: page.file.path,
      section: currentSection,
      status,
      tags: extractTaskTags(text),
      text,
      visual: line.trim(),
    };

    tasks.push({
      file: page.file,
      page,
      task,
    });
  }

  return tasks;
}

function createDataviewPage(
  filePath: string,
  contentRoot: string,
  resolver: ContentResolver,
): DataviewPage | null {
  const raw = readFileSync(filePath, "utf8");
  const { frontmatter } = extractFrontmatter(raw);
  const relativePath = filePath.slice(contentRoot.length + 1).replaceAll("\\", "/");
  const normalizedRelativePath = normalizeLookupValue(relativePath);
  const parsedFrontmatter =
    frontmatter.trim().length > 0
      ? (parseYaml(frontmatter) as Record<string, unknown> | null)
      : null;
  const data = normalizeValue(parsedFrontmatter ?? {}) as Record<string, unknown>;

  if (!isPublished(data)) {
    return null;
  }

  const resolved = resolver.resolve(normalizedRelativePath);
  const title = getTitle(data, relativePath);
  const stats = statSync(filePath);
  const aliases = toStringList(data.aliases);
  const tags = toTagList(data.tags);
  const fileLink: DataviewLink = {
    display: title,
    href:
      resolved.status === "resolved" ? getEntryHref(resolved.entry) : `/${normalizedRelativePath}`,
    path: normalizedRelativePath,
  };

  return {
    ...data,
    file: {
      aliases,
      cday: stats.birthtime ? new Date(stats.birthtime) : undefined,
      day: inferDay(relativePath, data),
      etags: tags,
      ext: extname(relativePath).replace(/^\./, ""),
      folder: relativePath.includes("/")
        ? relativePath.slice(0, relativePath.lastIndexOf("/"))
        : "",
      frontmatter: getFrontmatterLines(frontmatter),
      inlinks: [],
      link: fileLink,
      mday: stats.mtime ? new Date(stats.mtime) : undefined,
      name: basename(relativePath, ".md"),
      outlinks: [],
      path: relativePath,
      tags,
    },
  };
}

function getResolvedEntryLookupKeys(
  entry: Pick<ResolvedContentEntry, "filePath" | "id" | "publicPath">,
  contentRoot: string,
): string[] {
  const keys = new Set<string>();

  if (typeof entry.filePath === "string" && entry.filePath.startsWith(contentRoot)) {
    const relativePath = entry.filePath.slice(contentRoot.length + 1).replaceAll("\\", "/");
    keys.add(normalizeLookupValue(relativePath));
  }

  keys.add(normalizeLookupValue(entry.id));
  keys.add(normalizeLookupValue(entry.publicPath));
  return [...keys];
}

function resolvePageFromEntry(
  entry: Pick<ResolvedContentEntry, "filePath" | "id" | "publicPath">,
  byContentPath: Map<string, DataviewPage>,
  contentRoot: string,
): DataviewPage | null {
  for (const key of getResolvedEntryLookupKeys(entry, contentRoot)) {
    const page = byContentPath.get(key);
    if (page) {
      return page;
    }
  }

  return null;
}

export function createDataviewIndex(options?: CreateDataviewIndexOptions): DataviewIndex {
  const contentRoot = resolve(options?.contentRoot ?? DEFAULT_DATAVIEW_CONTENT_ROOT);
  const resolver = options?.resolver ?? createFilesystemContentResolver({ contentRoot });
  const useCache = !options?.resolver && contentRoot === DEFAULT_DATAVIEW_CONTENT_ROOT;

  if (useCache && cachedIndex) {
    return cachedIndex;
  }

  const pages: DataviewPage[] = [];
  const tasks: DataviewTaskRow[] = [];
  const byAbsolutePath = new Map<string, DataviewPage>();
  const byContentPath = new Map<string, DataviewPage>();

  for (const filePath of collectMarkdownFiles(contentRoot)) {
    const page = createDataviewPage(filePath, contentRoot, resolver);
    if (!page) {
      continue;
    }

    pages.push(page);
    const raw = readFileSync(filePath, "utf8");
    const { body } = extractFrontmatter(raw);
    tasks.push(...extractTasks(body, page));
    byAbsolutePath.set(filePath, page);
    byContentPath.set(normalizeLookupValue(page.file.path), page);
  }

  for (const page of pages) {
    const raw = readFileSync(resolve(contentRoot, page.file.path), "utf8");
    const { body } = extractFrontmatter(raw);
    const seen = new Set<string>();

    for (const wikilink of extractWikilinks(body)) {
      if (wikilink.isEmbed) continue;

      const resolved = resolver.resolve(wikilink.target);
      if (resolved.status !== "resolved") continue;

      const targetPage = resolvePageFromEntry(resolved.entry, byContentPath, contentRoot);
      if (!targetPage) continue;

      const targetPath = normalizeLookupValue(targetPage.file.path);
      if (seen.has(targetPath)) continue;

      seen.add(targetPath);
      page.file.outlinks.push(targetPage.file.link);
    }
  }

  const inbound = new Map<string, DataviewLink[]>();
  for (const page of pages) {
    for (const link of page.file.outlinks) {
      inbound.set(link.path, [...(inbound.get(link.path) ?? []), page.file.link]);
    }
  }

  for (const page of pages) {
    page.file.inlinks.push(...(inbound.get(normalizeLookupValue(page.file.path)) ?? []));
  }

  const index: DataviewIndex = {
    byAbsolutePath,
    byContentPath,
    pages,
    tasks,
    resolveLinkTarget(target: string) {
      const resolved = resolver.resolve(target);
      if (resolved.status !== "resolved") return null;
      return resolvePageFromEntry(resolved.entry, byContentPath, contentRoot);
    },
  };

  if (useCache) {
    cachedIndex = index;
  }

  return index;
}

export function resolveCurrentDataviewPage(
  file: FileContext,
  index: DataviewIndex,
  contentRoot = DEFAULT_DATAVIEW_CONTENT_ROOT,
): DataviewPage | null {
  const candidatePath = file.path ?? file.history?.[0];
  if (!candidatePath) return null;

  return (
    index.byAbsolutePath.get(candidatePath) ??
    index.byContentPath.get(normalizeLookupValue(candidatePath.replace(`${contentRoot}/`, ""))) ??
    null
  );
}
