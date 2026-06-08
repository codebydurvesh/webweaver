"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder,
  FolderOpen,
} from "lucide-react";
import type { FileNode } from "@/types";

interface FileExplorerProps {
  tree: FileNode[];
  selectedPath?: string;
  onSelect: (file: FileNode) => void;
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FileNode;
  depth: number;
  selectedPath?: string;
  onSelect: (file: FileNode) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const indent = { paddingLeft: `${depth * 14 + 8}px` };

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          style={indent}
          className="flex w-full items-center gap-1.5 py-1.5 pr-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/60"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
          )}
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-indigo-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-indigo-400" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {open && node.children && (
          <div>
            {sortNodes(node.children).map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const selected = node.path === selectedPath;
  return (
    <button
      onClick={() => onSelect(node)}
      style={indent}
      className={`flex w-full items-center gap-1.5 py-1.5 pr-2 text-sm transition-colors ${
        selected
          ? "bg-indigo-500/15 text-indigo-200"
          : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      }`}
    >
      <span className="w-4 shrink-0" />
      <FileIcon className="h-4 w-4 shrink-0 text-zinc-500" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export default function FileExplorer({
  tree,
  selectedPath,
  onSelect,
}: FileExplorerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Files</h2>
        <p className="text-xs text-zinc-500">Click a file to view it</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {sortNodes(tree).map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
