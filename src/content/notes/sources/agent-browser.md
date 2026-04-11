---
title: "agent-browser"
type: source
source_type: github
source_id: "https://github.com/vercel-labs/agent-browser"
captured_at: 2026-04-11
publish: false
---

# agent-browser

Browser automation CLI for AI agents. Fast native Rust CLI.

- **Stars:** 28,586
- **Language:** Rust
- **Owner:** vercel-labs

## Installation

### Global Installation (recommended)

```bash
npm install -g agent-browser
agent-browser install  # Download Chrome from Chrome for Testing (first time only)
```

### Homebrew (macOS)

```bash
brew install agent-browser
agent-browser install
```

### Cargo (Rust)

```bash
cargo install agent-browser
agent-browser install
```

### Requirements

- **Chrome** - Run `agent-browser install` to download Chrome from Chrome for Testing. Existing Chrome, Brave, Playwright, and Puppeteer installations are detected automatically. No Playwright or Node.js required for the daemon.
- **Rust** - Only needed when building from source.

## Quick Start

```bash
agent-browser open example.com
agent-browser snapshot                    # Get accessibility tree with refs
agent-browser click @e2                   # Click by ref from snapshot
agent-browser fill @e3 "test@example.com" # Fill by ref
agent-browser get text @e1                # Get text by ref
agent-browser screenshot page.png
agent-browser close
```

### Traditional Selectors (also supported)

```bash
agent-browser click "#submit"
agent-browser fill "#email" "test@example.com"
agent-browser find role button click --name "Submit"
```

## Core Commands

```bash
agent-browser open <url>              # Navigate to URL
agent-browser click <sel>             # Click element
agent-browser type <sel> <text>       # Type into element
agent-browser fill <sel> <text>       # Clear and fill
agent-browser press <key>             # Press key
agent-browser hover <sel>             # Hover element
agent-browser select <sel> <val>      # Select dropdown option
agent-browser scroll <dir> [px]       # Scroll
agent-browser screenshot [path]       # Take screenshot
agent-browser screenshot --annotate   # Annotated screenshot with numbered element labels
agent-browser snapshot                # Accessibility tree with refs (best for AI)
agent-browser eval <js>               # Run JavaScript
agent-browser close                   # Close browser
agent-browser chat "<instruction>"    # AI chat: natural language browser control
agent-browser chat                    # AI chat: interactive REPL mode
```

## Get Info

```bash
agent-browser get text <sel>          # Get text content
agent-browser get html <sel>          # Get innerHTML
agent-browser get value <sel>         # Get input value
agent-browser get attr <sel> <attr>   # Get attribute
agent-browser get title               # Get page title
agent-browser get url                 # Get current URL
agent-browser get count <sel>         # Count matching elements
```

## Find Elements (Semantic Locators)

```bash
agent-browser find role <role> <action> [value]       # By ARIA role
agent-browser find text <text> <action>               # By text content
agent-browser find label <label> <action> [value]     # By label
agent-browser find placeholder <ph> <action> [value]  # By placeholder
agent-browser find testid <id> <action> [value]       # By data-testid
```

## Wait

```bash
agent-browser wait <selector>         # Wait for element to be visible
agent-browser wait <ms>               # Wait for time
agent-browser wait --text "Welcome"   # Wait for text to appear
agent-browser wait --url "**/dash"    # Wait for URL pattern
agent-browser wait --load networkidle # Wait for load state
```

## Batch Execution

```bash
agent-browser batch "open https://example.com" "snapshot -i" "screenshot"
agent-browser batch --bail "open https://example.com" "click @e1" "screenshot"
```

## Network

```bash
agent-browser network route <url>              # Intercept requests
agent-browser network route <url> --abort      # Block requests
agent-browser network route <url> --body <json>  # Mock response
agent-browser network requests                 # View tracked requests
agent-browser network har start                # Start HAR recording
agent-browser network har stop [output.har]    # Stop and save HAR
```

## Tabs, Cookies, Storage

```bash
agent-browser tab                     # List tabs
agent-browser tab new [url]           # New tab
agent-browser cookies                 # Get all cookies
agent-browser cookies set <name> <val>
agent-browser storage local           # Get all localStorage
```

## Browser Settings

```bash
agent-browser set viewport <w> <h>    # Set viewport size
agent-browser set device <name>       # Emulate device
agent-browser set media [dark|light]  # Emulate color scheme
```
