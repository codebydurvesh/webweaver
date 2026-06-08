"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Code2, Eye, Loader2, Sparkles } from "lucide-react";
import StepsList from "@/components/StepsList";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import PreviewFrame from "@/components/PreviewFrame";
import { mockFileTree, mockSteps, previewHtml } from "@/lib/mockData";
import type { FileNode } from "@/types";

type Tab = "code" | "preview";

function findFirstFile(nodes: FileNode[]): FileNode | undefined {
  for (const node of nodes) {
    if (node.type === "file") return node;
    if (node.children) {
      const found = findFirstFile(node.children);
      if (found) return found;
    }
  }
  return undefined;
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "Your website";

  const defaultFile = useMemo(() => findFirstFile(mockFileTree), []);
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>(
    defaultFile
  );
  const [tab, setTab] = useState<Tab>("code");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100"
        >
          <Sparkles className="h-4 w-4 text-indigo-400" />
          Webweaver
        </Link>
        <span className="text-zinc-700">/</span>
        <p className="truncate text-sm text-zinc-400" title={prompt}>
          {prompt}
        </p>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="w-1/4 min-w-0 border-r border-zinc-800 bg-zinc-950">
          <StepsList steps={mockSteps} />
        </section>

        <section className="w-1/4 min-w-0 border-r border-zinc-800 bg-zinc-950">
          <FileExplorer
            tree={mockFileTree}
            selectedPath={selectedFile?.path}
            onSelect={setSelectedFile}
          />
        </section>

        <section className="flex w-1/2 min-w-0 flex-col bg-zinc-900">
          {/* Tabs */}
          <div className="flex shrink-0 items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-2">
            <TabButton
              active={tab === "code"}
              onClick={() => setTab("code")}
              icon={<Code2 className="h-4 w-4" />}
              label="Code"
            />
            <TabButton
              active={tab === "preview"}
              onClick={() => setTab("preview")}
              icon={<Eye className="h-4 w-4" />}
              label="Preview"
            />
            {selectedFile && tab === "code" && (
              <span className="ml-auto truncate pr-2 text-xs text-zinc-500">
                {selectedFile.path}
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1">
            {tab === "code" ? (
              <CodeEditor
                path={selectedFile?.path}
                content={selectedFile?.content}
              />
            ) : (
              <PreviewFrame html={previewHtml} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-500 text-zinc-100"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
