---
title: "Testing Pyramid Strategy for Vault"
type: feat
status: active
date: 2026-04-05
---

## Implementation Status

**Phase 1 (Unit + Integration): COMPLETE** — 2026-04-05
**Phase 2 (Component Tests): COMPLETE** — 2026-04-05
**Phase 3 (E2E Tests): NOT STARTED**

**Current state:** 19 test files, 92 tests, ~2s total runtime. Vitest projects config with `unit` (Node) and `component` (browser mode + Playwright) projects.

## Enhancement Summary

**Deepened on:** 2026-04-05
**Sections enhanced:** 8
**Research agents used:** test-engineer, kieran-typescript-reviewer, performance-oracle, architecture-strategist, code-simplicity-reviewer, pattern-recognition-specialist, Context7 (Vitest, Astro, Playwright docs)

### Key Improvements

1. **Revised pyramid proportions** — 60/25/10/5 (unit/integration/component/E2E) to reflect Vault's content-pipeline nature
2. **Added integration test layer** — composed remark pipeline tests promoted from afterthought to named layer
3. **Incremental adoption path** — start with zero config changes, add layers only when pain is felt
4. **Fixed code examples** — corrected `vi.mock` hoisting bug, switched to `userEvent`, aligned with existing AST-based test pattern
5. **Performance optimizations** — `sequence.concurrent`, `trace: retain-on-failure`, thread pool confirmation
6. **Architectural corrections** — test utils moved outside `src/`, cross-feature tests in `test/integration/`
7. **Browser mode over happy-dom** — component tests use Vitest browser mode with Playwright instead of happy-dom, providing real browser rendering and built-in locators

### New Considerations Discovered

- Existing test uses direct AST manipulation (`fromMarkdown`), not unified pipeline — align new tests with this pattern
- `getViteConfig` from `astro/config` adds unnecessary overhead for pure unit tests
- `vi.mock` inside a function body does not work as expected due to hoisting — use `vi.hoisted` pattern
- Missing test targets: asset/attachment resolution, 404 handling, build output verification, accessibility (axe-core)
- Radix Dialog renders content in a portal — component tests must use `page.getBy*()` from `vitest/browser` for portal-rendered elements, not `screen.getBy*()`

---

# Testing Pyramid Strategy for Vault

## Overview

Establish a testing strategy following the testing pyramid for Vault (Astro 6 + React 19). The focus is on **fast feedback loops** — the bulk of tests should run in milliseconds in Node, with heavier layers added sparingly for critical flows.

**Current state:** Vitest 4.1.2 with projects config — `unit` (Node, 17 files) and `component` (browser mode + Playwright, 2 files). 92 tests across 19 files, ~2s total. No E2E tests yet.

## The Pyramid (Revised)

The original 80/15/5 split is a generic backend ratio. Vault is a **content-rendering pipeline** — markdown in, HTML out. The real risk lives in remark plugin composition and correct rendering. Revised proportions:

```
         /   E2E   \         Playwright — 3-5 critical flows (5%)
        /------------\
       /  Component   \      Vitest browser mode + Playwright (10%)
      /----------------\
     /   Integration    \    Composed remark pipeline tests (25%)
    /--------------------\
   /       Unit           \  Individual functions, pure logic (60%)
  /------------------------\
```

| Layer       | Environment | Tools                                      | Speed          | Volume | What It Catches                                 |
| ----------- | ----------- | ------------------------------------------ | -------------- | ------ | ----------------------------------------------- |
| Unit        | Node        | Vitest                                     | ~1ms/test      | 60%    | Individual function bugs                        |
| Integration | Node        | Vitest                                     | ~5-20ms/test   | 25%    | Plugin ordering conflicts, pipeline regressions |
| Component   | Chromium    | Vitest browser mode + vitest-browser-react | ~10-100ms/test | 10%    | Rendering bugs, interaction failures            |
| E2E         | Chromium    | Playwright                                 | ~1-5s/test     | 5%     | Full user flow regressions                      |

### Research Insights: Why a Separate Integration Layer

