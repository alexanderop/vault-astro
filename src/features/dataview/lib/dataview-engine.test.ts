import { fileURLToPath } from "node:url";
import { fromMarkdown } from "mdast-util-from-markdown";
import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { createDataviewIndex } from "@/features/dataview/lib/dataview-index";
import {
  parseDataviewQuery,
  parseExpression,
} from "@/features/dataview/lib/dataview-expression-parser";
import { evaluateExpression } from "@/features/dataview/lib/dataview-evaluator";
import { renderDataviewQuery } from "@/features/dataview/lib/dataview-engine";
import { remarkDataview } from "@/features/dataview/lib/remark-dataview";
import { parseSourceExpression } from "@/features/dataview/lib/dataview-source-parser";

const contentRoot = fileURLToPath(new URL("./__tests__/fixtures/content", import.meta.url));
const authorPath = fileURLToPath(
  new URL("./__tests__/fixtures/content/authors/jane-doe.md", import.meta.url),
);
const betaPath = fileURLToPath(
  new URL("./__tests__/fixtures/content/notes/beta.md", import.meta.url),
);
const multilineTableQuery = `TABLE WITHOUT ID lower(file.name) AS "lower",
  upper(file.name) AS "upper",
  replace(string(length(file.tags)), "1", "one") AS "tag count text",
  choice(length(file.tags) > 0, "tagged", "untagged") AS "state",
  default(description, "no description") AS "description",
  round(3.14159, 2) AS "pi",
  date("2026-04-05") AS "date"
FROM "notes"
SORT file.name ASC
LIMIT 3`;

describe("Dataview query parsing", () => {
  it("parses shared lexer constructs for expressions and sources", () => {
    expect(parseExpression(String.raw`"Alpha \"Note\""`)).toEqual({
      type: "literal",
      value: 'Alpha "Note"',
    });
    expect(parseExpression("[[Daily Note]]")).toEqual({
      type: "literal",
      value: {
        display: "Daily Note",
        href: "",
        path: "daily note",
      },
    });
    expect(parseSourceExpression('!([[beta]] OR "notes")')).toEqual({
      type: "not",
      operand: {
        type: "or",
        left: {
          direction: "incoming",
          target: { path: "beta", type: "path" },
          type: "link",
        },
        right: { path: "notes", type: "folder" },
      },
    });
  });

  it("parses table queries with aliases and modifiers", () => {
    const query = parseDataviewQuery(`TABLE WITHOUT ID rating AS "Score", file.name
FROM "notes"
WHERE contains(file.tags, "#shared")
SORT rating ASC
LIMIT 2`);

    expect(query.header.type).toBe("table");
    const header = query.header as Extract<typeof query.header, { type: "table" }>;
    expect(header.showId).toBe(false);
    expect(header.fields).toHaveLength(2);
    expect(header.fields[0]?.alias).toBe("Score");
    expect(query.operations.find((operation) => operation.type === "sort")).toEqual({
      direction: "asc",
      expression: parseExpression("rating"),
      type: "sort",
    });
    expect(query.operations.find((operation) => operation.type === "limit")).toEqual({
      amount: parseExpression("2"),
      type: "limit",
    });
  });

  it("parses group and flatten commands into the query AST", () => {
    const query = parseDataviewQuery(`TABLE file.name
FROM "notes"
FLATTEN authors AS author
GROUP BY author`);

    expect(query.operations.map((operation) => operation.type)).toEqual(["flatten", "group"]);
  });

  it("parses multiline table headers before top-level commands", () => {
    const query = parseDataviewQuery(multilineTableQuery);

    expect(query.header.type).toBe("table");
    const header = query.header as Extract<typeof query.header, { type: "table" }>;
    expect(header.showId).toBe(false);
    expect(header.fields).toHaveLength(7);
    expect(header.fields.map((field) => field.alias)).toEqual([
      "lower",
      "upper",
      "tag count text",
      "state",
      "description",
      "pi",
      "date",
    ]);
    expect(query.operations.map((operation) => operation.type)).toEqual(["sort", "limit"]);
  });
});

describe("Dataview functions", () => {
  it("evaluates registry-backed functions", () => {
    const index = createDataviewIndex({ contentRoot });
    const row = index.pages.find((page) => page.file.name === "alpha");

    expect(row).toBeTruthy();
    expect(evaluateExpression(parseExpression('lower("Alpha")'), row!, null, index)).toBe("alpha");
    expect(evaluateExpression(parseExpression("round(3.14159, 2)"), row!, null, index)).toBe(3.14);
    expect(evaluateExpression(parseExpression("default(missing, 42)"), row!, null, index)).toBe(42);
  });
});

