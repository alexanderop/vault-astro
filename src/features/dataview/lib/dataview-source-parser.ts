import type { SourceExpression, Token } from "./dataview-types";

function tokenizeSource(source: string): Token[] {
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
      if (end === -1) throw new Error("Unclosed link source");
      tokens.push({ type: "link", value: source.slice(index + 2, end) });
      index = end + 2;
      continue;
    }

    if (char === "#") {
      let end = index + 1;
      while (end < source.length && /[A-Za-z0-9/_-]/.test(source[end])) end += 1;
      tokens.push({ type: "string", value: source.slice(index, end) });
      index = end;
      continue;
    }

    if (char === '"' || char === "'") {
      let end = index + 1;
      let value = "";

      while (end < source.length && source[end] !== char) {
        value += source[end];
        end += 1;
      }

      if (source[end] !== char) throw new Error("Unclosed source string");
      tokens.push({ type: "string", value });
      index = end + 1;
      continue;
    }

    if (["(", ")"].includes(char)) {
      tokens.push({ type: "punctuation", value: char });
      index += 1;
      continue;
    }

    if (char === "!") {
      tokens.push({ type: "operator", value: "!" });
      index += 1;
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let end = index + 1;
      while (end < source.length && /[A-Za-z_-]/.test(source[end])) end += 1;
      const value = source.slice(index, end);

      tokens.push({
        type: ["AND", "OR"].includes(value.toUpperCase()) ? "keyword" : "identifier",
        value,
      });
      index = end;
      continue;
    }

    throw new Error(`Unexpected source token "${char}"`);
  }

  return tokens;
}

class SourceParser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(source: string) {
    this.tokens = tokenizeSource(source);
  }

  parse(): SourceExpression {
    const expression = this.parseOr();
    if (this.peek()) throw new Error(`Unexpected token "${this.peek()?.value}"`);
    return expression;
  }

  private parseOr(): SourceExpression {
    let expression = this.parseAnd();

    while (this.matchKeyword("OR")) {
      expression = { type: "or", left: expression, right: this.parseAnd() };
    }

    return expression;
  }

  private parseAnd(): SourceExpression {
    let expression = this.parseUnary();

    while (this.matchKeyword("AND")) {
      expression = { type: "and", left: expression, right: this.parseUnary() };
    }

    return expression;
  }

  private parseUnary(): SourceExpression {
    if (this.matchOperator("!")) {
      return { type: "not", operand: this.parseUnary() };
    }

    if (this.matchPunctuation("(")) {
      const expression = this.parseOr();
      this.consumePunctuation(")");
      return expression;
    }

    const token = this.peek();
    if (!token) throw new Error("Unexpected end of source");

    if (token.type === "string") {
      this.index += 1;
      const value = token.value;
      if (value.startsWith("#")) {
        return { type: "tag", tag: value };
      }

      return value.includes(".") ? { type: "file", path: value } : { type: "folder", path: value };
    }

    if (token.type === "link") {
      this.index += 1;
      return {
        direction: "incoming",
        target:
          token.value === "" || token.value === "#"
            ? { type: "current" }
            : { path: token.value, type: "path" },
        type: "link",
      };
    }

    if (token.type === "identifier" && token.value.toLowerCase() === "outgoing") {
      this.index += 1;
      this.consumePunctuation("(");
      const link = this.consume("link", "Expected [[note]] inside outgoing()");
      this.consumePunctuation(")");
      return {
        direction: "outgoing",
        target:
          link.value === "" || link.value === "#"
            ? { type: "current" }
            : { path: link.value, type: "path" },
        type: "link",
      };
    }

    throw new Error(`Unexpected source token "${token.value}"`);
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

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }
}

export function parseSourceExpression(source: string): SourceExpression {
  return new SourceParser(source).parse();
}
