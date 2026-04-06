import type { Root, Text, Html, RootContent } from "mdast";
import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { readFileSync } from "node:fs";
import { isImageTarget, parseWikilink, type ContentResolver } from "../../../lib/content-resolver";
import { getFilesystemContentResolver } from "../../../lib/content-resolver.server";

const EMBED_REGEX = /!\[\[([^\]]+)\]\]/g;

function extractSection(nodes: RootContent[], heading: string): RootContent[] {
  let capturing = false;
  let captureDepth = 0;
  const result: RootContent[] = [];

  for (const node of nodes) {
    if (node.type === "heading") {
      if (capturing && node.depth <= captureDepth) break;

      const headingText = node.children.map((c) => ("value" in c ? c.value : "")).join("");

      if (!capturing && headingText.toLowerCase() === heading.toLowerCase()) {
        capturing = true;
        captureDepth = node.depth;
        result.push(node);
        continue;
      }
    }

    if (capturing) {
      result.push(node);
    }
  }

  return result;
}

function extractBlock(nodes: RootContent[], blockRef: string): RootContent[] {
  for (const node of nodes) {
    if (node.type !== "paragraph" && node.type !== "listItem") continue;

    const text = JSON.stringify(node);
    if (text.includes(`^${blockRef}`)) {
      return [node];
    }
  }

  return [];
}

/**
 * Remark plugin that resolves note embeds (![[Note]]) by reading
 * the target markdown file and injecting its parsed AST nodes.
 *
 * Runs before remarkWikilinks so that embedded content gets
 * processed by all subsequent remark plugins.
 *
 * Image embeds (![[image.png]]) are skipped — handled by remarkWikilinks.
 */
export function remarkEmbeds(options?: { resolver?: ContentResolver }) {
  const resolver = options?.resolver ?? getFilesystemContentResolver();

  return (tree: Root) => {
    // Track visited files to prevent infinite recursion
    const visited = new Set<string>();

    function processTree(t: Root) {
      visit(t, "text", (node: Text, index, parent) => {
        if (!parent || index === undefined) return;
        if (!node.value.includes("![[")) return;

        const children: (Text | Html | RootContent)[] = [];
        let lastIndex = 0;
        let hasReplacements = false;

        const regex = new RegExp(EMBED_REGEX.source, "g");
        let match: RegExpExecArray | null;

        while ((match = regex.exec(node.value)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            children.push({
              type: "text",
              value: node.value.slice(lastIndex, match.index),
            });
          }

          const parsed = parseWikilink(match[0]);

          // Skip image embeds — handled by remarkWikilinks
          if (isImageTarget(parsed.target)) {
            children.push({
              type: "text",
              value: match[0],
            });
            lastIndex = match.index + match[0].length;
            continue;
          }

          const resolved = resolver.resolve(parsed.target);

          if (
            resolved.status !== "resolved" ||
            !resolved.entry.filePath ||
            visited.has(resolved.entry.filePath)
          ) {
            // Unresolved or circular — render as a broken embed indicator
            children.push({
              type: "html",
              value: `<div class="obsidian-embed obsidian-embed--missing"><p>Embed not found: ${parsed.target}</p></div>`,
            });
            lastIndex = match.index + match[0].length;
            hasReplacements = true;
            continue;
          }

          visited.add(resolved.entry.filePath);

          try {
            const raw = readFileSync(resolved.entry.filePath, "utf-8");
            const parsedTree = fromMarkdown(raw.replace(/^---[\s\S]*?\n---\n?/, ""));

            let nodes: RootContent[] = parsedTree.children;

            if (parsed.heading) {
              nodes = extractSection(nodes, parsed.heading);
            }

            if (parsed.blockRef) {
              nodes = extractBlock(nodes, parsed.blockRef);
            }

            // Recursively process embeds in the embedded content
            const subtree: Root = { type: "root", children: [...nodes] };
            processTree(subtree);

            // Wrap in a container div
            children.push({
              type: "html",
              value: `<div class="obsidian-embed" data-target="${resolved.entry.id}">`,
            });
            children.push(...subtree.children);
            children.push({
              type: "html",
              value: `</div>`,
            });
          } catch {
            children.push({
              type: "html",
              value: `<div class="obsidian-embed obsidian-embed--missing"><p>Failed to embed: ${parsed.target}</p></div>`,
            });
          }

          lastIndex = match.index + match[0].length;
          hasReplacements = true;
          visited.delete(resolved.entry.filePath);
        }

        if (!hasReplacements) return;

        // Add remaining text
        if (lastIndex < node.value.length) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex),
          });
        }

        if (children.length > 0) {
          parent.children.splice(index, 1, ...(children as RootContent[]));
        }
      });
    }

    processTree(tree);
  };
}
