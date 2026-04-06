import { TokenCursor } from "./dataview-parser-utils";
import { tokenizeDataview } from "./dataview-lexer";
import type { SourceExpression, Token } from "./dataview-types";

function tokenizeSource(source: string): Token[] {
  return tokenizeDataview(source, {
    customTokenizers: [
      (lexer) => {
        if (lexer.current() !== "#") {
          return null;
        }

        lexer.advance();

        return {
          type: "string",
          value: `#${lexer.readWhile((char) => /[A-Za-z0-9/_-]/.test(char))}`,
        };
      },
    ],
    identifierPart: (char) => /[A-Za-z_-]/.test(char),
    identifierStart: (char) => /[A-Za-z_]/.test(char),
    keywords: ["AND", "OR"],
    parseQuotedString: (lexer) => lexer.readQuotedString("Unclosed source string"),
    singleCharTokenTypes: {
      "!": "operator",
      "(": "punctuation",
      ")": "punctuation",
    },
  });
}

class SourceParser extends TokenCursor {
  constructor(source: string) {
    super(tokenizeSource(source));
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
}

export function parseSourceExpression(source: string): SourceExpression {
  return new SourceParser(source).parse();
}
