---
title: "LLM Wiki"
type: wiki
wiki_role: synthesis
status: active
source_ids:
  - source:llm-wiki-pattern
summary: "The LLM Wiki pattern replaces one-shot retrieval with a maintained markdown wiki that compounds knowledge through ingest, query, and lint workflows."
date: 2026-04-08
updated_at: 2026-04-08
tags:
  - llm
  - knowledge-management
  - agents
  - wiki
---

## The Pattern

The model should not treat the vault like a bag of chunks. It should treat it like a codebase it maintains.

That means:

- sources stay immutable,
- wiki pages are the working memory,
- and the schema plus skills enforce maintenance discipline.

## What Changes In Practice

Ingest is no longer "save a note." It is "read a source, create a source record, update the right wiki pages, refresh [[index]], append to [[log]]."

Query is no longer "search everything." It is "search the maintained wiki first, synthesize from that layer, then file durable answers back when useful."

Lint is no longer just broken-link checking. It is knowledge maintenance: stale claims, orphan pages, missing concept pages, and unresolved tensions.

## Why This Fits This Vault

This vault already has the right raw material: notes on agent harnesses, context engineering, CLAUDE/AGENTS files, and Obsidian workflows. What it lacked was a stricter distinction between capture and synthesis.

The LLM Wiki retrofit turns that existing corpus into a maintained knowledge surface instead of a growing archive.

## Connections

- [[persistent-wiki]] - The core conceptual argument.
- [[agentic-knowledge-map]] - Current cluster of adjacent notes.
- [[self-improving-skills-in-claude-code]] - Shows the same compounding pattern applied to agent instructions.
