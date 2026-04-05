# Dataview Follow-Up Spec

## Goal

The current Dataview implementation supports a useful first slice:

- fenced `dataview` code blocks
- `LIST` and `TABLE`
- `FROM`, `WHERE`, `SORT`, `LIMIT`
- `contains()` and `length()`
- `this.<field>`
- folder, tag, link, and `outgoing()` sources

This document tracks the next work needed to move it closer to real Obsidian Dataview behavior while keeping the codebase maintainable.

## Current Constraints

- The implementation is intentionally partial, not full Dataview parity.
- The parser, evaluator, and index are now separated from the remark wrapper, but the engine is still large and should be split further as functionality grows.
- Query support is limited to the specific expression/function subset currently implemented.
- Rendering is static HTML only; there is no interactive query runtime.

## Next Work

### 1. Split the engine into smaller modules

Refactor `src/features/dataview/lib/dataview-engine.ts` into distinct parts:

- `dataview-index.ts`
- `dataview-tokenizer.ts`
- `dataview-expression-parser.ts`
- `dataview-source-parser.ts`
- `dataview-evaluator.ts`
- `dataview-renderer.ts`
- `dataview-types.ts`

This should happen before adding many more query features.

### 2. Improve Dataview field compatibility

Expand and normalize the page model to better match documented Dataview semantics:

- verify `file.tags` vs `file.etags`
- improve `file.folder`, `file.path`, and link/path normalization
- support more reliable current-page resolution for `this.*`
- review whether `file.cday` and `file.mday` should remain filesystem-derived
- evaluate support for `file.frontmatter`, `file.aliases`, `file.inlinks`, `file.outlinks`

### 3. Add more Dataview functions

Implement a larger documented subset incrementally, starting with common functions:

- `lower()`
- `upper()`
- `string()`
- `choice()`
- `default()`
- `date()`
- `round()`
- `replace()`

Each added function should have explicit test coverage.

### 4. Expand expression support

Improve expression parsing and evaluation:

- null handling
- better array comparison semantics
- link equality edge cases
- nested property access consistency
- support for additional literals where feasible
- clearer error messages for unsupported syntax

### 5. Expand source support

Add more `FROM` compatibility:

- single-file sources with exact Dataview expectations
- current-page source forms like `[[]]` / `[[#]]`
- better link-source semantics
- more complete boolean source combinations

### 6. Add more query commands

Implement additional documented commands in this order:

1. `GROUP BY`
2. `FLATTEN`
3. `TASK`
4. `CALENDAR`

`GROUP BY` and `FLATTEN` should come before `TASK` and `CALENDAR`, because they affect the query model directly and will shape later parser/evaluator design.

### 7. Improve rendering behavior

Bring output closer to Dataview expectations:

- `TABLE WITHOUT ID` edge cases
- better empty states
- better query error presentation
- consistent formatting for arrays, dates, links, booleans
- optional support for default list bullets/table headers closer to Dataview

### 8. Add tests

Create fixture-driven coverage for:

- `LIST` rendering
- `TABLE` rendering
- `FROM` folder/tag/link queries
- `WHERE` expressions
- `SORT` and `LIMIT`
- `this.*`
- unsupported syntax error states
- unpublished-content exclusion

Prefer deterministic fixtures over asserting against large built HTML files.

### 9. Add authoring examples

Create a small set of real content examples in markdown demonstrating:

- author page queries
- tag page queries
- note relationship queries
- table-based rollups

These examples should live in content files, not only tests, so the feature remains easy to inspect manually.

## Non-Goals For Now

- full Obsidian plugin parity in one pass
- JavaScript Dataview blocks
- inline Dataview fields
- runtime client-side query execution
- editing/query-builder UI

## Recommended Order

1. Split engine modules
2. Add tests
3. Improve field/source compatibility
4. Add more functions and expression support
5. Add `GROUP BY` and `FLATTEN`
6. Reassess `TASK` and `CALENDAR`
