import type { FileNode } from "@/types";

/**
 * Turn a flat path→content map into a nested folder/file tree.
 *
 * Paths use "/" separators (e.g. "src/components/Header.tsx"). Intermediate
 * folders are created on demand. Rebuilding from the map on every stream chunk
 * keeps the tree free of stale or duplicated nodes.
 */
export function buildFileTree(files: Map<string, string>): FileNode[] {
  const root: FileNode[] = [];

  for (const [path, content] of files) {
    const parts = path.split("/").filter(Boolean);
    let level = root;
    let currentPath = "";

    parts.forEach((part, i) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = i === parts.length - 1;
      let node = level.find((n) => n.name === part);

      if (!node) {
        node = isFile
          ? { name: part, type: "file", path: currentPath, content }
          : { name: part, type: "folder", path: currentPath, children: [] };
        level.push(node);
      } else if (isFile) {
        // File reappeared in a later turn — keep the freshest content.
        node.content = content;
      }

      if (!isFile) {
        node.children ??= [];
        level = node.children;
      }
    });
  }

  return root;
}

/** Count the file (non-folder) nodes in a tree. */
export function countFiles(nodes: FileNode[]): number {
  let total = 0;
  for (const node of nodes) {
    if (node.type === "file") total++;
    else if (node.children) total += countFiles(node.children);
  }
  return total;
}

/** Depth-first lookup of a node by its full path. */
export function findNode(
  nodes: FileNode[],
  path: string | undefined
): FileNode | undefined {
  if (!path) return undefined;
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}
