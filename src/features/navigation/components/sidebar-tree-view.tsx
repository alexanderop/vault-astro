import { useEffect, useState } from "react";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarTreeNode } from "@/features/navigation/lib/sidebar-tree";

const STORAGE_KEY = "vault-sidebar-open-folders";

interface SidebarTreeViewProps {
  tree: SidebarTreeNode[];
  currentSlug?: string;
  defaultOpenKeys: string[];
}

function SidebarNode({
  node,
  currentSlug,
  openKeys,
  toggleFolder,
}: {
  node: SidebarTreeNode;
  currentSlug?: string;
  openKeys: Set<string>;
  toggleFolder: (key: string) => void;
}) {
  const isFolder = node.children.length > 0;
  const isOpen = openKeys.has(node.key);
  const isCurrent = node.slug === currentSlug;
  const depth = node.key.split("/").length - 1;

  if (!isFolder) {
    return (
      <li>
        <a
          href={`/${node.slug}`}
          className={cn(
            "flex items-center gap-1.5 rounded-sm px-2 py-1 text-ui transition-colors",
            isCurrent
              ? "bg-surface-active font-medium text-foreground"
              : "text-foreground/55 hover:bg-surface-hover hover:text-foreground/80",
          )}
          style={{ paddingLeft: `${depth * 0.75 + 0.75}rem` }}
        >
          <FileText className="size-3.5 shrink-0 text-foreground/30" />
          <span className="min-w-0 truncate">{node.title ?? node.name}</span>
        </a>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => toggleFolder(node.key)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left text-ui text-foreground/55 transition-colors hover:bg-surface-hover hover:text-foreground/80"
        style={{ paddingLeft: `${depth * 0.75 + 0.75}rem` }}
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 text-foreground/30 transition-transform",
            isOpen && "rotate-90",
          )}
        />
        <Folder className="size-3.5 shrink-0 text-foreground/30" />
        <span className="min-w-0 truncate">{node.name}</span>
      </button>

      {isOpen && (
        <ul className="space-y-px pt-px">
          {node.children.map((child) => (
            <SidebarNode
              key={child.key}
              node={child}
              currentSlug={currentSlug}
              openKeys={openKeys}
              toggleFolder={toggleFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SidebarTreeView({ tree, currentSlug, defaultOpenKeys }: SidebarTreeViewProps) {
  const [openKeys, setOpenKeys] = useState(() => new Set(defaultOpenKeys));

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setOpenKeys(new Set(parsed.filter((value): value is string => typeof value === "string")));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...openKeys]));
  }, [openKeys]);

  function toggleFolder(key: string) {
    setOpenKeys((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  return (
    <ul className="space-y-px">
      {tree.map((node) => (
        <SidebarNode
          key={node.key}
          node={node}
          currentSlug={currentSlug}
          openKeys={openKeys}
          toggleFolder={toggleFolder}
        />
      ))}
    </ul>
  );
}
