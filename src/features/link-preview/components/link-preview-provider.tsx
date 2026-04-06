import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  type PreviewData,
  getPreviewPosition,
  LINK_PREVIEW_MAX_WIDTH,
  resolvePreviewData,
  useLinkPreview,
} from "@/features/link-preview/hooks/use-link-preview";

interface LinkPreviewProviderProps {
  entries: PreviewData[];
}

const OPEN_DELAY_MS = 400;
const CLOSE_DELAY_MS = 200;
const SUPPORTS_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const NOTE_PROSE_SELECTOR = ".note-prose";

function isWikiLinkTarget(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a.wikilink");
}

function updateTriggerDescription(
  previous: HTMLAnchorElement | null,
  next: HTMLAnchorElement | null,
  descriptionId: string,
) {
  if (previous && previous !== next) {
    previous.removeAttribute("aria-describedby");
  }

  if (next) {
    next.setAttribute("aria-describedby", descriptionId);
  }
}

export function LinkPreviewProvider({ entries }: LinkPreviewProviderProps) {
  const descriptionId = useId();
  const popupRef = useRef<HTMLDivElement | null>(null);
  const hoverEnabledRef = useRef(false);
  const activeTargetRef = useRef<HTMLAnchorElement | null>(null);
  const pendingTargetRef = useRef<HTMLAnchorElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const { previewLookup, state, setState } = useLinkPreview(entries);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closePreview = useCallback(() => {
    clearOpenTimer();
    clearCloseTimer();
    pendingTargetRef.current = null;
    updateTriggerDescription(activeTargetRef.current, null, descriptionId);
    activeTargetRef.current = null;

    setState((current) => {
      if (!current.target && !current.preview) return current;

      return {
        ...current,
        target: null,
        preview: null,
      };
    });
  }, [clearOpenTimer, clearCloseTimer, descriptionId, setState]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(closePreview, CLOSE_DELAY_MS);
  }, [clearCloseTimer, closePreview]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SUPPORTS_HOVER_QUERY);
    const updateHoverSupport = () => {
      hoverEnabledRef.current = mediaQuery.matches;
    };

    updateHoverSupport();
    mediaQuery.addEventListener("change", updateHoverSupport);

    return () => {
      mediaQuery.removeEventListener("change", updateHoverSupport);
    };
  }, []);

  useEffect(() => {
    if (!state.target || !state.preview) return;

    const popup = popupRef.current;
    const popupRect = popup?.getBoundingClientRect() ?? {
      width: LINK_PREVIEW_MAX_WIDTH,
      height: 120,
    };
    const nextPosition = getPreviewPosition(state.target.getBoundingClientRect(), popupRect, {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setState((current) => {
      if (
        current.position.left === nextPosition.left &&
        current.position.top === nextPosition.top
      ) {
        return current;
      }

      return {
        ...current,
        position: nextPosition,
      };
    });
  }, [setState, state.preview, state.target]);

  useEffect(() => {
    const openPreview = (anchor: HTMLAnchorElement) => {
      const preview = resolvePreviewData(
        previewLookup,
        anchor.dataset.href || anchor.getAttribute("href"),
      );

      if (!preview) {
        closePreview();
        return;
      }

      clearCloseTimer();
      updateTriggerDescription(activeTargetRef.current, anchor, descriptionId);
      activeTargetRef.current = anchor;
      setState({
        target: anchor,
        preview,
        position: getPreviewPosition(
          anchor.getBoundingClientRect(),
          { width: LINK_PREVIEW_MAX_WIDTH, height: 120 },
          {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        ),
      });
    };

    const scheduleOpen = (anchor: HTMLAnchorElement) => {
      clearOpenTimer();
      clearCloseTimer();
      pendingTargetRef.current = anchor;
      openTimerRef.current = window.setTimeout(() => {
        if (pendingTargetRef.current === anchor) {
          openPreview(anchor);
        }
      }, OPEN_DELAY_MS);
    };

    const handleMouseEnter = (event: MouseEvent) => {
      if (!hoverEnabledRef.current) return;

      const anchor = isWikiLinkTarget(event.target);
      if (!anchor || !anchor.closest(NOTE_PROSE_SELECTOR)) return;

      scheduleOpen(anchor);
    };

    const handleMouseLeave = (event: MouseEvent) => {
      if (!hoverEnabledRef.current) return;

      const anchor = isWikiLinkTarget(event.target);
      if (!anchor || !anchor.closest(NOTE_PROSE_SELECTOR)) return;

      const relatedTarget = event.relatedTarget;
      if (popupRef.current?.contains(relatedTarget as Node | null)) return;

      if (pendingTargetRef.current === anchor) {
        pendingTargetRef.current = null;
        clearOpenTimer();
      }

      if (activeTargetRef.current === anchor) {
        scheduleClose();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const anchor = isWikiLinkTarget(event.target);
      if (!anchor || !anchor.closest(NOTE_PROSE_SELECTOR)) return;

      scheduleOpen(anchor);
    };

    const handleFocusOut = (event: FocusEvent) => {
      const anchor = isWikiLinkTarget(event.target);
      if (!anchor || !anchor.closest(NOTE_PROSE_SELECTOR)) return;

      const relatedTarget = event.relatedTarget;
      if (popupRef.current?.contains(relatedTarget as Node | null)) return;

      if (pendingTargetRef.current === anchor) {
        pendingTargetRef.current = null;
        clearOpenTimer();
      }

      if (activeTargetRef.current === anchor) {
        scheduleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    const handleScroll = (event: Event) => {
      if (popupRef.current?.contains(event.target as Node | null)) return;
      closePreview();
    };

    const handleResize = () => {
      if (!activeTargetRef.current) return;

      const nextPosition = getPreviewPosition(
        activeTargetRef.current.getBoundingClientRect(),
        popupRef.current?.getBoundingClientRect() ?? {
          width: LINK_PREVIEW_MAX_WIDTH,
          height: 120,
        },
        { width: window.innerWidth, height: window.innerHeight },
      );

      setState((current) => {
        if (!current.preview) return current;

        return {
          ...current,
          position: nextPosition,
        };
      });
    };

    document.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseLeave);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      clearOpenTimer();
      clearCloseTimer();
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      updateTriggerDescription(activeTargetRef.current, null, descriptionId);
      activeTargetRef.current = null;
    };
  }, [
    clearCloseTimer,
    clearOpenTimer,
    closePreview,
    descriptionId,
    previewLookup,
    scheduleClose,
    setState,
  ]);

  const handlePopupEnter = () => {
    clearCloseTimer();
  };

  const handlePopupLeave = () => {
    if (!hoverEnabledRef.current) return;
    scheduleClose();
  };

  if (!state.preview) return null;

  return createPortal(
    <div
      ref={popupRef}
      id={descriptionId}
      role="tooltip"
      onMouseEnter={handlePopupEnter}
      onMouseLeave={handlePopupLeave}
      className={cn(
        "fixed z-[30] w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl",
        "motion-reduce:transition-none data-[state=open]:motion-safe:animate-in data-[state=open]:motion-safe:fade-in-0 data-[state=open]:motion-safe:zoom-in-95",
      )}
      data-state="open"
      style={{
        left: `${state.position.left}px`,
        top: `${state.position.top}px`,
        maxWidth: `${LINK_PREVIEW_MAX_WIDTH}px`,
      }}
    >
      <p className="text-sm font-semibold tracking-tight text-foreground">{state.preview.title}</p>
      {state.preview.preview ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.preview.preview}</p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">No preview available.</p>
      )}
    </div>,
    document.body,
  );
}
