---
title: "Everything We Got Wrong About Research-Plan-Implement"
type: talk
url: "https://www.youtube.com/watch?v=YwZR6tc7qYg"
conference: "MLOps Community Meetup 2026"
tags:
  - ai-agents
  - context-engineering
  - agentic-coding
  - developer-experience
  - coding-agents
authors:
  - dex-horthy
summary: "Research-Plan-Implement was a good first pass, but a monolithic 85-instruction prompt is a trap — splitting it into focused stages (CRISPY) gives better instruction adherence, lighter reviews, and real leverage without sacrificing code quality."
date: 2026-03-29
---

Dex Horthy returns to eat his own dogfood. After 10,000+ engineers grabbed the RPI prompts and half of them got mediocre results, his team dug into why. The answer: they violated their own 12 Factor Agents principles by shipping a monolithic mega-prompt, and they told people not to read the code. Both were wrong.

## Key Arguments

### The "Magic Words" Problem

RPI's planning prompt had ~85 instructions. Frontier models follow about 150-200 instructions with good consistency — but once you add CLAUDE.md, system prompts, tool definitions, and MCP servers, you blow through that budget fast. The result: critical workflow steps got skipped randomly. Users who happened to phrase their prompt with "work back and forth with me starting with your open questions" got great results. Everyone else got a plan dumped on them with zero alignment. Dex's takeaway: if your tool requires magic words to work, go fix the tool.

### Don't Read the Plans — Read the Code

The original RPI advice was to review the plan carefully before implementation. But a 1,000-line plan produces ~1,000 lines of code (within 10%), and the code always diverges from the plan. You end up reviewing twice: once for the plan, once for the code. That's not leverage — that's overhead. The new advice: skip the plan review, own the code review. You still get 2-3x speed. That's better business outcomes than 10x speed with slop you have to rip out in six months.

### RPI → CRISPY: Split Mega-Prompts into Focused Stages

The fix was decomposing one 85-instruction prompt into seven smaller, focused prompts — each under 40 instructions:

```mermaid
flowchart LR
    subgraph before["RPI (Before)"]
        direction LR
        R[Research] --> P[Plan]
        P --> I[Implement]
    end

    subgraph after["CRISPY (After)"]
        direction LR
        Q[Questions] --> RS[Research]
        RS --> D[Design]
        D --> S[Structure]
        S --> PL[Plan]
        PL --> W[Worktree]
        W --> IM[Implement]
        IM --> PR[PR]
    end

    before -.->|"Split mega-prompt\ninto focused stages"| after
```

::

The key insight: **don't use prompts for control flow if you can use control flow for control flow.** Classify the input, then route to smaller, specialized prompts. This isn't just a coding agent lesson — it applies to any LLM-based system.

### The Design Discussion as Leverage

The real leverage comes from a ~200-line design doc (vs. a 1,000-line plan). It forces the agent to brain-dump: what it found, what it wants to do, what it thinks you want, and what it doesn't know. You do "brain surgery on the agent" before it writes 2,000 lines. This is the architecture review meeting — short, high-signal, steerable. Your co-workers can review it too, catching bad decisions before code exists.

### Vertical Plans Beat Horizontal Plans

Models love horizontal planning: all the database, then all the services, then all the API, then all the frontend. You end up 1,200 lines in with nothing testable. Vertical plans — mock an endpoint, wire the frontend, add the service layer, do the migration — give you checkpoints. If something breaks at step 3, you catch it before step 7.

### Objective Research Requires Hiding the Ticket

When you tell the research agent what you're building, you get opinions mixed with facts. The fix: one context window generates questions from the ticket, a fresh context window with no knowledge of the goal does the research. Query planning for codebases.

## Notable Quotes

> "If you built a tool that requires hours and hours of training and reps to get good results from, go fix the tool."
> — Dex Horthy

> "You want to give the agent every single opportunity to show you what it's wrong about before you go write 2,000 lines of code."
> — Dex Horthy

> "We have a profession to uphold. 2026 is supposed to be the year of no more slop."
> — Dex Horthy

## Practical Takeaways

- Keep each prompt under 40 instructions — mind your instruction budget
- Use deterministic control flow (if-statements, classification) instead of cramming branching logic into a single prompt
- Front-load alignment: a 200-line design doc is cheaper to review and steer than a 1,000-line plan
- Structure plans vertically (feature slices with checkpoints) not horizontally (layer by layer)
- Separate research context from implementation intent to keep facts objective
- Read and own the code — 2-3x with quality beats 10x with slop

## Connections

- [[no-vibes-allowed-solving-hard-problems-in-complex-codebases]] — Dex's earlier talk introducing the original RPI methodology that this talk explicitly corrects and evolves
- [[12-factor-agents]] — Dex's own manifesto for building production agents with focused micro-agents in deterministic workflows — the very principle he admits RPI violated with its monolithic prompt
- [[chat-with-ai-coding-wizard-dex-horthy]] — Dex's conversation with Matt Pocock covering many of the same context engineering ideas in a more exploratory format
- [[effective-context-engineering-for-ai-agents]] — Anthropic's framework for treating context as a finite resource, which directly supports Dex's argument about instruction budgets and the "dumb zone"
