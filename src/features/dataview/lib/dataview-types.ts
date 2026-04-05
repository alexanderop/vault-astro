export type Primitive = boolean | number | string | null | undefined | Date;

export interface DataviewLink {
  display: string;
  href: string;
  path: string;
}

export interface DataviewFileData {
  aliases: string[];
  cday?: Date;
  day?: Date;
  etags: string[];
  ext: string;
  folder: string;
  frontmatter: string[];
  inlinks: DataviewLink[];
  link: DataviewLink;
  mday?: Date;
  name: string;
  outlinks: DataviewLink[];
  path: string;
  tags: string[];
}

export interface DataviewPage {
  [key: string]: unknown;
  file: DataviewFileData;
}

export interface DataviewTask {
  checked: boolean;
  completed: boolean;
  completedAt?: Date;
  line: number;
  path: string;
  section?: string;
  status: string;
  tags: string[];
  text: string;
  visual: string;
}

export interface DataviewIndex {
  byAbsolutePath: Map<string, DataviewPage>;
  byContentPath: Map<string, DataviewPage>;
  pages: DataviewPage[];
  tasks: DataviewTaskRow[];
  resolveLinkTarget: (target: string) => DataviewPage | null;
}

export interface TableColumn {
  alias?: string;
  expression: Expression;
  source: string;
}

export type Expression =
  | { type: "binary"; left: Expression; operator: string; right: Expression }
  | { arguments: Expression[]; name: string; type: "call" }
  | { path: string[]; type: "field" }
  | { value: Primitive | DataviewLink; type: "literal" }
  | { argument: Expression; operator: string; type: "unary" };

export type SourceTarget = { path: string; type: "path" } | { type: "current" };

export type SourceExpression =
  | { type: "all" }
  | { path: string; type: "folder" }
  | { path: string; type: "file" }
  | { direction: "incoming" | "outgoing"; target: SourceTarget; type: "link" }
  | { tag: string; type: "tag" }
  | { operand: SourceExpression; type: "not" }
  | { left: SourceExpression; right: SourceExpression; type: "and" | "or" };

export interface DataviewListQueryHeader {
  format?: Expression;
  showId: boolean;
  type: "list";
}

export interface DataviewTableQueryHeader {
  fields: TableColumn[];
  showId: boolean;
  type: "table";
}

export interface DataviewTaskQueryHeader {
  type: "task";
}

export interface DataviewCalendarQueryHeader {
  field: TableColumn;
  type: "calendar";
}

export type DataviewQueryHeader =
  | DataviewCalendarQueryHeader
  | DataviewListQueryHeader
  | DataviewTableQueryHeader
  | DataviewTaskQueryHeader;

export type DataviewQueryOperation =
  | { clause: Expression; type: "where" }
  | { direction: "asc" | "desc"; expression: Expression; type: "sort" }
  | { amount: Expression; type: "limit" }
  | { field: TableColumn; type: "group" }
  | { field: TableColumn; type: "flatten" };

export interface DataviewQuery {
  header: DataviewQueryHeader;
  operations: DataviewQueryOperation[];
  source: SourceExpression;
}

export interface DataviewExecutionDiagnostic {
  errorCount: number;
  inputRows: number;
  outputRows: number;
  operation: DataviewQueryOperation["type"];
}

export interface DataviewGroupValue {
  key: unknown;
  rows: DataviewQueryRow[];
}

export interface DataviewTaskRow {
  file: DataviewFileData;
  page: DataviewPage;
  task: DataviewTask;
}

export type DataviewQueryRow = DataviewPage | DataviewTaskRow | DataviewGroupValue;

export interface DataviewExecutionRow {
  data: DataviewQueryRow;
  display: unknown;
  id: unknown;
  values: unknown[];
}

export interface DataviewExecutionResult {
  diagnostics: DataviewExecutionDiagnostic[];
  errors: string[];
  header: DataviewQueryHeader;
  rows: DataviewExecutionRow[];
}

export interface Token {
  type: "identifier" | "keyword" | "link" | "number" | "operator" | "punctuation" | "string";
  value: string;
}

export interface FileContext {
  history?: string[];
  path?: string;
}

export type DataviewFunction = (...arguments_: unknown[]) => unknown;
