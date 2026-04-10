import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useStackedPages } from "@/features/stacked-pages/hooks/use-stacked-pages";

interface StackedPagesProviderProps {
  currentSlug: string;
  currentTitle: string;
}

const MIN_DESKTOP_WIDTH = 768;
const NOTE_PROSE_SELECTOR = ".note-prose";

function isWikiLinkClick(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a.wikilink");
}

function getSlugFromAnchor(anchor: HTMLAnchorElement): string | null {
  const href = anchor.dataset.href ?? anchor.getAttribute("href");
  if (!href) return null;
  return href.startsWith("/") ? href.slice(1) : href;
}

export function StackedPagesProvider({ currentSlug, currentTitle }: StackedPagesProviderProps) {
  const { state, pushPane, closePane, focusPane } = useStackedPages(currentSlug, currentTitle);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const paneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isDesktopRef = useRef(true);

  // Track desktop/mobile
  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${MIN_DESKTOP_WIDTH}px)`);
    const update = () => {
      isDesktopRef.current = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Toggle stacked-mode class on shell-body
  useEffect(() => {
    const shellBody = document.querySelector(".shell-body");
    if (!shellBody) return;

    const hasStack = state.panes.length > 1 && isDesktopRef.current;

    if (hasStack) {
      shellBody.classList.add("stacked-mode");
    } else {
      shellBody.classList.remove("stacked-mode");
    }

    return () => {
      shellBody.classList.remove("stacked-mode");
    };
  }, [state.panes.length]);

  // Create portal container
  useEffect(() => {
    const shellBody = document.querySelector(".shell-body");
    if (!shellBody || containerRef.current) return;

    const container = document.createElement("div");
    container.id = "stacked-panes-container";
    container.style.display = "contents";
    shellBody.appendChild(container);
    containerRef.current = container;

    return () => {
      container.remove();
      containerRef.current = null;
    };
  }, []);

  // Scroll focused pane into view
  useEffect(() => {
    if (state.panes.length <= 1) return;

    const paneEl = paneRefs.current.get(state.focusedIndex);
    paneEl?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, [state.focusedIndex, state.panes.length]);

  // Intercept wikilink clicks
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isDesktopRef.current) return;

      const anchor = isWikiLinkClick(event.target);
      if (!anchor) return;

      // Only intercept links within note content areas
      if (!anchor.closest(NOTE_PROSE_SELECTOR) && !anchor.closest(".stacked-pane")) {
        return;
      }

      const slug = getSlugFromAnchor(anchor);
      if (!slug) return;

      event.preventDefault();
      event.stopPropagation();
      void pushPane(slug);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pushPane]);

  // Close rightmost pane on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && state.panes.length > 1) {
        closePane(state.panes.length - 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closePane, state.panes.length]);

  // Re-init math and mermaid in new panes
  const initPaneContent = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;

    // KaTeX
    if (typeof window !== "undefined" && "renderMathInElement" in window) {
      (
        window as Record<string, unknown> & { renderMathInElement?: (el: HTMLElement) => void }
      ).renderMathInElement?.(el);
    }

    // Mermaid
    const mermaidBlocks = el.querySelectorAll(".mermaid:not([data-processed])");
    if (mermaidBlocks.length > 0 && typeof window !== "undefined" && "mermaid" in window) {
      (
        window as Record<string, unknown> & {
          mermaid?: { run?: (opts: { nodes: NodeListOf<Element> }) => void };
        }
      ).mermaid?.run?.({
        nodes: mermaidBlocks,
      });
    }
  }, []);

  const setPaneRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) {
        paneRefs.current.set(index, el);
        initPaneContent(el);
      } else {
        paneRefs.current.delete(index);
      }
    },
    [initPaneContent],
  );

  // Don't render anything if no stacked panes
  if (state.panes.length <= 1 || !containerRef.current) return null;

  return createPortal(
    <>
      {state.panes.slice(1).map((pane, i) => {
        const index = i + 1;
        return (
          <div
            key={pane.slug}
            ref={setPaneRef(index)}
            role="region"
            aria-label={pane.title}
            className={cn("stacked-pane", "note-prose-wrapper")}
            data-slug={pane.slug}
            data-focused={index === state.focusedIndex}
            data-entering="true"
            onClick={(e) => {
              // Focus on background click, not link clicks
              if (!(e.target as Element).closest("a")) {
                focusPane(index);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                focusPane(index);
              }
            }}
            onAnimationEnd={(e) => {
              (e.currentTarget as HTMLElement).removeAttribute("data-entering");
            }}
          >
            <div className="stacked-pane-header">
              <a
                href={`/${pane.slug}`}
                className="stacked-pane-title"
                onClick={(e) => {
                  e.preventDefault();
                  focusPane(index);
                }}
              >
                {pane.title}
              </a>
              <button
                type="button"
                className="stacked-pane-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closePane(index);
                }}
                aria-label={`Close ${pane.title}`}
              >
                <svg
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            {pane.headerHtml && (
              <header className="mb-8" dangerouslySetInnerHTML={{ __html: pane.headerHtml }} />
            )}
            <article
              className="note-prose"
              dangerouslySetInnerHTML={{ __html: pane.htmlContent }}
            />
          </div>
        );
      })}
    </>,
    containerRef.current,
  );
}
