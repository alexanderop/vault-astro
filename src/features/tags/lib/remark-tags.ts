import type { Root, Text, Html } from "mdast";
import { visit } from "unist-util-visit";

// Matches #tag and #nested/tag but not # (heading) or #123 (numbers only)
// Must be preceded by whitespace or start of string
const TAG_REGEX = /(?:^|\s)#([a-zA-Z][a-zA-Z0-9_/-]*)/g;

export function remarkTags() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes("#")) return;

      // Don't process inside headings or code
      if (parent.type === "heading" || parent.type === "code" || parent.type === "inlineCode") {
        return;
      }

      const children: (Text | Html)[] = [];
      let lastIndex = 0;
      const regex = new RegExp(TAG_REGEX.source, "g");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(node.value)) !== null) {
        const tag = match[1];
        const fullMatch = match[0];
        const leadingSpace = fullMatch.length - `#${tag}`.length;

        if (match.index + leadingSpace > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index + leadingSpace),
          });
        }

        children.push({
          type: "html",
          value: `<span class="obsidian-tag" data-tag="${tag}">#${tag}</span>`,
        });

        lastIndex = match.index + fullMatch.length;
      }

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
