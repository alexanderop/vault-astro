# Vault Agent Schema

Vault is an LLM-maintained wiki built with Astro. The repo still publishes markdown pages, but the operating model is now explicit:

1. **Sources** are immutable records captured under `src/content/notes/sources/`.
2. **Wiki pages** are the maintained public layer under `src/content/notes/`.
3. **This schema plus local skills** define how the agent ingests, queries, and lints the wiki.

`AGENTS.md` and `CLAUDE.md` must stay identical in substance.

## Commands

```bash
pnpm dev                 # Start dev server (localhost:4321)
pnpm build               # Production build
pnpm preview             # Preview production build
vp run check             # Format + lint + type check (single pass)
vp run lint              # Lint only
vp run fmt               # Format only
vp run audit:content     # Audit markdown/content issues
vp run test              # Run all Vitest suites
vp run test:unit         # Run node/unit Vitest suite
vp run test:component    # Run browser/component Vitest suite
vp run test:e2e          # Run Playwright tests
vp run verify            # Fast local verification
vp run verify:full       # Full local verification
```

Astro owns dev/build/preview. Use `pnpm` only for those lifecycle commands.
Use `vp run <task>` for checks, tests, and project utilities.
Never run `pnpm build` just to verify changes. Use `vp run check` instead.
Run `vp run check` after code changes.

## Stack

- Astro 6, Node >= 22.12.0
- React 19 via `@astrojs/react`
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui (new-york style, zinc base)
- TypeScript (strict)
- Vite+ task runner via `vp run`

## Architecture

Feature-based architecture following Bulletproof React, adapted for Astro.

### Dependency rules

```text
pages/layouts  →  features, components, lib, hooks, types
features       →  components, lib, hooks, types
components     →  lib, hooks, types
```

Features must not import from other features. Compose in `pages/` and `layouts/`.

### Structure

- `src/pages/` - File-based routing, composes features
- `src/layouts/` - Astro layouts
- `src/features/` - Feature modules
- `src/components/ui/` - shadcn/ui primitives
- `src/lib/` - Shared utilities
- `src/hooks/` - Shared hooks
- `src/types/` - Shared types
- `src/styles/` - Global styles and tokens
- `src/content/notes/` - Markdown content root
- `src/content/notes/sources/` - Immutable source records, unpublished by default
- `src/content.config.ts` - Content collection definitions
- `public/attachments/` - Local attachments

### Feature folder convention

```text
src/features/{feature-name}/
├── components/
├── hooks/
├── lib/
├── types/
└── utils/
```

Only include folders a feature actually needs.

## LLM Wiki Model

### Source layer

- Every external resource enters through a source page first.
- Source pages live under `src/content/notes/sources/`.
- Source pages should capture the full resource content available at ingest time: transcript, article text, thread text, extracted PDF text, metadata, and other raw source material.
- Source pages are immutable after capture except for metadata repair.
- Source pages default to `publish: false`.

Required source frontmatter:

- `title`
- `type: source`
- `source_type`
- `source_id`
- `captured_at`

### Wiki layer

- Public knowledge lives in maintained wiki pages, not chat history.
- Wiki pages are summaries, syntheses, and curated notes derived from one or more source pages.
- Wiki pages may summarize, compare, contradict, cluster, or extend sources.
- Durable query outputs should be written back into the wiki when useful.

Useful wiki frontmatter:

- `wiki_role`: `overview | index | log | map | entity | concept | synthesis | question | author`
- `status`: `seed | active | stale`
- `source_ids`
- `updated_at`

### Canonical wiki artifacts

- `[[overview]]` - top-level explanation of the wiki
- `[[index]]` - content-oriented catalog
- `[[log]]` - append-only operations log

## Workflows

### Ingest

When adding a new resource:

1. Create or update the immutable source record with the full captured resource under `src/content/notes/sources/`.
2. Create or update the wiki summary/synthesis entry under `src/content/notes/`.
3. Refresh `[[index]]` if a notable public page was added or changed.
4. Append a dated entry to `[[log]]`.

Ingest should prefer guided one-by-one work over batch dumping. The adding-notes skill documents a lighter-touch batch mode for 3-10 items when the user explicitly requests it.

### Query

When answering questions:

1. Search wiki pages first.
2. Use sources only when the wiki layer is missing needed detail.
3. Cite relevant wiki pages inline with `[[wikilinks]]`.
4. Offer to save durable answers back as wiki pages.

### Search Scaling

Below ~500 wiki pages, the index file + grep is sufficient for query. Above that threshold, adopt a dedicated search tool:

- **Recommended:** [qmd](https://github.com/tobi/qmd) — local hybrid BM25/vector search for markdown files with LLM re-ranking
- **Install:** `brew install tobi/tap/qmd` (or build from source)
- **Index:** `qmd index src/content/notes/notes/`
- **Search:** `qmd search "query terms"`

Grep remains useful for frontmatter/tag queries regardless of scale.

### Lint

Periodic maintenance should look for:

- contradictions between wiki pages
- stale syntheses
- orphan wiki pages
- repeated concepts without dedicated pages
- missing cross-links
- claims that should cite sources but do not

## Conventions

- `kebab-case` for all files and folders
- Use `@/` imports
- Astro by default; use React only for client interactivity
- `client:load` or `client:visible` required for React islands
- No barrel files
- No `any`
- Use `cn()` from `@/lib/utils`

## Further Reading

Before starting work, identify and read the relevant docs:

- `docs/spec-obsidian-publish.md`
- `docs/astro-gotchas.md`
- `SOUL.md` when editing or generating knowledge content
