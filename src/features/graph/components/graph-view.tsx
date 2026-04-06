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
    <div className="rail-panel" data-shortcut-list>
      <h3 className="rail-panel-title">
        <GitFork className="size-3" />
        {title}
        <span className="ml-auto font-normal tabular-nums text-muted-foreground">
          {linkedNotes.length}
        </span>
      </h3>
      <ul className="shell-list">
        {visible.map((node) => (
          <li key={node.id}>
            <a
              href={`/${node.id}`}
              data-shortcut-item
              className="shell-list-row shell-list-row--compact"
            >
              <FileText className="size-3 shrink-0 text-foreground/50" />
              <span className="min-w-0 truncate">{node.title}</span>
            </a>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn("shell-list-row shell-list-row--compact mt-1 w-full text-xs")}
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
