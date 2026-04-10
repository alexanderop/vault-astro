---
title: "Persistent Wiki"
type: wiki
wiki_role: concept
status: active
source_ids:
  - source:llm-wiki-pattern
summary: "A persistent wiki compounds knowledge by storing prior synthesis, contradictions, and cross-links as maintained markdown pages instead of rediscovering them at query time."
date: 2026-04-08
updated_at: 2026-04-08
tags:
  - llm
  - knowledge-management
  - rag
---

## Core Idea

The useful unit is not the raw document and not the one-off answer. It is the maintained page in the middle.

That page can absorb:

- claims from multiple sources,
- tensions between sources,
- links to related pages,
- and the current best synthesis.

## Why It Matters

RAG gives you retrieval on demand. A persistent wiki gives you accumulated judgment.

Each new source should update what the vault already believes, not force the model to rediscover the same structure from scratch every time.

## Connections

- [[llm-wiki]] - Concrete synthesis of this pattern inside the current vault.
- [[teaching-claude-code-my-obsidian-vault]] - Practical precedent for giving an agent persistent context about a personal knowledge base.
- [[writing-a-good-claude-md]] - The schema layer only works if the instructions stay concise and broadly reusable.
