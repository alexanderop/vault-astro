---
title: "Brainmaxxing"
type: github
url: "https://github.com/poteto/brainmaxxing"
stars: 177
language: "Python"
tags:
  - claude-code
  - memory
  - skills
  - knowledge-management
  - self-improvement
authors:
  - poteto
summary: "A markdown vault Claude Code reads at session start and writes to when it learns something — five slash commands wire reflection, rumination, and skill auditing into a self-improvement loop."
date: 2026-04-14
---

## The Core Argument

Persistent memory for an LLM agent doesn't need a vector database, an MCP server, or a SaaS. A folder of markdown files plus a startup hook gets you 90% of the value, and because it's a plain Obsidian vault you can read your agent's brain yourself. The interesting move isn't the storage — it's wiring reflection and pruning into slash commands so the brain compounds instead of rotting.

## What's in the Box

- **`brain/`** — the vault itself, seeded with 16 engineering principles. A startup hook injects an index into context every session.
- **`/reflect`** — end-of-session scan that writes worth-remembering bits into the brain. The author claims this alone delivers most of the value.
- **`/meditate`** — audits skills against accumulated brain content, finds contradictions, prunes stale notes, surfaces unstated principles hiding across entries.
- **`/ruminate`** — mines past Claude Code conversation history for corrections and preferences `/reflect` missed. Bootstraps a brain from existing history.
- **`/plan`** — phased task plans grounded in the brain's principles, written back to `brain/plans/`.
- **`/review`** — code and plan review against principles, with numbered severity and tradeoffs.

## Why This Matters

The reflect → meditate → skills-evolve loop is the same idea Alexander has been circling for months: agents shouldn't just remember facts, they should rewrite their own instructions. [[self-improving-skills-in-claude-code]] frames it as one-sentence reflection on mistakes; [[claude-code-continuous-learning-skill]] codifies it as a skill; [[introducing-remember-teaching-agents-to-learn-from-experience]] generalizes it to any agent. Brainmaxxing is the most mechanically complete version: a closed loop where reflection writes to the brain and meditation feeds back into the skills that did the reflecting.

The sleight of hand worth noticing: there's no separation between "memory" and "skills." Principles live in the same vault as session notes, so meditation can rewrite both from the same evidence. That's structurally simpler than the wiki-vs-source split [[llm-wiki]] uses, and the tradeoff is honesty — Alexander's vault keeps an immutable source layer, brainmaxxing happily prunes anything that looks stale.

## Tension Worth Sitting With

Compare to [[persistent-wiki]] and [[teaching-claude-code-my-obsidian-vault]]: those treat the vault as an external knowledge base the agent serves. Brainmaxxing inverts it — the vault is the agent's own working memory, and human browsing is a side effect of using markdown. Both framings work; they optimize for different things. If the goal is human-readable knowledge that survives the agent, the wiki model wins. If the goal is an agent that gets sharper week over week, brainmaxxing's tight loop wins.

Worth noting: at 177 stars it's a side project, not an ecosystem play. The whole thing is a few hundred lines of Python and markdown — closer in spirit to [[ralph-guide]]'s minimalism than to [[superpowers]]'s plugin marketplace.

## Installation

Tell Claude Code to install it from the repo. It copies `brain/`, the six skills under `.agents/skills/`, hook config into `.claude/settings.json`, and appends brain instructions to `CLAUDE.md`.

## Connections

- [[self-improving-skills-in-claude-code]] — same reflect-on-mistakes pattern, but brainmaxxing closes the loop with `/meditate` instead of leaving it as ad-hoc CLAUDE.md edits.
- [[claude-code-continuous-learning-skill]] — closest sibling: also packages reflection as a slash command. Brainmaxxing adds rumination over past conversations, which is the harder half.
- [[introducing-remember-teaching-agents-to-learn-from-experience]] — generalizes the same idea outside Claude Code.
- [[byterover-cli]] — alternative answer to "where does agent memory live": git-versioned context trees vs. a flat markdown vault.
- [[antfu-skills]] — Antfu's skill collection is the manual version of what `/meditate` tries to automate.
- [[ralph-guide]] — shares the "stupid simple, plain text, do less" aesthetic.
