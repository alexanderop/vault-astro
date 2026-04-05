import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.describe("Navigation", () => {
  test("home page loads with notes", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Vault", level: 1 }).first()).toBeVisible();

    const noteLinks = page.locator("main a.block");
    await expect(noteLinks.first()).toBeVisible();
  });

  test("click note navigates to detail", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const firstLink = page.locator("main a.block").first();
    const href = await firstLink.getAttribute("href");
    await firstLink.click();

    await page.waitForURL((url) => url.pathname !== "/");
    await expect(page.locator("main")).toBeVisible();
    expect(page.url()).toContain(href);
  });

  test("sidebar folder expand/collapse", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const folderButton = page.locator("button[aria-expanded]").first();
    await expect(folderButton).toBeVisible();

    // Wait for React hydration — click and verify toggle works
    await expect(async () => {
      const before = await folderButton.getAttribute("aria-expanded");
      await folderButton.click();
      const after = await folderButton.getAttribute("aria-expanded");
      expect(after).not.toBe(before);
    }).toPass({ timeout: 10_000 });
  });

  test("sidebar link navigation", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Expand a folder if all are collapsed
    const closedFolder = page.locator("button[aria-expanded='false']").first();
    if (await closedFolder.isVisible()) {
      await closedFolder.click();
    }

    const sidebarLink = page.locator("nav a[href]").first();
    await expect(sidebarLink).toBeVisible();

    const href = await sidebarLink.getAttribute("href");
    await sidebarLink.click();

    await page.waitForURL(`**${href}`);
  });

  test("accessibility check on home page", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .exclude(".katex")
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
