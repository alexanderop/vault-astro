---
title: Full DQL Parity for Dataview
type: feat
status: active
date: 2026-04-05
---

# Full DQL Parity for Dataview

## Overview

Bring the Vault Dataview implementation to full Obsidian Dataview Query Language (DQL) parity. Today the implementation covers LIST, TABLE, FROM, WHERE, SORT, LIMIT, and two functions (`contains`, `length`). This plan closes the gap by adding TASK, CALENDAR, GROUP BY, FLATTEN, ~50 functions, arithmetic/date/duration expressions, lambdas, inline queries, and cross-page field access — all running at build time with static HTML output.

## Problem Statement

Users migrating from Obsidian Publish expect their Dataview queries to work. Today, queries using GROUP BY, FLATTEN, TASK, CALENDAR, or any function beyond `contains`/`length` render as error blocks. This forces users to simplify their notes before publishing, defeating the purpose of a "self-hosted Obsidian Publish alternative."

## Proposed Solution

Incrementally expand every layer of the Dataview pipeline — parser, evaluator, index, renderer — through 8 phased milestones. Each phase produces working, tested functionality that can ship independently.

## Technical Approach

### Architecture

The existing modular structure under `src/features/dataview/lib/` is solid:

```
dataview-expression-parser.ts   ← tokenizer + recursive descent parser
dataview-source-parser.ts       ← FROM source parsing
dataview-evaluator.ts           ← expression eval + query execution
dataview-renderer.ts            ← HTML output
dataview-index.ts               ← page scanning + frontmatter + links
dataview-types.ts               ← shared types
dataview-engine.ts              ← orchestration
remark-dataview.ts              ← remark plugin (fenced blocks)
```

Key architectural decisions:

1. **Row type polymorphism.** Introduce a `DataviewRow` union type: `DataviewPage | DataviewGroup | DataviewFlatRow`. GROUP BY produces `DataviewGroup = { key: unknown; rows: DataviewPage[] }`. FLATTEN annotates existing pages with extra fields via `DataviewFlatRow = DataviewPage & { [flattenedField]: unknown }`. The evaluator and renderer dispatch on row shape.

2. **Function registry.** Replace the `switch` in `evaluateExpression` case `"call"` with a `Map<string, DataviewFunction>` where `DataviewFunction = (args: unknown[], context: FunctionContext) => unknown`. Each function is a standalone implementation. This scales to 50+ functions without a giant switch.

3. **Pipeline order.** Enforce canonical Obsidian pipeline: `FROM → WHERE → FLATTEN → GROUP BY → SORT → LIMIT`, regardless of declaration order in the query text. Parse commands into the `DataviewQuery` structure, then execute them in fixed order.

4. **Hyphen disambiguation.** Hyphens inside identifiers keep current greedy tokenization (`due-date` is one identifier). Subtraction requires whitespace: `due - date`. This matches Obsidian behavior.

5. **Inline queries.** A new remark plugin `remark-dataview-inline.ts` visits `inlineCode` nodes matching `/^= .+/`, evaluates the expression, and replaces the node with an HTML span.

### Implementation Phases

#### Phase 1: Parser Foundation

Expand the tokenizer and expression parser to handle the full DQL expression language.

**Files:**

- `src/features/dataview/lib/dataview-expression-parser.ts`
- `src/features/dataview/lib/dataview-types.ts`

**Tasks:**

- [ ] Add arithmetic operators (`+`, `-`, `*`, `/`, `%`) to tokenizer — recognize only when surrounded by whitespace or after `)`, `]`, number, or identifier
- [ ] Add arithmetic precedence levels to parser: `*`/`/`/`%` bind tighter than `+`/`-`, both sit between comparison and unary
- [ ] Add `null` literal to parser
- [ ] Add array literal syntax `[expr, expr, ...]` — single `[` starts array, `[[` starts link (existing)
- [ ] Add object literal syntax `{ key: expr, ... }` — add `{`, `}`, `:` tokens
- [ ] Add array indexing `expr[expr]` and dynamic property access `expr["key"]`
- [ ] Add lambda expression parsing `(params) => body` — disambiguate from grouped expressions by lookahead for `=>`
- [ ] Add string concatenation via `+` operator in evaluator
- [ ] Extend `Expression` type union with: `array-literal`, `object-literal`, `lambda`, `index-access`
- [ ] Preserve backward compat: hyphens in identifiers remain greedy, `due-date` is one field

