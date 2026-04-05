import { useEffect, useRef } from "react";
import { SITE } from "@/config";

function isInputTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable ||
    target.closest("[role='dialog']") !== null
  );
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
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInputTarget(e)) return;

      // Sequence shortcuts: G then X
      if (pendingRef.current === "g") {
        clearPending();
        switch (e.key.toLowerCase()) {
          case "h":
            e.preventDefault();
            window.location.href = "/";
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
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearPending();
    };
  }, []);
}
