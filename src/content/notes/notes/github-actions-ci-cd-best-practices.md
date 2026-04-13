---
title: "GitHub Actions CI/CD Best Practices"
type: article
url: "https://github.com/github/awesome-copilot/blob/main/instructions/github-actions-ci-cd-best-practices.instructions.md"
tags:
  - ci-cd
  - github-actions
  - security
  - best-practices
  - devops
authors:
  - github
summary: "GitHub's own Copilot instruction file distilling CI/CD pipeline best practices: SHA-pinned actions, OIDC over secrets, least-privilege tokens, matrix parallelism, and progressive delivery patterns."
date: 2026-04-12
---

## The core argument

This is a Copilot instruction file — written by GitHub to tell an LLM how to guide developers building Actions workflows. That framing matters. It's not a blog post optimized for engagement. It's the baseline GitHub wants every pipeline to hit when a machine writes the YAML.

Two non-negotiables carry the document: **pin every action to an immutable commit SHA**, and **use OIDC instead of long-lived cloud credentials**. Everything else is optimization around those invariants.

## Why SHA pinning is not optional

The supply-chain reasoning is the part I keep coming back to. `@v4` and `@main` are mutable pointers — a compromised maintainer account silently moves the tag to a malicious commit, and every workflow referencing that tag executes arbitrary code on the next run. A full commit SHA cannot be redirected.

```yaml
uses: actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5 # v4.3.1
```

The version comment keeps it human-readable. Dependabot keeps it updated. This is cheap to adopt and expensive to retrofit after an incident — pairs naturally with [[hardening-github-actions]].

## OIDC over static credentials

Storing AWS/GCP access keys as repo secrets is the legacy pattern. OIDC exchanges a short-lived JWT for temporary cloud credentials at job start, scoped by a trust policy in the cloud provider. No rotation, no leaked key blast radius. Treat static cloud credentials in `secrets.*` as technical debt.

## Least-privilege `GITHUB_TOKEN`

Default permissions are too broad. Set `contents: read` at the workflow level and grant write scopes per-job only when they're actually needed:

```yaml
permissions:
  contents: read
  pull-requests: write # only if this workflow comments on PRs
```

Same mental model as restricting API keys. The surprise is how many public workflows still run with implicit write access to everything.

## Performance levers that actually pay off

- **`fetch-depth: 1`** on `actions/checkout` — full git history is rarely needed and slow on large repos
- **`actions/cache`** with keys built from `hashFiles('**/package-lock.json')` — invalidate only when deps change, use `restore-keys` for graceful fallback
- **`strategy.matrix`** for parallel test runs across OS/runtime versions — the biggest wall-clock win available
- **`concurrency`** groups to cancel superseded runs on the same branch instead of queueing them

The takeaway isn't "use all of these" — it's that unoptimized workflows almost always leak time in these four places. Overlaps with [[optimizing-github-actions-workflows-for-speed]].

## Deployment strategies, ranked by risk

The doc lists rolling → blue/green → canary → dark launch → A/B. The useful framing: **pick the strategy based on how reversible a bad deploy is**. Blue/green gives instant rollback by flipping a router. Canary limits blast radius to a traffic slice. Feature flags decouple deploy from release entirely — the code ships dark, toggles on later. That last decoupling is the one most teams under-use.

## Why I'm saving this

GitHub writing instructions for its own LLM is a useful primary source — it's the floor GitHub wants Copilot to enforce, not aspirational advice. When I review a workflow file (mine or a PR), this is the checklist I'd grade against. It also pairs well with the [[github-actions-complete-guide]] for architecture, and [[hardening-github-actions]] for the offensive-security view of the same patterns.

The meta-observation: the most interesting part of this file isn't the advice — it's that GitHub is shipping _machine-readable policy_ via an instruction file. The same pattern applies to any team that wants AI-generated code to hit a consistent baseline.
