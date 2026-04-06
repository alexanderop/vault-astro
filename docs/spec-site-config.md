# Spec: Centralized Site Configuration

## Objective

Vault currently hardcodes site metadata ("Vault", `lang="en"`, etc.) across layout files. Developers forking this project must hunt through multiple files to customize basic settings. Feature toggles (graph, backlinks, mermaid, math) don't exist — everything is always on.

**Goal:** A single `src/config.ts` file (Astro Paper pattern) where developers configure all site-wide settings and feature toggles in one place. Import the config object wherever needed — no providers, no context, just a typed `as const` export.

### User Stories

- As a developer forking Vault, I can change the site title, description, author, and language in one file
- As a developer, I get TypeScript autocompletion and type safety for all config values
- As a developer, I can toggle features (graph, backlinks, math, mermaid, search, theme) via config
- As a developer, I can customize the footer or hide it entirely

## Tech Stack

No new dependencies. Uses existing TypeScript + Astro infrastructure.

## What's Configurable

### Site Metadata

| Field         | Type                       | Default          | Where it's used                 |
| ------------- | -------------------------- | ---------------- | ------------------------------- |
| `title`       | `string`                   | `"Vault"`        | `<title>`, sidebar, OG tags     |
| `description` | `string`                   | `""`             | `<meta name="description">`, OG |
| `author`      | `string`                   | `""`             | `<meta name="author">`          |
| `website`     | `string`                   | `""`             | Canonical URL, OG, sitemap      |
| `lang`        | `string`                   | `"en"`           | `<html lang>`                   |
| `dir`         | `"ltr" \| "rtl" \| "auto"` | `"ltr"`          | `<html dir>`                    |
| `ogImage`     | `string`                   | `""`             | Default Open Graph image path   |
| `favicon`     | `string`                   | `"/favicon.svg"` | `<link rel="icon">`             |

### Feature Toggles

| Field                 | Type      | Default | Effect when `false`                 |
| --------------------- | --------- | ------- | ----------------------------------- |
| `lightAndDarkMode`    | `boolean` | `true`  | Hides theme toggle, no dark mode    |
| `showGraph`           | `boolean` | `true`  | Hides graph view entirely           |
| `showBacklinks`       | `boolean` | `true`  | Hides backlinks section on notes    |
| `showSearch`          | `boolean` | `true`  | Hides search dialog from header     |
| `showTableOfContents` | `boolean` | `true`  | Hides auto-generated TOC on notes   |
| `showDate`            | `boolean` | `true`  | Hides dates on index and note pages |
| `showTags`            | `boolean` | `true`  | Hides tag pills on notes            |
| `enableMermaid`       | `boolean` | `true`  | Skips loading mermaid CDN script    |
| `enableMath`          | `boolean` | `true`  | Skips loading KaTeX CSS             |

### Display

| Field             | Type     | Default         | Where it's used                     |
| ----------------- | -------- | --------------- | ----------------------------------- |
| `themeStorageKey` | `string` | `"vault-theme"` | localStorage key for theme          |
| `notesPerIndex`   | `number` | `0` (all)       | Notes shown on index page (0 = all) |
| `footer`          | `string` | `""`            | Footer text (empty = no footer)     |

### Out of Scope (for now)

- Social links / share links (add later as `src/constants.ts` if needed)
- Per-page config overrides
- Environment variable overrides
- `notesDir` / `attachmentsDir` (changing breaks content collections)
- `showReadingTime`, `contentWidth`, `dateFormat`, `sidebarCollapsed` (Tier 2 — add when needed)

## Implementation

### File: `src/config.ts`

```ts
export const SITE = {
  // Site metadata
  title: "Vault",
  description: "A self-hosted Obsidian Publish alternative",
  author: "",
  website: "",
  lang: "en",
  dir: "ltr" as const,
  ogImage: "",
  favicon: "/favicon.svg",

  // Feature toggles
  lightAndDarkMode: true,
  showGraph: true,
  showBacklinks: true,
  showSearch: true,
  showTableOfContents: true,
  showDate: true,
  showTags: true,
  enableMermaid: true,
  enableMath: true,

  // Display
  themeStorageKey: "vault-theme",
  notesPerIndex: 0,
  footer: "",
} as const;
```

Single named export. `as const` for literal types. No class, no validation, no schema — it's a static config object.

### Consumers

Update these files to import from `@/config`:

1. **`src/layouts/Layout.astro`** — Replace hardcoded title, lang; add `dir`, `description`, `author`, `favicon` meta tags
2. **`src/layouts/note-layout.astro`** — Same as above, plus:
   - Conditionally render `ThemeToggle` based on `lightAndDarkMode`
   - Conditionally render `SearchDialog` based on `showSearch`
   - Conditionally load KaTeX CSS based on `enableMath`
   - Conditionally load mermaid script based on `enableMermaid`
   - Conditionally render footer based on `footer`
3. **`src/pages/index.astro`** — Use `notesPerIndex`, `showDate`, `showTags`
4. **`src/pages/[...slug].astro`** — Conditionally render backlinks (`showBacklinks`), TOC (`showTableOfContents`), graph (`showGraph`), tags (`showTags`), date (`showDate`)
5. **Any feature component** that is now toggleable reads `SITE` to decide whether to render

### Title Format

Page titles follow the pattern: `{pageTitle} — {SITE.title}`

When no page title is provided, just use `SITE.title`.

### Conditional Loading Strategy

For `enableMermaid` and `enableMath`: these load external CDN resources. When disabled, the `<link>` / `<script>` tags should not be rendered at all (not just hidden). This is a build-time decision since Astro renders these statically.

For UI toggles (`showGraph`, `showBacklinks`, etc.): simply don't render the component. No CSS hiding — skip the component entirely in the Astro template.

## Project Structure Change

```
src/
├── config.ts              ← NEW: site configuration
├── layouts/
│   ├── Layout.astro       ← MODIFIED: imports SITE
│   └── note-layout.astro  ← MODIFIED: imports SITE, conditional features
├── pages/
│   ├── index.astro        ← MODIFIED: imports SITE
│   └── [...slug].astro    ← MODIFIED: imports SITE, conditional features
└── ...
```

## Boundaries

- **Always:** Import `SITE` from `@/config` instead of hardcoding site metadata
- **Ask first:** Adding new config fields (keep it minimal)
- **Never:** Add runtime config, environment variable overrides, or validation logic to the config file

## Success Criteria

- [ ] `src/config.ts` exists with the `SITE` export
- [ ] Changing `title` in config updates `<title>` on every page
- [ ] Changing `lang` in config updates `<html lang>` on every page
- [ ] Changing `lightAndDarkMode` to `false` hides the theme toggle
- [ ] Changing `showSearch` to `false` hides the search dialog
- [ ] Changing `enableMermaid` to `false` removes the mermaid `<script>` from HTML output
- [ ] Changing `enableMath` to `false` removes the KaTeX `<link>` from HTML output
- [ ] Changing `showGraph` to `false` hides the graph view
- [ ] Changing `showBacklinks` to `false` hides the backlinks section
- [ ] `vp run check` passes
- [ ] `pnpm build` succeeds when validating production output
- [ ] No hardcoded "Vault" strings remain in layout files

## Open Questions

1. Do you want social links config now or later?
2. Any fields I missed that you'd like configurable?