**Acceptance Criteria:**

- [ ] `1 + 2 * 3` parses as `1 + (2 * 3)`
- [ ] `due-date` parses as single field, `due - date` parses as subtraction
- [ ] `[1, 2, 3]` parses as array literal, `[[Page]]` parses as link literal
- [ ] `{ a: 1, b: 2 }` parses as object literal
- [ ] `list[0]` and `obj["key"]` parse as index access
- [ ] `(x) => x + 1` parses as lambda; `(x + 1)` parses as grouped expression
- [ ] `null` parses as null literal
- [ ] All existing tests still pass

**Estimated effort:** Medium-large. ~400 lines of parser changes + tests.

---

#### Phase 2: Function Registry & Core Functions

Replace the inline switch with a registry and implement the most-used functions.

**Files:**

- `src/features/dataview/lib/dataview-functions.ts` (new)
- `src/features/dataview/lib/dataview-evaluator.ts`
- `src/features/dataview/lib/dataview-types.ts`

**Tasks:**

- [ ] Create `dataview-functions.ts` with `FunctionRegistry` type: `Map<string, (args: unknown[], ctx: FunctionContext) => unknown>`
- [ ] Define `FunctionContext` interface: `{ row: DataviewPage; current: DataviewPage | null; index: DataviewIndex }`
- [ ] Migrate `contains()` and `length()` from evaluator switch to registry
- [ ] Implement constructor functions:
  - [ ] `typeof()` — returns type name string
  - [ ] `string()` — convert to string
  - [ ] `number()` — extract first numeric value
  - [ ] `date()` — parse date from string, with shorthands (`today`, `now`, `tomorrow`, `yesterday`, `sow`, `eow`, `som`, `eom`, `soy`, `eoy`)
  - [ ] `dur()` — parse duration string (e.g., `"2 days 4 hours"`)
  - [ ] `list()` / `array()` — create array
  - [ ] `object()` — create object from key-value pairs
  - [ ] `link()` — create link object
  - [ ] `elink()` — create external link
