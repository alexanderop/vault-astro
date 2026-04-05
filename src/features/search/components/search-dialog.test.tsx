import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import { SearchDialog } from "@/features/search/components/search-dialog";
import type { SearchEntry } from "@/features/search/lib/search-index";

const entries: SearchEntry[] = [
  {
    href: "/astro-guide",
    slug: "astro-guide",
    title: "Astro Guide",
    type: "note",
    tags: ["astro"],
    summary: "Guide to Astro",
    preview: "A guide about Astro framework",
  },
  {
    href: "/react-hooks",
    slug: "react-hooks",
    title: "React Hooks",
    type: "note",
    tags: ["react"],
    summary: "React hooks guide",
    preview: "Learn about React hooks",
  },
  {
    href: "/css-grid",
    slug: "css-grid",
    title: "CSS Grid",
    type: "note",
    tags: ["css"],
    summary: "CSS Grid layout",
    preview: "CSS Grid layout tutorial",
  },
];

describe("SearchDialog", () => {
  it("renders search trigger button", async () => {
    const screen = await render(<SearchDialog entries={entries} />);
    await expect.element(screen.getByRole("button", { name: /search/i })).toBeVisible();
  });

  it("opens dialog on trigger click", async () => {
    const screen = await render(<SearchDialog entries={entries} />);
    await screen.getByRole("button", { name: /search/i }).click();
    await expect.element(page.getByPlaceholder("Type a command or search...")).toBeVisible();
  });

  it("filters results on input", async () => {
    const screen = await render(<SearchDialog entries={entries} />);
    await screen.getByRole("button", { name: /search/i }).click();
    await page.getByPlaceholder("Type a command or search...").fill("astro");
    await expect.element(page.getByText("Astro Guide")).toBeVisible();
    await expect.element(page.getByText("CSS Grid")).not.toBeInTheDocument();
  });

  it("shows no results message", async () => {
    const screen = await render(<SearchDialog entries={entries} />);
    await screen.getByRole("button", { name: /search/i }).click();
    await page.getByPlaceholder("Type a command or search...").fill("nonexistent");
    await expect.element(page.getByText("No results found.")).toBeVisible();
  });
});
