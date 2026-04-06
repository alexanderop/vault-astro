---
title: "feat: Link Hover Previews"
type: feat
status: active
date: 2026-04-06
---

# feat: Link Hover Previews

## Overview

Add hover previews to wiki links — when a user hovers over a `[[wiki link]]` in rendered note content, a popup appears showing the target note's title and a plain-text preview (~200 chars). This is a signature Obsidian Publish feature and a high-value UX enhancement.

## Problem Statement / Motivation

Wiki links currently navigate immediately on click with no way to peek at a target note's content. Users must click through and use the back button to return, disrupting reading flow. Obsidian Publish solves this with hover previews, and users expect this behavior from a Publish alternative.

## Proposed Solution

A single React island (`LinkPreviewProvider`) mounted once per note page. It uses **event delegation** on `.wikilink` anchors (server-rendered by the remark plugin) to show a positioned popup with the target note's title and plain-text preview.

### Key Decisions

| Decision                | Choice                                               | Rationale                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data delivery**       | Reuse `searchIndex` data, passed as prop from page   | Zero additional bundle cost — search index is already on every page. Feature isolation preserved (both features receive data from page level, not from each other). |
| **Component mounting**  | Single `<LinkPreviewProvider>` with event delegation | Avoids per-link React instances. Works with server-rendered anchors. Matches existing island patterns (SearchDialog, ThemeToggle).                                  |
| **Popup library**       | shadcn/Radix HoverCard primitives + custom trigger   | HoverCard handles positioning, collision detection, open/close delays, hover-to-popup bridge. Custom trigger needed since wiki links are not React elements.        |
| **Touch devices**       | Disabled — tap navigates as today                    | Matches Obsidian Publish behavior. No confusing long-press or double-tap.                                                                                           |
| **Heading links**       | Strip fragment, show note-level preview              | Heading-specific preview would require a much more complex data structure. V1 keeps it simple.                                                                      |
| **Popup interactivity** | Non-interactive (text only), `role="tooltip"`        | Simpler ARIA model. Click the original link to navigate.                                                                                                            |
| **Self-links**          | Show preview                                         | Simpler to implement, still useful (confirms where the link goes).                                                                                                  |

### Timing

- `openDelay`: 400ms (prevents flicker on casual mouse movement)
- `closeDelay`: 200ms (grace period for moving to popup)
- Close on scroll: yes

## Technical Approach

### Architecture

```
src/features/link-preview/
├── components/
│   └── link-preview-provider.tsx   ← React island, event delegation + popup
├── hooks/
│   └── use-link-preview.ts         ← hover state, debounce, lookup logic
└── types/
    └── index.ts                    ← PreviewData type
```

**Dependency flow:**

```
[...slug].astro
  └── passes searchIndex as prop
        └── <LinkPreviewProvider client:load entries={searchIndex} />
              └── event delegation on .wikilink anchors
              └── renders positioned popup via Radix HoverCard primitives
```

### Data Flow

1. **Build time:** `getBuildSiteData()` already builds `searchIndex` with `preview` (first ~200 chars of stripped markdown) and `title` per note.
2. **Page render:** `[...slug].astro` already passes `searchIndex` to `SearchDialog`. Same data passed to `LinkPreviewProvider`.
3. **Client runtime:** `LinkPreviewProvider` builds a `Map<string, { title: string; preview: string }>` from entries, keyed by `href`. On hover, strips any `#fragment` from the anchor's `href`, looks up the map, renders popup.

### Remark Plugin Enhancement

Add `data-href` attribute to wiki link anchors in `remark-wikilinks.ts` (line ~87):

```typescript
// Before
data: { hProperties: { className: ["wikilink"] } }

// After
data: { hProperties: { className: ["wikilink"], "data-href": href } }
```

This gives the client component a reliable lookup key without parsing URLs.

### Component Implementation

`link-preview-provider.tsx`:

- Mounts once in `note-layout.astro` or `[...slug].astro` with `client:load`
- On mount, attaches `mouseenter`/`mouseleave`/`focusin`/`focusout` listeners to the note content container via event delegation (filter for `.wikilink` targets)
- Manages a single popup instance (position, content, visibility)
- Uses Radix HoverCard Content primitives for positioning and collision avoidance
- Renders popup as a portal to `document.body`

### Popup UI

```
┌─────────────────────────────┐
│ Note Title                  │
│                             │
│ First ~200 characters of    │
│ plain text preview content  │
│ from the target note...     │
└─────────────────────────────┘
```

- `max-width: 320px`
- Uses `--color-popover` / `--color-popover-foreground` tokens (already defined in `tokens.css`)
- Subtle shadow, rounded corners (matches shadcn popover style)
- Fade-in 150ms; instant for `prefers-reduced-motion: reduce`
- Z-index: `30` (between header at 10 and overlay at 50)

### shadcn Component

Install HoverCard:

```bash
pnpm dlx shadcn@latest add hover-card
```

Since wiki links are server-rendered (not React elements), the Radix HoverCard `Trigger` cannot wrap them directly. The implementation will use a **virtual trigger** approach:

