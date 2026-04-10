---
title: "Claude Code with Playwright: 4-Agent Test Generation Pipeline"
type: source
source_type: article
source_id: "https://testdino.com/blog/claude-code-with-playwright/"
captured_at: 2026-04-10
publish: false
---

## Article Metadata

- **Author:** Pratik Patel (Founder & CEO, TestDino)
- **Published:** March 30, 2026
- **Last Modified:** April 8, 2026

## Full Content

### Overview

The article presents a structured methodology for using Anthropic's Claude Code CLI with Playwright browser automation to generate, maintain, and improve test suites through a multi-agent pipeline approach. The framework emphasizes product context over DOM exploration to prevent brittle tests.

### Key Premise

"Your team ships faster than QA can write tests. Single-prompt AI generators make it worse. They read the DOM, not your product rules, so scripts break on the next deploy."

The solution: A 4-agent pipeline that transformed a 20-line prompt into 3 page objects and a complete spec in 15 minutes at TestDino.

## The 4-Agent Pipeline Architecture

### Agent Breakdown

| Agent                    | Input                                       | Output                                                          | Purpose                                    |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| **Exploration**          | Documentation + live app via Playwright CLI | app.context.md + per-feature JSDoc                              | Discover product workflows and rules       |
| **Test Case Generation** | app.context.md + JSDoc files                | Test specifications with steps, preconditions, expected results | Human-reviewed coverage blueprint          |
| **Automation**           | Test cases + live app + Playwright Skills   | Page objects + .spec.ts files + results                         | Code generation with production patterns   |
| **Maintenance**          | Failing tests + page objects + TestDino MCP | Fix proposals or bug reports                                    | Diagnose and propose fixes with CI history |

### Handoff Mechanism

"Every handoff is a file on disk. No orchestrator. You can stop between any 2 phases, edit the output, and resume the next day."

All phases operate independently through file-based communication—no shared memory or orchestration layer.

## The 3-Layer Context Strategy

### Layer 1: app.context.md

Product knowledge foundation documenting:

- Core workflows
- User roles and permissions
- Authentication methods
- Out-of-scope features
- API endpoints

Example structure:

```
# tests/app.context.md
## What this app does
TestDino is a Playwright test reporting platform.
- Core workflows: upload runs, view failure groups, triage flaky tests
- User roles: Owner, Admin, Member, Viewer
- Auth: email/password at /auth/login
- NOT in scope: billing/Stripe, Google OAuth
```

### Layer 2: Per-Feature JSDoc

Documents what the accessibility tree cannot reveal:

- Clipboard-only tokens
- Permission rules
- Conditional flows
- API response structures

Example:

```typescript
/**
 * @feature API Keys Management
 * @route /org_.../projects/.../settings?tab=api
 * @rules
 *   - Only Owner and Admin can create/rotate/delete
 *   - Token prefix: trx_
 *   - Create: token visible in response dialog
 *   - Rotate: token clipboard-only, NOT shown in UI
 */
```

### Layer 3: Playwright Skills

Curated markdown guides enforcing production patterns:

- Semantic locators (getByRole over CSS selectors)
- storageState for authentication
- Auto-waiting assertions
- Page Object Model structure

## Real Example: API Key Workflow

### Challenge

A complex workflow crossing browser and CLI boundaries with conditional logic and dual token-capture strategies depending on the execution path.

### Solution: Response Interception Pattern

The rotation endpoint sends tokens directly to clipboard—never rendered in DOM. The agent must register a response listener **before** clicking, not after.

```typescript
async rotateKey(name: string): Promise<string> {
  const row = this.page.getByRole('row', { name });
  await row.getByRole('button', { name: 'Rotate' }).click();

  // Promise-first: register BEFORE confirming
  const responsePromise = this.page.waitForResponse(
    (resp) => resp.url().includes('/api-key') &&
              resp.request().method() === 'PUT',
  );
  await this.confirmRotateButton.click();

  const response = await responsePromise;
  const body = await response.json();
  return body.data.token; // trx_... prefix
}
```

**Key insight:** Reversed promise registration prevents the 1-in-10 CI flakiness that occurs when response arrives before listener exists.

## Playwright MCP Setup

```bash
claude                                              # Start Claude Code
claude mcp add playwright npx @playwright/mcp@latest  # Add MCP server
/mcp                                               # Verify connection
```

Requirements: Node.js 18 LTS or later. Use `@playwright/mcp`, not the deprecated `@modelcontextprotocol/server-playwright`.

## Playwright CLI vs. Playwright MCP

| Factor       | MCP                                               | CLI                                                        |
| ------------ | ------------------------------------------------- | ---------------------------------------------------------- |
| How it works | Streams full browser state into context each turn | Writes artifacts to disk; model reads only needed portions |
| Token cost   | High (50k+ tokens on complex pages per snapshot)  | ~4x lower cost with cached context reuse                   |
| Context risk | High on long sessions                             | Low                                                        |
| Best for     | Exploratory debugging, self-QA, one-off flows     | Repeated test generation, large projects, CI               |

