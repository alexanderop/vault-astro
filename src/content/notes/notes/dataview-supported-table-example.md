---
title: "Dataview Supported Table Example"
tags:
  - dataview
---

## Notes Table

```dataview
TABLE WITHOUT ID file.name AS "Note", length(file.tags) AS "Tag Count"
FROM #dataview
SORT file.name ASC
```
