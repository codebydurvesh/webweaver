"use client";

import { useState } from "react";
import { GraduationCap, X } from "lucide-react";

/**
 * A small fixed badge pinned to the corner of the screen, making it clear that
 * this is a personal learning project — not a product. Clicking it reveals a
 * short note about why it exists and the educational use of WebContainers.
 */
export default function EduBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-3 right-3 z-50 print:hidden">
      {open && (
        <div className="mb-2 w-72 rounded-xl border border-zinc-800 bg-zinc-900/95 p-4 text-sm shadow-2xl shadow-black/50 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-zinc-100">
              Educational project
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded p-0.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-zinc-400">
            This is a personal project built purely to learn how AI website
            builders work. It is not a product and is not for commercial use.
          </p>
          <p className="mt-2 text-zinc-400">
            It uses{" "}
            <a
              href="https://webcontainers.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline-offset-2 hover:underline"
            >
              StackBlitz WebContainers
            </a>{" "}
            for in-browser code execution, for educational purposes only.
            All trademarks belong to their respective owners.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-400 shadow-lg shadow-black/30 backdrop-blur transition-colors hover:border-zinc-700 hover:text-zinc-200"
      >
        <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
        For educational purposes only
      </button>
    </div>
  );
}
