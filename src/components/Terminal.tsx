"use client";

import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";

export interface TerminalHandle {
  write: (data: string) => void;
  onData: (cb: (data: string) => void) => void;
  onResize: (cb: (cols: number, rows: number) => void) => void;
  readonly cols: number;
  readonly rows: number;
}

export default function Terminal({
  onReady,
}: {
  onReady: (handle: TerminalHandle) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let dispose: (() => void) | undefined;

    (async () => {
      // xterm touches the DOM — load it only on the client.
      const [{ Terminal: XTerm }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      if (disposed || !containerRef.current) return;

      const term = new XTerm({
        convertEol: true,
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        theme: {
          background: "#09090b",
          foreground: "#e4e4e7",
          cursor: "#a5b4fc",
          selectionBackground: "#3f3f46",
          black: "#18181b",
          brightBlack: "#52525b",
        },
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(containerRef.current);
      try {
        fit.fit();
      } catch {
        // container may not be measured yet — ResizeObserver will refit
      }

      let resizeCb: ((cols: number, rows: number) => void) | undefined;
      const ro = new ResizeObserver(() => {
        try {
          fit.fit();
          resizeCb?.(term.cols, term.rows);
        } catch {
          // ignore transient layout errors
        }
      });
      ro.observe(containerRef.current);

      const handle: TerminalHandle = {
        write: (data) => term.write(data),
        onData: (cb) => term.onData(cb),
        onResize: (cb) => {
          resizeCb = cb;
        },
        get cols() {
          return term.cols;
        },
        get rows() {
          return term.rows;
        },
      };
      onReady(handle);

      dispose = () => {
        ro.disconnect();
        term.dispose();
      };
    })();

    return () => {
      disposed = true;
      dispose?.();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full overflow-hidden" />;
}
