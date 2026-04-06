import { render } from "vitest-browser-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "@/features/shortcuts/hooks/use-keyboard-shortcuts";
import { SHORTCUT_EVENTS, SHORTCUT_TARGETS } from "@/features/shortcuts/lib/shortcut-targets";

function Harness() {
  useKeyboardShortcuts();

  return (
    <div>
      <div data-source-url="https://example.com/source.md" />
      <button data-shortcut-target="search-trigger" type="button">
        Search
      </button>
      <div data-shortcut-target="right-rail" tabIndex={-1}>
        Right rail
      </div>
      <nav data-shortcut-target="backlinks" tabIndex={-1}>
        Backlinks
      </nav>
      <input aria-label="Shortcut input" />
      <ul data-shortcut-list>
        <li>
          <button data-shortcut-item type="button">
            First
          </button>
        </li>
        <li>
          <button data-shortcut-item type="button">
            Second
          </button>
        </li>
      </ul>
    </div>
  );
}

function dispatchKey(key: string, target: EventTarget = document) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("ShortcutsProvider keyboard shortcuts", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens search on G then S", async () => {
    const listener = vi.fn();
    document.addEventListener(SHORTCUT_EVENTS.openSearch, listener);

    await render(<Harness />);
    dispatchKey("g");
    dispatchKey("s");

    expect(listener).toHaveBeenCalledTimes(1);

    document.removeEventListener(SHORTCUT_EVENTS.openSearch, listener);
  });

  it("opens the source URL on O", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    await render(<Harness />);
    dispatchKey("o");

    expect(openSpy).toHaveBeenCalledWith("https://example.com/source.md", "_blank");
  });

  it("clears pending sequences on Escape", async () => {
    const listener = vi.fn();
    document.addEventListener(SHORTCUT_EVENTS.openSearch, listener);

    await render(<Harness />);
    dispatchKey("g");
    dispatchKey("Escape");
    dispatchKey("s");

    expect(listener).not.toHaveBeenCalled();

    document.removeEventListener(SHORTCUT_EVENTS.openSearch, listener);
  });

  it("does not fire shortcuts while typing in an input", async () => {
    const listener = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    document.addEventListener(SHORTCUT_EVENTS.openSearch, listener);

    const screen = await render(<Harness />);
    const input = await screen.getByRole("textbox", { name: "Shortcut input" }).element();

    input.focus();
    dispatchKey("g", input);
    dispatchKey("s", input);
    dispatchKey("o", input);

    expect(listener).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    document.removeEventListener(SHORTCUT_EVENTS.openSearch, listener);
  });

  it("moves focus through a shortcut list with J and K", async () => {
    const screen = await render(<Harness />);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    const firstElement = await first.element();
    const secondElement = await second.element();

    await first.click();
    dispatchKey("j", firstElement);
    expect(document.activeElement).toBe(secondElement);

    dispatchKey("k", secondElement);
    expect(document.activeElement).toBe(firstElement);
  });

  it("scrolls to backlinks on G then B", async () => {
    const scrollSpy = vi.fn();

    await render(<Harness />);
    const backlinks = document.querySelector<HTMLElement>(SHORTCUT_TARGETS.backlinks);

    if (backlinks) {
      backlinks.scrollIntoView = scrollSpy;
    }

    dispatchKey("g");
    dispatchKey("b");

    expect(scrollSpy).toHaveBeenCalled();
  });
});
