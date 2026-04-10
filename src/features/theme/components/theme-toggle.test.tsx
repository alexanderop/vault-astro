import { render } from "vitest-browser-react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.removeItem("vault-theme");
    document.documentElement.classList.remove("dark");
  });

  it("renders with correct initial aria-label", async () => {
    const screen = await render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to/i });
    await expect.element(button).toBeVisible();
  });

  it("toggles theme on click", async () => {
    const screen = await render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to/i });

    const initialLabel = button.element().getAttribute("aria-label");
    await button.click();

    // After clicking, the label should have changed to the opposite mode
    const isInitiallyLight = initialLabel?.includes("light");
    const expectedName = isInitiallyLight ? /switch to dark mode/i : /switch to light mode/i;
    const expectedDark = !isInitiallyLight;

    await expect.element(screen.getByRole("button", { name: expectedName })).toBeVisible();
    expect(document.documentElement.classList.contains("dark")).toBe(expectedDark);
  });

  it("persists theme to localStorage", async () => {
    const screen = await render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to/i });

    await button.click();

    const stored = localStorage.getItem("vault-theme");
    expect(stored === "light" || stored === "dark").toBe(true);

    const previousStored = stored;
    await button.click();

    const newStored = localStorage.getItem("vault-theme");
    expect(newStored).not.toBe(previousStored);
  });
});
