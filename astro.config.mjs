// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import AstroPWA from "@vite-pwa/astro";
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
  integrations: [
    react(),
    AstroPWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "favicon.svg", "robots.txt"],
      manifest: {
        name: "Vault",
        short_name: "Vault",
        description: "An LLM-maintained wiki built from persistent notes and immutable sources",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/404",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ["**/attachments/**"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/attachments/"),
            handler: "CacheFirst",
            options: {
              cacheName: "vault-attachments",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],

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
    // @ts-expect-error tailwindcss uses vite 8 types, astro bundles vite 7
    plugins: [tailwindcss()],
  },
});
