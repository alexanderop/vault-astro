const CONTENT_CLASS_ALLOWLIST = new Set([
  "content-compact",
  "content-relaxed",
  "content-serif",
  "content-sans",
  "content-callouts-soft",
]);

export function resolveContentClasses(cssclasses?: string[]) {
  if (!cssclasses?.length) {
    return [];
  }

  return cssclasses.filter((className) => CONTENT_CLASS_ALLOWLIST.has(className));
}
