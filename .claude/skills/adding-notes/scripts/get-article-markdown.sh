#!/usr/bin/env bash
# Fetch a web article and extract its content as clean markdown.
# Uses trafilatura for reader-mode extraction — no AI rewriting.
#
# Usage: get-article-markdown.sh URL [output-file]
#   If output-file is omitted, prints to stdout.
#
# Requires: python3, trafilatura (pip3 install trafilatura lxml_html_clean)

set -euo pipefail

URL="${1:?Usage: get-article-markdown.sh URL [output-file]}"
OUTPUT="${2:-}"

# Check dependencies
if ! python3 -c "import trafilatura" 2>/dev/null; then
  echo "Installing trafilatura..." >&2
  pip3 install --quiet trafilatura lxml_html_clean 2>/dev/null
fi

RESULT=$(python3 -c "
import sys
from trafilatura import fetch_url, extract

downloaded = fetch_url('${URL}')
if not downloaded:
    print('ERROR: Could not fetch URL', file=sys.stderr)
    sys.exit(1)

result = extract(
    downloaded,
    output_format='markdown',
    include_tables=True,
    include_links=True,
    include_images=False,
    favor_precision=False,
    favor_recall=True,
)

if not result:
    print('ERROR: Could not extract content from page', file=sys.stderr)
    sys.exit(1)

print(result)
" 2>/dev/null)

if [ -z "$RESULT" ]; then
  echo "ERROR: Extraction returned empty content" >&2
  exit 1
fi

if [ -n "$OUTPUT" ]; then
  echo "$RESULT" > "$OUTPUT"
  echo "Saved to $OUTPUT ($(echo "$RESULT" | wc -c | tr -d ' ') bytes)" >&2
else
  echo "$RESULT"
fi
