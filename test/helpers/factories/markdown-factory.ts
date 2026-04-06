export function wikilinks(...targets: string[]): string {
  return targets.map((target) => `[[${target}]]`).join(" ");
}

export function aliasedWikilink(target: string, alias: string): string {
  return `[[${target}|${alias}]]`;
}

export function embeddedWikilink(target: string): string {
  return `![[${target}]]`;
}