- Track the hovered anchor element's position via `getBoundingClientRect()`
- Use Radix Popover (or a custom floating `div` with `@floating-ui/react`) positioned relative to the anchor
- Alternatively, use Radix HoverCard with a hidden trigger ref that gets repositioned to match the hovered anchor

### Key Files to Modify

| File                                                  | Change                                               |
| ----------------------------------------------------- | ---------------------------------------------------- |
| `src/features/wikilinks/lib/remark-wikilinks.ts:87`   | Add `data-href` attribute to link hProperties        |
| `src/features/wikilinks/lib/remark-wikilinks.test.ts` | Add test for `data-href` attribute                   |
| `src/pages/[...slug].astro`                           | Pass `searchIndex` to `LinkPreviewProvider`          |
| `src/layouts/note-layout.astro`                       | Mount `LinkPreviewProvider` island (if layout-level) |
| `src/components/ui/hover-card.tsx`                    | New — installed via shadcn CLI                       |

### New Files

| File                                                             | Purpose                                          |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| `src/features/link-preview/components/link-preview-provider.tsx` | React island: event delegation + popup rendering |
| `src/features/link-preview/hooks/use-link-preview.ts`            | Hover state management, debounce, preview lookup |
| `src/features/link-preview/types/index.ts`                       | `PreviewData` type                               |

## Acceptance Criteria

### Functional Requirements

- [ ] Hovering a `.wikilink` anchor for 400ms shows a popup with the target note's title and ~200 char preview
- [ ] Moving mouse away dismisses the popup after 200ms
- [ ] Moving mouse from link into popup keeps the popup open
- [ ] Only one popup is visible at a time
- [ ] Heading links (`[[Note#Heading]]`) show the note-level preview (fragment stripped)
- [ ] Missing links (`<span class="obsidian-missing-link">`) do not trigger previews
- [ ] Links inside callouts, embeds, and nested content work correctly
- [ ] Popup repositions to stay within viewport bounds (collision detection)
- [ ] Popup closes on scroll
- [ ] Self-links show a preview

### Accessibility

- [ ] Keyboard focus on a `.wikilink` triggers the preview (focusin/focusout)
- [ ] Escape key dismisses the preview
- [ ] Popup has `role="tooltip"` and proper `aria-describedby` on trigger
- [ ] `prefers-reduced-motion: reduce` disables animations (instant show/hide)

### Performance

- [ ] No additional data fetched — reuses existing `searchIndex` prop
- [ ] Single popup DOM element (not per-link instances)
- [ ] Hover debounce prevents rapid-fire popup rendering
- [ ] No impact on Lighthouse score (no layout shift, no blocking JS)

### Mobile/Touch

- [ ] Previews are disabled on touch devices (tap navigates normally)
- [ ] Detection via `@media (hover: hover)` or `pointerType` check

### Visual

- [ ] Popup matches site theme (light/dark mode)
- [ ] Popup has consistent styling with other shadcn popovers (shadow, radius, padding)
- [ ] Z-index sits between header (10) and overlays (50)

### Testing

- [ ] Unit tests for preview lookup (hit, miss, fragment stripping, empty preview)
- [ ] Component test for hover interaction (mouseenter triggers popup)
- [ ] `vp run check` passes

## Dependencies & Risks

**Dependencies:**

- shadcn HoverCard component (install via CLI)
- Existing `searchIndex` data structure (stable, already in production)

**Risks:**

| Risk                                                       | Impact                               | Mitigation                                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Radix HoverCard may not support non-React triggers cleanly | Medium — may need custom positioning | Fall back to `@floating-ui/react` with manual event handling                                                                                              |
| Hydration mismatch from reading DOM state during render    | Medium — silent errors               | Use `useEffect` for all DOM interaction, default to hidden state during SSR. See `docs/astro-gotchas.md` and `docs/playwright-hydration-check-pattern.md` |
| Large vaults (1000+ notes) could have heavy searchIndex    | Low — search already loads this      | Monitor bundle size; consider lazy-loading preview map if >500KB                                                                                          |
| Event delegation may miss dynamically inserted links       | Low — content is static              | Only needs to handle initial render; no dynamic content insertion                                                                                         |

## References & Research

### Internal References

- Wiki link remark plugin: `src/features/wikilinks/lib/remark-wikilinks.ts:76-89`
- Search index with `stripMarkdown()` and preview field: `src/features/search/lib/search-index.ts:20-47`
- Build data pipeline: `src/lib/build-site-data.ts:104`
- Content resolver: `src/lib/content-resolver.ts:12-24`
- Note page composition: `src/pages/[...slug].astro:33-70`
- Layout composition: `src/layouts/note-layout.astro:54-63`
- Popover theme tokens: `src/styles/tokens.css:38-39`
- Z-index scale: `src/styles/tokens.css:82-83`
- Wikilink CSS: `src/styles/obsidian.css:83-91`
- Hydration gotchas: `docs/astro-gotchas.md`
- Hydration test pattern: `docs/playwright-hydration-check-pattern.md`

### External References

- [Radix HoverCard](https://www.radix-ui.com/primitives/docs/components/hover-card)
- [shadcn/ui HoverCard](https://ui.shadcn.com/docs/components/hover-card)
- [Obsidian Publish hover previews](https://help.obsidian.md/Obsidian+Publish/Customize+your+site#Page+previews)
