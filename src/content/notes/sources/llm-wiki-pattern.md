---
title: "LLM Wiki Pattern"
type: source
source_type: idea
source_id: source:llm-wiki-pattern
captured_at: 2026-04-08
authors:
  - alexander-opalic
publish: false
summary: "Idea file describing an LLM-maintained wiki with immutable sources, synthesized markdown pages, and schema-driven ingest/query/lint workflows."
tags:
  - llm
  - wiki
  - knowledge-management
---

## Source Summary

This source defines a pattern for building personal knowledge bases with LLMs:

- raw sources remain immutable,
- the LLM maintains a persistent wiki as an intermediate artifact,
- and the schema file teaches the agent how to ingest, query, and lint the system.

## Key Claims

- A maintained wiki compounds knowledge better than repeated raw-document retrieval.
- Good answers should be written back into the wiki instead of disappearing into chat history.
- `index.md` and `log.md` are enough for navigation at moderate scale before heavier search infrastructure is needed.

## Derived Wiki Pages

- [[overview]]
- [[index]]
- [[log]]
- [[persistent-wiki]]
- [[llm-wiki]]