Individual remark plugins pass their unit tests but fail when composed together (e.g., wikilinks inside callouts, dataview queries in embeds). This is Vault's highest-risk seam. Pipeline integration tests run the full remark chain against realistic markdown fixtures and catch ordering conflicts that no unit test can.

## Layer 1: Unit Tests (Node)

**What to test:** Pure logic with no DOM or framework dependencies.

**Tested targets (17 unit/integration test files):**

- `src/features/wikilinks/lib/remark-wikilinks.test.ts` — wikilink parsing, resolution, aliases, broken links, image embeds
- `src/features/embeds/lib/remark-embeds.test.ts` — embed transclusion, missing targets
- `src/features/embeds/lib/remark-block-refs.test.ts` — block reference resolution
- `src/features/callouts/lib/remark-callouts.test.ts` �� callout parsing and rendering
- `src/features/highlights/lib/remark-highlights.test.ts` — `==highlight==` and `%%comment%%` syntax
- `src/features/mermaid/lib/remark-mermaid.test.ts` — mermaid code block → div conversion
- `src/features/tags/lib/remark-tags.test.ts` — `#tag` and `#nested/tag` parsing
- `src/features/backlinks/lib/backlink-resolver.test.ts` — bidirectional link correctness
- `src/features/navigation/lib/sidebar-tree.test.ts` — tree building, ordering, `nav_hidden` filtering
- `src/features/search/lib/search-index.test.ts` — index generation, filtering
- `src/features/graph/lib/graph-data-builder.test.ts` — nodes, edges, orphans
- `src/features/dataview/lib/dataview-engine.test.ts` — dataview query engine
- `src/lib/content-resolver.test.ts` ��� content resolution, filesystem resolver
- `src/lib/note-links.test.ts` — wikilink extraction, link index building
- `src/lib/notes.test.ts` — getNoteTitle, getNoteSummary, getNoteHref, getNoteDate, sortNotesByDateDesc
- `test/integration/pipeline.test.ts` — composed remark pipeline (5 scenarios)
- `test/integration/publish-filtering.test.ts` — publish:false across sidebar, search, backlinks, graph

**Remaining untested targets:**

- `src/lib/utils.ts` — `cn()` utility (trivial, low risk)
- `src/content.config.ts` �� Zod schema validation against frontmatter fixtures
- **Asset/attachment resolution** — `![[image.png]]` embeds resolving to `/attachments/image.png` (partially covered in wikilinks test)
- **Build output verification** — no route generated for unpublished notes (requires E2E)

**Conventions:**

- Co-locate tests next to source: `sidebar-tree.ts` → `sidebar-tree.test.ts`
- Use `__tests__/fixtures/` for markdown input fixtures (follow existing dataview pattern)
- Use `{name}.md` / `{name}.expected.html` fixture pairs for remark plugin tests — makes failures self-documenting
- Mock `getCollection()` explicitly per-test — Astro's content layer is unavailable in plain Vitest

**Pattern for remark plugin tests (aligned with existing codebase):**

The existing dataview test uses direct AST manipulation via `fromMarkdown()`, not a full unified pipeline. Align new tests with this established pattern:

```ts
// src/features/notes/lib/remark-wikilinks.test.ts
import { describe, it, expect } from "vitest";
import { fromMarkdown } from "mdast-util-from-markdown";
import { remarkWikilinks } from "./remark-wikilinks";

function processTree(md: string) {
  const tree = fromMarkdown(md);
  remarkWikilinks(/* options */)(tree);
  return tree;
}

describe("remarkWikilinks", () => {
  it("resolves basic wikilink", () => {
    const tree = processTree("[[My Note]]");
    const link = tree.children[0]; // paragraph -> link node
    expect(link).toMatchObject({
      type: "link",
      url: "/my-note",
    });
  });

  it("handles aliased wikilink", () => {
    const tree = processTree("[[My Note|display text]]");
    // assert on link text child
    expect(tree).toMatchObject(expect.objectContaining({ children: expect.any(Array) }));
  });

  it("marks broken links with data attribute", () => {
    const tree = processTree("[[nonexistent]]");
    // assert broken-link class or data attribute
  });
});
```

