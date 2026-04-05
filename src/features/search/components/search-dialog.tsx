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
import { FileText, Home, Moon, Search, Sun, Keyboard } from "lucide-react";
import { useTheme } from "@/features/theme/hooks/use-theme";

interface SearchDialogProps {
  entries: SearchEntry[];
}

export function SearchDialog({ entries }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results } = useSearch(entries);
  const { theme, toggleTheme } = useTheme();

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
        className="inline-flex items-center gap-2 rounded-sm bg-surface-hover px-2.5 py-1 text-ui text-muted-foreground/60 transition-colors hover:bg-surface-active hover:text-muted-foreground"
      >
        <Search className="size-3.5" />
        Search
        <kbd className="pointer-events-none ml-1 hidden rounded bg-surface-hover px-1.5 py-0.5 text-ui-2xs font-medium text-muted-foreground/40 sm:inline-block">
          ⌘K
        </kbd>
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
              </CommandGroup>

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
                        new KeyboardEvent("keydown", {
                          key: "?",
                          bubbles: true,
                        }),
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
