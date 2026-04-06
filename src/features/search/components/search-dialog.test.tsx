import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchDialog } from "@/features/search/components/search-dialog";
import { SHORTCUT_EVENTS } from "@/lib/shortcut-targets";
import { searchEntriesFactory } from "../../../../test/helpers/factories/search-entry-factory";

const entries = searchEntriesFactory([
  {
    slug: "astro-guide",
    tags: ["astro"],
    summary: "Guide to Astro",
    preview: "A guide about Astro framework",
  },
  {
    slug: "react-hooks",
    tags: ["react"],
    summary: "React hooks guide",
    preview: "Learn about React hooks",
  },
  {
    slug: "css-grid",
    tags: ["css"],
    summary: "CSS Grid layout",
    preview: "CSS Grid layout tutorial",
  },
]);

describe("SearchDialog", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("shows the open source action when a source URL is provided", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const screen = await render(
      <SearchDialog entries={entries} sourceUrl="https://example.com/source.md" />,
    );

    await screen.getByRole("button", { name: /search/i }).click();
    await expect.element(page.getByText("Open source")).toBeVisible();
    await page.getByText("Open source").click();

    expect(openSpy).toHaveBeenCalledWith("https://example.com/source.md", "_blank");
  });

  it("opens when the search shortcut event is dispatched", async () => {
    await render(<SearchDialog entries={entries} />);

    document.dispatchEvent(new CustomEvent(SHORTCUT_EVENTS.openSearch));

    await expect.element(page.getByPlaceholder("Type a command or search...")).toBeVisible();
  });

  it("shows contextual navigation commands when matching targets exist", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div data-shortcut-target="right-rail" tabindex="-1"></div>
        <nav data-shortcut-target="backlinks" tabindex="-1"></nav>
      `,
    );

    const screen = await render(
      <SearchDialog entries={entries} sourceUrl="https://example.com/source.md" />,
    );
    await screen.getByRole("button", { name: /search/i }).click();

    await expect.element(page.getByText("Go to backlinks")).toBeVisible();
    await expect.element(page.getByText("Go to right rail")).toBeVisible();
    await expect.element(page.getByText("Open source")).toBeVisible();
  });
});
