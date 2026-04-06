import type { Token } from "./dataview-types";

interface DataviewLexerConfig {
  identifierStart: (char: string) => boolean;
  identifierPart: (char: string) => boolean;
  keywords: string[];
  parseQuotedString: (lexer: DataviewLexer) => string;
  customTokenizers?: Array<(lexer: DataviewLexer) => Token | null>;
  twoCharOperators?: string[];
  singleCharTokenTypes?: Partial<Record<string, Token["type"]>>;
}

export class DataviewLexer {
  private index = 0;

  constructor(readonly source: string) {}

  isDone(): boolean {
    return this.index >= this.source.length;
  }

  current(): string {
    return this.source[this.index] ?? "";
  }

  startsWith(value: string): boolean {
    return this.source.startsWith(value, this.index);
  }

  peek(length = 1): string {
    return this.source.slice(this.index, this.index + length);
  }

  advance(amount = 1): void {
    this.index += amount;
  }

  skipWhitespace(): boolean {
    if (!/\s/.test(this.current())) {
      return false;
    }

    this.advance();
    return true;
  }

  readLink(errorMessage: string): string {
    const end = this.source.indexOf("]]", this.index + 2);
    if (end === -1) {
      throw new Error(errorMessage);
    }

    const value = this.source.slice(this.index + 2, end);
    this.index = end + 2;
    return value;
  }

  readQuotedStringWithEscapes(): string {
    const quote = this.current();
    let end = this.index + 1;
    let value = "";

    while (end < this.source.length) {
      if (this.source[end] === "\\" && end + 1 < this.source.length) {
        value += this.source[end + 1];
        end += 2;
        continue;
      }

      if (this.source[end] === quote) {
        this.index = end + 1;
        return value;
      }

      value += this.source[end];
      end += 1;
    }

    throw new Error("Unclosed string literal");
  }

  readQuotedString(errorMessage: string): string {
    const quote = this.current();
    let end = this.index + 1;
    let value = "";

    while (end < this.source.length && this.source[end] !== quote) {
      value += this.source[end];
      end += 1;
    }

    if (this.source[end] !== quote) {
      throw new Error(errorMessage);
    }

    this.index = end + 1;
    return value;
  }

  readWhile(predicate: (char: string) => boolean): string {
    const start = this.index;

    while (!this.isDone() && predicate(this.current())) {
      this.advance();
    }

    return this.source.slice(start, this.index);
  }
}

export function tokenizeDataview(source: string, config: DataviewLexerConfig): Token[] {
  const tokens: Token[] = [];
  const lexer = new DataviewLexer(source);

  while (!lexer.isDone()) {
    if (lexer.skipWhitespace()) {
      continue;
    }

    if (lexer.startsWith("[[")) {
      tokens.push({ type: "link", value: lexer.readLink("Unclosed link literal") });
      continue;
    }

    const current = lexer.current();

    if (current === '"' || current === "'") {
      tokens.push({ type: "string", value: config.parseQuotedString(lexer) });
      continue;
    }

    let token: Token | null = null;

    for (const customTokenizer of config.customTokenizers ?? []) {
      token = customTokenizer(lexer);
      if (token) {
        tokens.push(token);
        break;
      }
    }

    if (token) {
      continue;
    }

    const twoCharOperator = lexer.peek(2);
    if (config.twoCharOperators?.includes(twoCharOperator)) {
      tokens.push({ type: "operator", value: twoCharOperator });
      lexer.advance(2);
      continue;
    }

    const singleCharTokenType = config.singleCharTokenTypes?.[current];
    if (singleCharTokenType) {
      tokens.push({ type: singleCharTokenType, value: current });
      lexer.advance();
      continue;
    }

    if (config.identifierStart(current)) {
      const value = lexer.readWhile(config.identifierPart);
      const upper = value.toUpperCase();
      tokens.push({
        type: config.keywords.includes(upper) ? "keyword" : "identifier",
        value,
      });
      continue;
    }

    throw new Error(`Unexpected token "${current}"`);
  }

  return tokens;
}
