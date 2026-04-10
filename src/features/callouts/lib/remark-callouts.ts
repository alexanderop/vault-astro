import type { Root, Blockquote } from "mdast";
import { visit } from "unist-util-visit";

// Matches > [!type] Title or > [!type]- Title (foldable)
const CALLOUT_REGEX = /^\[!(\w+)\]([+-])?\s*(.*)?$/;

const CALLOUT_ICONS: Record<string, string> = {
  note: "📝",
  tip: "💡",
  hint: "💡",
  important: "🔥",
  warning: "⚠️",
  caution: "⚠️",
  danger: "🚨",
  error: "🚨",
  info: "ℹ️",
  abstract: "📋",
  summary: "📋",
  tldr: "📋",
  todo: "☑️",
  example: "📌",
  quote: "💬",
  cite: "💬",
  bug: "🐛",
  success: "✅",
  check: "✅",
  done: "✅",
  failure: "❌",
  fail: "❌",
  missing: "❌",
  question: "❓",
  help: "❓",
  faq: "❓",
};

function getCalloutColor(type: string): string {
  const colors: Record<string, string> = {
    note: "note",
    tip: "success",
    hint: "success",
    important: "warning",
    warning: "warning",
    caution: "warning",
    danger: "danger",
    error: "danger",
    info: "note",
    abstract: "neutral",
    summary: "neutral",
    tldr: "neutral",
    todo: "note",
    example: "note",
    quote: "neutral",
    cite: "neutral",
    bug: "danger",
    success: "success",
    check: "success",
    done: "success",
    failure: "danger",
    fail: "danger",
    missing: "danger",
    question: "warning",
    help: "warning",
    faq: "warning",
  };
  return colors[type] ?? "note";
}

export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, "blockquote", (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      // Check if the first child is a paragraph starting with [!type]
      const firstChild = node.children[0];
      if (firstChild?.type !== "paragraph") return;

      const firstInline = firstChild.children[0];
      if (firstInline?.type !== "text") return;

      const lines = firstInline.value.split("\n");
      const match = lines[0].match(CALLOUT_REGEX);
      if (!match) return;

      const type = match[1].toLowerCase();
      const foldable = match[2] === "-" || match[2] === "+";
      const defaultOpen = match[2] !== "-";
      const title = match[3] || type.charAt(0).toUpperCase() + type.slice(1);
      const icon = (CALLOUT_ICONS as Record<string, string | undefined>)[type] ?? "📝";
      const color = getCalloutColor(type);

      // Remove the callout syntax line from the text
      const remainingLines = lines.slice(1);
      if (remainingLines.length > 0) {
        firstInline.value = remainingLines.join("\n");
      } else {
        // Remove the first text node entirely
        firstChild.children.shift();
      }

      // If the paragraph is now empty, remove it
      if (firstChild.children.length === 0) {
        node.children.shift();
      }

      // Build the callout HTML wrapper
      const tag = foldable ? "details" : "div";
      const openAttr = foldable && defaultOpen ? " open" : "";
      const titleTag = foldable ? "summary" : "div";

      const openingHtml = {
        type: "html" as const,
        value: `<${tag} class="callout callout-${type} callout-color-${color}"${openAttr}><${titleTag} class="callout-title"><span class="callout-icon">${icon}</span><span class="callout-title-text">${title}</span></${titleTag}><div class="callout-content">`,
      };

      const closingHtml = {
        type: "html" as const,
        value: `</div></${tag}>`,
      };

      // Replace the blockquote with the callout wrapper + its content
      parent.children.splice(index, 1, openingHtml, ...node.children, closingHtml);
    });
  };
}
