# Astro Gotchas

Hard-won lessons and non-obvious behaviors. Read this before working on Astro-specific code.

<!-- Add entries as you discover them using /learn -->

## `client:visible` vs `client:only` for browser-only libraries

Some React libraries (like `force-graph`, `react-force-graph-2d`, chart libraries, etc.) access `window` or `document` at **module load time**, not just at runtime. This causes:

```
ReferenceError: window is not defined
```

**Why `client:visible` fails:** Astro still imports the module on the server to prepare for hydration — the component just isn't rendered until visible. The import itself triggers the error.

**Fix:** Use `client:only="react"` to skip SSR entirely:

```astro
<!-- Fails — module still imported on server -->
<ForceGraphView graphData={data} client:visible />

<!-- Works — no server-side import -->
<ForceGraphView graphData={data} client:only="react" />
```

**When to use `client:only`:**

- Library accesses `window`/`document` at import time (not just in effects)
- Error mentions "window is not defined" during build or SSR
- Component has no meaningful server-rendered state anyway
