---
name: "CultRepo"
slug: "cultrepo"
aliases:
  - "Cult.Repo"
  - "Honeypot"
bio: "Creator of open source documentaries covering the history and human stories behind major technologies including Vue.js, React, GraphQL, Kubernetes, and Python."
website: "https://www.cultrepo.com/"
socials:
  twitter: "CultRepo"
  youtube: "CultRepo"
---

## Posts

```dataview
LIST
FROM "notes"
WHERE contains(authors, this.slug)
SORT date DESC
```
