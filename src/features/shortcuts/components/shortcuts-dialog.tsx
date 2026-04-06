import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { getShortcutGroups } from "@/features/shortcuts/lib/shortcuts";
import type { ShortcutGroup } from "@/features/shortcuts/lib/shortcuts";
import { getShortcutContext } from "@/lib/shortcut-targets";

function Kbd({ children }: { children: string }) {
  return <kbd className="shell-kbd h-5">{children}</kbd>;
}

function ShortcutKeys({ keys }: { keys: string[][] }) {
  return (
    <span className="flex items-center gap-1">
      {keys.map((group, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="mx-0.5 text-[11px] text-muted-foreground/50">then</span>}
          {group.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </span>
      ))}
    </span>
  );
}

function filterGroups(groups: ShortcutGroup[], query: string): ShortcutGroup[] {
  if (!query.trim()) return groups;
  const q = query.toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      shortcuts: group.shortcuts.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.keys.flat().some((k) => k.toLowerCase().includes(q)),
      ),
    }))
    .filter((group) => group.shortcuts.length > 0);
}

interface ShortcutsDialogProps {
  sourceUrl?: string;
}

export function ShortcutsDialog({ sourceUrl }: ShortcutsDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allGroups = useMemo(() => getShortcutGroups(getShortcutContext(sourceUrl)), [sourceUrl]);
  const filteredGroups = useMemo(() => filterGroups(allGroups, query), [allGroups, query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "?" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <DialogContent className="top-[20%] max-h-[70vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available keyboard shortcuts for navigating and using the site.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
        </div>

        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts"
            className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto p-2">
          {filteredGroups.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No shortcuts found.</p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="mb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.label}
                </div>
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm"
                  >
                    <span>{shortcut.label}</span>
                    <ShortcutKeys keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
