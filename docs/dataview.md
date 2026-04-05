# Dataview

Vault includes a build-time Dataview implementation for a limited, explicitly supported subset of Obsidian Dataview.

It is designed for static publishing:

- Dataview queries run during markdown processing
- output is rendered as static HTML
- there is no client-side query runtime
- unsupported syntax renders a visible Dataview error block instead of failing the page build

This document describes what works today and how the implementation is organized.

## Supported Syntax

### Block form

Only fenced `dataview` code blocks are supported:

````md
```dataview
LIST
FROM "notes"
SORT file.name ASC
```
````

Inline Dataview fields and JavaScript Dataview blocks are not supported.

`TABLE` field lists may be written on one line or across multiple lines, as long as the query commands still begin on their own lines:

````md
```dataview
TABLE WITHOUT ID lower(file.name) AS "lower",
  upper(file.name) AS "upper"
FROM "notes"
SORT file.name ASC
```
````

### Query types

- `LIST`
- `TABLE`
- `TABLE WITHOUT ID`

### Commands

- `FROM`
- `WHERE`
- `SORT`
- `LIMIT`

Commands are parsed line by line. Keep each command on its own line.

### Expressions

Supported expression features:

- field access like `file.name`, `file.tags`, `this.slug`
- booleans: `true`, `false`
- numbers
- strings
- link literals like `[[note]]`
- unary negation: `!expr`
- comparisons: `=`, `==`, `!=`, `<`, `<=`, `>`, `>=`
- boolean operators: `AND`, `OR`
- function calls:
  - `contains(value, search)`
  - `length(value)`
  - `lower(value)`
  - `upper(value)`
  - `string(value)`
  - `choice(condition, truthy, falsy)`
  - `default(value, fallback)`
  - `date(value)`
  - `round(value[, precision])`
  - `replace(value, search, replacement)`

### Sources

Supported `FROM` sources:

- folder source: `FROM "notes"`
- tag source: `FROM #tag`
- file source: `FROM "notes/example.md"`
- link target source: `FROM [[target-note]]`
- outgoing source: `FROM outgoing([[target-note]])`
- boolean combinations:
  - `FROM "notes" OR #tag`
  - `FROM "notes" AND !#private`

## Page Model

Each published markdown note is indexed into a Dataview page object. Frontmatter fields are copied onto the page, and a `file` object is added with Dataview-style metadata.

Current `file.*` fields:

- `file.aliases`
- `file.cday`
- `file.day`
- `file.etags`
- `file.ext`
- `file.folder`
- `file.frontmatter`
- `file.inlinks`
- `file.link`
- `file.mday`
- `file.name`
- `file.outlinks`
- `file.path`
- `file.tags`

Notes with `publish: false` are excluded from the index and cannot appear in query results.

## `this.*` Behavior

`this.*` resolves against the current markdown file being rendered.

Example:

````md
```dataview
LIST
FROM "notes"
WHERE contains(authors, this.slug)
SORT date DESC
```
````

When that query appears on an author page with `slug: "jane-doe"`, `this.slug` resolves to `"jane-doe"`.

## Rendering Rules

- `LIST` renders a `<ul>`
- `TABLE` renders a `<table>`
- empty results render `No results`
- errors render a Dataview error block with the message and original query source

Value rendering rules:

- links render as wiki-link styled anchors
- arrays render as comma-separated values
- booleans render as `true` or `false`
- dates render with `en-US` long-date formatting

## Implementation Flow

The Dataview pipeline lives under `src/features/dataview/lib/`.

- `remark-dataview.ts`
  Replaces fenced `dataview` code blocks with rendered HTML during markdown processing.
- `dataview-engine.ts`
  Thin orchestration layer. Builds the index, resolves the current page, parses the query, executes it, and converts failures into Dataview error markup.
- `dataview-index.ts`
  Scans markdown files, parses frontmatter, builds the page index, and computes inlinks and outlinks.
- `dataview-expression-parser.ts`
  Tokenizes expressions and parses `LIST` and `TABLE` query structure.
- `dataview-source-parser.ts`
  Parses `FROM` source expressions.
- `dataview-evaluator.ts`
  Evaluates expressions, applies filters and sort order, and executes queries.
- `dataview-renderer.ts`
  Escapes HTML and formats values and error output.
- `dataview-types.ts`
  Shared Dataview types.

## Tests

Dataview coverage lives in [`src/features/dataview/lib/dataview-engine.test.ts`](/Users/alexanderopalic/vault/src/features/dataview/lib/dataview-engine.test.ts).

The tests use a small fixture vault under `src/features/dataview/lib/__tests__/fixtures/content/` and currently cover:

- query parsing
- `this.*` evaluation
- `LIST` rendering
- `TABLE WITHOUT ID`
- link-target and outgoing sources
- unsupported syntax error rendering
- `remarkDataview()` integration

Run them with:

```bash
pnpm test
```

## Current Limitations

Not supported today:

- `TASK`
- `GROUP BY`
- `FLATTEN`
- `CALENDAR`
- inline Dataview fields
- JavaScript Dataview blocks
- full Obsidian Dataview parity

Planned follow-up work is tracked in [`docs/dataview-follow-up-spec.md`](/Users/alexanderopalic/vault/docs/dataview-follow-up-spec.md).
