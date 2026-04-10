---
name: asking-notes
description: Query the maintained wiki layer first, then fall back to sources when needed. Use when asked to "ask my notes", "what do I know about", "query my knowledge", "/ask", or when the user has a question that the wiki might answer.
allowed-tools: Read, Bash, Glob, Grep
---

# Query the LLM Wiki

This skill answers questions by searching wiki pages first, reading the most relevant ones, and synthesizing an answer. Raw source pages are a fallback, not the primary query surface.

## Workflow

### 1. Search — Find Relevant Notes

Use Grep and Glob to find wiki pages matching the user's question:

```bash
# Search by keywords in content
Grep pattern="keyword" path="src/content/notes/notes/" glob="*.md"

# Search by tags
Grep pattern="tags:.*keyword" path="src/content/notes/notes/" glob="*.md"

# Search by title
Grep pattern="title:.*keyword" path="src/content/notes/notes/" glob="*.md"
```

Combine multiple keyword searches to find the most relevant notes.

### 2. Read — Understand the Content

Read the **top 5** note files returned by the search (full markdown content). If the top 5 don't fully answer the question, read more from the results list.

### 3. Synthesize — Answer the Question

Combine insights across the notes into a direct answer. Follow these rules strictly:

- **Never invent information** not present in the notes
- **Always cite** which note each claim comes from using `[[wiki-links]]`
- **If no notes are relevant**, say so honestly — don't guess
- **Connect ideas** across notes when they complement each other
- **Note contradictions** if different notes disagree

### 4. Extend — Identify Gaps and Follow-ups

After answering, highlight what is missing from the wiki and suggest whether the answer should be saved back as a synthesis or question page.

## Output Format

```markdown
## Answer

[Direct answer synthesized from notes, citing [[sources]] inline]

## Sources Used

| Note       | Type    | Relevance            |
| ---------- | ------- | -------------------- |
| [[slug-1]] | article | Core source on topic |
| [[slug-2]] | book    | Supporting framework |
| [[slug-3]] | podcast | Practical examples   |

## Gaps & Follow-ups

- No notes covering [subtopic X]
- Try asking: "What about [related question]?"
```

## Quality Checklist

- [ ] Searched with multiple relevant keywords
- [ ] Read the top matching notes thoroughly
- [ ] Every claim is attributed to a specific note via `[[wiki-link]]`
- [ ] No information was invented or assumed
- [ ] Contradictions between notes are flagged
- [ ] Gaps in coverage are identified
- [ ] Follow-up questions are suggested
