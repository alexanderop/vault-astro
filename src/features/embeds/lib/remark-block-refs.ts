import type { Root, Paragraph } from "mdast";
import { visit } from "unist-util-visit";

const BLOCK_REF_REGEX = /\s+\^([a-zA-Z0-9-]+)\s*$/;

/**
 * Remark plugin that processes Obsidian block reference markers (^id).
 *
 * Strips `^block-id` from the end of paragraphs/list items and adds
 * an HTML id attribute so they can be linked to via [[Note#^block-id]].
 */
export function remarkBlockRefs() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node: Paragraph) => {
      const lastChild = node.children[node.children.length - 1];
      if (!lastChild || lastChild.type !== "text") return;

      const match = lastChild.value.match(BLOCK_REF_REGEX);
      if (!match) return;

      const blockId = match[1];

      // Strip the ^id from the text
      lastChild.value = lastChild.value.replace(BLOCK_REF_REGEX, "");

      // Add an id to the paragraph via hProperties
      node.data = node.data ?? {};
      node.data.hProperties = {
        ...(node.data.hProperties as Record<string, unknown>),
        id: `^${blockId}`,
      };
    });
  };
}