- [ ] Implement numeric functions: `round()`, `trunc()`, `floor()`, `ceil()`, `min()`, `max()`, `sum()`, `product()`, `average()`, `minby()`, `maxby()`
- [ ] Implement string functions: `lower()`, `upper()`, `replace()`, `regextest()`, `regexmatch()`, `regexreplace()`, `split()`, `startswith()`, `endswith()`, `padleft()`, `padright()`, `substring()`, `truncate()`
- [ ] Implement container functions: `icontains()`, `econtains()`, `containsword()`, `extract()`, `sort()`, `reverse()`, `nonnull()`, `firstvalue()`, `all()`, `any()`, `none()`, `join()`, `filter()`, `unique()`, `map()`, `flat()`, `slice()`
- [ ] Implement date/time functions: `striptime()`, `dateformat()`, `localtime()`
- [ ] Implement duration function: `durationformat()`
- [ ] Implement utility functions: `default()`, `choice()`, `display()`, `meta()`
- [ ] Add lambda evaluation support in evaluator (for `filter`, `map`, `all`, `any`, `none`, `minby`, `maxby`)
- [ ] Implement `dateformat()` with Luxon-compatible token subset (`yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, `EEE`, `EEEE`, `MMMM`, `MMM`, `D`, `t`, `T`) — custom formatter, no Luxon dependency

**Acceptance Criteria:**

- [ ] Each function has at least 2 test cases (happy path + edge case)
- [ ] `filter(file.tags, (t) => startswith(t, "#project"))` works end-to-end
- [ ] `date(today)` returns current build date
- [ ] `dur("2 days 4 hours")` creates a duration object
- [ ] `sum(rows.rating)` works (in preparation for GROUP BY)
- [ ] `default(missing-field, "N/A")` returns `"N/A"` for null/undefined fields
- [ ] Existing `contains()` and `length()` behavior unchanged

**Estimated effort:** Large. ~800 lines of function implementations + tests.

---

#### Phase 3: Expression Enhancements

Add date/duration types, arithmetic, and cross-page field access.

**Files:**

- `src/features/dataview/lib/dataview-evaluator.ts`
- `src/features/dataview/lib/dataview-types.ts`
- `src/features/dataview/lib/dataview-renderer.ts`

**Tasks:**

- [ ] Implement duration type as a simple object: `{ years, months, weeks, days, hours, minutes, seconds }`
- [ ] Implement duration parsing in tokenizer/evaluator for `dur(...)` calls
- [ ] Implement date arithmetic in binary expression evaluator:
  - [ ] `date - date → duration`
  - [ ] `date + duration → date`
  - [ ] `date - duration → date`
  - [ ] `duration + duration → duration`
- [ ] Implement date property access: `.year`, `.month`, `.day`, `.hour`, `.minute`, `.second`, `.week`, `.weekday` — when a field access path resolves to a Date, allow sub-property access
- [ ] Implement string concatenation: `string + string → string`, `string + any → string`
- [ ] Implement string repetition: `string * number → string`
- [ ] Implement cross-page field access: `[[Link]].field` — when a literal link is followed by `.field`, resolve the link against the index and access the field on the resolved page
- [ ] Implement field name normalization: spaces → hyphens, lowercase, strip formatting tokens — apply at index time to frontmatter keys
- [ ] Add duration rendering to `renderValue()`: format as human-readable string (e.g., "2 days, 4 hours")
- [ ] Add null rendering: render as `"-"` in TABLE cells

**Acceptance Criteria:**

- [ ] `file.ctime - file.mtime` produces a duration
- [ ] `date(today) + dur(7 days)` produces a date 7 days from build date
- [ ] `file.ctime.year` returns the year number
- [ ] `"Hello" + " " + "World"` evaluates to `"Hello World"`
- [ ] `[[Some Page]].rating` resolves the linked page and returns its `rating` field
- [ ] Frontmatter key `Due Date` accessible as `due-date` in queries
- [ ] Duration values render readably in tables
- [ ] Null/missing values render as `-` in TABLE cells

**Estimated effort:** Medium. ~300 lines of evaluator changes + tests.

---

#### Phase 4: Index Enhancements

Expand the page index with task extraction and additional metadata.

**Files:**

- `src/features/dataview/lib/dataview-index.ts`
- `src/features/dataview/lib/dataview-types.ts`

**Tasks:**

- [ ] Define `DataviewTask` interface:
  ```typescript
  interface DataviewTask {
    status: string; // character inside [ ]
    checked: boolean; // any character (not space)
    completed: boolean; // specifically 'x'
    text: string; // plain text content
    tags: string[]; // tags within task text
    line: number; // line number in source
    path: string; // file path
    section: DataviewLink; // link to parent heading
    link: DataviewLink; // link to task block
    children: DataviewTask[]; // subtasks
    outlinks: DataviewLink[]; // links in task text
  }
  ```
- [ ] Define `DataviewListItem` interface (extends DataviewTask with `task: boolean` discriminator)
- [ ] Implement task extraction in `createDataviewIndex`:
  - [ ] Parse markdown body for `- [ ]`, `- [x]`, `- [X]`, and custom status `- [/]`, `- [-]` etc.
  - [ ] Handle nested tasks via indentation tracking
  - [ ] Extract tags from task text
  - [ ] Extract wikilinks from task text
  - [ ] Map tasks to their parent section heading
  - [ ] Skip tasks inside code blocks and code fences
- [ ] Add `file.tasks: DataviewTask[]` to `DataviewFileData`
- [ ] Add `file.lists: DataviewListItem[]` to `DataviewFileData` (all list items including tasks)
- [ ] Add `file.size: number` via `statSync` (already calling stat for dates)
- [ ] Add `file.ctime: Date` and `file.mtime: Date` as full datetime fields (keep `file.cday`/`file.mday` as date-only for compat)
- [ ] Change `file.frontmatter` from `string[]` to `Record<string, unknown>` (parsed YAML object)
- [ ] Apply field name normalization to frontmatter keys at index time

**Acceptance Criteria:**

- [ ] `file.tasks` contains all `- [ ]` and `- [x]` items from a test fixture note
- [ ] Nested tasks appear as `children` on their parent task
- [ ] Tasks inside code blocks are excluded
- [ ] `file.lists` includes both task items (`task: true`) and regular list items (`task: false`)
- [ ] `file.size` returns file size in bytes
- [ ] `file.ctime` includes time component
- [ ] `file.frontmatter` is an object, not a string array
- [ ] All existing tests updated for the `file.frontmatter` type change

**Estimated effort:** Medium-large. ~400 lines of index changes + new fixtures + tests.

---

#### Phase 5: FLATTEN & GROUP BY

Add the two pipeline commands that restructure result sets.

**Files:**

- `src/features/dataview/lib/dataview-types.ts`
- `src/features/dataview/lib/dataview-expression-parser.ts`
- `src/features/dataview/lib/dataview-evaluator.ts`
- `src/features/dataview/lib/dataview-renderer.ts`

**Tasks:**

- [ ] Add to `DataviewQuery`:
  ```typescript
  flatten?: { expression: Expression; alias?: string };
  groupBy?: { expression: Expression; alias?: string };
  sort?: { fields: { expression: Expression; direction: "asc" | "desc" }[] };  // multi-sort
  ```
- [ ] Parse `FLATTEN expr AS alias` command
- [ ] Parse `GROUP BY expr AS "alias"` command
- [ ] Parse multi-field SORT: `SORT field1 ASC, field2 DESC`
- [ ] Implement FLATTEN execution:
  - [ ] For each page, evaluate the flatten expression
  - [ ] If result is an array, produce one row per element with the alias field set
  - [ ] If result is not an array, keep the row as-is with the alias field set to the value
- [ ] Implement GROUP BY execution:
  - [ ] Group pages by evaluating the group expression on each
  - [ ] Produce `{ key, rows }` groups
  - [ ] Support field swizzling: `rows.fieldName` returns array of that field across group members
- [ ] Enforce canonical pipeline order: FROM → WHERE → FLATTEN → GROUP BY → SORT → LIMIT
- [ ] Implement multi-field sort with stable ordering
- [ ] Update LIST renderer for grouped output: render group key as header, nested `<ul>` for items
- [ ] Update TABLE renderer for grouped output: group key replaces File column, render `rows.*` aggregations
- [ ] Add `LIST WITHOUT ID` support (skip file link, show only expression)

**Acceptance Criteria:**

- [ ] `FLATTEN file.tags AS tag` produces one row per tag
- [ ] `GROUP BY file.folder` groups pages by folder, `length(rows)` returns group size
- [ ] `rows.file.link` returns array of links in a group (field swizzling)
- [ ] `SORT date ASC, file.name DESC` sorts by date first, then name
- [ ] `LIST WITHOUT ID file.name` renders names without file links
- [ ] Pipeline order enforced: `WHERE` before `FLATTEN` before `GROUP BY` regardless of query text order
- [ ] FLATTEN then GROUP BY works correctly in combination
- [ ] Grouped TABLE renders group headers

**Estimated effort:** Large. ~500 lines across parser, evaluator, renderer + tests.

---

#### Phase 6: TASK & CALENDAR Query Types

Add the two remaining query types.

**Files:**

- `src/features/dataview/lib/dataview-expression-parser.ts`
- `src/features/dataview/lib/dataview-evaluator.ts`
- `src/features/dataview/lib/dataview-renderer.ts`
- `src/features/dataview/lib/dataview-types.ts`
- `src/styles/globals.css`

**Tasks:**

- [ ] Parse `TASK` query type
- [ ] Parse `CALENDAR date-expression` query type
- [ ] Implement TASK query execution:
  - [ ] Collect all tasks from matching pages (via `file.tasks`)
  - [ ] Apply WHERE at task level (filter individual tasks, not pages)
  - [ ] Support GROUP BY on tasks (commonly `GROUP BY file.link`)
  - [ ] Parent task rule: if parent matches, show children; if only child matches, show only child
- [ ] Implement TASK rendering:
  - [ ] Render as `<ul>` with checkbox-styled `<li>` items
  - [ ] `<input type="checkbox" disabled checked>` for completed, unchecked for incomplete
  - [ ] Render task text with wikilinks resolved
  - [ ] Render nested subtasks as nested `<ul>`
  - [ ] Support grouped task output (group key header + nested task list)
- [ ] Implement CALENDAR query execution:
  - [ ] Evaluate the date expression for each page
  - [ ] Filter pages where the expression resolves to a valid date
  - [ ] Group pages by year-month
  - [ ] Ignore SORT and GROUP BY (no effect on CALENDAR)
- [ ] Implement CALENDAR rendering:
  - [ ] One `<table>` per month with day-of-week headers (Mon–Sun)
  - [ ] Each cell is a day number
  - [ ] Days with matching pages get a dot indicator (`<span class="dataview-calendar-dot">`) linked to the page
  - [ ] Multiple pages on same day: multiple dots or a count badge
  - [ ] Month/year header above each calendar grid
  - [ ] Empty months between first and last result month are included
- [ ] Add CSS for TASK and CALENDAR rendering:
  - [ ] `.dataview-task` — task list styling
  - [ ] `.dataview-task input[type="checkbox"]` — checkbox appearance
  - [ ] `.dataview-calendar` — calendar grid
  - [ ] `.dataview-calendar-dot` — date dot indicator
  - [ ] `.dataview-calendar th` — day-of-week headers

**Acceptance Criteria:**

- [ ] `TASK WHERE !completed` returns uncompleted tasks across vault
- [ ] `TASK WHERE contains(tags, "#important") GROUP BY file.link` groups tasks by file
- [ ] Completed tasks render with checked checkbox
- [ ] Nested subtasks render indented
- [ ] `CALENDAR file.cday` renders a month grid with dots on creation dates
- [ ] `CALENDAR due WHERE typeof(due) = "date"` only shows pages with valid due dates
- [ ] SORT on CALENDAR is silently ignored
- [ ] Multi-month result sets render multiple calendar grids

**Estimated effort:** Large. ~600 lines across evaluator, renderer, CSS + tests.

---

#### Phase 7: Inline Queries

Add `= expression` inline query support in note text.

**Files:**

- `src/features/dataview/lib/remark-dataview-inline.ts` (new)
- `src/features/dataview/lib/dataview-engine.ts`
- `astro.config.mjs`

**Tasks:**

- [ ] Create `remark-dataview-inline.ts` remark plugin:
  - [ ] Visit `inlineCode` nodes
  - [ ] Match pattern: content starts with `= ` (equals + space)
  - [ ] Extract expression text (everything after `= `)
  - [ ] Parse and evaluate the expression using existing `parseExpression` + `evaluateExpression`
  - [ ] Replace inlineCode node with HTML span: `<span class="dataview-inline">${renderValue(result)}</span>`
  - [ ] On parse/eval error: leave original inlineCode unchanged (graceful degradation)
- [ ] Wire current page context (`this.*`) into inline evaluation
- [ ] Register plugin in `astro.config.mjs` after `remarkDataview`
- [ ] Add CSS for `.dataview-inline`

**Acceptance Criteria:**

- [ ] `` `= this.file.name` `` renders the current file name inline
- [ ] `` `= date(today)` `` renders the build date inline
- [ ] `` `= length(this.file.tags)` `` renders the tag count
- [ ] `` `= [[Other Page]].rating` `` resolves cross-page field
- [ ] Invalid expressions render as original code text (no error block inline)
- [ ] `` `=no-space` `` (no space after `=`) is NOT treated as inline query
- [ ] Regular inline code (`` `const x = 1` ``) is not affected

**Estimated effort:** Small-medium. ~150 lines + tests.

---

#### Phase 8: Polish & Edge Cases

Final pass for completeness and compatibility.

**Files:** Various across the feature.

**Tasks:**

- [ ] Add `reduce()` function with two-parameter lambda: `reduce(list, (acc, x) => acc + x, initial)`
- [ ] Add `hash()` function for deterministic randomization
- [ ] Improve rendering:
  - [ ] Arrays in TABLE cells render as `<ul>` sub-lists
  - [ ] Objects render as key-value definition lists
  - [ ] Embedded links render as images when pointing to image files
- [ ] Improve error messages for common mistakes:
  - [ ] "Did you mean GROUP BY?" when `GROUPBY` (no space) is used
  - [ ] Function name suggestions for typos (Levenshtein distance)
  - [ ] Clear message when TASK query has no tasks in matching pages
- [ ] Handle edge cases:
  - [ ] Empty vault (no pages) — all query types return "No results"
  - [ ] FLATTEN on non-array field — treat as single-element array
  - [ ] GROUP BY on null/undefined field — group as "No value"
  - [ ] CALENDAR with all-null dates — render "No results"
  - [ ] Circular cross-page references — detect and break cycles
  - [ ] Very large result sets — warn if >1000 rows in build output
- [ ] Add `file.starred` stub (always `false` — no Obsidian bookmarks in static build)
- [ ] Skip `embed()` (not meaningful in static HTML, document as unsupported)
- [ ] Audit all existing tests for regressions from type changes

**Acceptance Criteria:**

- [ ] All existing Dataview example notes render correctly
- [ ] No build errors on the full vault
- [ ] `vp check` passes
- [ ] `vp test` passes with >90% line coverage on dataview feature
- [ ] Error blocks show helpful messages for common syntax mistakes

**Estimated effort:** Medium. ~300 lines of fixes + tests.

---

## Alternative Approaches Considered

### 1. Port Obsidian Dataview source directly

**Rejected.** The Obsidian Dataview plugin is tightly coupled to the Obsidian runtime (DOM APIs, `app.vault`, `app.metadataCache`). Porting would require replacing every Obsidian API call. The existing custom implementation is cleaner for static builds and already covers the core architecture.

### 2. Use a JS expression evaluator library (e.g., `expr-eval`, `mathjs`)

**Rejected.** Dataview's expression language has non-standard features (link literals, `this.*` resolution, field swizzling, duration arithmetic) that no generic evaluator handles. Adapting one would be more work than extending the existing custom parser.

### 3. Add Luxon as a dependency for date handling

**Rejected.** Luxon is 72KB minified. Dataview only uses a small subset of Luxon's formatting tokens. A custom formatter for the ~15 commonly used tokens is simpler and avoids the dependency. If full Luxon compatibility proves necessary, it can be added later.

### 4. Implement DataviewJS (JavaScript API)

**Deferred.** Full DQL parity covers 95%+ of real-world Dataview usage. DataviewJS would require a sandboxed JS runtime at build time (security concerns), a DOM emulation layer, and a completely separate execution path. The cost-benefit ratio is poor for the remaining 5% of use cases. Can revisit if user demand warrants it.

### 5. Lazy task extraction (only when TASK query exists)

**Considered but rejected for Phase 1.** Would require a two-pass build: first pass to detect TASK queries, second pass with task extraction enabled. This adds significant complexity. Eager extraction at index time is simpler. If build performance becomes a problem with large vaults, lazy extraction can be added as an optimization in a follow-up.

## Acceptance Criteria

### Functional Requirements

- [ ] All four DQL query types work: LIST, TABLE, TASK, CALENDAR
- [ ] All six DQL commands work: FROM, WHERE, SORT, LIMIT, GROUP BY, FLATTEN
- [ ] LIST WITHOUT ID and TABLE WITHOUT ID both work
- [ ] Multi-field SORT works
- [ ] All ~50 Dataview functions implemented and tested
- [ ] Inline queries (`= expr`) work in note text
- [ ] Duration and date types with arithmetic
- [ ] Lambda expressions for higher-order functions
- [ ] Cross-page field access via `[[Link]].field`
- [ ] Task extraction from markdown bodies into `file.tasks`
- [ ] Canonical pipeline order enforced

### Non-Functional Requirements

- [ ] Build time increase <2x for a 500-note vault (measure before/after)
- [ ] No client-side JavaScript added (static HTML only)
- [ ] TypeScript strict mode — no `any` types
- [ ] Backward compatible: all existing Dataview queries produce same output (except `file.frontmatter` type change and null rendering, which are documented breaking changes)

### Quality Gates

- [ ] `vp check` passes (format + lint + type check)
- [ ] `vp test` passes with >90% coverage on dataview feature
- [ ] `pnpm build` succeeds on full vault
- [ ] Every function has at least 2 tests
- [ ] Every query type has at least 3 integration tests
- [ ] Error blocks shown for genuinely unsupported syntax (DataviewJS, inline fields)

## Dependencies & Prerequisites

- **Phase 1** has no dependencies — can start immediately
- **Phase 2** depends on Phase 1 (needs arithmetic + lambda parser support for function implementations)
- **Phase 3** depends on Phase 2 (needs `date()` and `dur()` functions for arithmetic)
- **Phase 4** is independent of Phases 1-3 — can run in parallel
- **Phase 5** depends on Phases 1-3 (needs expression support), soft-depends on Phase 4 (needs tasks for TASK GROUP BY testing)
- **Phase 6** depends on Phases 4 + 5 (needs task index + GROUP BY)
- **Phase 7** depends on Phase 2 (needs full expression + function support)
- **Phase 8** depends on all prior phases

```
Phase 1 (Parser) ──→ Phase 2 (Functions) ──→ Phase 3 (Expressions) ──→ Phase 5 (GROUP BY/FLATTEN)
                                                                            │
Phase 4 (Index) ─── can run in parallel ────────────────────────────────────┤
                                                                            ↓
                                                                     Phase 6 (TASK/CALENDAR)
Phase 7 (Inline) ─── depends on Phase 2 only ───────────────────────────────
                                                                            ↓
                                                                     Phase 8 (Polish)
```

## Risk Analysis & Mitigation

| Risk                                                    | Likelihood | Impact | Mitigation                                                                                                  |
| ------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| GROUP BY row type breaks existing evaluator assumptions | High       | High   | Design `DataviewRow` union type in Phase 1 types, validate with spike before full implementation            |
| Hyphen ambiguity causes parser regressions              | Medium     | High   | Comprehensive test suite for edge cases: `due-date`, `a - b`, `a-b - c-d`, `-5` (negative number)           |
| Task extraction significantly slows builds              | Medium     | Medium | Measure build time before/after Phase 4. If >2x slower, add lazy extraction or caching                      |
| 50+ functions create maintenance burden                 | Low        | Medium | Function registry pattern + per-function test files keep implementations isolated                           |
| `file.frontmatter` type change breaks user queries      | High       | Low    | Document as breaking change. Low real-world impact since `file.frontmatter` as `string[]` was rarely useful |
| CALENDAR HTML/CSS complexity for responsive layouts     | Medium     | Low    | Start with simple month grid, iterate on CSS. No JS needed.                                                 |
| `date(today)` staleness in static builds                | Low        | Low    | Acceptable trade-off for static publishing. Document that date shorthands evaluate at build time.           |

## Future Considerations

Features explicitly deferred from this plan:

- **DataviewJS** (`dataviewjs` code blocks with `dv.*` API) — major architectural addition requiring sandboxed JS runtime
- **Inline fields** (`key:: value` in note body) — significant indexing complexity, separate initiative
- **Interactive task toggling** — requires client-side JS and file write-back, contradicts static-build philosophy
- **Query result caching** — optimize if build times become a problem
- **Custom CSS per query** — Obsidian supports `cssclasses` frontmatter; could be added later

## Documentation Plan

- [ ] Update `docs/dataview.md` with new syntax documentation after each phase
- [ ] Update `docs/dataview-follow-up-spec.md` to mark completed items
- [ ] Add example notes for each new query type in `src/content/notes/`
- [ ] Document breaking changes (`file.frontmatter` type, null rendering) in changelog

## References & Research

### Internal References

- Current implementation: `src/features/dataview/lib/` (7 modules)
- Existing spec: `docs/dataview.md`
- Follow-up spec: `docs/dataview-follow-up-spec.md`
- Test fixtures: `src/features/dataview/lib/__tests__/fixtures/content/`
- Remark plugin integration: `astro.config.mjs` (remarkPlugins array)
- Content resolver: `src/lib/content-resolver.ts`
- CSS: `src/styles/globals.css` (`.dataview*` classes)

### External References

- Obsidian Dataview docs: https://blacksmithgu.github.io/obsidian-dataview/
- Dataview functions reference: https://blacksmithgu.github.io/obsidian-dataview/reference/functions/
- Dataview expressions: https://blacksmithgu.github.io/obsidian-dataview/reference/expressions/
- Dataview source code: https://github.com/blacksmithgu/obsidian-dataview
- Luxon format tokens (for dateformat compat): https://moment.github.io/luxon/#/formatting

### Related Work

- Existing follow-up spec (`docs/dataview-follow-up-spec.md`) — this plan supersedes it
