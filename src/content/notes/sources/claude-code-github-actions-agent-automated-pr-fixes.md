---
title: "How to Run Claude Code as a GitHub Actions Agent for Automated PR Fixes"
type: source
source_type: article
source_id: "https://groundy.com/articles/how-to-run-claude-code-as-a-github-actions-agent-for-automated-pr-fixes/"
captured_at: 2026-04-11
---

You can run Claude Code as a fully autonomous GitHub Actions agent today using the official `anthropics/claude-code-action@v1`

— responding to PR comments, auto-fixing failing CI tests, and posting code reviews. For most teams running 50 PRs a month, the API cost runs under $5. The pattern is production-ready, with built-in guardrails to prevent runaway loops and unauthorized access.

## What Is the Claude Code GitHub Action?

The `anthropics/claude-code-action@v1`

is Anthropic's official GitHub Action that runs the full Claude Code runtime inside a standard GitHub Actions runner. It launched September 29, 2025 as part of Claude Code 2.0 and is built on Anthropic's Agent SDK.

Unlike typical AI reviewer tools that produce static comment threads, this action gives Claude a live shell environment: it can read files, run `git`

commands, edit code, install dependencies, and push commits. When wired into your workflow, it becomes a software agent that acts on your repository — not just one that talks about it.

The action supports two distinct modes:

**Interactive mode**: Claude listens for`@claude`

mentions in PR comments, issues, and review threads, then executes whatever the commenter requests.**Automation mode**: Claude is given a`prompt`

parameter directly in the workflow YAML and runs headlessly on every matching event (PR open, CI failure, issue creation, etc.).

Most production pipelines use both: interactive mode for ad-hoc developer requests and automation mode for continuous gatekeeping.

## How to Set Up the Claude Code Action

### Three Setup Paths

Anthropic offers three ways to get started, depending on your billing model:

**Path 1: Quickstart (API users)**
Run `/install-github-app`

inside the Claude Code terminal. It installs the Claude GitHub App, configures repository secrets, and creates a starter workflow — the fastest route for direct API users.

**Path 2: Manual Setup**

- Install the Claude GitHub App at
  `github.com/apps/claude`

. It requests Read & Write access to Contents, Issues, and Pull Requests. - Add
`ANTHROPIC_API_KEY`

to your repository's Secrets (Settings → Secrets and variables → Actions). - Copy the example workflow from the official repo and commit it to
`.github/workflows/`

.

**Path 3: OAuth Token (Max subscribers)**
As of v1.0.44, Claude Max plan users can authenticate without a per-token API key using an OAuth token instead:

claude update # ensure v1.0.44+ claude setup-token # outputs CLAUDE_CODE_OAUTH_TOKEN

Add the generated token to GitHub Secrets as `CLAUDE_CODE_OAUTH_TOKEN`

and reference it in the workflow with `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`

.

## The Four Core Workflow Patterns

### 1. Interactive Comment Trigger

The simplest deployment: Claude activates only when a team member types `@claude`

in a PR comment or issue.

name: Claude Code on: issue_comment: types: [created] pull_request_review_comment: types: [created] issues: types: [opened, assigned] pull_request_review: types: [submitted]

jobs: claude: runs-on: ubuntu-latest permissions: contents: write pull-requests: write issues: write steps: - uses: anthropics/claude-code-action@v1 with: anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

With this in place, any write-access team member can type `@claude fix the failing test in auth.spec.ts`

in a PR comment and Claude will check out the branch, read the error, edit the file, and push the fix.

### 2. Automated PR Code Review

This triggers on every new or updated PR, running Claude against the diff before human reviewers engage:

name: Claude PR Review on: pull_request: types: [opened, synchronize] paths-ignore: - '\*.md' - 'docs/\*\*'

jobs: review: runs-on: ubuntu-latest permissions: contents: read pull-requests: write concurrency: group: claude-review-${{ github.event.pull_request.number }} cancel-in-progress: true steps: - uses: actions/checkout@v4 with: fetch-depth: 0 - uses: anthropics/claude-code-action@v1 with: anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }} prompt: | Review this pull request. Focus on: 1. Logic errors and potential bugs 2. Security vulnerabilities 3. Performance issues (N+1 queries, unnecessary allocations) 4. Missing error handling Format your review with ## Summary, ## Issues Found (file

