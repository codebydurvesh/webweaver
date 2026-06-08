"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WebContainer, WebContainerProcess } from "@webcontainer/api";
import {
  detectStartScript,
  getWebContainer,
  toFileSystemTree,
} from "@/lib/webcontainer";
import { findNode } from "@/lib/fileTree";
import type { TerminalHandle } from "@/components/Terminal";
import type { FileNode } from "@/types";

export type WcStatus =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

interface Params {
  files: FileNode[];
  generation: number;
  enabled: boolean;
}

export function useWebContainer({ files, generation, enabled }: Params) {
  const [status, setStatus] = useState<WcStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [terminalReady, setTerminalReady] = useState(false);

  const wcRef = useRef<WebContainer | null>(null);
  const termRef = useRef<TerminalHandle | null>(null);
  const shellRef = useRef<WebContainerProcess | null>(null);
  const shellInputRef = useRef<WritableStreamDefaultWriter<string> | null>(null);
  const startedRef = useRef(false);
  const lastSyncedGenRef = useRef(0);
  const lastPkgRef = useRef<string | undefined>(undefined);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const termWrite = useCallback((data: string) => {
    termRef.current?.write(data);
  }, []);

  const attachTerminal = useCallback((handle: TerminalHandle) => {
    termRef.current = handle;
    handle.onResize((cols, rows) => shellRef.current?.resize({ cols, rows }));
    setTerminalReady(true);
  }, []);

  async function startShell(wc: WebContainer) {
    const t = termRef.current;
    if (!t) return;
    termWrite(
      "\r\n\x1b[2m> Shell ready — run Linux commands below (e.g. ls, cat, npm install)\x1b[0m\r\n"
    );
    const shell = await wc.spawn("jsh", {
      terminal: { cols: t.cols || 80, rows: t.rows || 24 },
    });
    shellRef.current = shell;
    void shell.output.pipeTo(new WritableStream({ write: (d) => termWrite(d) }));
    const input = shell.input.getWriter();
    shellInputRef.current = input;
    t.onData((d) => void input.write(d));
  }

  async function run() {
    try {
      setStatus("booting");
      termWrite("\x1b[2m> Booting WebContainer…\x1b[0m\r\n");
      const wc = await getWebContainer();
      wcRef.current = wc;

      wc.on("server-ready", (_port, url) => {
        setPreviewUrl(url);
        setStatus("ready");
        termWrite(`\r\n\x1b[32m> Preview ready: ${url}\x1b[0m\r\n`);
      });
      wc.on("error", (err) => {
        setError(err.message);
        setStatus("error");
        termWrite(`\r\n\x1b[31m> Error: ${err.message}\x1b[0m\r\n`);
      });

      await wc.mount(toFileSystemTree(filesRef.current));
      lastPkgRef.current = findNode(filesRef.current, "package.json")?.content;

      // Install dependencies
      setStatus("installing");
      termWrite("\r\n\x1b[36m$ npm install\x1b[0m\r\n");
      const install = await wc.spawn("npm", ["install"]);
      void install.output.pipeTo(
        new WritableStream({ write: (d) => termWrite(d) })
      );
      const code = await install.exit;
      if (code !== 0) throw new Error(`npm install exited with code ${code}`);

      // Start the dev server (Vite for React projects)
      const script = detectStartScript(filesRef.current);
      if (script) {
        setStatus("starting");
        termWrite(`\r\n\x1b[36m$ npm run ${script}\x1b[0m\r\n`);
        const dev = await wc.spawn("npm", ["run", script]);
        void dev.output.pipeTo(
          new WritableStream({ write: (d) => termWrite(d) })
        );
      } else {
        setStatus("ready");
        termWrite("\r\n\x1b[33m> No dev script found — skipping server.\x1b[0m\r\n");
      }

      await startShell(wc);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
      termWrite(`\r\n\x1b[31m> ${msg}\x1b[0m\r\n`);
    }
  }

  async function syncFiles() {
    const wc = wcRef.current;
    if (!wc) return;
    try {
      await wc.mount(toFileSystemTree(filesRef.current));
      termWrite("\r\n\x1b[2m> Files updated (hot reload)\x1b[0m\r\n");

      const pkg = findNode(filesRef.current, "package.json")?.content;
      if (pkg && pkg !== lastPkgRef.current) {
        lastPkgRef.current = pkg;
        termWrite("\r\n\x1b[2m> package.json changed — reinstalling…\x1b[0m\r\n");
        await shellInputRef.current?.write("npm install\r");
      }
    } catch {
      // mount can briefly race with the dev server — safe to ignore
    }
  }

  useEffect(() => {
    if (!enabled || !terminalReady || generation < 1) return;
    if (startedRef.current) return;
    startedRef.current = true;
    lastSyncedGenRef.current = generation;
    void run();
  }, [enabled, terminalReady, generation]);

  useEffect(() => {
    if (!startedRef.current) return;
    if (generation <= lastSyncedGenRef.current) return;
    lastSyncedGenRef.current = generation;
    void syncFiles();
  }, [generation]);

  return { status, previewUrl, error, attachTerminal };
}
