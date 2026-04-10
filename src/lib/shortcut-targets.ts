export const SHORTCUT_EVENTS = {
  openSearch: "vault:open-search",
  toggleSidebar: "vault:toggle-sidebar",
} as const;

export const SHORTCUT_TARGETS = {
  searchTrigger: '[data-shortcut-target="search-trigger"]',
  top: '[data-shortcut-target="top"]',
  rightRail: '[data-shortcut-target="right-rail"]',
  backlinks: '[data-shortcut-target="backlinks"]',
  source: "[data-source-url]",
} as const;

export interface ShortcutContext {
  hasSearch: boolean;
  hasNotesIndex: boolean;
  hasTop: boolean;
  hasRightRail: boolean;
  hasBacklinks: boolean;
  hasSource: boolean;
}

export function getShortcutContext(sourceUrl?: string): ShortcutContext {
  if (typeof document === "undefined") {
    return {
      hasSearch: false,
      hasNotesIndex: true,
      hasTop: true,
      hasRightRail: false,
      hasBacklinks: false,
      hasSource: Boolean(sourceUrl),
    };
  }

  return {
    hasSearch: Boolean(document.querySelector(SHORTCUT_TARGETS.searchTrigger)),
    hasNotesIndex: true,
    hasTop: true,
    hasRightRail: Boolean(document.querySelector(SHORTCUT_TARGETS.rightRail)),
    hasBacklinks: Boolean(document.querySelector(SHORTCUT_TARGETS.backlinks)),
    hasSource: Boolean(sourceUrl),
  };
}

export function openSearchShortcut() {
  document.dispatchEvent(new CustomEvent(SHORTCUT_EVENTS.openSearch));
}

export function jumpToShortcutTarget(selector: string): boolean {
  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    return false;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });

  if (typeof element.focus === "function") {
    element.focus({ preventScroll: true });
  }

  return true;
}

export function moveFocusInShortcutList(direction: 1 | -1): boolean {
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) {
    return false;
  }

  const container = activeElement.closest<HTMLElement>("[data-shortcut-list]");

  if (!container) {
    return false;
  }

  const items = Array.from(container.querySelectorAll<HTMLElement>("[data-shortcut-item]")).filter(
    (item) => !item.hasAttribute("disabled") && item.tabIndex !== -1,
  );

  if (items.length === 0) {
    return false;
  }

  const currentIndex = items.findIndex((item) => item === activeElement);
  const fallbackIndex = direction === 1 ? 0 : items.length - 1;
  const nextIndex =
    currentIndex === -1
      ? fallbackIndex
      : Math.max(0, Math.min(items.length - 1, currentIndex + direction));
  const nextItem = items[nextIndex];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- nextItem can be undefined if items is empty
  if (!nextItem || nextItem === activeElement) {
    return false;
  }

  nextItem.focus();
  nextItem.scrollIntoView({ block: "nearest" });
  return true;
}
