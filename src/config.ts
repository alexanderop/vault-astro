export const SITE = {
  // Site metadata
  title: "Vault",
  description: "An LLM-maintained wiki built from persistent notes and immutable sources",
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
  showBreadcrumb: true,
  showDate: true,
  showTags: true,
  enableMermaid: true,
  enableMath: true,
  showStackedPages: true,

  // Display
  themeStorageKey: "vault-theme",
  notesPerIndex: 0,
  footer: "",
} as const;
