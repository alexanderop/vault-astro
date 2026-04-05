import { DataviewContext } from "./dataview-context";
import {
  executeDataviewQuery as executeQuery,
  matchesSource as matchesSourceInternal,
} from "./dataview-query-executor";
import type {
  DataviewExecutionResult,
  DataviewIndex,
  DataviewPage,
  DataviewQueryRow,
  DataviewQuery,
  Expression,
  SourceExpression,
} from "./dataview-types";

export function evaluateField(
  path: string[],
  row: DataviewQueryRow,
  current: DataviewQueryRow | null,
): unknown {
  return new DataviewContext(
    {
      byAbsolutePath: new Map(),
      byContentPath: new Map(),
      pages: [],
      tasks: [],
      resolveLinkTarget: () => null,
    },
    current,
  ).evaluate({ path, type: "field" }, row);
}

export function evaluateExpression(
  expression: Expression,
  row: DataviewQueryRow,
  current: DataviewQueryRow | null,
  index: DataviewIndex,
): unknown {
  return new DataviewContext(index, current).evaluate(expression, row);
}

export function matchesSource(
  source: SourceExpression,
  page: DataviewPage,
  index: DataviewIndex,
  current: DataviewQueryRow | null = null,
): boolean {
  return matchesSourceInternal(source, page, new DataviewContext(index, current), current);
}

export function executeDataviewQuery(
  query: DataviewQuery,
  current: DataviewQueryRow | null,
  index: DataviewIndex,
): DataviewExecutionResult {
  return executeQuery(query, current, index);
}
