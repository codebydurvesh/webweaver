"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

const SUGGESTIONS = [
  "A personal portfolio with a projects grid",
  "A SaaS landing page with pricing tiers",
  "A todo app with dark mode",
  "A blog homepage with featured posts",
];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    router.push(`/builder?prompt=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[120px]"
      />

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          AI website builder
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
            Build a website by
            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}
              just describing it
            </span>
          </h1>
          <p className="max-w-md text-pretty text-lg text-zinc-400">
            Type what you want to build. Watch it come together step by step,
            with the code right next to it.
          </p>
        </div>

        <div className="w-full">
          <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 shadow-2xl shadow-black/40 transition-colors focus-within:border-indigo-500/60">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              rows={3}
              placeholder="Create a landing page for a coffee subscription startup..."
              className="w-full resize-none bg-transparent px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-xs text-zinc-600">
                Press{" "}
                <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                  Enter
                </kbd>{" "}
                to build
              </span>
              <button
                onClick={submit}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                <Wand2 className="h-4 w-4" />
                Generate
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
            >
              {s}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
