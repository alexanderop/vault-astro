import { DataviewContext } from "./dataview-context";
import { normalizeLookupValue } from "../../../lib/content-utils";
import type {
  DataviewExecutionDiagnostic,
  DataviewExecutionResult,
  DataviewExecutionRow,
  DataviewGroupValue,
  DataviewIndex,
  DataviewPage,
  DataviewQuery,
  DataviewQueryRow,
  DataviewTaskRow,
  SourceExpression,
  SourceTarget,
} from "./dataview-types";

function resolveSourceTarget(
  target: SourceTarget,
  context: DataviewContext,
  current: DataviewQueryRow | null,
): DataviewPage | null {
  if (target.type === "current") {
    if (current && "page" in current) {
      return current.page;
    }

    if (current && "file" in current && !("rows" in current)) {
      return current as DataviewPage;
    }

    return null;
  }

  return context.resolveSourceTarget(target.path);
}

function getRowFile(row: DataviewQueryRow): DataviewPage["file"] | null {
  if ("file" in row && !("rows" in row)) {
    return row.file;
  }

  if ("page" in row) {
    return row.file;
  }

  return null;
}

function getRowPage(row: DataviewQueryRow): DataviewPage | null {
  if ("page" in row) {
    return row.page;
  }

  if ("file" in row && !("rows" in row)) {
    return row as DataviewPage;
  }

  return null;
}

function getRowId(row: DataviewQueryRow): unknown {
  if ("rows" in row) {
    return row.key;
  }

  if ("page" in row) {
    return row.task.text;
  }

  return row.file.link;
}

function matchesLinkSource(
  row: DataviewQueryRow,
  source: Extract<SourceExpression, { type: "link" }>,
  context: DataviewContext,
  current: DataviewQueryRow | null,
): boolean {
  const page = getRowPage(row);
  if (!page) return false;

  const target = resolveSourceTarget(source.target, context, current);
  if (!target) return false;

  if (source.direction === "incoming") {
    return page.file.outlinks.some((link) => link.path === target.file.link.path);
  }

  return target.file.outlinks.some((link) => link.path === page.file.link.path);
}

export function matchesSource(
  source: SourceExpression,
  row: DataviewQueryRow,
  context: DataviewContext,
  current: DataviewQueryRow | null,
): boolean {
  const file = getRowFile(row);
  if (!file) return false;

  switch (source.type) {
    case "all":
      return true;
    case "folder": {
      const folder = normalizeLookupValue(source.path);
      const currentFolder = normalizeLookupValue(file.folder);
      return currentFolder === folder || currentFolder.startsWith(`${folder}/`);
    }
    case "file":
      return normalizeLookupValue(file.path) === normalizeLookupValue(source.path);
    case "tag": {
      const tag = source.tag.startsWith("#")
        ? source.tag.toLowerCase()
        : `#${source.tag.toLowerCase()}`;

      const tags = "task" in row ? row.task.tags : file.tags;
      return tags.some(
        (entry) => entry.toLowerCase() === tag || entry.toLowerCase().startsWith(`${tag}/`),
      );
    }
    case "link":
      return matchesLinkSource(row, source, context, current);
    case "not":
      return !matchesSource(source.operand, row, context, current);
    case "and":
      return (
        matchesSource(source.left, row, context, current) &&
        matchesSource(source.right, row, context, current)
      );
    case "or":
      return (
        matchesSource(source.left, row, context, current) ||
        matchesSource(source.right, row, context, current)
      );
  }
}

function filterOperation<T extends DataviewQuery["operations"][number]["type"]>(
  query: DataviewQuery,
  type: T,
) {
  return query.operations.filter((entry) => entry.type === type) as Extract<
    DataviewQuery["operations"][number],
    { type: T }
  >[];
}

function addDiagnostic(
  diagnostics: DataviewExecutionDiagnostic[],
  operation: DataviewExecutionDiagnostic["operation"],
  inputRows: number,
  outputRows: number,
  errorCount = 0,
) {
  diagnostics.push({
    errorCount,
    inputRows,
    operation,
    outputRows,
  });
}

function applyWhere(
  rows: DataviewQueryRow[],
  operations: Extract<DataviewQuery["operations"][number], { type: "where" }>[],
  context: DataviewContext,
  diagnostics: DataviewExecutionDiagnostic[],
): { errors: string[]; rows: DataviewQueryRow[] } {
  let currentRows = rows;
  const errors: string[] = [];

  for (const operation of operations) {
    const inputRows = currentRows.length;
    currentRows = currentRows.filter((row) => {
      try {
        return context.isTruthy(context.evaluate(operation.clause, row));
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Unknown Dataview evaluation error");
        return false;
      }
    });

    addDiagnostic(diagnostics, "where", inputRows, currentRows.length, errors.length);
  }

  return { errors, rows: currentRows };
}

