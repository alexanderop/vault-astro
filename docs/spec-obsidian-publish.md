# Spec: Vault — Obsidian Publish Alternative

## Objective

Vault is a self-hosted Obsidian Publish alternative built with Astro 6. Users drop their Obsidian vault's markdown files into the project and get a fast, statically-generated knowledge site with full Obsidian syntax support.

**Target user:** Someone who wants to publish their Obsidian notes without paying for Obsidian Publish, with the same (or better) reading experience.

**Success looks like:** A site that renders an Obsidian vault faithfully — wiki links work, callouts look right, backlinks show up, and it feels like Obsidian Publish but faster and self-owned.

## Tech Stack

- **Astro 6** — static site generation, content collections, file-based routing
- **React 19** via `@astrojs/react` — interactive islands (search, sidebar, theme toggle, graph view)
- **Tailwind CSS v4** — global styling
- **shadcn/ui** (new-york style, zinc base) — UI components for interactive elements
- **TypeScript** — strict mode

## Commands

```
pnpm dev          # Start dev server (localhost:4321)
pnpm build        # Production build
pnpm preview      # Preview production build
```

## Architecture

Follows [Bulletproof React](https://github.com/alan2207/bulletproof-react) feature-based architecture, adapted for Astro.

### Principles

1. **Feature isolation** — each feature owns its components, hooks, types, utils. No cross-feature imports.
2. **Unidirectional flow** — `shared (components, lib, hooks, types, utils) → features → pages/layouts`. Never import backwards.
3. **Colocation** — keep things close to where they're used. Feature-specific code lives inside the feature folder.
4. **No barrel files** — import directly from the file, not via `index.ts` re-exports (better tree-shaking).
5. **kebab-case** — all files and folders use `kebab-case` naming.

### Project Structure

```
src/
├── content/                  ← Obsidian vault markdown files (data source)
│   └── notes/                ← Drop .md files here
├── content.config.ts         ← Content collection definitions (Astro 6 location)
│
├── components/               ← Shared components used across the entire app
│   └── ui/                   ← shadcn/ui primitives (button, dialog, etc.)
│
├── features/                 ← Feature-based modules (the core of the architecture)
│   ├── notes/                ← Note rendering & content pipeline
│   │   ├── components/       ← note-content.astro, note-header.astro
│   │   ├── lib/              ← remark plugins, markdown processing
│   │   ├── types/            ← note types, frontmatter types
│   │   └── utils/            ← slug resolution, path helpers
│   │
│   ├── navigation/           ← Sidebar file tree + breadcrumbs
│   │   ├── components/       ← sidebar.tsx, nav-tree.tsx
│   │   ├── hooks/            ← use-nav-state.ts
│   │   └── utils/            ← tree-builder.ts
│   │
│   ├── search/               ← Command-palette search
│   │   ├── components/       ← search-dialog.tsx, search-results.tsx
│   │   ├── hooks/            ← use-search.ts
│   │   └── lib/              ← search index builder
│   │
│   ├── theme/                ← Light/dark mode
│   │   ├── components/       ← theme-toggle.tsx, theme-provider.tsx
│   │   ├── hooks/            ← use-theme.ts
│   │   └── utils/            ← theme-constants.ts
│   │
│   ├── backlinks/            ← Backlink computation & panel
│   │   ├── components/       ← backlinks-panel.astro
│   │   ├── lib/              ← backlink-resolver.ts
│   │   └── types/            ← backlink types
│   │
│   ├── graph/                ← Note relationship graph view
│   │   ├── components/       ← graph-view.tsx
│   │   └── lib/              ← graph-data-builder.ts
│   │
│   ├── wikilinks/            ← [[wiki link]] processing
│   │   ├── lib/              ← remark-wikilinks.ts (remark plugin)
│   │   └── utils/            ← link-resolver.ts
│   │
│   ├── callouts/             ← > [!type] callout rendering
│   │   ├── components/       ← callout.tsx
│   │   └── lib/              ← remark-callouts.ts
│   │
│   ├── tags/                 ← #tag parsing & tag pages
│   │   ├── components/       ← tag-list.astro, tag-badge.tsx
│   │   └── lib/              ← remark-tags.ts
│   │
│   ├── math/                 ← LaTeX math rendering
│   │   └── lib/              ← math config (remark-math + rehype-katex)
│   │
│   └── mermaid/              ← Mermaid diagram rendering
│       └── components/       ← mermaid-block.tsx
│
├── hooks/                    ← Shared hooks used across features
│
├── lib/                      ← Shared libraries, preconfigured for the app
│   └── utils.ts              ← cn() utility
│
├── types/                    ← Shared types
│
├── layouts/                  ← Astro layouts (Astro-specific, like app shell)
│   ├── layout.astro          ← Base HTML layout
│   └── note-layout.astro     ← Note page layout with sidebar + backlinks
│
├── pages/                    ← Astro file-based routing (composes features)
│   ├── index.astro           ← Home / notes index
│   └── [...slug].astro       ← Dynamic route for all notes
│
└── styles/
    └── globals.css           ← Tailwind + shadcn theme variables

public/
  attachments/                ← Obsidian attachments (images, PDFs, etc.)

components.json               ← shadcn/ui CLI config
```

### Dependency Rules

```
pages/layouts  →  can import from  →  features, components, lib, hooks, types
features       →  can import from  →  components, lib, hooks, types
components     →  can import from  →  lib, hooks, types
lib/hooks/types →  standalone, no app imports
```

**Features MUST NOT import from other features.** Composition happens in `pages/` and `layouts/`. For example, `note-layout.astro` composes the `navigation`, `notes`, and `backlinks` features together — those features don't know about each other.

### Feature Folder Convention

Each feature includes only the folders it needs:

```
src/features/{feature-name}/
├── components/    ← React (.tsx) or Astro (.astro) components scoped to this feature
├── hooks/         ← React hooks scoped to this feature
├── lib/           ← Feature-specific logic (remark plugins, resolvers, etc.)
├── types/         ← TypeScript types for this feature
└── utils/         ← Utility functions for this feature
```

## Content Collections

Notes are loaded via Astro's glob loader from `src/content/`:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content" }),
  schema: z.object({
    title: z.string().optional(),
    aliases: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    publish: z.boolean().optional().default(true),
    date: z.coerce.date().optional(),
    cssclasses: z.array(z.string()).optional(),
    description: z.string().optional(),
  }),
});
```

## Obsidian Feature Support

### Phase 1 — Foundation (this task)

| Feature                         | Approach                                     |
| ------------------------------- | -------------------------------------------- |
| React + Tailwind + shadcn setup | Astro integrations + shadcn init             |
| Content collections             | Glob loader for `.md` files                  |
| Frontmatter/properties          | Zod schema, flexible to allow arbitrary YAML |
| Standard markdown               | Astro's built-in markdown rendering          |
| Dark/light theme                | shadcn theme toggle, CSS variables           |
| Basic layout                    | Sidebar + content area like Obsidian Publish |

### Phase 2 — Obsidian Markdown Extensions (DONE)

| Feature                         | Syntax                        | Implementation                                                  |
| ------------------------------- | ----------------------------- | --------------------------------------------------------------- |
| Wiki links                      | `[[Page]]`, `[[Page\|Alias]]` | `features/wikilinks/lib/remark-wikilinks.ts`                    |
| Heading links                   | `[[Page#Heading]]`            | Same plugin, slug generation                                    |
| Callouts (all types + foldable) | `> [!type] Title`             | `features/callouts/lib/remark-callouts.ts`                      |
| Highlights                      | `==text==`                    | `features/highlights/lib/remark-highlights.ts`                  |
| Comments                        | `%%hidden%%`                  | `features/highlights/lib/remark-highlights.ts` (remarkComments) |
| Tags                            | `#tag`, `#nested/tag`         | `features/tags/lib/remark-tags.ts`                              |
| Math/LaTeX                      | `$inline$`, `$$block$$`       | remark-math + rehype-katex                                      |
| Mermaid                         | ` ```mermaid `                | `features/mermaid/lib/remark-mermaid.ts` + CDN client           |
| Footnotes                       | `[^1]`                        | Built-in Astro markdown                                         |
| Task lists                      | `- [ ]` / `- [x]`             | Built-in GFM support                                            |

### Phase 3 — Advanced Features

| Feature              | Approach                                        |
| -------------------- | ----------------------------------------------- |
| Backlinks panel      | Build-time computation, rendered per page       |
| Note embeds          | `![[Note]]` → inline rendered content           |
| Image embeds         | `![[image.png]]` → resolve from attachments     |
| Section embeds       | `![[Note#Heading]]` → extract and embed section |
| Block references     | `[[Note#^id]]` → link to specific block         |
| Graph view           | React component, d3 or force-graph library      |
| Search               | Pagefind or Fuse.js, command-palette UI         |
| Sidebar file tree    | Collapsible tree from content structure         |
| Foldable callouts    | `> [!note]- Title` → collapsible                |
| `cssclasses` support | Apply custom classes from frontmatter           |

### Out of Scope (for now)

- Dataview queries (would need a custom query engine)
- Canvas files
- Real-time sync with Obsidian
- Multi-vault support

## Project Standards

### File & Folder Naming

- **All files and folders:** `kebab-case` (e.g., `theme-toggle.tsx`, `use-search.ts`, `remark-wikilinks.ts`)
- **React components:** `kebab-case` file, PascalCase export (e.g., `theme-toggle.tsx` exports `ThemeToggle`)
- **Astro components:** `kebab-case` (e.g., `note-layout.astro`)

### Absolute Imports

All imports use the `@/` alias pointing to `src/`:

```typescript
// Good
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";

// Bad
import { cn } from "../../../lib/utils";
```

### Code Style

```tsx
// React components: function declarations, named exports
// File: src/features/theme/components/theme-toggle.tsx
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
```

```astro
---
// Astro pages compose features — they don't contain business logic
// File: src/pages/[...slug].astro
import NoteLayout from '@/layouts/note-layout.astro';
import { getCollection } from 'astro:content';
const notes = await getCollection('notes');
---
<NoteLayout>
  {notes.map(note => <li><a href={`/${note.id}`}>{note.data.title ?? note.id}</a></li>)}
</NoteLayout>
```

- Use `cn()` for conditional class merging
- Prefer Astro components for static content, React only for interactivity
- No `any` types
- No barrel files (`index.ts` re-exports) — import directly
- No cross-feature imports — compose in pages/layouts

## Testing Strategy

- `pnpm build` must pass — this is the primary verification
- Manual verification of markdown rendering for each Obsidian feature
- Future: Playwright tests for interactive components

## Boundaries

- **Always:** Use `client:load` / `client:visible` for React in Astro; run `pnpm build` after changes
- **Ask first:** Adding new dependencies, changing content collection schema, modifying the remark pipeline
- **Never:** Modify user's source markdown files; commit secrets; break existing Astro component rendering

## Success Criteria (Phase 1)

1. `pnpm build` passes with zero errors
2. React integration works — a shadcn Button renders in an Astro page
3. Tailwind CSS v4 is applied globally with dark/light theme support
4. Content collection is defined and can load `.md` files from `src/content/`
5. A sample markdown note renders at a dynamic route (`/note-name`)
6. Basic layout exists: sidebar (file list) + content area
7. `npx shadcn@latest add <component>` works for future component additions
8. Theme toggle switches between light and dark mode
