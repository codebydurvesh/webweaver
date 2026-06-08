import {
  CheckCircle2,
  Circle,
  FilePlus2,
  FolderTree,
  Loader2,
  Terminal,
} from "lucide-react";
import type { Step } from "@/types";

function KindIcon({ step }: { step: Step }) {
  if (step.status === "in-progress") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-400" />;
  }
  if (step.status === "pending") {
    return <Circle className="h-4 w-4 shrink-0 text-zinc-600" />;
  }
  // completed — icon hints at what the step did
  if (step.kind === "shell") {
    return <Terminal className="h-4 w-4 shrink-0 text-emerald-500" />;
  }
  if (step.kind === "title") {
    return <FolderTree className="h-4 w-4 shrink-0 text-emerald-500" />;
  }
  if (step.kind === "file") {
    return <FilePlus2 className="h-4 w-4 shrink-0 text-emerald-500" />;
  }
  return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />;
}

interface StepsListProps {
  steps: Step[];
  streaming?: boolean;
}

export default function StepsList({ steps, streaming }: StepsListProps) {
  const completed = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Build steps</h2>
          <p className="text-xs text-zinc-500">
            {completed} of {steps.length} complete
          </p>
        </div>
        {streaming && (
          <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Building
          </span>
        )}
      </div>

      <ol className="flex-1 space-y-1 overflow-y-auto p-3">
        {steps.length === 0 && (
          <li className="px-1 py-2 text-sm text-zinc-500">
            {streaming ? "Thinking…" : "No steps yet."}
          </li>
        )}
        {steps.map((step) => {
          const active = step.status === "in-progress";
          return (
            <li
              key={step.id}
              className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                active
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-transparent hover:bg-zinc-900"
              }`}
            >
              <span className="mt-0.5">
                <KindIcon step={step} />
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-medium ${
                    step.status === "pending" ? "text-zinc-500" : "text-zinc-100"
                  }`}
                >
                  {step.title}
                </p>
                {step.description && step.kind !== "file" && (
                  <p className="mt-0.5 truncate font-mono text-xs text-zinc-500">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
