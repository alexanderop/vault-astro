import type { StackedPane } from "@/features/stacked-pages/types";

const cache = new Map<string, Promise<StackedPane | null>>();

function normalizePath(slug: string): string {
  const clean = slug.startsWith("/") ? slug.slice(1) : slug;
  return clean.endsWith("/") ? clean : clean;
}

async function doFetch(slug: string): Promise<StackedPane | null> {
  const path = normalizePath(slug);

  try {
    const response = await fetch(`/${path}/`);
    if (!response.ok) return null;

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const article = doc.querySelector("article.note-prose");
    if (!article) return null;

    const header = doc.querySelector(".shell-content > header");
    const heading = doc.querySelector(".shell-content h1");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- querySelector returns Element|null, textContent can be null
    const title = heading?.textContent?.trim() ?? path;

    return {
      slug: path,
      title,
      htmlContent: article.innerHTML,
      headerHtml: header?.innerHTML ?? "",
    };
  } catch {
    return null;
  }
}

export function fetchNoteContent(slug: string): Promise<StackedPane | null> {
  const key = normalizePath(slug);
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = doFetch(key);
  cache.set(key, promise);
  return promise;
}
