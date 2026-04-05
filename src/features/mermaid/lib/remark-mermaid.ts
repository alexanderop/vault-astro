import type { Root, Code, Html } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that transforms ```mermaid fenced code blocks
 * into <div class="mermaid"> elements for client-side rendering.
 *
 * Runs at the remark (mdast) level so it executes before Astro's
 * built-in Shiki syntax highlighter can transform the code block.
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.lang !== "mermaid") return;

      const htmlNode: Html = {
        type: "html",
        value: `<div class="mermaid">\n${node.value}\n</div>`,
      };

      parent.children.splice(index, 1, htmlNode);
    });
  };
}
