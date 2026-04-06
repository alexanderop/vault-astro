import { AxeBuilder } from "@axe-core/playwright";
import { expect, gotoHome, test } from "./test-utils";

test.describe("Navigation", () => {
  test("home page loads with notes", async ({ page, hydrationErrors, runtimeErrors }) => {
    await gotoHome(page);

    await expect(page.getByRole("heading", { name: "Vault", level: 1 }).first()).toBeVisible();

    const noteLinks = page.locator("main [data-shortcut-item]");
    await expect(noteLinks.first()).toBeVisible();
    expect(hydrationErrors).toEqual([]);
    expect(runtimeErrors).toEqual([]);
  });

  test("click note navigates to detail", async ({ page }) => {
    await gotoHome(page);

    const firstLink = page.locator("main [data-shortcut-item]").first();
    const href = await firstLink.getAttribute("href");
    await firstLink.click();

    await page.waitForURL((url) => url.pathname !== "/");
    await expect(page.locator("main")).toBeVisible();
    expect(page.url()).toContain(href);
  });

  test("sidebar folder expand/collapse", async ({ page }) => {
    await gotoHome(page);

    const folderButton = page.locator("aside.shell-desktop-sidebar button[aria-expanded]").first();
    await expect(folderButton).toBeVisible();

    await expect(async () => {
      const before = await folderButton.getAttribute("aria-expanded");
      await folderButton.click();
      const after = await folderButton.getAttribute("aria-expanded");
      expect(after).not.toBe(before);
    }).toPass({ timeout: 10_000 });
  });

  test("sidebar link navigation", async ({ page }) => {
    await gotoHome(page);

    const firstNoteLink = page.locator("main [data-shortcut-item]").first();
    const initialHref = await firstNoteLink.getAttribute("href");
    await firstNoteLink.click();
    await page.waitForURL(`**${initialHref}`);

    const sidebar = page.locator("aside.shell-desktop-sidebar");
    await expect(async () => {
      await expect(sidebar.locator("[data-shortcut-item]").first()).toBeVisible();
    }).toPass({ timeout: 10_000 });

    const sidebarLink = sidebar
      .locator(`[data-shortcut-item]:not([href="${initialHref}"])`)
      .first();
    await expect(sidebarLink).toBeVisible();

    const href = await sidebarLink.getAttribute("href");
    await sidebarLink.click();

    await page.waitForURL(`**${href}`);
  });

  test("accessibility check on home page", async ({ page }) => {
    await gotoHome(page);

    const results = await new AxeBuilder({ page })
      .exclude(".katex")
      .disableRules(["color-contrast"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
