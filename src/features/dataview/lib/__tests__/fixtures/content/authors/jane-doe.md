---
name: "Jane Doe"
slug: "jane-doe"
---

# Jane Doe

```dataview
LIST
FROM "notes"
WHERE contains(authors, this.slug)
SORT date DESC
```
