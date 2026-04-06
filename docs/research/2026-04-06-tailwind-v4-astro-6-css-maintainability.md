# Research: Tailwind CSS v4 + Astro 6 CSS Maintainability

**Date:** 2026-04-06
**Status:** Complete

## Problem Statement

The project uses Tailwind CSS v4 with Astro 6 and React 19. The goal is to improve CSS code quality and maintainability **without changing any visual styling** -- better organization, reduced duplication, and easier-to-maintain code.

## Key Findings

### 1. Tailwind v4 CSS-First Configuration

Tailwind v4 eliminates JavaScript config in favor of pure CSS directives:

| Directive                  | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `@theme` / `@theme inline` | Define design tokens that generate utility classes + CSS variables                     |
| `@utility`                 | Register custom utilities with full variant support (hover, dark, responsive)          |
| `@custom-variant`          | Define reusable custom variants                                                        |
| `@variant`                 | Apply Tailwind variants inside custom CSS blocks                                       |
| `@reference`               | Import theme variables without duplicating CSS output (for component `<style>` blocks) |
| `--alpha()`                | Built-in color opacity manipulation (replaces manual `color-mix()` for opacity)        |
| `--spacing()`              | Built-in spacing calculation (replaces `calc(var(--spacing) * N)`)                     |

### 2. Critical v4 Behavior Change: `@layer components`

**Variants (`hover:`, `dark:`, responsive) no longer work on classes defined inside `@layer components`.** This is a breaking change from v3. If variant support is needed, classes must use `@utility` instead.

However, `@layer components` remains correct for classes that:

- Are only used as standalone class names (never with Tailwind modifiers)
- Need to be overridable by utility classes (cascade ordering)

### 3. `@utility` vs `@layer components` Decision Guide

```
Need variant support (hover:, md:, dark:)?
  YES → @utility
  NO  → Is it a multi-property reusable class?
    YES → @layer components (correct cascade ordering)
    NO  → @utility (single-purpose custom utility)
```

### 4. Reducing Utility Class Repetition (Priority Order)

1. **Framework components first** -- React/Astro components are the primary abstraction
2. **Loops for repeated elements** -- markup in a loop is authored once
3. **`@apply` sparingly** -- only for small, highly reusable primitives when components are impractical
4. **Use theme variables directly** in custom CSS instead of `@apply`:

   ```css
   /* Preferred in v4 */
   padding: var(--spacing-4);
   color: var(--color-muted-foreground);

   /* Instead of */
   @apply p-4 text-muted-foreground;
   ```

### 5. Splitting Large CSS Files

Tailwind v4 has built-in `@import` support (no postcss-import needed):

```css
@import "tailwindcss";
@import "./theme.css";
@import "./components.css";
```

### 6. Astro Styling Best Practices

- **Scoped styles by default** -- `<style>` tags in Astro are auto-scoped via `data-astro-cid-*`
- **`:global()` selector** -- mix scoped and global rules in the same `<style>` tag
- **Cascade order** (lowest to highest): `<link>` tags, imported stylesheets, scoped styles
- **Performance**: Astro inlines CSS under 4kB automatically
- **For Tailwind v4**: use `@tailwindcss/vite` plugin (not the old `@astrojs/tailwind`)

### 7. Class String Readability

- **Prettier plugin for Tailwind CSS** -- auto-sorts classes in consistent order (most impactful tool)
- **`cn()` utility** -- essential for conditional class application
- **Multi-line class strings** -- no official Prettier solution; use `cn()` with arrays for manual breaks

## Codebase Patterns

### Current Architecture (Well-Structured)

```
globals.css (524 lines)
├── @import "tailwindcss" + @plugin
├── @custom-variant dark
├── :root / .dark (5-color OKLCH palette)
├── @theme inline (semantic tokens → utilities)
├── @layer base (scrollbar, smooth scroll, reduced-motion)
├── @layer components
│   ├── Shell system (.shell-layout, .shell-sidebar, .shell-header, etc.)
│   ├── Navigation (.shell-list, .shell-list-row)
│   ├── UI elements (.shell-kbd, .shell-meta)
│   ├── Mobile nav (.mobile-nav-dialog + keyframes)
│   ├── Content (.note-prose, .content-compact, .content-serif)
│   ├── Callouts (5 colors, collapsible)
│   └── Obsidian elements (tags, wikilinks, embeds, dataview)
└── Responsive adjustments
```

### Styling Approach by Component Type

