import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:4322";
const workers = process.env.CI ? 1 : 3;

export default defineConfig({
  testDir: "test/e2e",
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,
  reporter: process.env.CI ? "html" : "line",
  use: {
    baseURL,
    trace: process.env.CI ? "on-first-retry" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm start:e2e:preview",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