Pipeline recommendation: Use CLI for the 4-agent pipeline. Agents already possess product context from app.context.md and JSDoc, eliminating the need for full accessibility snapshots each iteration.

## Where Agents Actually Get Stuck

| Stuck Point                    | Root Cause                                 | Fix                                         |
| ------------------------------ | ------------------------------------------ | ------------------------------------------- |
| Rotation token not in UI       | Clipboard-only, never rendered             | "Intercept the PUT /api-key response"       |
| Over-reading files             | Agent reads full files instead of sections | Restructure page objects to be smaller      |
| Create vs. rotate confusion    | Ambiguous conditional                      | "Check if key name exists in table first"   |
| Wrong CLI flags                | Non-standard syntax                        | Paste exact upload command with all flags   |
| Token lost across serial tests | Missing test.describe.serial()             | "Write token to variable at describe scope" |

Pattern: Standard operations (login, form fill, navigation) succeed on first attempt. Loops occur exclusively where answers exist outside the DOM or codebase.

## Token Costs from Real Runs

- API key workflow session: 110k of 200k context window (55%) at mid-session snapshot
- Single large file read: 137.9k tokens consumed in one tool call
- Most expensive loop: 3 attempts on clipboard token issue before one sentence resolved it
- Caching benefit: app.context.md and JSDoc cache between runs, making subsequent feature tests significantly cheaper

Lesson: Keep page objects small. One unfocused file can consume massive token allocation.

## CLAUDE.md Configuration

```markdown
# CLAUDE.md

## Read first

tests/app.context.md — read at session start, once.

## Playwright patterns

Load the Playwright Skill before writing test code.
Install: npx skills add testdino-hq/playwright-skill

## Hard rules

- Never auto-apply test fixes. Show a diff first.
- Never modify page objects without reading JSDoc.
- Locators: getByRole or getByTestId. No CSS selectors.
- Auth: storageState from tests/auth/ only.
- Staging only. Never production.
```

## Multi-User Auth with storageState

```typescript
// tests/auth/global-setup.ts
const roles = [
  { name: "owner", email: process.env.OWNER_EMAIL!, password: process.env.OWNER_PASS! },
  { name: "admin", email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASS! },
  { name: "member", email: process.env.MEMBER_EMAIL!, password: process.env.MEMBER_PASS! },
  { name: "viewer", email: process.env.VIEWER_EMAIL!, password: process.env.VIEWER_PASS! },
];

for (const role of roles) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${process.env.BASE_URL}/auth/login`);
  await page.getByLabel("Email").fill(role.email);
  await page.getByLabel("Password").fill(role.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
  await context.storageState({ path: `tests/auth/${role.name}.json` });
  await context.close();
}
```

Per-spec usage:

```typescript
test.use({ storageState: "tests/auth/member.json" });

test("member cannot create API keys", async ({ page }) => {
  await page.goto("/settings?tab=api");
  await expect(page.getByRole("button", { name: "Generate Key" })).not.toBeVisible();
});
```

## Built-In Playwright Agents vs. 4-Agent Pipeline

| Capability               | Built-in Agents              | 4-Agent Pipeline                                |
| ------------------------ | ---------------------------- | ----------------------------------------------- |
| Business logic awareness | Accessibility tree only      | app.context.md + JSDoc + routes                 |
| Test review before code  | None                         | Human checkpoint before Automation Agent        |
| Multi-role RBAC tests    | Manual re-recording per role | storageState per user, built-in                 |
| Maintenance on failures  | Healer auto-applies fixes    | Maintenance Agent proposes diff; human approves |

"The Healer auto-applying fixes is the gap that matters most. If a test broke because the feature's permission rule changed, a silent fix hides a real bug."

## 5 Mistakes That Will Hurt You

1. **Skipping app.context.md** — Generic scripts, 30 loops per feature. 30 minutes of documentation prevents 10 loops.
2. **Trusting the Healer on permission-sensitive tests** — Auto-applied fixes silently change RBAC coverage. Use Maintenance Agent with human review.
3. **Running full pipeline on large refactors** — Agent guesses at scope beyond 50 changed files. Keep diffs small.
4. **Using MCP for the Automation Agent** — 3-4x higher token consumption. MCP for exploration, CLI for generation.
5. **Missing test.describe.serial() on data-dependent tests** — Parallel execution silently breaks state-sharing tests.

## Tracking AI-Generated Tests in CI

```bash
npx tdpw upload ./playwright-report \
  --token=$TESTDINO_TOKEN \
  --environment="staging" \
  --tag="ai-generated,claude-code" \
  --json
```

Maintenance Agent queries error grouping and trace viewer data across CI runs, not isolated local traces. A test failing 3-of-5 runs receives a retry strategy; consistent post-deployment failures trigger bug reports.

## FAQ Highlights

- Claude Code vs Cursor: Both use identical MCP server. Claude Code offers terminal agent reading full project context. For structured generation with app.context.md + JSDoc, Claude Code produces more consistent results.
- Token cost: API key workflow (3 page objects + 1 spec) consumed 110k of 200k window. Automation Agent costs most (~70k).
- When to skip pipeline: Simple flows (login, form, basic navigation) without complex permissions — use built-in agents.
