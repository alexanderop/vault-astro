import { AxeBuilder } from "@axe-core/playwright";
import { ensureLightMode, expect, gotoHome, test, waitForInteractiveUi } from "./test-utils";

test.describe("Theme", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test("toggle changes theme class on html element", async ({ page }) => {
    const toggle = page.getByRole("button", {
      name: /Switch to (light|dark) mode/,
    });
    await expect(toggle).toBeVisible();

    const hadDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));

    await toggle.click();

    const hasDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));

    expect(hasDark).toBe(!hadDark);
  });

  test("theme persists after reload", async ({ page }) => {
    await ensureLightMode(page);

    await page.reload();
    await waitForInteractiveUi(page);

    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("toggle back to dark mode", async ({ page }) => {
    await ensureLightMode(page);

    await page.getByRole("button", { name: /Switch to dark mode/ }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("no accessibility violations in light and dark mode", async ({ page }) => {
    await ensureLightMode(page);

    const lightResults = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(lightResults.violations).toEqual([]);

    await page.getByRole("button", { name: /Switch to dark mode/ }).click();

    const darkResults = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    expect(darkResults.violations).toEqual([]);
  });
});
