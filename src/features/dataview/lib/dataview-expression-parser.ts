import { normalizeLookupValue } from "./dataview-index";
import { parseSourceExpression } from "./dataview-source-parser";
import type {
  DataviewQuery,
  DataviewQueryOperation,
  Expression,
  TableColumn,
  Token,
} from "./dataview-types";

function tokenizeExpression(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (source.startsWith("[[", index)) {
      const end = source.indexOf("]]", index + 2);
      if (end === -1) {
        throw new Error("Unclosed link literal");
      }

      tokens.push({ type: "link", value: source.slice(index + 2, end) });
      index = end + 2;
      continue;
    }

    if (char === '"' || char === "'") {
      let end = index + 1;
      let value = "";

      while (end < source.length) {
        if (source[end] === "\\" && end + 1 < source.length) {
          value += source[end + 1];
          end += 2;
          continue;
        }

        if (source[end] === char) break;
        value += source[end];
        end += 1;
      }

      if (source[end] !== char) {
        throw new Error("Unclosed string literal");
      }

      tokens.push({ type: "string", value });
      index = end + 1;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[0-9.]/.test(source[end])) end += 1;
      tokens.push({ type: "number", value: source.slice(index, end) });
      index = end;
      continue;
    }

    const twoCharOperator = source.slice(index, index + 2);
    if (["<=", ">=", "!=", "=="].includes(twoCharOperator)) {
      tokens.push({ type: "operator", value: twoCharOperator });
      index += 2;
      continue;
    }

    if (["=", "<", ">", "!", ","].includes(char)) {
      tokens.push({
        type: char === "," ? "punctuation" : "operator",
        value: char,
      });
      index += 1;
      continue;
    }

    if (["(", ")", "."].includes(char)) {
      tokens.push({ type: "punctuation", value: char });
      index += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[A-Za-z0-9_-]/.test(source[end])) end += 1;
      const value = source.slice(index, end);
      const upper = value.toUpperCase();

      tokens.push({
        type: ["AND", "OR", "AS", "ASC", "DESC", "TRUE", "FALSE"].includes(upper)
          ? "keyword"
          : "identifier",
        value,
      });
      index = end;
      continue;
    }

    throw new Error(`Unexpected token "${char}"`);
  }

  return tokens;
}

class ExpressionParser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(source: string) {
    this.tokens = tokenizeExpression(source);
  }

  parse(): Expression {
    const expression = this.parseOr();
    if (this.peek()) {
      throw new Error(`Unexpected token "${this.peek()?.value}"`);
    }
    return expression;
  }

  private parseOr(): Expression {
    let expression = this.parseAnd();

    while (this.matchKeyword("OR")) {
      expression = {
        type: "binary",
        left: expression,
        operator: "OR",
        right: this.parseAnd(),
      };
    }

    return expression;
  }

  private parseAnd(): Expression {
    let expression = this.parseComparison();

    while (this.matchKeyword("AND")) {
      expression = {
        type: "binary",
        left: expression,
        operator: "AND",
        right: this.parseComparison(),
      };
    }

    return expression;
  }

  private parseComparison(): Expression {
    let expression = this.parseUnary();

    while (this.matchOperator("=", "==", "!=", "<", "<=", ">", ">=")) {
      const operator = this.previous().value;
      expression = {
        type: "binary",
        left: expression,
        operator,
        right: this.parseUnary(),
      };
    }

    return expression;
  }

  private parseUnary(): Expression {
    if (this.matchOperator("!")) {
      return { type: "unary", operator: "!", argument: this.parseUnary() };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): Expression {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "number") {
      this.index += 1;
      return { type: "literal", value: Number(token.value) };
    }

    if (token.type === "string") {
      this.index += 1;
      return { type: "literal", value: token.value };
    }

    if (token.type === "link") {
      this.index += 1;
      return {
        type: "literal",
        value: {
          display: token.value,
          href: "",
          path: normalizeLookupValue(token.value),
        },
      };
    }

    if (token.type === "keyword" && ["TRUE", "FALSE"].includes(token.value.toUpperCase())) {
      this.index += 1;
      return { type: "literal", value: token.value.toUpperCase() === "TRUE" };
    }

    if (token.type === "punctuation" && token.value === "(") {
      this.index += 1;
      const expression = this.parseOr();
      this.consumePunctuation(")");
      return expression;
    }

    if (token.type === "identifier") {
      this.index += 1;
      const path = [token.value];

      while (this.matchPunctuation(".")) {
        const segment = this.consume("identifier", "Expected identifier after '.'");
        path.push(segment.value);
      }

      if (this.matchPunctuation("(")) {
        const args: Expression[] = [];
        if (!this.checkPunctuation(")")) {
          do {
            args.push(this.parseOr());
          } while (this.matchPunctuation(","));
        }
        this.consumePunctuation(")");
        return {
          type: "call",
          name: path.join("."),
          arguments: args,
        };
      }

      return { type: "field", path };
    }

    throw new Error(`Unexpected token "${token.value}"`);
  }

  private matchKeyword(...values: string[]): boolean {
    const token = this.peek();
    if (!token || token.type !== "keyword") return false;
    if (!values.includes(token.value.toUpperCase())) return false;
    this.index += 1;
    return true;
  }

  private matchOperator(...values: string[]): boolean {
    const token = this.peek();
    if (!token || token.type !== "operator") return false;
    if (!values.includes(token.value)) return false;
    this.index += 1;
    return true;
  }

  private matchPunctuation(value: string): boolean {
    const token = this.peek();
    if (!token || token.type !== "punctuation" || token.value !== value) return false;
    this.index += 1;
    return true;
  }

  private consume(type: Token["type"], message: string): Token {
    const token = this.peek();
    if (!token || token.type !== type) throw new Error(message);
    this.index += 1;
    return token;
  }

  private consumePunctuation(value: string) {
    if (!this.matchPunctuation(value)) {
      throw new Error(`Expected "${value}"`);
    }
  }

  private checkPunctuation(value: string): boolean {
    const token = this.peek();
    return Boolean(token && token.type === "punctuation" && token.value === value);
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }
}

