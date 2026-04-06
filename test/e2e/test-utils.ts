import { expect, test as base, type ConsoleMessage, type Page } from "@playwright/test";

const HYDRATION_ERROR_PATTERNS = [
  /hydration failed because the server rendered html didn't match the client/i,
  /hydration completed but contains mismatches/i,
  /hydration text content mismatch/i,
  /hydration node mismatch/i,
  /hydration attribute mismatch/i,
];

export const SEARCH_INPUT_PLACEHOLDER = "Type a command or search...";

interface E2EFixtures {
  hydrationErrors: string[];
  runtimeErrors: string[];
}

function isHydrationError(text: string): boolean {
  return HYDRATION_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

function toConsoleText(message: ConsoleMessage): string {
  return message.text().trim();
}

export const test = base.extend<E2EFixtures>({
  hydrationErrors: async ({ page }, use) => {
    const hydrationErrors: string[] = [];
    const handleConsole = (message: ConsoleMessage) => {
      const text = toConsoleText(message);
      if (isHydrationError(text)) {
        hydrationErrors.push(text);
      }
    };

    page.on("console", handleConsole);
    await use(hydrationErrors);
    page.off("console", handleConsole);
  },

  runtimeErrors: async ({ page }, use) => {
    const runtimeErrors: string[] = [];
    const handleConsole = (message: ConsoleMessage) => {
      const text = toConsoleText(message);
      if (message.type() === "error" && text.length > 0 && !isHydrationError(text)) {
        runtimeErrors.push(text);
      }
    };
    const handlePageError = (error: Error) => {
      runtimeErrors.push(error.message);
    };

    page.on("console", handleConsole);
    page.on("pageerror", handlePageError);
    await use(runtimeErrors);
    page.off("console", handleConsole);
    page.off("pageerror", handlePageError);
  },
});

export { expect };

export async function waitForInteractiveUi(page: Page) {
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to (light|dark) mode/ })).toBeVisible();
}

export async function gotoHome(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await waitForInteractiveUi(page);
}

export async function openSearch(page: Page) {
  await waitForInteractiveUi(page);

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Search" }).click();
    await expect(dialog).toBeVisible();
  }).toPass({ timeout: 10_000 });
  await expect(dialog.getByPlaceholder(SEARCH_INPUT_PLACEHOLDER)).toBeVisible();
  return dialog;
}

export async function ensureLightMode(page: Page) {
  await waitForInteractiveUi(page);

  const html = page.locator("html");
  await expect(async () => {
    const isDark = await html.evaluate((element) => element.classList.contains("dark"));

    if (isDark) {
      await page.getByRole("button", { name: /Switch to light mode/ }).click();
    }

    await expect(html).not.toHaveClass(/dark/);
  }).toPass({ timeout: 10_000 });
}

// Vault still allows CDN-backed browser assets such as KaTeX and Mermaid during E2E.
// We intentionally do not block external requests until those assets are localized.
