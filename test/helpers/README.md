# Test Helpers

Use factories to keep setup readable while leaving assertions explicit in the test body.

## Preferred patterns

```ts
const note = publishedNote("guides/getting-started");

const draft = draftNote("draft", {
  body: wikilinks("published"),
});

const notes = notesFromDefinitions([
  { id: "alpha", title: "Alpha Note", targets: ["beta"] },
  { id: "beta", title: "Beta Note" },
]);

const entries = searchEntriesFactory([
  { slug: "astro-guide", tags: ["astro"] },
  { slug: "react-hooks", tags: ["react"] },
]);
```

## Rule of thumb

Use factories for setup, keep expectations explicit in the test body.
