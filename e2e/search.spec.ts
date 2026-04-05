import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const modifier = process.platform === "darwin" ? "Meta" : "Control";

async function openSearch(page: import("@playwright/test").Page) {
  const searchButton = page.getByRole("button", { name: "Search" });
  await expect(searchButton).toBeVisible();
  await searchButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("keyboard shortcut opens search dialog", async ({ page }) => {
    // Ensure React has hydrated by waiting for the search button
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();

    await page.keyboard.press(`${modifier}+k`);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder("Search notes...")).toBeVisible();
  });

  test("typing filters results", async ({ page }) => {
    await openSearch(page);

    const dialog = page.getByRole("dialog");
    const input = dialog.getByPlaceholder("Search notes...");

    await input.fill("zzz_nonexistent_gibberish_query");
    await expect(dialog.getByText("No results found.")).toBeVisible();
  });

  test("clicking a result navigates to the note", async ({ page }) => {
    await openSearch(page);

    const dialog = page.getByRole("dialog");
    const results = dialog.locator("ul button");
    await expect(results.first()).toBeVisible();

    await results.first().click();
    await page.waitForURL((url) => url.pathname !== "/");
  });

  test("Escape closes the search dialog", async ({ page }) => {
    await openSearch(page);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("search dialog has no accessibility violations", async ({ page }) => {
    await openSearch(page);

    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast", "aria-dialog-name"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