### Research Insights: Unit Test Best Practices

**Dependency injection over global mocking:** Design resolver functions to accept a collection as a parameter rather than importing `getCollection` directly. This makes tests simpler (pass fixtures directly) and decouples from Astro internals. Reserve `vi.mock("astro:content")` for the thin integration layer only.

**Naming convention:** Use `describe` blocks matching the module name. File: `sidebar-tree.test.ts`, describe: `"sidebarTree"` or `"buildSidebarTree"`.

## Layer 2: Integration Tests (Node) — NEW

**What to test:** The composed remark pipeline — all plugins running together against realistic markdown.

**Why this layer exists:** Individual plugins pass in isolation but fail when composed. Plugin ordering, shared AST state, and edge cases like wikilinks inside callouts or dataview queries in embedded notes only surface here.

**Pattern:**

```ts
// src/features/notes/lib/__tests__/pipeline-integration.test.ts
import { describe, it, expect } from "vitest";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHtml } from "hast-util-to-html";
import { remarkWikilinks } from "../remark-wikilinks";
import { remarkCallouts } from "../remark-callouts";
import { remarkEmbeds } from "../remark-embeds";
import { remarkDataview } from "@/features/dataview/lib/remark-dataview";

function processFullPipeline(md: string) {
  const tree = fromMarkdown(md);
  // Apply plugins in the same order as production config
  remarkCallouts()(tree);
  remarkWikilinks(/* opts */)(tree);
  remarkEmbeds(/* opts */)(tree);
  remarkDataview(/* opts */)(tree);
  return tree;
}

describe("remark pipeline integration", () => {
  it("handles wikilink inside callout", () => {
    const tree = processFullPipeline(`> [!note]
> See [[Other Note]] for details`);
    // Assert both callout structure AND link resolution
  });

  it("handles dataview query in embedded note", () => {
    // Test that dataview processes correctly after embed transclusion
  });

  it("excludes publish:false notes from all outputs", () => {
    // Test with fixtures containing publish:false frontmatter
    // Verify they're excluded from backlinks, sidebar, search, graph
  });
});
```

**Fixture convention:** Use `__tests__/fixtures/integration/` with realistic markdown files that combine multiple Obsidian features.

## Layer 3: Component Tests — Vitest Browser Mode (IMPLEMENTED)

React component tests run in a **real Chromium browser** via Vitest browser mode with Playwright, not in a DOM simulation like happy-dom. This catches real rendering issues, CSS behavior, portal rendering (Radix), and browser API interactions (localStorage, classList).

**Dependencies:** `@vitest/browser-playwright`, `vitest-browser-react`

**Implemented tests:**

- `src/features/theme/components/theme-toggle.test.tsx` — aria-label rendering, theme toggle, localStorage persistence (3 tests)
- `src/features/search/components/search-dialog.test.tsx` — trigger button, dialog open, search filtering, empty results (4 tests)

**Pattern (Vitest browser mode + built-in locators):**

```tsx
// src/features/search/components/search-dialog.test.tsx
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { SearchDialog } from "./search-dialog";
import type { SearchEntry } from "@/features/search/lib/search-index";

const entries: SearchEntry[] = [
  {
    href: "/astro-guide",
    slug: "astro-guide",
    title: "Astro Guide",
    type: "note",
    tags: ["astro"],
    summary: "Guide to Astro",
    preview: "...",
  },
];

describe("SearchDialog", () => {
  it("filters results on input", async () => {
    const screen = await render(<SearchDialog entries={entries} />);
    await screen.getByRole("button", { name: /search/i }).click();
    // Radix Dialog renders in a portal — use page.getBy*() not screen.getBy*()
    await page.getByPlaceholder("Search notes...").fill("astro");
    await expect.element(page.getByText("Astro Guide")).toBeVisible();
  });
});
```

### Key Patterns

