import { getFilesystemContentResolver } from "../src/lib/content-resolver.server.ts";
import { extractWikilinks } from "../src/lib/content-resolver.ts";

const resolver = getFilesystemContentResolver();

const linkFindings = [];
const inboundCounts = new Map();
const outboundCounts = new Map();

for (const entry of resolver.entries) {
  const links = extractWikilinks(entry.body ?? "");
  outboundCounts.set(entry.id, links.length);

  for (const link of links) {
    const resolved = resolver.resolve(link.target);

    if (resolved.status === "resolved") {
      inboundCounts.set(resolved.entry.id, (inboundCounts.get(resolved.entry.id) ?? 0) + 1);
      continue;
    }

    linkFindings.push({
      from: entry.id,
      target: link.target,
      status: resolved.status,
      matches:
        resolved.status === "ambiguous" ? resolved.matches.map((match) => match.id).join(", ") : "",
    });
  }
}

const orphanedEntries = resolver.entries
  .filter((entry) => (inboundCounts.get(entry.id) ?? 0) === 0)
  .map((entry) => entry.id)
  .toSorted();

const summary = {
  publishedEntries: resolver.entries.length,
  brokenLinks: linkFindings.filter((item) => item.status === "missing").length,
  ambiguousLinks: linkFindings.filter((item) => item.status === "ambiguous").length,
  orphanedEntries: orphanedEntries.length,
};

console.log(JSON.stringify(summary, null, 2));

if (linkFindings.length > 0) {
  console.log("\nUnresolved links:");
  for (const finding of linkFindings.slice(0, 100)) {
    console.log(
      `- ${finding.status.toUpperCase()}: ${finding.from} -> [[${finding.target}]]${finding.matches ? ` (${finding.matches})` : ""}`,
    );
  }
}

if (orphanedEntries.length > 0) {
  console.log("\nOrphaned entries:");
  for (const entry of orphanedEntries.slice(0, 100)) {
    console.log(`- ${entry}`);
  }
}

if (summary.brokenLinks > 0 || summary.ambiguousLinks > 0) {
  process.exit(1);
}
