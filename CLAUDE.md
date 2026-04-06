# CLAUDE.md

Vault is a self-hosted Obsidian Publish alternative built with Astro.

## Commands

```
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

Astro owns dev/build/preview — use `pnpm` only for those lifecycle commands.
Use `vp run <task>` for checks, tests, and project utilities.
**Never run `pnpm build` just to verify changes.** Use `vp run check` instead.
Run `vp run check` after code changes to verify formatting, linting, and type checking pass.

## Stack

- Astro 6, Node >= 22.12.0
- React 19 via `@astrojs/react`
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui (new-york style, zinc base)
- TypeScript (strict)
- Vite+ (task runner, Oxlint, and Oxfmt via `vp run`)

## Architecture

Feature-based architecture following [Bulletproof React](https://github.com/alan2207/bulletproof-react), adapted for Astro.

### Dependency rules

```
pages/layouts  →  features, components, lib, hooks, types
features       →  components, lib, hooks, types
components     →  lib, hooks, types
```

**Features MUST NOT import from other features.** Compose in `pages/` and `layouts/`.

### Structure

- `src/pages/` - File-based routing, composes features
- `src/layouts/` - Astro layouts (app shell)
- `src/features/` - Feature modules (notes, navigation, theme, search, etc.)
- `src/components/ui/` - shadcn/ui primitives
- `src/lib/` - Shared utilities (`cn()`, etc.)
- `src/hooks/` - Shared React hooks
- `src/types/` - Shared TypeScript types
- `src/styles/globals.css` - Tailwind + shadcn theme variables
- `src/content/notes/` - Obsidian markdown files (content collection)
- `src/content.config.ts` - Content collection definitions (Astro 6 location)
- `public/attachments/` - Obsidian attachments (images, PDFs)
- `components.json` - shadcn/ui CLI config

### Feature folder convention

```
src/features/{feature-name}/
├── components/    ← .tsx or .astro
├── hooks/         ← React hooks
├── lib/           ← Feature logic (remark plugins, resolvers)
├── types/
└── utils/
```

Only include folders the feature needs.

## Conventions

- **kebab-case** for all files and folders
- **`@/` imports** — all imports use `@/` alias (maps to `src/`)
- **Astro by default** — only use React for client-side interactivity
- **`client:load`** or **`client:visible`** required for React components in Astro
- **No barrel files** — import directly, no `index.ts` re-exports
- **No `any` types**
- Use `cn()` from `@/lib/utils` for conditional class merging
- `npx shadcn@latest add <component>` to add new shadcn components

## Further Reading

**IMPORTANT:** Before starting any task, identify which docs below are relevant and read them first.

- `docs/spec-obsidian-publish.md` - Full project spec with phased feature roadmap
- `docs/astro-gotchas.md` - Astro-specific pitfalls and non-obvious behaviors
