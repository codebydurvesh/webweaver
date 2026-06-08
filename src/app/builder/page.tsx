"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Code2, Eye, Loader2, Sparkles } from "lucide-react";
import StepsList from "@/components/StepsList";
import FileExplorer from "@/components/FileExplorer";
import CodeEditor from "@/components/CodeEditor";
import PreviewPanel from "@/components/PreviewPanel";
import RefineBox from "@/components/RefineBox";
import ResizablePanels from "@/components/ResizablePanels";
import { useBuilder } from "@/hooks/useBuilder";
import { countFiles } from "@/lib/fileTree";

type Tab = "code" | "preview";

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";

  // No prompt → nothing to build; send the user back to the landing page.
  useEffect(() => {
    if (!prompt) router.replace("/");
  }, [prompt, router]);

  const {
    steps,
    files,
    selectedFile,
    selectedPath,
    status,
    error,
    isBusy,
    selectFile,
    sendRefinement,
    retry,
  } = useBuilder(prompt);

  const [tab, setTab] = useState<Tab>("code");
  const streaming = status === "streaming";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
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
          {prompt || "Untitled"}
        </p>
        {status === "initializing" && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Setting up…
          </span>
        )}
      </header>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 border-b border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <button
            onClick={() => retry()}
            className="rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-200 hover:bg-red-900/40"
          >
            Retry
          </button>
        </div>
      )}

      {/* Resizable 25% / 25% / 50% layout — drag the dividers to resize */}
      <ResizablePanels
        className="min-h-0 flex-1"
        initialSizes={[25, 25, 50]}
        minSizes={[15, 12, 30]}
      >
        {/* Steps (with refine box pinned to the bottom) */}
        <section className="flex h-full flex-col bg-zinc-950">
          <div className="min-h-0 flex-1">
            <StepsList steps={steps} streaming={streaming} />
          </div>
          <RefineBox onSend={sendRefinement} disabled={isBusy} />
        </section>

        {/* File explorer */}
        <section className="h-full bg-zinc-950">
          <FileExplorer
            tree={files}
            selectedPath={selectedPath}
            onSelect={(node) => selectFile(node.path)}
          />
        </section>

        {/* Code / Preview */}
        <section className="flex h-full flex-col bg-zinc-900">
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
            {tab === "code" && selectedFile && (
              <span className="ml-auto truncate pr-2 font-mono text-xs text-zinc-500">
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
              <PreviewPanel fileCount={countFiles(files)} />
            )}
          </div>
        </section>
      </ResizablePanels>
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
