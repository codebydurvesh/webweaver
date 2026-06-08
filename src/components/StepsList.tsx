import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Step } from "@/types";

function StatusIcon({ status }: { status: Step["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />;
  }
  if (status === "in-progress") {
    return (
      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-indigo-400" />
    );
  }
  return <Circle className="h-5 w-5 shrink-0 text-zinc-600" />;
}

export default function StepsList({ steps }: { steps: Step[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Build steps</h2>
        <p className="text-xs text-zinc-500">
          {steps.filter((s) => s.status === "completed").length} of{" "}
          {steps.length} complete
        </p>
      </div>

      <ol className="flex-1 space-y-1 overflow-y-auto p-3">
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
              <StatusIcon status={step.status} />
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.status === "pending"
                      ? "text-zinc-500"
                      : "text-zinc-100"
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-xs text-zinc-500">
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
