import type { Expression, TableColumn, Token } from "./dataview-types";

export class TokenCursor {
  protected index = 0;

  constructor(protected readonly tokens: Token[]) {}

  protected matchKeyword(...values: string[]): boolean {
    const token = this.peek();
    if (!token || token.type !== "keyword") return false;
    if (!values.includes(token.value.toUpperCase())) return false;
    this.index += 1;
    return true;
  }

  protected matchOperator(...values: string[]): boolean {
    const token = this.peek();
    if (!token || token.type !== "operator") return false;
    if (!values.includes(token.value)) return false;
    this.index += 1;
    return true;
  }

  protected matchPunctuation(value: string): boolean {
    const token = this.peek();
    if (!token || token.type !== "punctuation" || token.value !== value) return false;
    this.index += 1;
    return true;
  }

  protected consume(type: Token["type"], message: string): Token {
    const token = this.peek();
    if (!token || token.type !== type) throw new Error(message);
    this.index += 1;
    return token;
  }

  protected consumePunctuation(value: string) {
    if (!this.matchPunctuation(value)) {
      throw new Error(`Expected "${value}"`);
    }
  }

  protected peek(): Token | undefined {
    return this.tokens[this.index];
  }
}

export function parseAliasedField(
  source: string,
  findAliasSeparator: (source: string) => number,
  parseExpression: (source: string) => Expression,
): TableColumn {
  const aliasSeparator = findAliasSeparator(source);
  const expressionSource = aliasSeparator === -1 ? source : source.slice(0, aliasSeparator).trim();
  const aliasSource = aliasSeparator === -1 ? undefined : source.slice(aliasSeparator + 2).trim();

  return {
    alias: aliasSource?.replace(/^["']|["']$/g, ""),
    expression: parseExpression(expressionSource),
    source: expressionSource,
  };
}
