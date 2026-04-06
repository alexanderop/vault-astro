import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useSearch } from "@/features/search/hooks/use-search";
import type { SearchEntry } from "@/features/search/lib/search-index";
import { ExternalLink, FileText, Home, Moon, Search, Sun, Keyboard } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  SHORTCUT_EVENTS,
  SHORTCUT_TARGETS,
  getShortcutContext,
  jumpToShortcutTarget,
} from "@/lib/shortcut-targets";

interface SearchDialogProps {
  entries: SearchEntry[];
  sourceUrl?: string;
}

export function SearchDialog({ entries, sourceUrl }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results } = useSearch(entries);
  const { theme, toggleTheme } = useTheme();
  const shortcutContext = getShortcutContext(sourceUrl);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleOpenSearch() {
      setOpen(true);
    }

    document.addEventListener(SHORTCUT_EVENTS.openSearch, handleOpenSearch);
    return () => document.removeEventListener(SHORTCUT_EVENTS.openSearch, handleOpenSearch);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      window.location.href = href;
    },
    [setQuery],
  );

  const handleClose = useCallback(
    (v: boolean) => {
      setOpen(v);
      if (!v) setQuery("");
    },
    [setQuery],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-shortcut-target="search-trigger"
        className="inline-flex items-center gap-2 rounded-sm bg-surface-hover px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-surface-active hover:text-foreground"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="shell-kbd pointer-events-none ml-1 hidden sm:inline-flex">⌘K</kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleClose}
        title="Command Palette"
        description="Search notes or run a command."
        showCloseButton={false}
      >
        <CommandInput
          placeholder="Type a command or search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {query.length > 0 && results.length > 0 && (
            <CommandGroup heading="Notes">
              {results.slice(0, 10).map((entry) => (
                <CommandItem
                  key={entry.slug}
                  value={`note:${entry.title} ${entry.slug}`}
                  onSelect={() => handleSelect(entry.href)}
                >
                  <FileText />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{entry.title}</span>
                    {entry.summary && (
                      <span className="truncate text-xs text-muted-foreground">
                        {entry.summary}
                      </span>
                    )}
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground/50">{entry.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length === 0 && (
            <>
              <CommandGroup heading="Navigation">
                <CommandItem value="go-home" onSelect={() => handleSelect("/")}>
                  <Home />
                  <span>Go home</span>
                  <CommandShortcut>G H</CommandShortcut>
                </CommandItem>
                <CommandItem value="go-notes" onSelect={() => handleSelect("/")}>
                  <FileText />
                  <span>Go to notes</span>
                  <CommandShortcut>G N</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value="go-top"
                  onSelect={() => {
                    jumpToShortcutTarget(SHORTCUT_TARGETS.top);
                    setOpen(false);
                  }}
                >
                  <Home />
                  <span>Go to top</span>
                  <CommandShortcut>G T</CommandShortcut>
                </CommandItem>
                {shortcutContext.hasBacklinks && (
                  <CommandItem
                    value="go-backlinks"
                    onSelect={() => {
                      jumpToShortcutTarget(SHORTCUT_TARGETS.backlinks);
                      setOpen(false);
                    }}
                  >
                    <FileText />
                    <span>Go to backlinks</span>
                    <CommandShortcut>G B</CommandShortcut>
                  </CommandItem>
                )}
                {shortcutContext.hasRightRail && (
                  <CommandItem
                    value="go-right-rail"
                    onSelect={() => {
                      jumpToShortcutTarget(SHORTCUT_TARGETS.rightRail);
                      setOpen(false);
                    }}
                  >
                    <FileText />
                    <span>Go to right rail</span>
                    <CommandShortcut>G R</CommandShortcut>
                  </CommandItem>
                )}
              </CommandGroup>

              {shortcutContext.hasSource && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Notes">
                    <CommandItem
                      value="open-source"
                      onSelect={() => {
                        window.open(sourceUrl, "_blank");
                        setOpen(false);
                      }}
                    >
                      <ExternalLink />
                      <span>Open source</span>
                      <CommandShortcut>O</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}

              <CommandSeparator />

              <CommandGroup heading="Appearance">
                <CommandItem
                  value="toggle-theme"
                  onSelect={() => {
                    toggleTheme();
                    setOpen(false);
                  }}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                  <span>Toggle dark mode</span>
                  <CommandShortcut>T</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Help">
                <CommandItem
                  value="keyboard-shortcuts"
                  onSelect={() => {
                    setOpen(false);
                    setTimeout(() => {
                      document.dispatchEvent(
                        new KeyboardEvent("keydown", { key: "?", bubbles: true }),
                      );
                    }, 100);
                  }}
                >
                  <Keyboard />
                  <span>View keyboard shortcuts</span>
                  <CommandShortcut>?</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