- **`render()` from `vitest-browser-react`** — renders in real browser, returns `screen` with locators. Must be `await`ed.
- **Built-in Vitest locators** — `screen.getByRole()`, `screen.getByText()`, `page.getByPlaceholder()` — no Testing Library needed.
- **`page` from `vitest/browser`** — page-level locators for portal-rendered content (Radix dialogs, tooltips).
- **`locator.click()` / `locator.fill()`** — direct interaction methods on locators.
- **`expect.element(locator)`** — element assertions with built-in retry-ability.
- **Real browser APIs** — `localStorage`, `document.documentElement.classList` are available directly in tests.

### Gotchas

- **Portal rendering (Radix UI):** After opening a dialog, its content renders in a portal outside the component's container. Use `page.getByPlaceholder()` / `page.getByText()` instead of `screen.getByPlaceholder()`.
- **`await render()`:** The `render()` function returns a Promise in vitest-browser-react — always `await` it.
- **Import path:** Use `import { page } from "vitest/browser"` — the old `@vitest/browser/context` path is deprecated.

### Future Component Test Candidates

- `SidebarTreeView` — tree navigation, folder toggle, localStorage persistence
- `TableOfContents` — scroll event handling, active heading tracking
- `GraphView` — canvas rendering, mouse interactions (complex, may be better as E2E)

## Layer 4: E2E Tests (Playwright)

**What to test:** Critical user flows only. These are slow — keep the count low.

**Target flows:**

1. **Navigation** — sidebar click → page loads → breadcrumb updates
2. **Search** — open search → type query → select result → correct page loads
3. **Theme toggle** — toggle dark/light → preference persists on reload
4. **Wikilink navigation** — click wikilink in note body → correct note loads
5. **404 handling** — visit nonexistent page → 404 page renders; `publish: false` pages return 404

