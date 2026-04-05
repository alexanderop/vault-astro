---
title: "Data Vie"
tags:
  - dataview
description: "Live examples of the Dataview subset supported by Vault."
---

# Data Vie

This note shows the Dataview API shape Vault supports today and the rendered output for each query.

## LIST + FROM + SORT + LIMIT

### Query

````md
```dataview
LIST
FROM #dataview
SORT file.name ASC
LIMIT 5
```
````

### Output

```dataview
LIST
FROM #dataview
SORT file.name ASC
LIMIT 5
```

## TABLE + WHERE + this.\*

### Query

````md
```dataview
TABLE WITHOUT ID file.name AS "Note", file.folder AS "Folder"
FROM #dataview
WHERE file.name != this.file.name
SORT file.name ASC
```
````

### Output

```dataview
TABLE WITHOUT ID file.name AS "Note", file.folder AS "Folder"
FROM #dataview
WHERE file.name != this.file.name
SORT file.name ASC
```

## Functions

### Query

````md
```dataview
TABLE WITHOUT ID lower(file.name) AS "lower",
  upper(file.name) AS "upper",
  replace(string(length(file.tags)), "1", "one") AS "tag count text",
  choice(length(file.tags) > 0, "tagged", "untagged") AS "state",
  default(description, "no description") AS "description",
  round(3.14159, 2) AS "pi",
  date("2026-04-05") AS "date"
FROM #dataview
SORT file.name ASC
LIMIT 3
```
````

### Output

```dataview
TABLE WITHOUT ID lower(file.name) AS "lower",
  upper(file.name) AS "upper",
  replace(string(length(file.tags)), "1", "one") AS "tag count text",
  choice(length(file.tags) > 0, "tagged", "untagged") AS "state",
  default(description, "no description") AS "description",
  round(3.14159, 2) AS "pi",
  date("2026-04-05") AS "date"
FROM #dataview
SORT file.name ASC
LIMIT 3
```

## FLATTEN + GROUP BY

### Query

````md
```dataview
TABLE WITHOUT ID author
FROM "notes"
WHERE authors
FLATTEN authors AS author
GROUP BY author
SORT author ASC
LIMIT 10
```
````

### Output

```dataview
TABLE WITHOUT ID author
FROM "notes"
WHERE authors
FLATTEN authors AS author
GROUP BY author
SORT author ASC
LIMIT 10
```

## TASK

### Query

````md
```dataview
TASK
FROM "notes"
WHERE contains(file.path, "crdts-the-hard-parts") AND !task.completed
SORT file.name ASC
LIMIT 5
```
````

### Output

```dataview
TASK
FROM "notes"
WHERE contains(file.path, "crdts-the-hard-parts") AND !task.completed
SORT file.name ASC
LIMIT 5
```

## Supported Query Surface

```txt
Headers:
- LIST
- TABLE
- TABLE WITHOUT ID
- TASK

Commands:
- FROM
- WHERE
- SORT
- LIMIT
- FLATTEN
- GROUP BY

Sources:
- "folder"
- #tag
- "file/path.md"
- [[note]]
- outgoing([[note]])
- [[]]
- [[#]]
- AND / OR / ! combinations

Expressions:
- field access: file.name, file.tags, this.file.name, task.completed
- booleans, numbers, strings, link literals
- !, =, ==, !=, <, <=, >, >=
- AND, OR

Functions:
- contains()
- length()
- lower()
- upper()
- string()
- default()
- choice()
- replace()
- round()
- date()
```
