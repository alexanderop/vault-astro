# Vault

Vault is a self-hosted Obsidian Publish alternative built with Astro. Drop markdown notes into `src/content/notes/` and generate a fast static knowledge site with Obsidian-style features like wiki links, callouts, embeds, backlinks, and search.

## Commands

Use `vp run <task>` for project workflows and `pnpm` only for Astro lifecycle commands.

| Command                 | Action                                         |
| :---------------------- | :--------------------------------------------- |
| `pnpm install`          | Install dependencies                           |
| `pnpm dev`              | Start the Astro dev server on `localhost:4321` |
| `pnpm build`            | Build the production site                      |
| `pnpm preview`          | Preview the production build                   |
| `vp run check`          | Run format, lint, and type checks              |
| `vp run lint`           | Run linting only                               |
| `vp run fmt`            | Run formatting only                            |
| `vp run audit:content`  | Audit markdown/content issues                  |
| `vp run test`           | Run all Vitest suites                          |
| `vp run test:unit`      | Run the unit/node Vitest suite                 |
| `vp run test:component` | Run the browser/component Vitest suite         |
| `vp run test:e2e`       | Run the Playwright suite                       |
| `vp run verify`         | Run the fast local verification flow           |
| `vp run verify:full`    | Run the full local verification flow           |

## Workflow

Use `vp run check` as the default verification step after code changes.

Do not use `pnpm build` just to verify work. Reserve `pnpm build` for cases where you specifically need to validate production output.

## Project Docs

- [Project spec](./docs/spec-obsidian-publish.md)
- [Astro gotchas](./docs/astro-gotchas.md)
- [Centralized site config spec](./docs/spec-site-config.md)
