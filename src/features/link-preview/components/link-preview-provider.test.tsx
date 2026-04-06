import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LinkPreviewProvider } from "@/features/link-preview/components/link-preview-provider";

describe("LinkPreviewProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    document.body.innerHTML = `
      <article class="note-prose">
        <p><a class="wikilink" href="/alpha" data-href="/alpha">Alpha</a></p>
        <p><a class="wikilink" href="/beta#section" data-href="/beta#section">Beta</a></p>
        <p><span class="obsidian-missing-link">Missing</span></p>
      </article>
    `;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("shows a popup after the hover delay", async () => {
    await render(
      <LinkPreviewProvider
        entries={[{ href: "/alpha", title: "Alpha", preview: "Alpha preview text" }]}
      />,
    );

    await page.getByRole("link", { name: "Alpha" }).hover();
    await vi.advanceTimersByTimeAsync(400);

    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await expect.element(page.getByText("Alpha preview text")).toBeVisible();
  });

  it("strips fragments before lookup", async () => {
    await render(
      <LinkPreviewProvider
        entries={[{ href: "/beta", title: "Beta", preview: "Beta preview text" }]}
      />,
    );

    await page.getByRole("link", { name: "Beta" }).hover();
    await vi.advanceTimersByTimeAsync(400);

    await expect.element(page.getByText("Beta preview text")).toBeVisible();
  });

  it("does not show a popup for missing links", async () => {
    await render(
      <LinkPreviewProvider
        entries={[{ href: "/alpha", title: "Alpha", preview: "Alpha preview text" }]}
      />,
    );

    await page.getByText("Missing").hover();
    await vi.advanceTimersByTimeAsync(400);

    await expect.element(page.getByRole("tooltip")).not.toBeInTheDocument();
  });
});
