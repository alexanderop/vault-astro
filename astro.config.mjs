// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { remarkWikilinks } from "./src/features/wikilinks/lib/remark-wikilinks.ts";
import { remarkCallouts } from "./src/features/callouts/lib/remark-callouts.ts";
import {
  remarkHighlights,
  remarkComments,
} from "./src/features/highlights/lib/remark-highlights.ts";
import { remarkTags } from "./src/features/tags/lib/remark-tags.ts";
import { remarkEmbeds } from "./src/features/embeds/lib/remark-embeds.ts";
import { remarkBlockRefs } from "./src/features/embeds/lib/remark-block-refs.ts";
import { remarkMermaid } from "./src/features/mermaid/lib/remark-mermaid.ts";
import { remarkDataview } from "./src/features/dataview/lib/remark-dataview.ts";
import { syncExcalidrawAssets } from "./src/lib/sync-excalidraw-assets.ts";

syncExcalidrawAssets();

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  markdown: {
    remarkPlugins: [
      remarkComments,
      remarkDataview,
      remarkEmbeds,
      remarkBlockRefs,
      remarkWikilinks,
      remarkCallouts,
      remarkHighlights,
      remarkTags,
      remarkMermaid,
      remarkMath,
    ],
    rehypePlugins: [rehypeKatex],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
