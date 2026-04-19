---
title: "Log"
type: wiki
wiki_role: log
status: active
summary: "Append-only operational log for wiki ingests, syntheses, and maintenance passes."
date: 2026-04-08
updated_at: 2026-04-18
tags:
  - wiki
  - operations
---

## [2026-04-18] ingest | The Philosophy of Software Design — with John Ousterhout (The Pragmatic Engineer)

- Source captured: `sources/the-philosophy-of-software-design-with-john-ousterhout.md` (YouTube, Pragmatic Engineer Podcast — full transcript of Gergely Orosz's solo interview with John Ousterhout).
- Wiki note: [[the-philosophy-of-software-design-with-john-ousterhout]] — The AI-era framing: as LLMs automate low-level coding, design becomes a larger share of the job, but universities teach almost none of it. Sharper versions of his contrarian positions than the book: TDD's units are too small for design, combining often beats splitting for module depth, and AI compensates for missing comments without replacing them (a one-way ratchet worth naming).
- Diagram: mermaid flowchart of "design it twice" — first design → forced alternative → compare → pick, annotated with the 1–2% time cost.
- Connections: [[ousterhout-martin-software-philosophies]] (solo framework vs. debate-constrained replies), [[deep-and-shallow-modules]] (this episode adds _combining_ as a depth-increasing move), [[how-ai-will-change-software-engineering]] (Fowler and Ousterhout reach "design matters more" from opposite directions), [[the-wet-codebase]] (anti-small-methods-as-dogma rhymes with anti-DRY-as-dogma), [[senior-engineers-guide-to-ai-coding]] (the daily-practice layer of the same shift).

## [2026-04-18] ingest | Ousterhout vs. Martin — Clean Code vs. Philosophy of Software Design (Book Overflow)

- Source captured: `sources/ousterhout-martin-software-philosophies.md` (YouTube, Book Overflow podcast — full transcript of the joint follow-up episode with John Ousterhout and Robert "Uncle Bob" Martin).
- Wiki note: [[ousterhout-martin-software-philosophies]] — After months of written debate, the two moved roughly an inch on each axis (method length, comments, TDD). Most concrete update: Martin added Ousterhout's TDD variant to _Clean Code_ 2nd edition. Core unresolved split traces back to whether readers share context (Martin) or not (Ousterhout).
- Created podcast profile: book-overflow.
- Created author profiles: john-ousterhout, robert-martin.
- Diagram: mermaid flowchart of the three axes, each showing before/after positions and the inch-of-convergence on two of them.
- Connections: [[deep-and-shallow-modules]] (Ousterhout's long-form defense of the method-length position), [[the-wet-codebase]] (Abramov's anti-DRY-as-dogma argument rhymes with Ousterhout's anti-small-methods-as-dogma), [[tidy-first]] (Beck adds the missing _when_ axis), [[refactoring-improving-the-design-of-existing-code]] (Extract Method vs Inline are the debate in miniature), [[refactoring-not-on-the-backlog]] (the operational layer both philosophies assume).

## [2026-04-18] ingest | Typesafe state in your URL (Eduardo San Martin Morote)

- Source captured: `sources/typesafe-state-in-your-url.md` (YouTube, Vuejs Amsterdam talk by Eduardo San Martin Morote — full transcript).
- Wiki note: [[typesafe-state-in-your-url]] — Vue Router 5's experimental param parsers push URL validation out of pages and into the router, so `route.params.productId` arrives typed. Path params strict, query params resilient. 30% minified-router size cut via build-time static resolver. Framed explicitly as an LLM-ergonomics win (fewer tokens in the page).
- Diagram: mermaid flowchart comparing before/after — validation boilerplate in the page vs parsers inside the router.
- Connections: [[pinia-colada]] (same author, same "declarative typed primitives kill boilerplate" thesis), [[deep-and-shallow-modules]] (router-as-deep-module: tiny interface, large hidden complexity), [[vue3-development-guide]] (architecture-level decision about where validation lives).

## [2026-04-18] ingest | The Wet Codebase (Dan Abramov)

- Source captured: `sources/the-wet-codebase.md` (YouTube, Deconstruct Conf 2019 talk by Dan Abramov — full transcript).
- Wiki note: [[the-wet-codebase]] — DRY-as-dogma produces wrong abstractions that accumulate flags and indirection until nobody can touch them; duplicating a third "almost the same" case is cheaper than generalising.
- Diagram: mermaid flowchart of the decay chain (extract → flex → flag → genericise → monster) with the inline-instead branch.
- Connections: [[deep-and-shallow-modules]] (same cost/benefit argument, different framing), [[tidy-first]] (inline as a legitimate tidying), [[6-levels-of-reusability]] (prop-bloat is component-level flag-bloat), [[avoid-nesting-when-youre-testing]] (anti-DRY reflex applied to test setup).

## [2026-04-18] ingest | Deep and Shallow Modules (Vladimír Zdražil)

- Source captured: `sources/deep-and-shallow-modules.md` (article summarising Ousterhout's "Deep Modules" chapter from _A Philosophy of Software Design_, with a TypeScript shallow→deep refactor example).
- Wiki note: [[deep-and-shallow-modules]] — cost-of-module-is-its-interface framing, and why chains of one-line selectors are the shallow-module anti-pattern.
- Created author profile: vladimir-zdrazil.
- Diagram: mermaid flowchart of the cost/benefit decision — deep vs shallow branching on interface size × functionality.
- Connections: [[tidy-first]] (tidyings as the low-level moves toward deeper modules), [[functional-core-imperative-shell-pattern]] (deep-module instance + productive tension on module count), [[6-levels-of-reusability]] (same cost/benefit calculus at component level), [[graphql-schema-design-principles]] (client-centric schemas as deep modules), [[you-cant-design-software-you-dont-work-on]] (judging depth requires hands-on context).

## [2026-04-18] ingest | Explore It? Explore It! (Elisabeth Hendrickson)

- Source captured: `sources/explore-it-explore-it.md` (YouTube, ~40 min talk by the author of _Explore It!_).
- Wiki note: [[explore-it-explore-it]] — exploratory testing as a methodical discipline (charter → variables → heuristics → mini-experiment → observe → debrief), not random clicking. Centerpiece: the "Bug Hall of Fame" (payment flow, RBAC privilege escalation, zombie chat sessions) and the system-monitor crash that shipped because lab state-durations didn't match production.
- Created author profile: elisabeth-hendrickson.
- Diagram: mermaid flowchart of the chartered exploratory loop with the "informs next experiment" feedback edge.
- Connections: [[software-testing-with-generative-ai]] (productive tension — Winteringham more optimistic about AI-assisted exploration), [[the-testing-pyramid-is-dead]], [[autonomous-qa-testing-ai-agents-claude-code]] (model-based exploration in practice), [[write-tests-not-too-many-mostly-integration]].

## [2026-04-14] ingest | brainmaxxing

- Added immutable source record: [[brainmaxxing]] from GitHub (poteto/brainmaxxing).
- Added public note: [[brainmaxxing]] on persistent markdown memory for Claude Code, the reflect/meditate/ruminate loop, and how it compares to wiki-as-knowledge-base framings.
- Created author profile: poteto.

## [2026-04-13] ingest | MCP vs CLI Is the Wrong Fight

- Source captured: `sources/mcp-vs-cli-is-the-wrong-fight.md` (Smithery Team, article)
- Wiki note: [[mcp-vs-cli-is-the-wrong-fight]] — situational answer to MCP vs CLI debate based on 756 benchmarks
- Connections: [[playwright-cli-vs-mcp]] (productive tension — opposite finding for local tools), [[why-model-context-protocol-does-not-work]], [[code-mode-mcp]]
- New author: Smithery Team
- Diagram: mermaid decision tree for where each surface wins

## [2026-04-12] synthesis | The Future of Coding for Software Developers

- Created synthesis page: [[future-of-coding-for-software-developers]] — synthesizes 12+ sources on how AI transforms the developer role. Key threads: coding commoditization (Karpathy, Boris Cherny), engineer-to-builder role shift, industry expansion vs. individual attrition (Booch vs. Huntley/Yegge), agent orchestration as the new skill stack, systems thinking as the durable moat, and the Amodei-vs-Booch timeline tension.

## [2026-04-12] ingest | GitHub Actions CI/CD Best Practices (GitHub Copilot instruction file)

- Added immutable source record: `sources/github-actions-ci-cd-best-practices.md` from the `github/awesome-copilot` repo.
- Added public note: [[github-actions-ci-cd-best-practices]] — GitHub's own Copilot instruction file for Actions workflows. Key invariants: SHA-pin every action (tags are mutable attack surface), use OIDC instead of long-lived cloud credentials, set `contents: read` as default `GITHUB_TOKEN` scope, and pick deployment strategy by rollback reversibility. Linked to [[hardening-github-actions]], [[optimizing-github-actions-workflows-for-speed]], [[github-actions-complete-guide]].

## [2026-04-11] ingest | Automating documentation with Claude Code and GitHub Actions

- Added immutable source record: `sources/automate-documentation-claude-code-github-actions.md` from Medium article.
- Added public note: [[automate-documentation-claude-code-github-actions]] — Frank Bernhardt's step-by-step guide for two GitHub Actions workflows (PR-triggered + daily scheduled) that let Claude Code keep docs current automatically, with infinite loop prevention and tool restriction guardrails.
- Created author profile: frank-bernhardt.

## [2026-04-11] ingest | Claude Code as GitHub Actions agent for automated PR fixes

- Added immutable source record: `sources/claude-code-github-actions-agent-automated-pr-fixes.md` from Groundy article.
- Added public note: [[claude-code-github-actions-agent-automated-pr-fixes]] — Production playbook for `anthropics/claude-code-action@v1`: four workflow patterns (interactive, automated review, CI auto-fix, structured output), cost controls keeping 50-PR teams under $5/month, and security guardrails including loop prevention and prompt injection filtering.
- Created author profile: groundy.

## [2026-04-11] ingest | AI code review bot with Claude and GitHub Actions

- Added immutable source record: `sources/ai-code-review-bot-claude-github-actions.md` from vadimall.com article.
- Added public note: [[ai-code-review-bot-claude-github-actions]] — Vadim Alakhverdov's walkthrough of wiring Claude Sonnet into GitHub Actions for automated PR review: diff-only analysis, file filtering for cost control, prompt exclusion lists to prevent nitpicking, and the permissions gotcha.
- Created author profile: vadim-alakhverdov.

## [2026-04-11] ingest | DHH's new way of writing code

- Added immutable source record: `sources/dhhs-new-way-of-writing-code.md` from The Pragmatic Engineer podcast (YouTube).
- Added public note: [[dhhs-new-way-of-writing-code]] — DHH's conversion from AI skeptic to agent-first developer: agent harnesses over autocomplete, the exploding pie of new work categories, senior devs winning disproportionately, and "peak programmer" arriving.
- Guest: DHH. Host: Gergely Orosz.

## [2026-04-11] ingest | orchestrating payments for the millions

- Added immutable source record: `sources/orchestrating-payments-for-the-millions.md` from Devoxx talk.
- Added public note: [[orchestrating-payments-for-the-millions]] — Faris Aziz's war story on building front-end payment orchestration at Smallpdf: multi-gateway fallback, local payment method optimization, and payments-as-code configuration.
- Created author profile: faris-aziz.

## [2026-04-11] synthesis | creative non-coding uses of Claude Code

- Created synthesis page: [[creative-non-coding-uses-of-claude-code]] — taxonomy of Claude Code's non-coding uses across 8+ sources: video production, phone collaboration, life OS, diagramming, knowledge curation, and institutional knowledge distribution.
- Updated [[index]] with new synthesis entry.

## [2026-04-11] synthesis | agent-browser vs Playwright for AI agents

- Created synthesis page: [[agent-browser-vs-playwright-for-ai-agents]] — three-way comparison of agent-browser, Playwright CLI, and Playwright MCP for AI-driven browser automation, with verified claims and decision framework.
- Sources used: [[agent-browser]], [[playwright-cli-vs-mcp]], [[my-4-layer-agentic-browser-automation-stack]], [[playwright-test-agents]], [[claude-code-with-playwright]].

## [2026-04-11] ingest | agent-browser

- Added immutable source record: `sources/agent-browser.md` from GitHub.
- Added public note: [[agent-browser]] — Vercel Labs' native Rust CLI that gives AI agents browser automation through accessibility-tree snapshots and element refs.
- Created author profile: vercel-labs.

## [2026-04-10] synthesis | Biggest Problems of AI

- Created synthesis page: [[biggest-problems-of-ai]] — maps AI's biggest problems across 10+ wiki sources: deskilling, cognitive debt, existential risk, job displacement, quality degradation, security threats, and geopolitical traps.
- Updated [[index]] with new synthesis entry.

## [2026-04-10] ingest | Vulnerability Research Is Cooked

- Added immutable source record: `sources/vulnerability-research-is-cooked.md` from sockpuppet.org.
- Added public note: [[vulnerability-research-is-cooked]] — Thomas Ptacek argues AI agents already generate validated zero-days with trivial bash scripts; the Bitter Lesson just hit security.
- Created author profile: thomas-ptacek.

## [2026-04-10] ingest | TanStack AI Code Mode

- Added immutable source record: `sources/tanstack-ai-code-mode.md` from TanStack blog.
- Added public note: [[tanstack-ai-code-mode]] on TanStack's Code Mode pattern — letting LLMs write TypeScript to compose tools in a sandbox instead of sequential tool calls.
- Created author profiles: jack-herrington, tanner-linsley, alem-tuzlak.

## [2026-04-10] ingest | Playwright Test Agents

- Added immutable source record: `sources/playwright-test-agents.md` from Playwright official docs.
- Added public note: [[playwright-test-agents]] on Playwright's first-party planner→generator→healer agent pipeline for self-healing test generation.

## [2026-04-10] ingest | Claude Code with Playwright 4-agent pipeline

- Added immutable source record: `sources/claude-code-with-playwright.md` from TestDino blog.
- Added public note: [[claude-code-with-playwright]] on a 4-agent test generation pipeline using Claude Code and Playwright, emphasizing product context over DOM exploration.
- Created author profile: pratik-patel.

## [2026-04-09] ingest | autonomous QA testing with Claude Code

- Added immutable source record: `sources/autonomous-qa-testing-ai-agents-claude-code.md` from OpenObserve blog.
- Added public note: [[autonomous-qa-testing-ai-agents-claude-code]] on OpenObserve's eight-agent QA pipeline that doubled test coverage and caught a silent production bug.
- Created author profile: shrinath-rao.

## [2026-04-09] ingest | your file system is already a graph database

- Added immutable source record: `sources/your-file-system-is-already-a-graph-database.md` from Rumproarious.
- Added public note: [[your-file-system-is-already-a-graph-database]] on using markdown files and wikilinks as a graph database for agent-powered knowledge management.
- Created author profile: alex-kessinger.

## [2026-04-09] ingest | byterover cli

- Added immutable source record: `sources/byterover-cli.md` from GitHub.
- Added public note: [[byterover-cli]] on portable agent memory, git-versioned context trees, and multi-agent knowledge sharing.
- Created author profile: campfirein.

## [2026-04-09] ingest | pi coding agent (etisha garg)

- Added immutable source record: [[pi-coding-agent-the-best-alternative-to-claude-code]] from YouTube (Hindi auto-generated transcript).
- Added public note: [[pi-coding-agent-the-best-alternative-to-claude-code]] on Pi agent's minimal architecture, session tree branching, multi-provider support, and TypeScript extensibility.
- Created author profile: etisha-garg.

## [2026-04-08] retrofit | llm wiki

- Established explicit LLM Wiki roles in frontmatter.
- Added first-class wiki entry points: [[overview]], [[index]], and [[log]].
- Added an immutable source record for [[llm-wiki]].
- Updated the public site to foreground wiki roles rather than treating every page as a flat note.

## [2026-04-08] ingest | project glasswing

- Added immutable source record: [[project-glasswing]] source from Anthropic.
- Added public note: [[project-glasswing]] on AI-native cyber defense, Mythos Preview, and the open-source security bottleneck.

## [2026-04-08] ingest | ai assistance reduces persistence

- Added immutable source record: [[ai-assistance-reduces-persistence-and-hurts-independent-performance]] source from arXiv preprint `2604.04721`.
- Added public note: [[ai-assistance-reduces-persistence-and-hurts-independent-performance]] on short-term helpfulness, persistence loss, and the answer-vs-hint distinction in AI use.

## [2026-04-08] maintenance | index coverage

- Expanded [[index]] so it points at the real public surface area instead of only six canonical wiki pages.
- Added collection catalogs for [[notes-catalog]], [[authors-catalog]], [[podcasts-catalog]], [[newsletters-catalog]], and [[tweets-catalog]].
