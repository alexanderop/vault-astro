import { useMemo, useState } from "react";

export interface PreviewData {
  href: string;
  title: string;
  preview: string;
}

export interface LinkPreviewPosition {
  left: number;
  top: number;
}

export interface LinkPreviewState {
  target: HTMLAnchorElement | null;
  preview: PreviewData | null;
  position: LinkPreviewPosition;
}

const VIEWPORT_PADDING = 12;
const POPUP_OFFSET = 12;
export const LINK_PREVIEW_MAX_WIDTH = 320;

export function normalizePreviewHref(href: string): string {
  const trimmed = href.trim();
  const hashIndex = trimmed.indexOf("#");

  return hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
}

export function buildPreviewLookup(entries: PreviewData[]): Map<string, PreviewData> {
  return new Map(
    entries.map((entry) => [
      normalizePreviewHref(entry.href),
      {
        href: normalizePreviewHref(entry.href),
        title: entry.title,
        preview: entry.preview.trim(),
      },
    ]),
  );
}

export function resolvePreviewData(
  lookup: Map<string, PreviewData>,
  href: string | null | undefined,
): PreviewData | null {
  if (!href) return null;
  return lookup.get(normalizePreviewHref(href)) ?? null;
}

export function getPreviewPosition(
  anchorRect: Pick<DOMRect, "bottom" | "left" | "top">,
  popupSize: { width: number; height: number },
  viewport: { width: number; height: number },
): LinkPreviewPosition {
  const preferredLeft = anchorRect.left;
  const maxLeft = viewport.width - popupSize.width - VIEWPORT_PADDING;
  const left = Math.min(
    Math.max(preferredLeft, VIEWPORT_PADDING),
    Math.max(maxLeft, VIEWPORT_PADDING),
  );

  const preferredTop = anchorRect.bottom + POPUP_OFFSET;
  const fitsBelow = preferredTop + popupSize.height <= viewport.height - VIEWPORT_PADDING;
  const top = fitsBelow
    ? preferredTop
    : Math.max(anchorRect.top - popupSize.height - POPUP_OFFSET, VIEWPORT_PADDING);

  return { left, top };
}

export function useLinkPreview(entries: PreviewData[]) {
  const previewLookup = useMemo(() => buildPreviewLookup(entries), [entries]);
  const [state, setState] = useState<LinkPreviewState>({
    target: null,
    preview: null,
    position: { left: VIEWPORT_PADDING, top: VIEWPORT_PADDING },
  });

  return {
    previewLookup,
    state,
    setState,
  };
}
