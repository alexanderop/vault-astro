---
name: "Hacker News Community"
slug: "hacker-news-community"
bio: "Y Combinator's tech forum where developers discuss startup ideas, programming, and technology trends."
website: "https://news.ycombinator.com/"
---

## Posts

```dataview
LIST
FROM "notes"
WHERE contains(authors, this.slug)
SORT date DESC
```
