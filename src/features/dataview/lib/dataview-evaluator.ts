import { DataviewContext } from "./dataview-context";
import type {
  DataviewIndex,
  DataviewPage,
  DataviewQueryRow,
  DataviewTaskRow,
  Expression,
} from "./dataview-types";

export function evaluateExpression(
  expression: Expression,
  row: DataviewQueryRow,
  current: DataviewPage | DataviewTaskRow | null,
  index: DataviewIndex,
): unknown {
  return new DataviewContext(index, current).evaluate(expression, row);
}
