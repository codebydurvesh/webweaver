"use client";

import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface RefineBoxProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

/** Follow-up prompt box — lets the user refine the generated project. */
export default function RefineBox({ onSend, disabled }: RefineBoxProps) {
  const [text, setText] = useState("");

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-zinc-800 p-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 transition-colors focus-within:border-indigo-500/60">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            disabled ? "Generating…" : "Refine the project — e.g. add a footer"
          }
          disabled={disabled}
          className="w-full resize-none bg-transparent px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={submit}
            disabled={disabled || !text.trim()}
            aria-label="Send refinement"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
