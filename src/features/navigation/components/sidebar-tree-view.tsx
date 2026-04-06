import { useEffect, useState } from "react";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarTreeNode } from "@/features/navigation/lib/sidebar-tree";

const STORAGE_KEY = "vault-sidebar-open-folders";

interface SidebarTreeViewProps {
  tree: SidebarTreeNode[];
  currentSlug?: string;
  defaultOpenKeys: string[];
  onNavigate?: () => void;
}

function SidebarNode({
  node,
  currentSlug,
  openKeys,
  toggleFolder,
  onNavigate,
}: {
  node: SidebarTreeNode;
  currentSlug?: string;
  openKeys: Set<string>;
  toggleFolder: (key: string) => void;
  onNavigate?: () => void;
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
          data-shortcut-item
          className={cn("shell-list-row", isCurrent ? "shell-list-row--active" : null)}
          onClick={onNavigate}
          style={{ paddingLeft: `${depth * 0.75 + 0.75}rem` }}
        >
          <FileText className="size-3.5 shrink-0 text-foreground/50" />
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
        className="shell-list-row w-full text-left"
        style={{ paddingLeft: `${depth * 0.75 + 0.75}rem` }}
      >
        <ChevronRight
          className={cn(
            "size-3 shrink-0 text-foreground/50 transition-transform",
            isOpen && "rotate-90",
          )}
        />
        <Folder className="size-3.5 shrink-0 text-foreground/50" />
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
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SidebarTreeView({
  tree,
  currentSlug,
  defaultOpenKeys,
  onNavigate,
}: SidebarTreeViewProps) {
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
    <ul className="shell-list" data-shortcut-list>
      {tree.map((node) => (
        <SidebarNode
          key={node.key}
          node={node}
          currentSlug={currentSlug}
          openKeys={openKeys}
          toggleFolder={toggleFolder}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
