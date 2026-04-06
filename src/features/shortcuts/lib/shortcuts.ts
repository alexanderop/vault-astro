import type { ShortcutContext } from "@/features/shortcuts/lib/shortcut-targets";

export interface Shortcut {
  id: string;
  label: string;
  keys: string[][];
  action?: () => void;
  when?: (context: ShortcutContext) => boolean;
}

export interface ShortcutGroup {
  id: string;
  label: string;
  shortcuts: Shortcut[];
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

export const MOD_KEY = isMac ? "⌘" : "Ctrl";

export function getShortcutGroups(context: ShortcutContext): ShortcutGroup[] {
  return [
    {
      id: "general",
      label: "General",
      shortcuts: [
        {
          id: "command-palette",
          label: "Open command palette",
          keys: [[MOD_KEY, "K"]],
        },
        {
          id: "search",
          label: "Open search",
          keys: [["/"]],
        },
        {
          id: "shortcuts",
          label: "View keyboard shortcuts",
          keys: [["?"]],
        },
      ],
    },
    {
      id: "navigation",
      label: "Navigation",
      shortcuts: [
        {
          id: "go-home",
          label: "Go home",
          keys: [["G"], ["H"]],
        },
        {
          id: "go-notes",
          label: "Go to notes",
          keys: [["G"], ["N"]],
          when: (ctx) => ctx.hasNotesIndex,
        },
        {
          id: "go-search",
          label: "Go to search",
          keys: [["G"], ["S"]],
          when: (ctx) => ctx.hasSearch,
        },
        {
          id: "go-top",
          label: "Go to top",
          keys: [["G"], ["T"]],
          when: (ctx) => ctx.hasTop,
        },
        {
          id: "go-backlinks",
          label: "Go to backlinks",
          keys: [["G"], ["B"]],
          when: (ctx) => ctx.hasBacklinks,
        },
        {
          id: "go-right-rail",
          label: "Go to right rail",
          keys: [["G"], ["R"]],
          when: (ctx) => ctx.hasRightRail,
        },
        {
          id: "go-back",
          label: "Go back",
          keys: [[MOD_KEY, "["]],
        },
        {
          id: "go-forward",
          label: "Go forward",
          keys: [[MOD_KEY, "]"]],
        },
      ],
    },
    {
      id: "notes",
      label: "Notes",
      shortcuts: [
        {
          id: "open-source",
          label: "Open source",
          keys: [["O"]],
          when: (ctx) => ctx.hasSource,
        },
      ],
    },
    {
      id: "appearance",
      label: "Appearance",
      shortcuts: [
        {
          id: "toggle-theme",
          label: "Toggle dark mode",
          keys: [["T"]],
        },
        {
          id: "move-down",
          label: "Move down in focused list",
          keys: [["J"]],
        },
        {
          id: "move-up",
          label: "Move up in focused list",
          keys: [["K"]],
        },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter((shortcut) => shortcut.when?.(context) ?? true),
    }))
    .filter((group) => group.shortcuts.length > 0);
}
