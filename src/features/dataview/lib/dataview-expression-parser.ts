import { parseAliasedField, TokenCursor } from "./dataview-parser-utils";
import { parseSourceExpression } from "./dataview-source-parser";
import { normalizeLookupValue } from "../../../lib/content-utils";
import type {
  DataviewQuery,
  DataviewQueryOperation,
  Expression,
  TableColumn,
  Token,
} from "./dataview-types";
import { tokenizeDataview } from "./dataview-lexer";

function tokenizeExpression(source: string): Token[] {
  return tokenizeDataview(source, {
    customTokenizers: [
      (lexer) => {
        if (!/[0-9]/.test(lexer.current())) {
          return null;
        }

        return {
          type: "number",
          value: lexer.readWhile((char) => /[0-9.]/.test(char)),
        };
      },
    ],
    identifierPart: (char) => /[A-Za-z0-9_-]/.test(char),
    identifierStart: (char) => /[A-Za-z_]/.test(char),
    keywords: ["AND", "OR", "AS", "ASC", "DESC", "TRUE", "FALSE"],
    parseQuotedString: (lexer) => lexer.readQuotedStringWithEscapes(),
    singleCharTokenTypes: {
      "!": "operator",
      "(": "punctuation",
      ")": "punctuation",
      ",": "punctuation",
      ".": "punctuation",
      "<": "operator",
      "=": "operator",
      ">": "operator",
    },
    twoCharOperators: ["<=", ">=", "!=", "=="],
  });
}

class ExpressionParser extends TokenCursor {
  constructor(source: string) {
    super(tokenizeExpression(source));
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

  private checkPunctuation(value: string): boolean {
    const token = this.peek();
    return Boolean(token && token.type === "punctuation" && token.value === value);
  }

  private previous(): Token {
    return this.tokens[this.index - 1];
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
    return parseAliasedField(columnSource, findAliasSeparator, parseExpression);
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
      operations.push({
        field: parseAliasedField(
          command.slice("GROUP BY ".length).trim(),
          findAliasSeparator,
          parseExpression,
        ),
        type: "group",
      });
      continue;
    }

    if (upper.startsWith("FLATTEN ")) {
      operations.push({
        field: parseAliasedField(
          command.slice("FLATTEN ".length).trim(),
          findAliasSeparator,
          parseExpression,
        ),
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
