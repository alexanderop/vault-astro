import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkMermaid } from "@/features/mermaid/lib/remark-mermaid";

function processTree(markdown: string) {
  const tree = fromMarkdown(markdown) as Root;
  remarkMermaid()(tree);
  return tree;
}

describe("remarkMermaid", () => {
  it("converts mermaid code block to div", () => {
    const tree = processTree("```mermaid\ngraph TD\nA-->B\n```");

    expect(tree.children[0]).toMatchObject({
      type: "html",
      value: '<div class="mermaid">\ngraph TD\nA-->B\n</div>',
    });
  });

  it("leaves non-mermaid code blocks untouched", () => {
    const tree = processTree("```js\nconsole.log('hi')\n```");

    expect(tree.children[0]).toMatchObject({
      type: "code",
      lang: "js",
    });
  });

  it("leaves code blocks without a lang untouched", () => {
    const tree = processTree("```\nplain code\n```");

    expect(tree.children[0]).toMatchObject({
      type: "code",
      lang: null,
    });
  });

  it("preserves multiline mermaid content", () => {
    const diagram = "sequenceDiagram\n  Alice->>Bob: Hello\n  Bob-->>Alice: Hi";
    const tree = processTree(`\`\`\`mermaid\n${diagram}\n\`\`\``);

    expect(tree.children[0]).toMatchObject({
      type: "html",
      value: `<div class="mermaid">\n${diagram}\n</div>`,
    });
  });
});
