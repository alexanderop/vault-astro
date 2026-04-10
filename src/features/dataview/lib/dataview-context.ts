import { resolveDataviewFunction } from "./dataview-functions";
import type { DataviewFunctionDefinition } from "./dataview-functions";
import type {
  DataviewIndex,
  DataviewLink,
  DataviewPage,
  DataviewQueryRow,
  DataviewTaskRow,
  Expression,
} from "./dataview-types";

function isDataviewLink(value: unknown): value is DataviewLink {
  return Boolean(
    value && typeof value === "object" && "href" in value && "path" in value && "display" in value,
  );
}

function compareDataviewValues(left: unknown, right: unknown): boolean {
  if (isDataviewLink(left) && isDataviewLink(right)) {
    return left.path === right.path;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  return left === right;
}

function compareDataviewSortValues(left: unknown, right: unknown): number {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  const leftStr =
    typeof left === "object" && left !== null
      ? JSON.stringify(left)
      : String((left ?? "") as string | number | boolean);
  const rightStr =
    typeof right === "object" && right !== null
      ? JSON.stringify(right)
      : String((right ?? "") as string | number | boolean);
  return leftStr.localeCompare(rightStr);
}

function toComparableNumber(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate.getTime();

    const parsedNumber = Number(value);
    return Number.isNaN(parsedNumber) ? null : parsedNumber;
  }

  return null;
}

function normalizeFieldValue(value: unknown): unknown {
  return value === undefined ? null : value;
}

export class DataviewContext {
  constructor(
    private readonly index: DataviewIndex,
    private readonly current: DataviewPage | DataviewTaskRow | null,
  ) {}

  evaluate(expression: Expression, row: DataviewQueryRow): unknown {
    switch (expression.type) {
      case "literal":
        if (isDataviewLink(expression.value) && expression.value.href.length === 0) {
          return this.index.resolveLinkTarget(expression.value.path)?.file.link ?? expression.value;
        }

        return expression.value;
      case "field":
        return this.resolveField(expression.path, row);
      case "unary":
        if (expression.operator !== "!") {
          throw new Error(`Unsupported unary operator: ${expression.operator}`);
        }
        return !this.isTruthy(this.evaluate(expression.argument, row));
      case "call":
        return this.callFunction(
          expression.name,
          expression.arguments.map((argument) => this.evaluate(argument, row)),
        );
      case "binary":
        return this.evaluateBinary(expression, row);
    }
  }

  isTruthy(value: unknown): boolean {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }

  compare(left: unknown, right: unknown): boolean {
    if (Array.isArray(left)) return left.some((entry) => this.compare(entry, right));
    if (Array.isArray(right)) return right.some((entry) => this.compare(left, entry));
    return compareDataviewValues(left, right);
  }

  compareForSort(left: unknown, right: unknown): number {
    return compareDataviewSortValues(left, right);
  }

  resolveSourceTarget(path: string): DataviewPage | null {
    return this.index.resolveLinkTarget(path);
  }

  private resolveField(path: string[], row: DataviewQueryRow): unknown {
    let value: unknown = path[0] === "this" ? this.current : row;
    const segments = path[0] === "this" ? path.slice(1) : path;

    for (const segment of segments) {
      if (!value || typeof value !== "object") return null;
      value = (value as Record<string, unknown>)[segment];
    }

    return normalizeFieldValue(value);
  }

  private callFunction(name: string, arguments_: unknown[]): unknown {
    const definition = resolveDataviewFunction(name);
    if (!definition) {
      throw new Error(`Unsupported Dataview function: ${name}`);
    }

    this.assertArity(name, definition, arguments_.length);

    if (name.toLowerCase() === "contains" && Array.isArray(arguments_[0])) {
      const [container, value] = arguments_;
      return (container as unknown[]).some((entry) => this.compare(entry, value));
    }

    return definition.implementation(...arguments_);
  }

  private evaluateBinary(
    expression: Extract<Expression, { type: "binary" }>,
    row: DataviewQueryRow,
  ): unknown {
    const left = this.evaluate(expression.left, row);
    const right = this.evaluate(expression.right, row);

    switch (expression.operator) {
      case "AND":
        return this.isTruthy(left) && this.isTruthy(right);
      case "OR":
        return this.isTruthy(left) || this.isTruthy(right);
      case "=":
      case "==":
        return this.compare(left, right);
      case "!=":
        return !this.compare(left, right);
      case "<":
      case "<=":
      case ">":
      case ">=": {
        const leftValue = toComparableNumber(left);
        const rightValue = toComparableNumber(right);

        if (leftValue !== null && rightValue !== null) {
          if (expression.operator === "<") return leftValue < rightValue;
          if (expression.operator === "<=") return leftValue <= rightValue;
          if (expression.operator === ">") return leftValue > rightValue;
          return leftValue >= rightValue;
        }

        const compared = this.compareForSort(left, right);
        if (expression.operator === "<") return compared < 0;
        if (expression.operator === "<=") return compared <= 0;
        if (expression.operator === ">") return compared > 0;
        return compared >= 0;
      }
      default:
        throw new Error(`Unsupported operator: ${expression.operator}`);
    }
  }

  private assertArity(name: string, definition: DataviewFunctionDefinition, actualArity: number) {
    if (!definition.arities || definition.arities.includes(actualArity)) {
      return;
    }

    throw new Error(
      `Invalid Dataview function call: ${name}() expected ${definition.arities.join(" or ")} argument(s), received ${actualArity}`,
    );
  }
}
