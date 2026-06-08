"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-500">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
});

function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

interface CodeEditorProps {
  path?: string;
  content?: string;
}

export default function CodeEditor({ path, content }: CodeEditorProps) {
  if (!path || content === undefined) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select a file to view its contents
      </div>
    );
  }

  return (
    <MonacoEditor
      height="100%"
      theme="vs-dark"
      path={path}
      language={languageFromPath(path)}
      value={content}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
        renderLineHighlight: "none",
      }}
    />
  );
}
