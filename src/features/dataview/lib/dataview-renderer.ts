import type { DataviewExecutionResult, DataviewLink } from "./dataview-types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isDataviewLink(value: unknown): value is DataviewLink {
  return Boolean(
    value && typeof value === "object" && "href" in value && "path" in value && "display" in value,
  );
}

function renderValue(value: unknown): string {
  if (value instanceof Date) {
    return escapeHtml(
      value.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }

  if (isDataviewLink(value)) {
    return `<a class="wikilink" href="${escapeHtml(value.href)}">${escapeHtml(value.display)}</a>`;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => renderValue(entry)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value === null || value === undefined || value === "") {
    return "";
  }

  return escapeHtml(String(value));
}

export function renderDataviewResult(result: DataviewExecutionResult): string {
  if (result.header.type === "list") {
    if (result.rows.length === 0) {
      return '<div class="dataview dataview-list"><p>No results</p></div>';
    }

    const items = result.rows
      .map((row) => `<li>${renderValue(result.header.showId ? row.display : row.display)}</li>`)
      .join("");
    return `<div class="dataview dataview-list"><ul>${items}</ul></div>`;
  }

  if (result.header.type === "table") {
    if (result.rows.length === 0) {
      return '<div class="dataview dataview-table"><p>No results</p></div>';
    }

    const headers = [
      ...(result.header.showId ? ["<th>File</th>"] : []),
      ...result.header.fields.map((field) => `<th>${escapeHtml(field.alias ?? field.source)}</th>`),
    ].join("");

    const body = result.rows
      .map((row) => {
        const cells = [
          ...(result.header.showId ? [`<td>${renderValue(row.id)}</td>`] : []),
          ...row.values.map((value) => `<td>${renderValue(value)}</td>`),
        ].join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `<div class="dataview dataview-table"><table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  if (result.header.type === "task") {
    if (result.rows.length === 0) {
      return '<div class="dataview dataview-task"><p>No results</p></div>';
    }

    const items = result.rows
      .map((row) => {
        const checked = row.values[0] === true ? " checked" : "";
        return `<li><label><input type="checkbox" disabled${checked}> <span>${renderValue(row.display)}</span></label> <span class="dataview-task-file">${renderValue(row.id)}</span></li>`;
      })
      .join("");

    return `<div class="dataview dataview-task"><ul>${items}</ul></div>`;
  }

  return renderDataviewError("", new Error("Unsupported Dataview result type"));
}

export function renderDataviewError(source: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown Dataview error";
  return `<div class="dataview dataview-error"><p>${escapeHtml(message)}</p><pre><code>${escapeHtml(source)}</code></pre></div>`;
}
