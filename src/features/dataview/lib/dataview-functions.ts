import type { DataviewFunction } from "./dataview-types";

export interface DataviewFunctionDefinition {
  arities?: number[];
  implementation: DataviewFunction;
}

function coerceToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function replaceValue(value: string, search: string, replacement: string): string {
  return value.replaceAll(search, replacement);
}

export const DEFAULT_DATAVIEW_FUNCTIONS: Record<string, DataviewFunctionDefinition> = {
  choice: {
    arities: [3],
    implementation(condition: unknown, left: unknown, right: unknown) {
      return condition ? left : right;
    },
  },
  contains: {
    arities: [2],
    implementation(container: unknown, value: unknown) {
      if (typeof container === "string") {
        return container.includes(coerceToString(value));
      }

      if (Array.isArray(container)) {
        return container.some((entry) => entry === value);
      }

      return false;
    },
  },
  date: {
    arities: [1],
    implementation(value: unknown) {
      if (value instanceof Date) return value;
      if (typeof value !== "string") return null;

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    },
  },
  default: {
    arities: [2],
    implementation(value: unknown, fallback: unknown) {
      return value === null || value === undefined || value === "" ? fallback : value;
    },
  },
  length: {
    arities: [1],
    implementation(value: unknown) {
      if (typeof value === "string" || Array.isArray(value)) return value.length;
      if (value && typeof value === "object") return Object.keys(value).length;
      return 0;
    },
  },
  lower: {
    arities: [1],
    implementation(value: unknown) {
      return coerceToString(value).toLowerCase();
    },
  },
  replace: {
    arities: [3],
    implementation(value: unknown, search: unknown, replacement: unknown) {
      return replaceValue(
        coerceToString(value),
        coerceToString(search),
        coerceToString(replacement),
      );
    },
  },
  round: {
    arities: [1, 2],
    implementation(value: unknown, precision?: unknown) {
      const number = Number(value);
      if (Number.isNaN(number)) return null;

      const digits = precision === undefined ? 0 : Number(precision);
      if (!Number.isInteger(digits)) return null;

      const factor = 10 ** digits;
      return Math.round(number * factor) / factor;
    },
  },
  string: {
    arities: [1],
    implementation(value: unknown) {
      return coerceToString(value);
    },
  },
  upper: {
    arities: [1],
    implementation(value: unknown) {
      return coerceToString(value).toUpperCase();
    },
  },
};

export function resolveDataviewFunction(name: string): DataviewFunctionDefinition | null {
  return DEFAULT_DATAVIEW_FUNCTIONS[name.toLowerCase()] ?? null;
}
