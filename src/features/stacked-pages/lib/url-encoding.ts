const STACK_PREFIX = "stacked=";

export function encodeStack(slugs: string[]): string {
  if (slugs.length === 0) return "";
  return `#${STACK_PREFIX}${slugs.map(encodeURIComponent).join(",")}`;
}

export function decodeStack(hash: string): string[] {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw.startsWith(STACK_PREFIX)) return [];

  const value = raw.slice(STACK_PREFIX.length);
  if (!value) return [];

  return value.split(",").map(decodeURIComponent).filter(Boolean);
}
