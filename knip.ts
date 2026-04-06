import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      entry: ["src/pages/**/*.astro", "src/layouts/**/*.astro", "scripts/**/*.{js,mjs,cjs,ts}"],
      project: [
        "src/**/*.{ts,tsx,astro}",
        "src/styles/**/*.css",
        "test/**/*.{ts,tsx}",
        "scripts/**/*.{js,mjs,cjs,ts}",
        "*.config.{js,mjs,cjs,ts}",
      ],
      ignoreDependencies: [],
      ignoreUnresolved: [],
      ignoreFiles: ["src/features/mermaid/components/mermaid-block.astro"],
    },
  },
};

export default config;