, severity), ## Positive Notes. claude_args: "—max-turns 5 —model claude-sonnet-4-6"The `concurrency`

block is important: without it, rapid commits to a PR branch could spawn parallel Claude jobs that race to post conflicting reviews.

### 3. CI Failure Auto-Fix (The High-Impact Pattern)

This is where Claude Code becomes a genuine force multiplier. The workflow triggers when your CI pipeline fails, creates a new branch, downloads the failure logs, and gives Claude the tools to diagnose and patch the problem:

name: Auto Fix CI Failures on: workflow_run: workflows: ["CI"] types: [completed]

permissions: contents: write pull-requests: write actions: read issues: write id-token: write

jobs: auto-fix: if: | github.event.workflow_run.conclusion == 'failure' && github.event.workflow_run.pull_requests[0] && !startsWith(github.event.workflow_run.head_branch, 'claude-auto-fix-ci-') runs-on: ubuntu-latest steps: - uses: actions/checkout@v4 with: ref: ${{ github.event.workflow_run.head_branch }} fetch-depth: 0 token: ${{ secrets.GITHUB_TOKEN }}

The critical guard is the `if`

condition: `!startsWith(github.event.workflow_run.head_branch, 'claude-auto-fix-ci-')`

. Without this, every Claude commit would re-trigger the fixer, creating an infinite loop. Claude's own fix branches are excluded from triggering new fix attempts.

### 4. Structured Output for Downstream Decisions

Claude can return structured JSON that later workflow steps consume — for example, detecting flaky tests before deciding whether to retry or escalate:

- name: Classify failure id: analyze uses: anthropics/claude-code-action@v1 with: anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }} prompt: "Examine the test output. Is this a flaky test or a real regression?" claude_args: | —json-schema '{"type":"object","properties":{"is_flaky":{"type":"boolean"},"confidence":{"type":"number"},"summary":{"type":"string"}},"required":["is_flaky","confidence","summary"]}'

- name: Retry if flaky if: fromJSON(steps.analyze.outputs.structured_output).is_flaky == true run: gh workflow run CI

## Cost Controls That Actually Work

Running Claude against every PR commit without guardrails can accumulate costs quickly. These controls, applied together, keep automation affordable:

| Control              | How to Apply                                  | Effect                                               |
| -------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `--max-turns N`      | `claude_args: "--max-turns 5"`                | Hard cap on agentic steps per invocation             |
| Concurrency group    | `cancel-in-progress: true`                    | Cancels queued runs when new commits arrive          |
| Event type filtering | `types: [opened]` not `[opened, synchronize]` | Fires once per PR, not per commit                    |
| Path filtering       | `paths-ignore: ['*.md', 'docs/**']`           | Skips doc-only changes entirely                      |
| Model selection      | `--model claude-sonnet-4-6`                   | Sonnet costs 60% less than Opus for equivalent tasks |
| Workflow timeout     | `timeout-minutes: 10`                         | Kills runaway jobs before they exhaust turn budget   |
| Tool scoping         | `--allowedTools 'Edit,Read,Grep'`             | Restricts operations, reducing unnecessary turns     |

Based on community benchmarks, at time of writing the per-PR API cost with Sonnet runs approximately:

| PR Size | Lines Changed | Estimated Cost |
| ------- | ------------- | -------------- |
| Small   | < 200         | $0.01 – $0.03  |
| Medium  | 200 – 1,000   | $0.05 – $0.15  |
| Large   | 1,000+        | $0.20 – $0.50  |

For teams running 50 PRs per month, total API spend typically stays under $5. Teams spending over $100/month on tokens may find a Claude Max subscription ($100/month for 5x usage) more economical — it also eliminates per-token billing unpredictability.

## Security Guardrails

### Access Control

By default, only repository contributors with **write access** can trigger Claude. External contributors and bots are blocked unless explicitly listed in `allowed_bots`

. Setting `allowed_non_write_users: "*"`

bypasses this restriction entirely — the official documentation flags this as a significant security risk.

### Prompt Injection Protection

The action automatically strips hidden content from trigger inputs: HTML comments, invisible characters, markdown image alt text, hidden HTML attributes, and HTML entities. This guards against prompt injection via crafted PR descriptions or issue bodies. That said, the docs recommend reviewing raw content from external contributors before allowing Claude to process anything security-sensitive.

