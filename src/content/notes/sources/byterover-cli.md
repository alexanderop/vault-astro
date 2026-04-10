---
title: "ByteRover CLI"
type: source
source_type: github
source_id: "https://github.com/campfirein/byterover-cli"
captured_at: 2026-04-09
publish: false
---

# ByteRover CLI (brv)

The portable memory layer for autonomous coding agents (formerly Cipher).

## Key Stats

- Stars: 4,398
- Language: TypeScript
- License: Elastic License 2.0
- Topics: agent, ai, autonomous-agents, cli, coding-assistant, context-memory, developer-tools, knowledge-management, llm, mcp, memory, typescript, vibe-coding

## Description

ByteRover CLI (`brv`) is a portable memory layer for autonomous coding agents. It provides AI agents with persistent, structured memory capabilities, allowing developers to curate project knowledge into a context tree, synchronize it to the cloud, and share it across tools and teammates.

The tool operates as an interactive REPL that runs in any project directory, powered by a choice of LLM providers. Agents can understand codebases through an agentic map, read/write files, execute code, and store knowledge for future sessions.

## Key Features

- Interactive TUI with REPL interface (built with React/Ink)
- Context tree and knowledge storage management
- Git-like version control for context trees including branch, commit, merge, push/pull operations
- 18 LLM providers including Anthropic, OpenAI, Google, Groq, Mistral, xAI, and others
- 24 built-in agent tools covering code execution, file operations, knowledge search, and memory management
- Cloud sync capabilities with push/pull functionality
- Review workflow for approving/rejecting curate operations
- MCP (Model Context Protocol) integration
- Hub and connectors ecosystem for skills and bundles
- Multi-agent compatibility with 22+ AI coding agents (Cursor, Claude Code, Windsurf, Cline, etc.)
- Enterprise proxy support

## Installation

### Shell Script (macOS & Linux)

```bash
curl -fsSL https://byterover.dev/install.sh | sh
```

Supported platforms: macOS ARM64, Linux x64, Linux ARM64.

### npm (All Platforms)

```bash
npm install -g byterover-cli
```

### Verification

```bash
brv --version
```

## Usage

### Initial Setup

```bash
cd your/project
brv
```

The REPL auto-configures on first run with no setup needed. Type `/` to discover available commands.

### Example Commands

```bash
/curate "Auth uses JWT with 24h expiry" @src/middleware/auth.ts
/query How is authentication implemented?
```

## Core Workflow Commands

```bash
brv                  # Start interactive REPL
brv status           # Show project and daemon status
brv curate           # Add context to knowledge storage
brv curate view      # View curate history
brv query            # Query context tree and knowledge
brv review pending   # List pending review operations
brv review approve   # Approve curate operations
brv review reject    # Reject curate operations
```

## Version Control Operations

```bash
brv vc init              # Initialize version control for context tree
brv vc status            # Show version control status
brv vc add               # Stage files for the next commit
brv vc commit            # Save staged changes as a commit
brv vc log               # Show commit history
brv vc branch            # List, create, or delete branches
brv vc checkout          # Switch branches
brv vc merge             # Merge a branch into the current branch
brv vc clone             # Clone a ByteRover space repository
brv vc push              # Push commits to ByteRover cloud
brv vc pull              # Pull commits from ByteRover cloud
brv vc fetch             # Fetch refs from ByteRover cloud
brv vc remote            # Show current remote origin
brv vc remote add        # Add a named remote
brv vc remote set-url    # Update a remote URL
brv vc config            # Get or set commit author
brv vc reset             # Unstage files or undo commits
```

## Supported LLM Providers (18)

Anthropic, OpenAI, Google, Groq, Mistral, xAI, Cerebras, Cohere, DeepInfra, OpenRouter, Perplexity, TogetherAI, Vercel, Minimax, Moonshot, GLM, OpenAI-Compatible, ByteRover.

## Hub & Connectors

```bash
brv hub list             # List available hub packages
brv hub install          # Install a hub package
brv connectors list      # List connectors
brv connectors install   # Install a connector
```

## ByteRover Cloud

Team collaboration features with local-first functionality:

- Team context sync across teammates
- Shared spaces for organizing context across projects
- Multi-machine access with cloud backup
- Built-in hosted LLM with limited free usage
- SOC 2 Type II certified infrastructure with privacy mode

## Benchmark Performance

- **LoCoMo**: 96.1% overall accuracy (1,982 questions, 272 docs)
- **LongMemEval-S**: 92.8% overall accuracy (500 questions, 23,867 docs)
