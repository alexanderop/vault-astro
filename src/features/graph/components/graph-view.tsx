import { useState } from "react";
import type { GraphData } from "@/features/graph/lib/graph-data-builder";
import { GitFork, FileText, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphViewProps {
  data: GraphData;
  currentSlug?: string;
  title?: string;
  height?: number;
}

const COLLAPSED_COUNT = 8;

export function GraphView({ data, currentSlug, title = "Linked Notes" }: GraphViewProps) {
  const [expanded, setExpanded] = useState(false);

  const linkedNotes = data.nodes.filter((n) => n.id !== currentSlug);

  if (linkedNotes.length === 0) return null;

  const hasMore = linkedNotes.length > COLLAPSED_COUNT;
  const visible = expanded ? linkedNotes : linkedNotes.slice(0, COLLAPSED_COUNT);

  return (
    <div className="px-1">
      <h3 className="mb-2 flex items-center gap-1.5 text-ui-xs font-medium uppercase tracking-wider text-muted-foreground/50">
        <GitFork className="size-3" />
        {title}
        <span className="ml-auto font-normal tabular-nums">{linkedNotes.length}</span>
      </h3>
      <ul className="space-y-px">
        {visible.map((node) => (
          <li key={node.id}>
            <a
              href={`/${node.id}`}
              className="flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-ui text-foreground/55 transition-colors hover:bg-surface-hover hover:text-foreground/80"
            >
              <FileText className="size-3 shrink-0 text-foreground/25" />
              <span className="min-w-0 truncate">{node.title}</span>
            </a>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mt-1 flex w-full items-center gap-1 rounded-sm px-1.5 py-1 text-ui-sm text-muted-foreground/40 transition-colors hover:text-muted-foreground/60",
          )}
        >
          {expanded ? (
            <>
              <ChevronDown className="size-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronRight className="size-3" />
              {linkedNotes.length - COLLAPSED_COUNT} more
            </>
          )}
        </button>
      )}
    </div>
  );
}