**Setup (from Playwright docs):**

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "blob" : "html",
  use: {
    baseURL: "http://localhost:4321",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm preview",
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
});
```

**Convention:** E2E tests live in `e2e/` at project root, not inside `src/`.

### Research Insights: E2E Performance

- **`trace: "retain-on-failure"`** — captures traces only on failure, zero overhead on passing tests. Better than `"on-first-retry"` for fast local runs.
- **Sharding in CI** — use `--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}` with GitHub Actions matrix strategy (2-4 shards) for parallel execution.
- **Cache the build** — hash `src/` + `package.json` as CI cache key for `pnpm build` output.
- **Accessibility for free** — add `@axe-core/playwright` checks inside E2E tests. Nearly zero extra cost, catches WCAG violations.
- **Build output verification** — add one E2E test that asserts `pnpm build` produces expected routes and omits `publish: false` pages from the output directory. This catches regressions that no unit test can.

## Vitest Configuration (CURRENT)

Two projects: `unit` runs in Node, `component` runs in real Chromium via Vitest browser mode.

```ts
// vitest.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const alias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
          exclude: ["src/**/components/**"],
          sequence: { concurrent: true },
        },
      },
      {
        resolve: { alias },
        test: {
          name: "component",
          include: ["src/**/components/**/*.test.tsx"],
          sequence: { concurrent: true },
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
```

### Config Notes

- **Plain `defineConfig` from Vitest, not `getViteConfig` from Astro** — avoids pulling in the full Astro Vite pipeline for unit tests.
- **`sequence: { concurrent: true }`** — run tests within each file concurrently. Single highest-impact performance setting.
- **`--pool=threads`** (default) — keep it. Worker threads share memory and avoid fork serialization overhead.
- **Environment routing by directory:** Unit tests in `src/**/*.test.ts` + `test/**/*.test.ts`, component tests in `src/**/components/**/*.test.tsx`.
- **Browser mode over happy-dom:** Components run in real Chromium, catching portal rendering (Radix), CSS, localStorage, and browser API issues that happy-dom would miss.

## Test Infrastructure

### Directory Structure (Current)

```
vault/
├── src/
│   ├── features/
│   │   ├── wikilinks/lib/
│   │   │   └── remark-wikilinks.test.ts          ← co-located unit test
│   │   ├── embeds/lib/
│   │   │   ├── remark-embeds.test.ts
│   │   │   └── remark-block-refs.test.ts
│   │   ├── callouts/lib/
│   │   │   └── remark-callouts.test.ts
│   │   ├── highlights/lib/
│   │   │   └── remark-highlights.test.ts
│   │   ├── mermaid/lib/
│   │   │   └── remark-mermaid.test.ts
│   │   ├── tags/lib/
│   │   │   └── remark-tags.test.ts
│   │   ├── backlinks/lib/
│   │   │   └── backlink-resolver.test.ts
│   │   ├── navigation/lib/
│   │   │   └── sidebar-tree.test.ts
│   │   ├── search/lib/
│   │   │   └── search-index.test.ts
│   │   ├── search/components/
│   │   │   └── search-dialog.test.tsx            ← browser mode component test
│   │   ├── graph/lib/
│   │   │   └── graph-data-builder.test.ts
│   │   ├── dataview/lib/
│   │   │   └── dataview-engine.test.ts
│   │   └── theme/components/
│   │       └── theme-toggle.test.tsx             ← browser mode component test
│   └── lib/
│       ├── content-resolver.test.ts
│       ├── note-links.test.ts
│       └── notes.test.ts
├── test/                                          ← test infrastructure (outside src/)
│   ├── helpers/
│   │   └── note-fixtures.ts                       ← createNoteFixture() helper
│   ├── fixtures/
│   │   ├── content/                               ← markdown test fixtures
│   ���   └── attachments/                           ← test assets
│   └── integration/
│       ├── pipeline.test.ts                       ← cross-feature pipeline tests (5 scenarios)
│       └── publish-filtering.test.ts              ← publish:false across all consumers
├── e2e/                                           ← Playwright E2E tests (Phase 3)
├── vitest.config.ts
└── playwright.config.ts                           ← (Phase 3)
```

### Research Insights: Architecture

- **`src/test-utils/` is the wrong location** — it breaks the dependency hierarchy (neither a feature nor a shared utility). Test infrastructure belongs in root-level `test/` or a Vitest setup file.
- **Cross-feature integration tests** (e.g., `publish: false` filtering across sidebar, search, graph) inherently violate feature isolation if placed inside any single feature. `test/integration/` is the correct home — it mirrors how `pages/` composes features.

### Content Collection Testing (Implemented)

All testable functions use **dependency injection** — they accept a notes array as a parameter. Tests pass fixtures directly via `createNoteFixture()` from `test/helpers/note-fixtures.ts`. No `vi.mock("astro:content")` needed.

```ts
// test/helpers/note-fixtures.ts
export function createNoteFixture(id: string, opts?: { body?: string; data?: Partial<NoteData> }): CollectionEntry<"notes">

// In tests:
import { createNoteFixture } from "../../test/helpers/note-fixtures";

it("builds tree from notes", () => {
  const notes = [
    createNoteFixture("guides/alpha", { data: { title: "Alpha" } }),
    createNoteFixture("guides/beta", { data: { title: "Beta" } }),
  ];
  const tree = buildSidebarTree(notes);
  expect(tree).toMatchObject([...]);
});
```

## Dependencies

```bash
# Installed (Phase 1 + 2):
# vitest ^4.1.2 (devDependency)
# @vitest/browser-playwright ^4.1.2 (devDependency)
# vitest-browser-react ^2.2.0 (devDependency)

# Phase 3: When adding E2E tests
pnpm add -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

## Scripts (Current)

```jsonc
{
  "scripts": {
    "test": "vitest run", // runs both unit + component projects
    "test:watch": "vitest",
    "test:unit": "vitest run --project unit",
    "test:component": "vitest run --project component",

    // Phase 3 (when Playwright added)
    "test:e2e": "playwright test",
    "test:all": "vitest run && playwright test",
  },
}
```

## CI Gating Strategy

| Layer       | Blocks merge?      | Notes                                             |
| ----------- | ------------------ | ------------------------------------------------- |
| Unit        | Yes                | Fast, deterministic, catches most bugs            |
| Integration | Yes                | Catches pipeline regressions                      |
| Component   | Yes                | Catches rendering and interaction bugs            |
| E2E         | Advisory initially | Promote to blocking once stable (< 1% flake rate) |

## Performance Budget

Set hard ceilings to protect the fast feedback loop:

| Layer             | Target       | Action if exceeded                                          |
| ----------------- | ------------ | ----------------------------------------------------------- |
| Unit suite        | < 5 seconds  | Profile with `--reporter=verbose`, check for accidental I/O |
| Integration suite | < 10 seconds | Review fixture size, check for unnecessary parsing          |
| Component suite   | < 15 seconds | Ensure `css: false`, check for heavy renders                |
| E2E suite         | < 60 seconds | Shard in CI, reduce flow count                              |

## Cross-Cutting Concerns

### `publish: false` filtering

Notes with `publish: false` must be excluded across **all** consumers. Add a shared test fixture with `publish: false` notes and verify filtering in:

- Sidebar tree builder
- Search index
- Backlink resolver
- Graph data builder
- **Build output** (no route generated for unpublished notes)
- **404 response** (visiting an unpublished note's URL returns 404)

### Markdown pipeline integration

Promoted to Layer 2 (see above). Key scenarios:

- Wikilinks inside callouts
- Dataview queries in embedded notes
- Nested embeds (embed within embed)
- Block references across files with wikilinks
- Circular embed detection

### Asset/attachment resolution

`![[image.png]]` embeds must resolve to `/attachments/image.png`. Test both the remark plugin resolution and the build output (file exists at expected path).

## Acceptance Criteria

### Phase 1: Unit + Integration — COMPLETE

- [x] At least one unit test per remark plugin (wikilinks, embeds, callouts, block-refs, highlights, mermaid, tags)
- [x] At least one unit test for sidebar-tree, backlink-resolver, search-index, graph-data-builder, notes.ts
- [x] Pipeline integration tests covering plugin composition edge cases (5 scenarios)
- [x] `publish: false` filtering verified across all consumers (sidebar, search, backlinks, graph)
- [x] `vp test` passes — 85 unit/integration tests, 425ms
- [x] Unit suite runs under 5 seconds (425ms)

### Phase 2: Component Tests — COMPLETE

- [x] Vitest config updated with `projects` for unit (node) and component (browser mode) environments
- [x] `@vitest/browser-playwright` and `vitest-browser-react` added
- [x] ThemeToggle browser test — aria-label, toggle, localStorage (3 tests)
- [x] SearchDialog browser test — trigger, dialog open, filtering, empty results (4 tests)
- [x] Full suite: 19 files, 92 tests, ~2s

### Phase 3: E2E Tests — NOT STARTED

- [ ] Playwright config added with `pnpm preview` web server
- [ ] At least 3 E2E tests for critical flows (navigation, search, theme)
- [ ] `trace: "retain-on-failure"` configured
- [ ] axe-core accessibility checks in at least one E2E test
- [ ] All tests pass in CI (`vp test && playwright test`)

## References

- [Vitest Browser Mode](https://vitest.dev/guide/browser/) — browser testing with Playwright provider
- [Vitest Browser Component Testing](https://vitest.dev/guide/browser/component-testing) — rendering components in real browsers
- [vitest-browser-react](https://github.com/vitest-dev/vitest-browser-react) — React rendering for Vitest browser mode
- [Vitest Interactivity API](https://vitest.dev/api/browser/interactivity) — userEvent, locator.click(), locator.fill()
- [Vitest Projects Config](https://vitest.dev/guide/projects) — multi-environment setup
- [Astro Testing Guide](https://docs.astro.build/en/guides/testing/) — official recommendations (Vitest + Container API + Playwright)
- [Playwright Config](https://playwright.dev/docs/test-configuration) — webServer, sharding, trace (for Phase 3 E2E)
- Existing test pattern: `src/features/dataview/lib/dataview-engine.test.ts` (AST-based, co-located, fixtures)
