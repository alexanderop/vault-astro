---
title: "Overview"
type: wiki
wiki_role: overview
status: active
source_ids:
  - source:llm-wiki-pattern
summary: "Top-level guide to how this vault now works as an LLM-maintained wiki with immutable sources, synthesized pages, and maintenance workflows."
date: 2026-04-08
updated_at: 2026-04-08
tags:
  - knowledge-management
  - llm
  - wiki
---

## What This Vault Is

This vault is no longer just a pile of notes. It is a persistent wiki the LLM maintains over time.

The working model has three layers:

- **Sources** are immutable records of what entered the system.
- **Wiki pages** are the public layer: concept pages, maps, syntheses, author pages, and operational documents.
- **Schema and skills** tell the LLM how to ingest, query, lint, and maintain the wiki.

## Operating Rules

- New material enters through a source record first.
- Durable understanding lives in wiki pages, not chat history.
- Good answers get filed back as synthesis pages.
- Contradictions, stale claims, and missing pages should be surfaced during lint passes.

## Start Here

- [[index]] tracks the current catalog of important wiki pages.
- [[log]] records how the wiki evolves over time.
- [[llm-wiki]] explains the pattern this retrofit is built around.
- [[agentic-knowledge-map]] groups the current cluster of notes about agents, skills, and persistent context.
