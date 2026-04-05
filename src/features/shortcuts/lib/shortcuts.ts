export interface Shortcut {
  id: string;
  label: string;
  keys: string[][];
  action?: () => void;
}

export interface ShortcutGroup {
  id: string;
  label: string;
  shortcuts: Shortcut[];
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

export const MOD_KEY = isMac ? "⌘" : "Ctrl";

export function getShortcutGroups(): ShortcutGroup[] {
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
      id: "appearance",
      label: "Appearance",
      shortcuts: [
        {
          id: "toggle-theme",
          label: "Toggle dark mode",
          keys: [["T"]],
        },
      ],
    },
  ];
}
