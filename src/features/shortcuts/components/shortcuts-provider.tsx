import { ShortcutsDialog } from "@/features/shortcuts/components/shortcuts-dialog";
import { useKeyboardShortcuts } from "@/features/shortcuts/hooks/use-keyboard-shortcuts";

export function ShortcutsProvider() {
  useKeyboardShortcuts();
  return <ShortcutsDialog />;
}
