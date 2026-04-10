#!/bin/bash

# Extract file path from hook input
file_path=$(jq -r '.tool_input.file_path' 2>/dev/null)

# Exit if no file path
if [ -z "$file_path" ]; then
  exit 0
fi

# JS/TS/Astro files: run oxlint
if [[ "$file_path" =~ \.(js|ts|jsx|tsx|astro)$ ]]; then
  if ! vp lint -- "$file_path" 2>&1; then
    exit 2
  fi
fi

# Markdown files in notes: run content audit
if [[ "$file_path" =~ src/content/notes/.*\.md$ ]]; then
  if ! node --experimental-strip-types --import ./scripts/register-loader.mjs scripts/audit-content.mjs 2>&1; then
    exit 2
  fi
fi

exit 0
