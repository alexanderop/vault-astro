export function normalizeLookupValue(value: string): string {
  return value
    .replaceAll("\\", "/")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.md$/i, "")
    .toLowerCase();
}

export function extractFrontmatter(raw: string): { body: string; frontmatter: string } {
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

export function toStringList(value: unknown): string[] {
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
