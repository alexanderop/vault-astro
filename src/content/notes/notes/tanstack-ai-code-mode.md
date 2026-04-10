---
title: "TanStack AI Code Mode"
type: article
url: "https://tanstack.com/blog/tanstack-ai-code-mode"
tags:
  - ai-agents
  - ai-tools
  - typescript
  - llm
authors:
  - jack-herrington
  - alem-tuzlak
  - tanner-linsley
summary: "Stop making LLMs orchestrate tools one call at a time — let them write TypeScript that composes your tools with Promise.all, .reduce(), and real arithmetic, then execute it in a sandbox. One round-trip, correct math, massively fewer tokens."
date: 2026-04-08
---

## Summary

The core insight is embarrassingly obvious once you see it: LLMs are great at writing TypeScript and terrible at math and sequential orchestration. So stop asking them to call tools one at a time. Give them an `execute_typescript` tool, let them write a program that composes your tools, and run it in a sandboxed isolate. Seven tool calls become one. Mental math becomes `Array.reduce()`. The N+1 problem disappears.

TanStack AI's Code Mode packages this pattern into a composable, model-agnostic tool. Define your tools with `toolDefinition()`, pick an isolate driver (Node V8, QuickJS WASM, or Cloudflare Workers), and the LLM gets a TypeScript sandbox where your tools appear as typed `external_*` functions.

```mermaid
flowchart LR
    subgraph Traditional["Traditional Tool Calling"]
        direction TB
        T1["Tool Call 1"] --> W1["Wait"]
        W1 --> T2["Tool Call 2"]
        T2 --> W2["Wait"]
        W2 --> T3["Tool Call N"]
        T3 --> W3["Wait"]
        W3 --> LLM["LLM does math\n(probably wrong)"]
    end

    subgraph CodeMode["Code Mode"]
        direction TB
        TS["LLM writes TypeScript"] --> SB["Sandbox executes"]
        SB --> PA["Promise.all\n(parallel API calls)"]
        PA --> JS["JS runtime does math\n(always correct)"]
    end

    Traditional -.-|"7 round-trips\nhigh token cost\nwrong math"| R1["❌"]
    CodeMode -.-|"1 round-trip\nlow token cost\ncorrect math"| R2["✅"]
```

## Key Concepts

### The Three Premises

1. **Tool calling is slow and expensive** — every round-trip bloats the context window, and the overhead compounds
2. **LLMs can't do math** — "the average is 4.37" is pattern matching, not computation
3. **LLMs are excellent at TypeScript** — enormous training data, they know `Promise.all`, `.reduce()`, async control flow

The conclusion: let models write code, let runtimes execute it.

### Isolate Drivers

Three runtime options, same `IsolateDriver` interface:

| Driver                            | Best for                    | Native deps     | Browser |
| --------------------------------- | --------------------------- | --------------- | ------- |
| `@tanstack/ai-isolate-node`       | Server-side Node.js         | Yes (C++ addon) | No      |
| `@tanstack/ai-isolate-quickjs`    | Browsers, edge, portability | None (WASM)     | Yes     |
| `@tanstack/ai-isolate-cloudflare` | Edge on Cloudflare          | None            | N/A     |

Each execution creates a fresh sandbox context with configurable timeouts and memory limits. The sandbox is destroyed after every call — no state leaks between executions.

### Skills: Persistent Learned Code

The most interesting extension. When the LLM writes code that works, it can save it as a **skill** — a named, typed, persistent function. Next conversation, relevant skills load automatically (selected by a cheap model) and appear as direct tools. The LLM calls them without rewriting the logic.

Skills earn trust through execution stats. Four strategies from "always trusted" to custom thresholds. Trust is metadata-only today, but the infrastructure is there for approval workflows.

## Code Snippets

### Basic Setup

```typescript
import { createCodeMode } from "@tanstack/ai-code-mode";
import { createNodeIsolateDriver } from "@tanstack/ai-isolate-node";

const { tool, systemPrompt } = createCodeMode({
  driver: createNodeIsolateDriver(),
  tools: [fetchWeather],
  timeout: 30_000,
});
```

### With Skills

```typescript
import { codeModeWithSkills } from "@tanstack/ai-code-mode-skills";
import { createFileSkillStorage } from "@tanstack/ai-code-mode-skills/storage";

const storage = createFileSkillStorage({ directory: "./.skills" });
const { toolsRegistry, systemPrompt } = await codeModeWithSkills({
  config: { driver: createNodeIsolateDriver(), tools, timeout: 60_000 },
  adapter: openaiText("gpt-5.4-mini"),
  skills: { storage, maxSkillsInContext: 5 },
  messages,
});
```

## Connections

- [[building-ai-agentic-apps-in-2025]] — Sunil Pai's talk on Cloudflare's agent framework is the direct predecessor here. He pushed the idea that agents should generate TypeScript against typed SDKs instead of making individual tool calls. TanStack Code Mode packages that insight into a composable library.