function splitTopLevel(source: string, separator: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let inString: '"' | "'" | null = null;
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source.slice(index, index + 2);

    if (!inString && next === "[[") {
      const end = source.indexOf("]]", index + 2);
      if (end === -1) throw new Error("Unclosed link literal");
      current += source.slice(index, end + 2);
      index = end + 2;
      continue;
    }

    if (inString) {
      current += char;
      if (char === inString && source[index - 1] !== "\\") {
        inString = null;
      }
      index += 1;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
      current += char;
      index += 1;
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = "";
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  if (current.trim().length > 0) parts.push(current.trim());
  return parts;
}

function findAliasSeparator(source: string): number {
  const tokens = tokenizeExpression(source);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type === "keyword" && token.value.toUpperCase() === "AS") {
      let cursor = 0;
      for (const priorToken of tokens.slice(0, index)) {
        cursor = source.indexOf(priorToken.value, cursor) + priorToken.value.length;
      }
      return source.indexOf(token.value, cursor - token.value.length);
    }
  }

  return -1;
}

function parseTableColumns(source: string): { columns: TableColumn[]; withoutId: boolean } {
  let remaining = source.trim();
  let withoutId = false;

  if (remaining.toUpperCase().startsWith("WITHOUT ID")) {
    withoutId = true;
    remaining = remaining.slice("WITHOUT ID".length).trim();
  }

  const columns = splitTopLevel(remaining, ",").map((columnSource) => {
    const aliasSeparator = findAliasSeparator(columnSource);
    const expressionSource =
      aliasSeparator === -1 ? columnSource : columnSource.slice(0, aliasSeparator).trim();
    const aliasSource =
      aliasSeparator === -1 ? undefined : columnSource.slice(aliasSeparator + 2).trim();
    const alias = aliasSource?.replace(/^["']|["']$/g, "");

    return {
      alias,
      expression: new ExpressionParser(expressionSource).parse(),
      source: expressionSource,
    };
  });

  return { columns, withoutId };
}

function parseListHeader(source: string): { format?: Expression; withoutId: boolean } {
  let remaining = source.trim();
  let withoutId = false;

  if (remaining.toUpperCase().startsWith("WITHOUT ID")) {
    withoutId = true;
    remaining = remaining.slice("WITHOUT ID".length).trim();
  }

  return {
    format: remaining.length > 0 ? parseExpression(remaining) : undefined,
    withoutId,
  };
}

export function parseExpression(source: string): Expression {
  return new ExpressionParser(source).parse();
}

function isDataviewCommandStart(line: string): boolean {
  const upper = line.trim().toUpperCase();

  return (
    upper.startsWith("FROM ") ||
    upper.startsWith("WHERE ") ||
    upper.startsWith("SORT ") ||
    upper.startsWith("LIMIT ") ||
    upper.startsWith("GROUP BY ") ||
    upper.startsWith("FLATTEN ")
  );
}

function collectQueryClauses(source: string): string[] {
  const rawLines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length === 0) {
    return [];
  }

  const clauses: string[] = [rawLines[0]];
  const initialHeader = rawLines[0].toUpperCase();
  const isTableHeader = initialHeader === "TABLE" || initialHeader.startsWith("TABLE ");

  for (const line of rawLines.slice(1)) {
    if (isTableHeader && !isDataviewCommandStart(line)) {
      clauses[0] = `${clauses[0]} ${line}`;
      continue;
    }

    clauses.push(line);
  }

  return clauses;
}

export function parseDataviewQuery(source: string): DataviewQuery {
  const rawLines = collectQueryClauses(source);

  if (rawLines.length === 0) {
    throw new Error("Empty dataview block");
  }

  const [header, ...commands] = rawLines;
  const upperHeader = header.toUpperCase();

  let parsedHeader: DataviewQuery["header"];

  if (upperHeader === "LIST" || upperHeader.startsWith("LIST ")) {
    const parsedList = parseListHeader(header.slice(4).trim());
    parsedHeader = {
      format: parsedList.format,
      showId: !parsedList.withoutId,
      type: "list",
    };
  } else if (upperHeader === "TABLE" || upperHeader.startsWith("TABLE ")) {
    const parsedColumns = parseTableColumns(header.slice(5).trim());
    parsedHeader = {
      fields: parsedColumns.columns,
      showId: !parsedColumns.withoutId,
      type: "table",
    };
  } else if (upperHeader === "TASK" || upperHeader.startsWith("TASK ")) {
    parsedHeader = { type: "task" };
  } else if (upperHeader === "CALENDAR" || upperHeader.startsWith("CALENDAR ")) {
    const fieldSource = header.slice("CALENDAR".length).trim();
    if (fieldSource.length === 0) {
      throw new Error("CALENDAR requires a field expression");
    }

    parsedHeader = {
      field: {
        expression: parseExpression(fieldSource),
        source: fieldSource,
      },
      type: "calendar",
    };
  } else {
    throw new Error(`Unsupported Dataview query type: ${header.split(/\s+/)[0]}`);
  }

  const operations: DataviewQueryOperation[] = [];
  let sourceExpression: DataviewQuery["source"] = { type: "all" };

  for (const command of commands) {
    const upper = command.toUpperCase();

    if (upper.startsWith("FROM ")) {
      sourceExpression = parseSourceExpression(command.slice(5).trim());
      continue;
    }

    if (upper.startsWith("WHERE ")) {
      operations.push({
        clause: parseExpression(command.slice(6).trim()),
        type: "where",
      });
      continue;
    }

    if (upper.startsWith("SORT ")) {
      const body = command.slice(5).trim();
      const match = body.match(/\s+(ASC|DESC)$/i);
      const direction = match?.[1]?.toLowerCase() === "asc" ? "asc" : "desc";
      const expressionSource = match ? body.slice(0, match.index).trim() : body;
      operations.push({
        direction,
        expression: parseExpression(expressionSource),
        type: "sort",
      });
      continue;
    }

    if (upper.startsWith("LIMIT ")) {
      operations.push({
        amount: parseExpression(command.slice(6).trim()),
        type: "limit",
      });
      continue;
    }

    if (upper.startsWith("GROUP BY ")) {
      const fieldSource = command.slice("GROUP BY ".length).trim();
      const aliasSeparator = findAliasSeparator(fieldSource);
      const expressionSource =
        aliasSeparator === -1 ? fieldSource : fieldSource.slice(0, aliasSeparator).trim();
      const aliasSource =
        aliasSeparator === -1 ? undefined : fieldSource.slice(aliasSeparator + 2).trim();

      operations.push({
        field: {
          alias: aliasSource?.replace(/^["']|["']$/g, ""),
          expression: parseExpression(expressionSource),
          source: expressionSource,
        },
        type: "group",
      });
      continue;
    }

    if (upper.startsWith("FLATTEN ")) {
      const fieldSource = command.slice("FLATTEN ".length).trim();
      const aliasSeparator = findAliasSeparator(fieldSource);
      const expressionSource =
        aliasSeparator === -1 ? fieldSource : fieldSource.slice(0, aliasSeparator).trim();
      const aliasSource =
        aliasSeparator === -1 ? undefined : fieldSource.slice(aliasSeparator + 2).trim();

      operations.push({
        field: {
          alias: aliasSource?.replace(/^["']|["']$/g, ""),
          expression: parseExpression(expressionSource),
          source: expressionSource,
        },
        type: "flatten",
      });
      continue;
    }

    throw new Error(`Unsupported Dataview command: ${command.split(/\s+/)[0]}`);
  }

  return {
    header: parsedHeader,
    operations,
    source: sourceExpression,
  };
}
