import type { Root, Text, Link, Html } from "mdast";
import { visit } from "unist-util-visit";
import {
  isExcalidrawTarget,
  isImageTarget,
  parseWikilink,
  targetToHref,
  type ContentResolver,
} from "../../../lib/content-resolver";
import { getFilesystemContentResolver } from "../../../lib/content-resolver.server";

// Matches [[Page]], [[Page|Alias]], [[Page#Heading]], [[Page#Heading|Alias]]
// Also matches ![[embeds]]
const WIKILINK_REGEX = /!?\[\[([^\]]+)\]\]/g;

export function remarkWikilinks(options?: { resolver?: ContentResolver }) {
  const resolver = options?.resolver ?? getFilesystemContentResolver();

  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes("[[")) return;

      const children: (Text | Link | Html)[] = [];
      let lastIndex = 0;

      const regex = new RegExp(WIKILINK_REGEX.source, "g");
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

        if (parsed.isEmbed && isExcalidrawTarget(parsed.target)) {
          const src = resolver.resolveExcalidraw(parsed.target);
          const alt = parsed.alias ?? parsed.target;
          if (src) {
            const caption = parsed.alias ? `<figcaption>${parsed.alias}</figcaption>` : "";
            children.push({
              type: "html",
              value: `<figure class="obsidian-excalidraw-embed"><img src="${src}" alt="${alt}" class="obsidian-excalidraw-embed__image" loading="lazy" />${caption}</figure>`,
            });
          } else {
            children.push({
              type: "html",
              value: `<span class="obsidian-missing-link">${alt}</span>`,
            });
          }
        } else if (parsed.isEmbed && isImageTarget(parsed.target)) {
          // Image embed: ![[image.png]] → <img>
          const src = resolver.resolveAttachment(parsed.target);
          const alt = parsed.alias ?? parsed.target;
          if (src) {
            children.push({
              type: "html",
              value: `<img src="${src}" alt="${alt}" class="obsidian-image-embed" loading="lazy" />`,
            });
          } else {
            children.push({
              type: "html",
              value: `<span class="obsidian-missing-link">${alt}</span>`,
            });
          }
        } else if (parsed.isEmbed) {
          children.push({
            type: "text",
            value: match[0],
          });
        } else {
          const displayText = parsed.alias ?? parsed.heading ?? parsed.blockRef ?? parsed.target;
          const href = targetToHref(resolver, parsed.target, parsed.heading, parsed.blockRef);
          const resolved = resolver.resolve(parsed.target);

          if (resolved.status === "resolved" && href) {
            children.push({
              type: "link",
              url: href,
              children: [{ type: "text", value: displayText }],
              data: {
                hProperties: { className: ["wikilink"], "data-href": href },
              },
            } as Link);
          } else {
            children.push({
              type: "html",
              value: `<span class="${resolved.status === "ambiguous" ? "obsidian-ambiguous-link" : "obsidian-missing-link"}">${displayText}</span>`,
            });
          }
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < node.value.length) {
        children.push({
          type: "text",
          value: node.value.slice(lastIndex),
        });
      }

      if (children.length > 0) {
        parent.children.splice(index, 1, ...children);
      }
    });
  };
}
