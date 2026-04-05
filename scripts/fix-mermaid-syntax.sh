#!/usr/bin/env bash
# Replaces ::mermaid + <pre>...</pre> blocks with ```mermaid...``` syntax
# in all markdown files under src/content/notes/

set -euo pipefail

NOTES_DIR="src/content/notes"
count=0

for file in $(grep -rl '::mermaid' "$NOTES_DIR" --include='*.md'); do
  # Replace ::mermaid\n\n<pre> with ```mermaid
  # Replace the matching </pre> with ```
  perl -0777 -i -pe 's/::mermaid\s*\n\s*<pre>/```mermaid/g; s|</pre>|```|g' "$file"
  count=$((count + 1))
  echo "Fixed: $file"
done

echo "Done. Fixed $count file(s)."
