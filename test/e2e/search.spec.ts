import { AxeBuilder } from "@axe-core/playwright";
import { expect, gotoHome, openSearch, SEARCH_INPUT_PLACEHOLDER, test } from "./test-utils";

const modifier = process.platform === "darwin" ? "Meta" : "Control";

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test("keyboard shortcut opens search dialog", async ({
    page,
    hydrationErrors,
    runtimeErrors,
  }) => {
    const dialog = page.getByRole("dialog");
    await expect(async () => {
      await page.keyboard.press(`${modifier}+k`);
      await expect(dialog).toBeVisible();
    }).toPass({ timeout: 10_000 });
    await expect(dialog.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER)).toBeVisible();
    expect(hydrationErrors).toEqual([]);
    expect(runtimeErrors).toEqual([]);
  });

  test("typing filters results", async ({ page }) => {
    const dialog = await openSearch(page);

    const input = dialog.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);

    await input.fill("zzz_nonexistent_gibberish_query");
    await expect(dialog.getByText("No results found.")).toBeVisible();
  });

  test("clicking a result navigates to the note", async ({ page }) => {
    const dialog = await openSearch(page);
    const input = dialog.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER);
    await input.fill("alpha");

    const results = dialog.locator("[cmdk-item]");
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
