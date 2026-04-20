---
title: "Using Claude Code Skills Well"
type: wiki
wiki_role: synthesis
status: seed
source_ids:
  - claude-code-skills
  - the-complete-guide-to-building-skills-for-claude
  - claude-code-2-1-skills-universal-extension
  - claude-code-skills-dont-auto-activate
  - agents-md-outperforms-skills-in-vercel-agent-evals
  - how-to-make-claude-code-better-every-time-you-use-it
  - self-improving-skills-in-claude-code
  - how-we-built-a-company-wide-knowledge-layer-with-claude-skills
summary: "Skills are markdown workflows that load progressively into Claude Code, but the pitched auto-invocation is unreliable — design them to work well when manually invoked, put the weight in the description, and treat 2.1 frontmatter as the default extension mechanism."
tags:
  - claude-code
  - skills
  - ai-agents
  - developer-experience
  - synthesis
authors:
  - alexander-opalic
date: 2026-04-20
updated_at: 2026-04-20
---

Skills are Claude Code's unified extension format: a folder with a `SKILL.md` file whose YAML frontmatter Claude sees at startup, whose body loads when triggered, and whose reference files and scripts load on demand. In 2.1 they absorbed the best parts of slash commands, subagents, and hooks. The pitch is that they auto-activate when a request matches the description. The evidence says that part is unreliable. Here is what actually works.

## The Three-Layer Loading Model

[[claude-code-skills]] and [[the-complete-guide-to-building-skills-for-claude]] describe the same **progressive disclosure** hierarchy:

1. **Frontmatter** — always loaded; decides whether the skill activates
2. **`SKILL.md` body** — loaded only when triggered
3. **`references/` and `scripts/`** — discovered and loaded on demand; script code executes without ever entering the context window

The practical consequence: the description field carries almost all of the decision weight, and everything below `SKILL.md` is essentially free until needed.

## The Auto-Activation Contradiction

The marketing story is that skills are "model-invoked" — Claude autonomously detects a match and loads them. [[how-we-built-a-company-wide-knowledge-layer-with-claude-skills]] treats this as the core value proposition, letting frontend engineers inherit data-team patterns without knowing which skills exist.

The empirical story is less flattering:

- [[claude-code-skills-dont-auto-activate]] reports that even with hook-based prompting, reliability sits at 40–50%. Gentle reminders fail; only direct commands like "Use Skill(research) to handle this request" work.
- [[agents-md-outperforms-skills-in-vercel-agent-evals]] found skills triggered in only 44% of relevant eval cases. Documentation embedded in `AGENTS.md` hit 100% on the same evals, because it removes the decision point entirely.

The resolution: **design skills assuming manual invocation**. Auto-activation is a bonus when it fires. If a skill is load-bearing, prefer either explicit invocation (via the Skill tool or slash menu) or passive context in `CLAUDE.md` / `AGENTS.md`.

## The Description Is Everything

Since Claude only sees the description before deciding to load a skill, writing it well is the highest-leverage activity in skill authoring ([[the-complete-guide-to-building-skills-for-claude]]):

- **Bad**: "Helps with projects."
- **Good**: "Analyzes Figma design files and generates developer handoff documentation. Use when user uploads .fig files, asks for 'design specs', 'component documentation', or 'design-to-code handoff'."

Include trigger phrases users would actually say. Narrow the scope if the skill over-triggers ("processes PDF legal documents" beats "processes documents"). Max 1024 characters — use them.

## Keep SKILL.md Light, Push Depth Downward

Both [[claude-code-skills]] and [[claude-code-2-1-skills-universal-extension]] land on the same rule: `SKILL.md` under ~500 lines (the full guide says under 5,000 words). Put detail in sibling reference files that Claude loads only when that branch of the workflow triggers. Put deterministic logic in `scripts/` — language interpretation drifts, code doesn't, and script code executes without consuming context.

A well-structured skill folder:

```text
my-skill/
├── SKILL.md              # Overview + routing (under 500 lines)
├── references/
│   ├── openapi-patterns.md   # Loaded only for OpenAPI workflows
│   └── error-handling.md     # Loaded when implementing error paths
└── scripts/
    └── validate.ts           # Runs without context cost
```

## The 2.1 Mental Model: Just Make It a Skill

Before 2.1, the extension-mechanism decision was a four-way tree: skill, slash command, subagent, or hook. [[claude-code-2-1-skills-universal-extension]] collapses this:

| Use case                | Solution                   |
| ----------------------- | -------------------------- |
| User-invocable workflow | Skill (default behavior)   |
| Isolated context        | Skill with `context: fork` |
| Specific model          | Skill with `model:`        |
| Event-driven logic      | Skill with `hooks:`        |
| Dynamic runtime prompt  | Task tool (the exception)  |

[[how-to-make-claude-code-better-every-time-you-use-it]] keeps a pragmatic slash-command/subagent/skill table for cases where direct user invocation or a dedicated isolated agent still reads cleaner, but 2.1's frontmatter (hot-reload, `context: fork`, `agent:`, scoped lifecycle hooks) absorbs most of those.

## Test Triggering Before You Ship

[[the-complete-guide-to-building-skills-for-claude]] prescribes a three-level test:

1. **Triggering** — does the skill fire on 10–20 representative queries (target ≥90%) and stay silent on unrelated ones?
2. **Functional** — does the workflow produce correct outputs with clean tool calls?
3. **Comparative** — how does with-skill vs. without-skill compare on message count, failed tool calls, and token use?

Given the auto-activation reliability data above, the triggering test matters more than the guide lets on. A 90% trigger rate in your own harness is the floor, not the ceiling.

## Compound the Skill Over Time

[[self-improving-skills-in-claude-code]] and [[how-to-make-claude-code-better-every-time-you-use-it]] both land on the same loop: when the skill produces a wrong output or Claude needs correction mid-workflow, capture the lesson back into the skill (or CLAUDE.md). The minimum-viable version is a single sentence: "Add this to the skill so it doesn't happen next time." Over weeks, the skill encodes the mistakes that would otherwise recur each session.

## Distribution and Precedence

Skills resolve in a fixed precedence: Enterprise managed settings → Personal (`~/.claude/skills/`) → Project (`.claude/skills/`) → Plugin ([[claude-code-skills]]). For org-wide distribution, host on GitHub with a README and install guide, or use Anthropic's workspace-level admin deploy (available since December 2025) for automatic updates across a team ([[the-complete-guide-to-building-skills-for-claude]]).

## Gaps

- No note directly covers the `skill-creator` tool's workflow or how it generates trigger phrases.
- Limited first-party data on measuring skill reliability inside your own setup — most evidence is from Vercel and Scott Spence, neither testing this vault's harness.
- No synthesis on when to prefer `context: fork` skills over Task-tool subagents in practice.
- The `AGENTS.md` vs skills comparison is from one Next.js eval — unclear how it generalizes to non-framework knowledge.

## Follow-ups

- What does an end-to-end compound-engineering loop ([[compound-engineering-plugin]]) look like when the unit of compounding is the skill file itself?
- How should `references/` vs `scripts/` be split? Rough rule: language → references, determinism → scripts.
- Worth capturing: the smallest useful skill (one description + five-line body) and the largest reasonable skill (500-line `SKILL.md` + references/scripts) as anchors.
