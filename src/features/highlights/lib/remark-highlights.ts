import type { Root, Text, Html } from "mdast";
import { visit } from "unist-util-visit";

// Matches ==highlighted text==
const HIGHLIGHT_REGEX = /==((?:[^=]|=[^=])+)==/g;

// Matches %%comment text%%
const COMMENT_REGEX = /%%((?:[^%]|%[^%])+)%%/g;

export function remarkHighlights() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes("==")) return;

      const children: (Text | Html)[] = [];
      let lastIndex = 0;
      const regex = new RegExp(HIGHLIGHT_REGEX.source, "g");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(node.value)) !== null) {
        if (match.index > lastIndex) {
          children.push({
            type: "text",
            value: node.value.slice(lastIndex, match.index),
          });
        }

        children.push({
          type: "html",
          value: `<mark>${match[1]}</mark>`,
        });

        lastIndex = match.index + match[0].length;
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

export function remarkComments() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes("%%")) return;

      // Strip %%comment%% entirely
      node.value = node.value.replace(COMMENT_REGEX, "");
    });
  };
}