function applyFlatten(
  rows: DataviewQueryRow[],
  operations: Extract<DataviewQuery["operations"][number], { type: "flatten" }>[],
  context: DataviewContext,
  diagnostics: DataviewExecutionDiagnostic[],
): DataviewQueryRow[] {
  let currentRows = rows;

  for (const operation of operations) {
    const inputRows = currentRows.length;
    const flattened: DataviewQueryRow[] = [];

    for (const row of currentRows) {
      const value = context.evaluate(operation.field.expression, row);
      const values = Array.isArray(value) ? value : [value];

      for (const entry of values) {
        if ("rows" in row) {
          flattened.push({
            ...row,
            [operation.field.alias ?? operation.field.source]: entry,
          } as DataviewGroupValue);
          continue;
        }

        flattened.push({
          ...row,
          [operation.field.alias ?? operation.field.source]: entry,
        } as DataviewPage | DataviewTaskRow);
      }
    }

    currentRows = flattened;
    addDiagnostic(diagnostics, "flatten", inputRows, currentRows.length);
  }

  return currentRows;
}

function applySort(
  rows: DataviewQueryRow[],
  operations: Extract<DataviewQuery["operations"][number], { type: "sort" }>[],
  context: DataviewContext,
  diagnostics: DataviewExecutionDiagnostic[],
): DataviewQueryRow[] {
  let currentRows = rows;

  for (const operation of operations) {
    const inputRows = currentRows.length;
    currentRows = currentRows.toSorted((left, right) => {
      const leftValue = context.evaluate(operation.expression, left);
      const rightValue = context.evaluate(operation.expression, right);
      const compared = context.compareForSort(leftValue, rightValue);
      return operation.direction === "asc" ? compared : -compared;
    });

    addDiagnostic(diagnostics, "sort", inputRows, currentRows.length);
  }

  return currentRows;
}

function applyGroup(
  rows: DataviewQueryRow[],
  operations: Extract<DataviewQuery["operations"][number], { type: "group" }>[],
  context: DataviewContext,
  diagnostics: DataviewExecutionDiagnostic[],
): DataviewQueryRow[] {
  let currentRows = rows;

  for (const operation of operations) {
    const inputRows = currentRows.length;
    const grouped: DataviewGroupValue[] = [];

    for (const row of currentRows) {
      const key = context.evaluate(operation.field.expression, row);
      const existing = grouped.find((group) => context.compare(group.key, key));

      if (existing) {
        existing.rows.push(row);
        continue;
      }

      grouped.push({
        key,
        rows: [row],
        [operation.field.alias ?? operation.field.source]: key,
      } as DataviewGroupValue);
    }

    currentRows = grouped;
    addDiagnostic(diagnostics, "group", inputRows, currentRows.length);
  }

  return currentRows;
}

function applyLimit(
  rows: DataviewQueryRow[],
  operations: Extract<DataviewQuery["operations"][number], { type: "limit" }>[],
  context: DataviewContext,
  diagnostics: DataviewExecutionDiagnostic[],
): DataviewQueryRow[] {
  let currentRows = rows;

  for (const operation of operations) {
    const inputRows = currentRows.length;
    const amount = context.evaluate(operation.amount, currentRows[0] ?? ({} as DataviewPage));
    const limit = Number(amount);
    if (!Number.isInteger(limit) || limit < 0) {
      throw new Error(`Invalid LIMIT value: ${String(amount)}`);
    }

    currentRows = currentRows.slice(0, limit);
    addDiagnostic(diagnostics, "limit", inputRows, currentRows.length);
  }

  return currentRows;
}

function createExecutionRows(
  rows: DataviewQueryRow[],
  query: DataviewQuery,
  context: DataviewContext,
): DataviewExecutionRow[] {
  if (query.header.type === "list") {
    return rows.map((row) => ({
      data: row,
      display: query.header.format ? context.evaluate(query.header.format, row) : getRowId(row),
      id: getRowId(row),
      values: [],
    }));
  }

  if (query.header.type === "table") {
    return rows.map((row) => ({
      data: row,
      display: null,
      id: getRowId(row),
      values: query.header.fields.map((field) => context.evaluate(field.expression, row)),
    }));
  }

  if (query.header.type === "task") {
    return rows
      .filter((row): row is DataviewTaskRow => "task" in row)
      .map((row) => ({
        data: row,
        display: row.task.text,
        id: row.file.link,
        values: [row.task.completed, row.task.text],
      }));
  }

  throw new Error(`Unsupported Dataview query type: ${query.header.type.toUpperCase()}`);
}

export function executeDataviewQuery(
  query: DataviewQuery,
  current: DataviewQueryRow | null,
  index: DataviewIndex,
): DataviewExecutionResult {
  if (query.header.type === "calendar") {
    throw new Error("Unsupported Dataview query type: CALENDAR");
  }

  const context = new DataviewContext(index, current);
  const diagnostics: DataviewExecutionDiagnostic[] = [];

  let rows: DataviewQueryRow[] = query.header.type === "task" ? [...index.tasks] : [...index.pages];

  const inputRows = rows.length;
  rows = rows.filter((row) => matchesSource(query.source, row, context, current));
  addDiagnostic(diagnostics, "where", inputRows, rows.length);

  const whereResult = applyWhere(rows, filterOperation(query, "where"), context, diagnostics);
  rows = whereResult.rows;
  rows = applyFlatten(rows, filterOperation(query, "flatten"), context, diagnostics);
  rows = applySort(rows, filterOperation(query, "sort"), context, diagnostics);
  rows = applyGroup(rows, filterOperation(query, "group"), context, diagnostics);
  rows = applyLimit(rows, filterOperation(query, "limit"), context, diagnostics);

  return {
    diagnostics,
    errors: whereResult.errors,
    header: query.header,
    rows: createExecutionRows(rows, query, context),
  };
}
