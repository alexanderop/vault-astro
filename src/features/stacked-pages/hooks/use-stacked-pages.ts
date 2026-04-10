import { useCallback, useEffect, useRef, useState } from "react";
import type { StackedPane, StackState } from "@/features/stacked-pages/types";
import { fetchNoteContent } from "@/features/stacked-pages/lib/fetch-note-content";
import { decodeStack, encodeStack } from "@/features/stacked-pages/lib/url-encoding";

function initialStateFromHash(baseSlug: string, baseTitle: string): StackState {
  const basePane: StackedPane = {
    slug: baseSlug,
    title: baseTitle,
    htmlContent: "",
    headerHtml: "",
  };

  return {
    panes: [basePane],
    focusedIndex: 0,
  };
}

function syncHash(panes: StackedPane[]) {
  const stackedSlugs = panes.slice(1).map((p) => p.slug);
  const hash = encodeStack(stackedSlugs);
  const url = window.location.pathname + window.location.search + hash;
  window.history.replaceState(null, "", url);
}

export function useStackedPages(initialSlug: string, initialTitle: string) {
  const [state, setState] = useState<StackState>(() =>
    initialStateFromHash(initialSlug, initialTitle),
  );
  const isRestoringRef = useRef(false);

  // Restore stack from hash on mount
  useEffect(() => {
    const stackedSlugs = decodeStack(window.location.hash);
    if (stackedSlugs.length === 0) return;

    isRestoringRef.current = true;

    void Promise.all(stackedSlugs.map(fetchNoteContent)).then((results) => {
      const panes = results.filter((r): r is StackedPane => r !== null);

      if (panes.length > 0) {
        setState((prev) => ({
          panes: [...prev.panes, ...panes],
          focusedIndex: panes.length,
        }));
      }

      isRestoringRef.current = false;
      return undefined;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync hash whenever panes change (skip during restore)
  useEffect(() => {
    if (isRestoringRef.current) return;
    syncHash(state.panes);
  }, [state.panes]);

  const pushPane = useCallback(async (slug: string) => {
    const normalizedSlug = slug.startsWith("/") ? slug.slice(1) : slug;

    // Focus existing pane if already in stack
    let alreadyExists = false;
    setState((prev) => {
      const existingIndex = prev.panes.findIndex((p) => p.slug === normalizedSlug);
      if (existingIndex >= 0) {
        alreadyExists = true;
        return { ...prev, focusedIndex: existingIndex };
      }
      return prev;
    });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- set synchronously inside setState callback
    if (alreadyExists) return;

    const pane = await fetchNoteContent(normalizedSlug);
    if (!pane) {
      window.location.href = `/${normalizedSlug}`;
      return;
    }

    setState((prev) => {
      if (prev.panes.some((p) => p.slug === pane.slug)) {
        return {
          ...prev,
          focusedIndex: prev.panes.findIndex((p) => p.slug === pane.slug),
        };
      }

      const truncated = prev.panes.slice(0, prev.focusedIndex + 1);
      const newPanes = [...truncated, pane];

      const hash = encodeStack(newPanes.slice(1).map((p) => p.slug));
      const url = window.location.pathname + window.location.search + hash;
      window.history.pushState({ stackLength: newPanes.length }, "", url);

      return {
        panes: newPanes,
        focusedIndex: newPanes.length - 1,
      };
    });
  }, []);

  const closePane = useCallback((index: number) => {
    setState((prev) => {
      if (index === 0) return prev; // Can't close the base pane
      const newPanes = prev.panes.filter((_, i) => i !== index);
      const newFocused = Math.min(prev.focusedIndex, newPanes.length - 1);
      return { panes: newPanes, focusedIndex: newFocused };
    });
  }, []);

  const focusPane = useCallback((index: number) => {
    setState((prev) => {
      if (index < 0 || index >= prev.panes.length) return prev;
      return { ...prev, focusedIndex: index };
    });
  }, []);

  // Handle back button
  useEffect(() => {
    const handlePopState = () => {
      const stackedSlugs = decodeStack(window.location.hash);
      setState((prev) => {
        const targetLength = stackedSlugs.length + 1; // +1 for base pane
        if (targetLength >= prev.panes.length) return prev;

        const newPanes = prev.panes.slice(0, targetLength);
        return {
          panes: newPanes,
          focusedIndex: Math.min(prev.focusedIndex, newPanes.length - 1),
        };
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return { state, pushPane, closePane, focusPane };
}
