"use client";

import { useEffect, useRef, useState } from "react";
import { parseArtifact } from "@/lib/parseArtifact";
import { buildFileTree, findNode } from "@/lib/fileTree";
import type { FileNode, LlmMessage, ParsedArtifact, Step } from "@/types";

export type BuilderStatus = "initializing" | "streaming" | "ready" | "error";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function useBuilder(prompt: string) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>();
  const [status, setStatus] = useState<BuilderStatus>("initializing");
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  const filesRef = useRef<Map<string, string>>(new Map());
  const committedStepsRef = useRef<Step[]>([]);
  const messagesRef = useRef<LlmMessage[]>([]);
  const autoFollowRef = useRef(true);
  const didInitRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);


  function buildSteps(
    artifact: ParsedArtifact,
    idBase: number,
    existingPaths: Set<string>
  ): Step[] {
    const out: Step[] = [];
    let id = idBase;

    if (artifact.title) {
      out.push({
        id: id++,
        title: artifact.title,
        status: "completed",
        kind: "title",
      });
    }

    for (const action of artifact.actions) {
      const stepStatus = action.complete ? "completed" : "in-progress";
      if (action.type === "file" && action.filePath) {
        const verb = existingPaths.has(action.filePath) ? "Update" : "Create";
        out.push({
          id: id++,
          title: `${verb} ${action.filePath}`,
          description: action.filePath,
          status: stepStatus,
          kind: "file",
          path: action.filePath,
          code: action.content,
        });
      } else if (action.type === "shell") {
        const cmd = action.content.trim();
        out.push({
          id: id++,
          title: "Run command",
          description: cmd,
          status: stepStatus,
          kind: "shell",
          code: cmd,
        });
      }
    }
    return out;
  }

  function applyResponse(
    raw: string,
    idBase: number,
    existingPaths: Set<string>
  ) {
    const artifact = parseArtifact(raw);

    let activeFilePath: string | undefined;
    for (const action of artifact.actions) {
      if (action.type === "file" && action.filePath) {
        filesRef.current.set(action.filePath, action.content);
        activeFilePath = action.filePath; // last file wins as the "active" one
      }
    }

    setFiles(buildFileTree(filesRef.current));
    setSteps([...committedStepsRef.current, ...buildSteps(artifact, idBase, existingPaths)]);

    if (autoFollowRef.current && activeFilePath) {
      setSelectedPath(activeFilePath);
    }
  }


  async function streamChat() {
    setStatus("streaming");
    setError(null);
    autoFollowRef.current = true;

    const idBase = committedStepsRef.current.length;
    const existingPaths = new Set(filesRef.current.keys());

    const controller = new AbortController();
    abortRef.current = controller;

    let raw = "";
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ messages: messagesRef.current }),
      signal: controller.signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value, { stream: true });
      applyResponse(raw, idBase, existingPaths);
    }
    raw += decoder.decode();
    applyResponse(raw, idBase, existingPaths);

    const finalSteps = buildSteps(parseArtifact(raw), idBase, existingPaths).map(
      (s) => ({ ...s, status: "completed" as const })
    );
    committedStepsRef.current = [...committedStepsRef.current, ...finalSteps];
    setSteps([...committedStepsRef.current]);
    messagesRef.current = [
      ...messagesRef.current,
      { role: "assistant", content: raw },
    ];
    setStatus("ready");
    setGeneration((g) => g + 1);
  }

  async function initialize() {
    try {
      setStatus("initializing");
      setError(null);
      filesRef.current = new Map();
      committedStepsRef.current = [];
      messagesRef.current = [];
      setFiles([]);
      setSteps([]);
      setSelectedPath(undefined);

      const tplRes = await fetch("/api/template", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ prompt }),
      });
      if (!tplRes.ok) {
        const data = await tplRes.json().catch(() => null);
        throw new Error(
          data?.error
            ? `Could not start project: ${data.error}`
            : `Template request failed (${tplRes.status})`
        );
      }
      const tpl = await tplRes.json();
      const uiPrompt = Array.isArray(tpl.uiPrompt)
        ? tpl.uiPrompt[0]
        : tpl.uiPrompt;

      const scaffold = parseArtifact(uiPrompt ?? "");
      let count = 0;
      let defaultPath: string | undefined;
      for (const action of scaffold.actions) {
        if (action.type === "file" && action.filePath) {
          filesRef.current.set(action.filePath, action.content);
          count++;
          if (!defaultPath || action.filePath.endsWith("App.tsx")) {
            defaultPath = action.filePath;
          }
        }
      }

      committedStepsRef.current = [
        {
          id: 0,
          title: "Initialized project template",
          description: `${count} starter files`,
          status: "completed",
          kind: "title",
        },
      ];
      setFiles(buildFileTree(filesRef.current));
      setSteps([...committedStepsRef.current]);
      setSelectedPath(defaultPath);

      const prompts: string[] = tpl.prompts ?? [];
      messagesRef.current = [
        ...prompts.map((content) => ({ role: "user" as const, content })),
        { role: "user" as const, content: prompt },
      ];
      await streamChat();
    } catch (e) {
      handleError(e);
    }
  }

  function handleError(e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    setError(e instanceof Error ? e.message : "Something went wrong");
    setStatus("error");
  }


  async function sendRefinement(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === "streaming" || status === "initializing") return;
    messagesRef.current = [
      ...messagesRef.current,
      { role: "user", content: trimmed },
    ];
    try {
      await streamChat();
    } catch (e) {
      handleError(e);
    }
  }

  function selectFile(path: string) {
    autoFollowRef.current = false; // stop following the stream once user picks
    setSelectedPath(path);
  }

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void initialize();
  }, []);

  const selectedFile = findNode(files, selectedPath);

  return {
    steps,
    files,
    selectedFile,
    selectedPath,
    status,
    error,
    generation,
    isBusy: status === "initializing" || status === "streaming",
    selectFile,
    sendRefinement,
    retry: initialize,
  };
}