describe("Dataview evaluation", () => {
  it("resolves current-page fields for this.* expressions", () => {
    const index = createDataviewIndex({ contentRoot });
    const current = index.byAbsolutePath.get(authorPath) ?? null;
    const row = index.pages.find((page) => page.file.name === "alpha");

    expect(row).toBeTruthy();
    expect(
      evaluateExpression(parseExpression("contains(authors, this.slug)"), row!, current, index),
    ).toBe(true);
  });
});

describe("Dataview rendering", () => {
  it("renders list queries with current-page filtering and excludes unpublished content", () => {
    const html = renderDataviewQuery(
      `LIST
FROM "notes"
WHERE contains(authors, this.slug)
SORT date DESC`,
      { path: authorPath },
      { contentRoot },
    );

    expect(html).toContain('href="/alpha"');
    expect(html).toContain('href="/beta"');
    expect(html).not.toContain("Unpublished Note");
    expect(html.indexOf("Alpha Note")).toBeLessThan(html.indexOf("Beta Note"));
  });

  it("renders tables without the default id column", () => {
    const html = renderDataviewQuery(
      `TABLE WITHOUT ID rating AS "Score", file.name
FROM "notes"
WHERE contains(file.tags, "#shared")
SORT rating ASC
LIMIT 2`,
      {},
      { contentRoot },
    );

    expect(html).toContain("<th>Score</th>");
    expect(html).toContain("<td>1</td><td>2024-01-02</td>");
    expect(html).toContain("<td>2</td><td>alpha</td>");
    expect(html).not.toContain("<th>File</th>");
  });

  it("renders multiline table headers with function columns", () => {
    const html = renderDataviewQuery(multilineTableQuery, {}, { contentRoot });

    expect(html).not.toContain('class="dataview-error"');
    expect(html).toContain("<th>upper</th>");
    expect(html).toContain("<th>tag count text</th>");
    expect(html).toContain("<th>description</th>");
    expect(html).toContain("<td>alpha</td><td>ALPHA</td><td>2</td><td>tagged</td>");
    expect(html).toContain("<td>beta</td><td>BETA</td><td>2</td><td>tagged</td>");
    expect(html).toContain("<td>2024-01-02</td><td>2024-01-02</td><td>one</td><td>tagged</td>");
    expect(html).toContain("no description");
    expect(html).toContain("3.14");
    expect(html).toContain("April 5, 2026");
  });

  it("supports link-target and outgoing source semantics", () => {
    const backlinks = renderDataviewQuery(
      `LIST
FROM [[beta]]
SORT file.name ASC`,
      {},
      { contentRoot },
    );
    const outgoing = renderDataviewQuery(
      `LIST
FROM outgoing([[beta]])`,
      {},
      { contentRoot },
    );

    expect(backlinks).toContain("Daily Rollup");
    expect(backlinks).toContain("Alpha Note");
    expect(outgoing).toContain("Alpha Note");
    expect(outgoing).not.toContain("Beta Note");
  });

  it("supports current-page source forms", () => {
    const backlinks = renderDataviewQuery(
      `LIST
FROM [[]]
SORT file.name ASC`,
      { path: betaPath },
      { contentRoot },
    );

    expect(backlinks).toContain("Alpha Note");
    expect(backlinks).not.toContain("Beta Note");
  });

  it("executes flatten and group-by queries", () => {
    const html = renderDataviewQuery(
      `TABLE WITHOUT ID author
FROM "notes"
FLATTEN authors AS author
GROUP BY author`,
      {},
      { contentRoot },
    );

    expect(html).toContain("<th>author</th>");
    expect(html).toContain("<td>jane-doe</td>");
  });

  it("renders task queries", () => {
    const html = renderDataviewQuery(
      `TASK
FROM #shared
WHERE !task.completed
SORT file.name ASC`,
      {},
      { contentRoot },
    );

    expect(html).toContain("Draft summary");
    expect(html).toContain("Review beta follow-up");
    expect(html).not.toContain("Publish alpha recap");
    expect(html).toContain('type="checkbox"');
  });

  it("renders unsupported syntax as a Dataview error block", () => {
    const html = renderDataviewQuery('CALENDAR file.day\nFROM "notes"', {}, { contentRoot });

    expect(html).toContain("Unsupported Dataview query type: CALENDAR");
    expect(html).toContain("<pre><code>CALENDAR");
  });
});

describe("remarkDataview", () => {
  it("replaces Dataview fenced code blocks with html nodes", () => {
    const tree = fromMarkdown('```dataview\nLIST\nFROM "notes"\nLIMIT 1\n```') as Root;

    remarkDataview()(tree, { path: authorPath });

    const child = tree.children[0];
    expect(child?.type).toBe("html");
    expect((child as { value: string }).value).toContain('class="dataview');
  });
});
