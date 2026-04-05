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
    linkRefs.current[activeSlug]?.scrollIntoView({ block: "nearest" });
  }, [activeSlug]);

  if (items.length === 0) return null;

  return (
    <nav className="px-1">
      <h2 className="mb-2 flex items-center gap-1.5 text-ui-xs font-medium uppercase tracking-wider text-muted-foreground/50">
        <List className="size-3" />
        On This Page
      </h2>
      <ul className="max-h-80 space-y-0.5 overflow-y-auto pr-1 text-ui">
        {items.map((heading) => {
          const isActive = heading.slug === activeSlug;

          return (
            <li key={heading.slug}>
              <a
                ref={(element) => {
                  linkRefs.current[heading.slug] = element;
                }}
                href={`#${heading.slug}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block py-0.5 transition-colors",
                  heading.depth === 3 ? "pl-3" : "",
                  isActive ? "text-foreground" : "text-foreground/40 hover:text-foreground/70",
                  heading.depth === 3 && !isActive ? "text-foreground/30" : "",
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
