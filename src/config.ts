export const SITE = {
  // Site metadata
  title: "Vault",
  description: "A self-hosted Obsidian Publish alternative",
  author: "",
  website: "",
  lang: "en",
  dir: "ltr" as const,
  ogImage: "",
  favicon: "/favicon.svg",

  // Feature toggles
  lightAndDarkMode: true,
  showGraph: true,
  showBacklinks: true,
  showSearch: true,
  showTableOfContents: true,
  showDate: true,
  showTags: true,
  enableMermaid: true,
  enableMath: true,

  // Display
  themeStorageKey: "vault-theme",
  notesPerIndex: 0,
  footer: "",
} as const;
