---
title: "From 380 to 700+ Tests: How We Built an Autonomous QA Team with Claude Code"
type: source
source_type: article
source_id: "https://openobserve.ai/blog/autonomous-qa-testing-ai-agents-claude-code/"
captured_at: 2026-04-09
publish: false
---

## Metadata

- **Author:** Shrinath Rao
- **Published:** January 27, 2026
- **Organization:** OpenObserve
- **Read time:** 9 minutes

## Full Article Content

### TL;DR

OpenObserve developed the "Council of Sub Agents"—eight specialized AI agents powered by Claude Code automating their end-to-end testing pipeline. The system reduced feature analysis from 45-60 minutes to 5-10 minutes, eliminated 85% of flaky tests, expanded test coverage from 380 to 700+ tests, and identified a production bug during test creation that customers hadn't yet reported.

### The Problem

Development velocity exceeded QA automation capabilities. Key pain points:

- Feature analysis requiring 45-60 minutes
- 30+ flaky tests causing false failures
- Limited test coverage (~380 tests)
- Manual test creation bottlenecks preventing pace with development

### The Solution: Six-Phase Pipeline Architecture with Eight Agents

1. **The Orchestrator** - Pipeline manager routing features and determining OSS vs. Enterprise testing paths

2. **The Analyst (Phase 1)** - Extracts data-test selectors from source code, maps user workflows, identifies edge cases, produces Feature Design Documentation

3. **The Architect (Phase 2)** - Creates prioritized test plans categorizing tests as P0 (critical paths), P1 (core functionality), P2 (edge cases)

4. **The Engineer (Phase 3)** - Generates Playwright test code using Page Object Model patterns and verified selectors

5. **The Sentinel (Phase 4)** - Quality assurance gate auditing code for framework violations, anti-patterns, and security issues; can block the pipeline

6. **The Healer (Phase 5)** - Runs tests, diagnoses failures, fixes issues through iterative testing (up to 5 iterations)

7. **The Scribe (Phase 6)** - Documents test cases in TestDino test management system

8. **The Test Inspector** - Reviews GitHub PRs containing E2E test changes independently

### Critical Discovery: ServiceNow Production Bug

During automation of the "Prebuilt Alert Destinations" feature, the pipeline discovered a silent production failure:

**The Issue:** ServiceNow URL validation used faulty logic:

```javascript
hostname.split(".").slice(-3, -1).join(".") === "service-now";
// For "dev12345.service-now.com" returned wrong substring
```

**The Fix:**

```javascript
hostname.endsWith(".service-now.com");
```

The bug prevented all ServiceNow destination edits from functioning in production without generating visible errors. No customers had reported it.

### Measured Impact

**Speed & Efficiency:**

- Feature analysis: 6-10x faster (45-60 min → 5-10 min)
- Time to first passing test: ~1 hour → 5 minutes
- RCA and maintenance: full day → minutes

**Quality & Coverage:**

- Flaky test reduction: 85% (30-35 tests → 4-5 tests)
- Test coverage increase: 84% (380 → 700+ tests)
- Edge case detection: consistent discovery of scenarios humans missed
- Production bugs caught: at least one critical silent failure

**Team Velocity:**

- Direct automation contribution in feature PRs
- Tests exist at release time
- Standardized patterns enforced via Sentinel auditing

### Technical Implementation

Built using Claude Code (slash commands as markdown files in `.claude/commands/`), integrating with:

- Playwright (E2E testing framework)
- Page Object Model (UI component abstraction)
- TestDino (test management)
- GitHub (version control and PR reviews)

Architecture philosophy: specialization over generalization—bounded agents with specific roles outperform single "super agents."

### Key Lessons

1. **Quality Gates Create Long-term Value** - The Sentinel blocking pipeline for critical issues forced standardization
2. **Iteration Enables Autonomy** - The Healer's iterative capability (5 attempts per test) distinguishes true autonomous testing from simple code generation
3. **Context Chaining Drives Intelligence** - Each agent receives output from previous phases, enabling informed decisions
4. **Human Review Remains Important** - Oversight of final output continues, but review time dropped from hours to minutes

### Future Roadmap

- Full CI/CD integration (automatic trigger on feature PR merges)
- Visual regression testing via screenshot comparison
- Performance test generation
- API test coverage expansion
- Self-improvement loops where agents learn from failures and update their own prompts