| Component Type    | Styling Method                   | Example                               |
| ----------------- | -------------------------------- | ------------------------------------- |
| React (shadcn/ui) | CVA + `cn()` + inline Tailwind   | `button.tsx`, `dialog.tsx`            |
| React (feature)   | `cn()` + inline Tailwind         | `search-dialog.tsx`, `graph-view.tsx` |
| Astro (layout)    | `.shell-*` component classes     | `note-layout.astro`, `sidebar.astro`  |
| Astro (content)   | `.note-prose` + content variants | `note-content.astro`                  |
| Content safety    | Allowlist pattern                | `content-classes.ts`                  |

### What's Working Well

- `@theme inline` usage is correct and idiomatic v4
- 5-color palette with OKLCH + `color-mix()` is excellent
- Shell component class system reduces repetition across Astro templates
- CVA for React component variants prevents duplication
- Content class allowlist pattern is secure and maintainable
- `cn()` used consistently everywhere
- Focus states, reduced-motion, and accessibility are covered

## Recommended Approach

### Priority 1: Split `globals.css` into Focused Files

At 524 lines, the file benefits from splitting. Use Tailwind v4's built-in `@import`:

```css
/* globals.css -- entry point */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:is(.dark *));

@import "./tokens.css"; /* :root, .dark palette + @theme inline */
@import "./base.css"; /* @layer base */
@import "./shell.css"; /* Shell layout component classes */
@import "./prose.css"; /* note-prose + content variants */
@import "./obsidian.css"; /* Callouts, tags, wikilinks, embeds, dataview */
```

This preserves all existing styling while making each concern independently editable.

### Priority 2: Audit `@layer components` for Variant Needs

Review each class in `@layer components`:

- Classes that need `hover:`, `dark:`, or responsive variants should migrate to `@utility`
- Classes used only as standalone names stay in `@layer components`
- The shell-\* classes appear to be standalone-only, so they can stay

### Priority 3: Use v4 Built-in Functions

Replace manual patterns with v4 functions where applicable:

- `--alpha(var(--color) / 50%)` instead of `color-mix(in oklab, var(--color) 50%, transparent)` for opacity
- `--spacing(4)` instead of `calc(var(--spacing) * 4)` in custom CSS

### Priority 4: Add Prettier Tailwind Plugin

If not already installed, add `prettier-plugin-tailwindcss` for automatic class sorting across all files. This is the single most impactful tool for inline class readability.

### Priority 5: Consider Scoped Styles for Component-Specific CSS

Currently no Astro components use scoped `<style>` blocks. For truly component-specific styles that don't need sharing, Astro's scoped styles avoid polluting the global stylesheet.

### What NOT to Do

- Don't replace `@layer components` wholesale with `@utility` -- only migrate classes that need variant support
- Don't over-extract utility classes -- the Tailwind team recommends component extraction over `@apply`
- Don't add `@apply` to reduce inline classes -- use React/Astro components instead
- Don't change the palette/token system -- it's already well-structured

## Sources

### Official Documentation

- [Tailwind CSS v4 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS - Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS - Functions and Directives](https://tailwindcss.com/docs/functions-and-directives)
- [Tailwind CSS - Adding Custom Styles](https://tailwindcss.com/docs/adding-custom-styles)
- [Tailwind CSS - Reusing Styles](https://tailwindcss.com/docs/reusing-styles)
- [Install Tailwind CSS with Astro](https://tailwindcss.com/docs/guides/astro)
- [Astro Styling Guide](https://docs.astro.build/en/guides/styling/)

### Community & GitHub

- [Variants Not Working in @layer components (v4) - GitHub #16449](https://github.com/tailwindlabs/tailwindcss/discussions/16449)
- [@layer component ordering issues (v4) - GitHub #16109](https://github.com/tailwindlabs/tailwindcss/discussions/16109)
- [@apply not working with @layer in v4 - GitHub #17082](https://github.com/tailwindlabs/tailwindcss/discussions/17082)
- [Break long class names discussion - GitHub #7763](https://github.com/tailwindlabs/tailwindcss/discussions/7763)

### Articles

- [10 Tailwind CSS Best Practices for 2026 - Benjamin Crozat](https://benjamincrozat.com/tailwind-css)
- [Tailwind CSS Best Practices for 2025 - Faraaz Motiwala](https://www.faraazcodes.com/blog/tailwind-2025-best-practices)
- [Design Tokens That Scale (Tailwind v4 + CSS Variables) - Mavik Labs](https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026)
- [Tailwind CSS 4 @theme: The Future of Design Tokens - Medium](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06)
