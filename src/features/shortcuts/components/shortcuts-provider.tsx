import { ShortcutsDialog } from "@/features/shortcuts/components/shortcuts-dialog";
import { useKeyboardShortcuts } from "@/features/shortcuts/hooks/use-keyboard-shortcuts";

interface ShortcutsProviderProps {
  sourceUrl?: string;
}

export function ShortcutsProvider({ sourceUrl }: ShortcutsProviderProps) {
  useKeyboardShortcuts();
  return <ShortcutsDialog sourceUrl={sourceUrl} />;
}
