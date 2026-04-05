import type { Code, Html, Root } from "mdast";
import { visit } from "unist-util-visit";
import { renderDataviewQuery } from "./dataview-engine";

interface FileContext {
  history?: string[];
  path?: string;
}

export function remarkDataview() {
  return (tree: Root, file: FileContext) => {
    visit(tree, "code", (node: Code, entryIndex, parent) => {
      if (!parent || entryIndex === undefined) return;
      if (node.lang?.toLowerCase() !== "dataview") return;

      const replacement: Html = {
        type: "html",
        value: renderDataviewQuery(node.value, file),
      };

      parent.children.splice(entryIndex, 1, replacement);
    });
  };
}
