import { useEffect, useRef, useState } from "react";
import type { MarkdownHeading } from "astro";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TableOfContentsProps {
  headings: MarkdownHeading[];
}

function getEligibleHeadings(headings: MarkdownHeading[]) {
  return headings.filter((heading) => heading.depth >= 2 && heading.depth <= 3);
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const items = getEligibleHeadings(headings);
  const [activeSlug, setActiveSlug] = useState(items[0]?.slug ?? "");
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (items.length === 0) return;

    const updateActiveHeading = () => {
      const offset = 140;
      let currentSlug = items[0]?.slug ?? "";

      for (const heading of items) {
        const element = document.getElementById(heading.slug);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= offset) {
          currentSlug = heading.slug;
        } else {
          break;
        }
      }

      setActiveSlug(currentSlug);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("hashchange", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("hashchange", updateActiveHeading);
    };
  }, [items]);

  useEffect(() => {
    if (!activeSlug) return;
    const link = linkRefs.current[activeSlug];
    const container = link?.closest(".overflow-y-auto");
    if (!link || !container) return;

    const linkRect = link.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (linkRect.top < containerRect.top) {
      container.scrollTop += linkRect.top - containerRect.top;
    } else if (linkRect.bottom > containerRect.bottom) {
      container.scrollTop += linkRect.bottom - containerRect.bottom;
    }
  }, [activeSlug]);

  if (items.length === 0) return null;

  return (
    <nav className="rail-panel" data-shortcut-list>
      <h2 className="rail-panel-title">
        <List className="size-3" />
        On This Page
      </h2>
      <ul className="shell-list max-h-80 overflow-y-auto pr-1">
        {items.map((heading) => {
          const isActive = heading.slug === activeSlug;

          return (
            <li key={heading.slug}>
              <a
                ref={(element) => {
                  linkRefs.current[heading.slug] = element;
                }}
                href={`#${heading.slug}`}
                data-shortcut-item
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "shell-list-row block rounded-sm py-0.5",
                  heading.depth === 3 ? "pl-5" : "pl-2",
                  isActive ? "shell-list-row--active" : "bg-transparent",
                  heading.depth === 3 && !isActive ? "text-muted-foreground" : "",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
