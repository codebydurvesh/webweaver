import type {
  FileSystemTree,
  WebContainer as WebContainerInstance,
} from "@webcontainer/api";
import type { FileNode } from "@/types";
import { findNode } from "./fileTree";

let bootPromise: Promise<WebContainerInstance> | null = null;

export function getWebContainer(): Promise<WebContainerInstance> {
  if (!bootPromise) {
    bootPromise = (async () => {
      const { WebContainer } = await import("@webcontainer/api");
      return WebContainer.boot({
        coep: "credentialless",
        forwardPreviewErrors: true,
        workdirName: "project",
      });
    })();
  }
  return bootPromise;
}

export function toFileSystemTree(nodes: FileNode[]): FileSystemTree {
  const tree: FileSystemTree = {};
  for (const node of nodes) {
    if (node.type === "folder") {
      tree[node.name] = { directory: toFileSystemTree(node.children ?? []) };
    } else {
      tree[node.name] = { file: { contents: node.content ?? "" } };
    }
  }
  return tree;
}

export function detectStartScript(nodes: FileNode[]): string | null {
  const pkg = findNode(nodes, "package.json");
  if (!pkg?.content) return null;
  try {
    const scripts = (JSON.parse(pkg.content).scripts ?? {}) as Record<
      string,
      string
    >;
    if (scripts.dev) return "dev";
    if (scripts.start) return "start";
    return null;
  } catch {
    return null;
  }
}
