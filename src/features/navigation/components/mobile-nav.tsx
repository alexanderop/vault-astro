import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTreeView } from "@/features/navigation/components/sidebar-tree-view";
import {
  buildSidebarTree,
  getSidebarDefaultOpenKeys,
} from "@/features/navigation/lib/sidebar-tree";
import type { SidebarTreeNode } from "@/features/navigation/lib/sidebar-tree";
import type { CollectionEntry } from "astro:content";

interface MobileNavProps {
  notes: CollectionEntry<"notes">[];
  currentSlug?: string;
}

function useSidebarState(
  notes: CollectionEntry<"notes">[],
  currentSlug?: string,
): { tree: SidebarTreeNode[]; defaultOpenKeys: string[] } {
  return useMemo(() => {
    const tree = buildSidebarTree(notes);

    return {
      tree,
      defaultOpenKeys: getSidebarDefaultOpenKeys(tree, currentSlug),
    };
  }, [notes, currentSlug]);
}

export function MobileNav({ notes, currentSlug }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { tree, defaultOpenKeys } = useSidebarState(notes, currentSlug);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-4" />
      </Button>
      <DialogContent
        className="mobile-nav-dialog lg:hidden"
        overlayClassName="mobile-nav-overlay lg:hidden"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Navigation</DialogTitle>
          <DialogDescription>Browse published notes.</DialogDescription>
        </DialogHeader>

        <div className="shell-sidebar">
          <div className="shell-sidebar-header">
            <Menu className="size-4 text-primary/70" />
            <a href="/" className="text-sm font-semibold tracking-tight text-foreground/90">
              Vault
            </a>
          </div>
          <div className="shell-sidebar-scroll">
            <SidebarTreeView
              tree={tree}
              currentSlug={currentSlug}
              defaultOpenKeys={defaultOpenKeys}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
