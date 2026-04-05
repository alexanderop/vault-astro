import type { CollectionEntry } from "astro:content";
import { getPublishedNotes } from "@/lib/content-resolver";
import { getNoteHref, getNoteTitle } from "@/lib/notes";

export interface SidebarTreeNode {
  key: string;
  name: string;
  slug?: string;
  title?: string;
  children: SidebarTreeNode[];
}

interface MutableSidebarTreeNode {
  key: string;
  name: string;
  slug?: string;
  title?: string;
  children: Map<string, MutableSidebarTreeNode>;
}

function sortNodes(nodes: MutableSidebarTreeNode[]): SidebarTreeNode[] {
  return nodes
    .toSorted((a, b) => {
      const typeOrderA = a.slug ? 1 : 0;
      const typeOrderB = b.slug ? 1 : 0;

      if (typeOrderA !== typeOrderB) {
        return typeOrderA - typeOrderB;
      }

      return a.name.localeCompare(b.name);
    })
    .map((node) => ({
      key: node.key,
      name: node.name,
      slug: node.slug,
      title: node.title,
      children: sortNodes([...node.children.values()]),
    }));
}

export function buildSidebarTree(entries: CollectionEntry<"notes">[]): SidebarTreeNode[] {
  const publishedEntries = getPublishedNotes(entries);
  const root: MutableSidebarTreeNode = {
    key: "",
    name: "",
    children: new Map(),
  };

  for (const note of publishedEntries) {
    if (note.data.nav_hidden) continue;

    const rawParts = note.id.split("/");
    // Wrap root-level notes (no folder) under a "Notes" folder
    const parts = rawParts.length === 1 ? ["notes", ...rawParts] : rawParts;
    let current = root;

    for (const [index, part] of parts.entries()) {
      const key = current.key ? `${current.key}/${part}` : part;

      if (!current.children.has(part)) {
        current.children.set(part, {
          key,
          name: part,
          children: new Map(),
        });
      }

      current = current.children.get(part)!;

      if (index === parts.length - 1) {
        current.slug = getNoteHref(note, publishedEntries).replace(/^\//, "");
        current.title = getNoteTitle(note);
      }
    }
  }

  return sortNodes([...root.children.values()]);
}

export function getSidebarDefaultOpenKeys(tree: SidebarTreeNode[], currentSlug?: string): string[] {
  if (!currentSlug) {
    return [];
  }

  const openKeys: string[] = [];

  function visit(nodes: SidebarTreeNode[], ancestors: string[]): boolean {
    for (const node of nodes) {
      if (node.slug === currentSlug) {
        openKeys.push(...ancestors);
        return true;
      }

      if (node.children.length > 0 && visit(node.children, [...ancestors, node.key])) {
        return true;
      }
    }

    return false;
  }

  visit(tree, []);

  return openKeys;
}
