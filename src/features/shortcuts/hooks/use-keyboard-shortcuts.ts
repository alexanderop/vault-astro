import { useEffect, useRef } from "react";
import { SITE } from "@/config";
import {
  SHORTCUT_TARGETS,
  jumpToShortcutTarget,
  moveFocusInShortcutList,
  openSearchShortcut,
} from "@/lib/shortcut-targets";

function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable ||
    target.closest("[role='dialog']") !== null
  );
}

function openSource() {
  const url = document.querySelector("[data-source-url]")?.getAttribute("data-source-url");
  if (url) window.open(url, "_blank");
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const next = isDark ? "light" : "dark";
  root.classList.toggle("dark", next === "dark");
  localStorage.setItem(SITE.themeStorageKey, next);
}

export function useKeyboardShortcuts() {
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearPending() {
      pendingRef.current = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        clearPending();
        return;
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "j":
            if (moveFocusInShortcutList(1)) {
              e.preventDefault();
              clearPending();
              return;
            }
            break;
          case "k":
            if (moveFocusInShortcutList(-1)) {
              e.preventDefault();
              clearPending();
              return;
            }
            break;
        }
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputTarget(e)) return;

      // Sequence shortcuts: G then X
      if (pendingRef.current === "g") {
        clearPending();
        switch (e.key.toLowerCase()) {
          case "h":
          case "n":
            e.preventDefault();
            window.location.href = "/";
            return;
          case "s":
            e.preventDefault();
            openSearchShortcut();
            return;
          case "t":
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          case "b":
            if (jumpToShortcutTarget(SHORTCUT_TARGETS.backlinks)) {
              e.preventDefault();
            }
            return;
          case "r":
            if (jumpToShortcutTarget(SHORTCUT_TARGETS.rightRail)) {
              e.preventDefault();
            }
            return;
        }
        return;
      }

      // Start a sequence
      if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        pendingRef.current = "g";
        timerRef.current = setTimeout(clearPending, 1000);
        return;
      }

      // Single-key shortcuts
      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault();
          toggleTheme();
          return;
        case "o":
          e.preventDefault();
          openSource();
          return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearPending();
    };
  }, []);
}