### CLAUDE.md Behavioral Constraints

Create a `CLAUDE.md`

file at the repository root to define hard behavioral rules Claude follows in every workflow invocation:

# CLAUDE.md

## Boundaries

- Never modify files in /vendor/ or /generated/
- Never push directly to main or release/\* branches
- Do not suggest architectural changes in routine CI fix PRs

## Review Standards

- Flag any hardcoded credentials as critical, block PR merge
- All new functions require unit tests

## Code Style

- Follow existing patterns before introducing new abstractions

This file functions as a persistent system prompt that outlasts individual workflow runs, ensuring consistent behavior across interactive and automated triggers.

### Principle of Least Privilege

Match workflow permissions to what the job actually needs:

permissions: contents: write # only if Claude pushes commits pull-requests: write # only if Claude posts comments or opens PRs issues: write # only if Claude labels or comments on issues actions: read # only for accessing CI logs id-token: write # only for OIDC auth (Bedrock/Vertex)

Granting `contents: write`

to a review-only job that only needs to post comments is a common misconfiguration worth auditing.

## Behavioral Summary vs. Competing Approaches

| Approach                | Setup         | PR Cost      | Human Loop | Customizable?           |
| ----------------------- | ------------- | ------------ | ---------- | ----------------------- |
| `claude-code-action@v1` | Low (minutes) | $0.01–$0.50  | Optional   | High (CLAUDE.md + args) |
| Direct CLI in runner    | Medium        | Same         | Manual     | Full                    |
| CodeRabbit / similar    | None          | Subscription | Optional   | Low–Medium              |
| Custom LLM reviewer     | High          | Variable     | Manual     | Full                    |

The action wrapper adds the GitHub App token handling, prompt injection filtering, progress tracking, and structured output support that raw CLI usage requires you to build yourself.

## Frequently Asked Questions

**Q: Does Claude automatically merge PRs after fixing CI failures?**
**A:** No. By default, Claude commits to a new branch and links to the PR creation page — a human must approve and merge. Automatic merging requires explicitly granting elevated permissions and configuring the relevant GitHub tools in `claude_args`

.

**Q: How do I prevent infinite loops when Claude's commits trigger CI again?**
**A:** Add `!startsWith(github.event.workflow_run.head_branch, 'claude-auto-fix-ci-')`

to your workflow's `if`

condition. This prevents Claude's own fix branches from re-triggering the auto-fix workflow.

**Q: Can external contributors trigger the action with @claude in a comment?**

**A:**No, by default only users with write access to the repository can trigger Claude. External contributors are blocked unless explicitly whitelisted using the

`allowed_non_write_users`

parameter — which the official docs recommend against for public repositories.**Q: Which Claude model should I use for routine CI fixes?**
**A:** Claude Sonnet is the right default. It costs approximately 60% less than Opus and handles typical test failures, lint errors, and type errors with equivalent reliability. Reserve Opus for jobs requiring complex reasoning across large codebases.

**Q: Does the action work without an Anthropic API key?**
**A:** Yes. Claude Max subscribers can generate an OAuth token via `claude setup-token`

and use `claude_code_oauth_token`

instead of `anthropic_api_key`

. Teams with existing AWS or GCP agreements can route through Bedrock or Vertex AI using OIDC — no Anthropic billing relationship required.

## Footnotes

- Anthropic. "Claude Code GitHub Actions." Official Documentation. September 2025.

https://code.claude.com/docs/en/github-actions -
Anthropic.

`anthropics/claude-code-action`

— Setup Guide. GitHub.

https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md -
Anthropic.

`ci-failure-auto-fix.yml`

example.`anthropics/claude-code-action`

GitHub repository.

https://github.com/anthropics/claude-code-action/tree/main/examples -
myougatheaxo. "Automate Code Reviews on Every PR with Claude Code + GitHub Actions." DEV Community. 2025.

https://dev.to/myougatheaxo/automate-code-reviews-on-every-pr-with-claude-code-github-actions-599p -
Anthropic.

`claude-code-action`

Security Documentation. GitHub.

https://github.com/anthropics/claude-code-action/blob/main/docs/security.md
