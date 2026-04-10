import { defineConfig } from "vite-plus";

const cacheableInput = [
  { auto: true },
  "!dist/**",
  "!playwright-report/**",
  "!test-results/**",
  "!coverage/**",
  "!.astro/**",
  "!**/*.tsbuildinfo",
];

export default defineConfig({
  run: {
    cache: {
      scripts: false,
      tasks: true,
    },
    tasks: {
      check: {
        command: "vp check",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      lint: {
        command: "vp lint --import-plugin --type-aware",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      fmt: {
        command: "vp fmt",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      "audit:content": {
        command:
          "node --experimental-strip-types --import ./scripts/register-loader.mjs scripts/audit-content.mjs",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      knip: {
        command: "knip && knip --production --exclude dependencies",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      dupes: {
        command:
          "jscpd src --min-lines 8 --min-tokens 60 --ignore '**/content/**,**/*.test.*,**/assets/**'",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      test: {
        command: "vitest run",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      "test:unit": {
        command: "vitest run --project unit",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      "test:component": {
        command: "vitest run --project component",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      "test:e2e": {
        command: "playwright test --config=playwright.config.ts",
        cache: false,
      },
      "test:e2e:preview": {
        command: "pnpm build:test && playwright test --config=playwright.preview.config.ts",
        cache: false,
      },
      verify: {
        command: "vp run check && vp run test:unit && vp run audit:content",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
      "verify:full": {
        command: "vp run verify && vp run test:component",
        env: ["NODE_ENV"],
        input: cacheableInput,
      },
    },
  },
});
