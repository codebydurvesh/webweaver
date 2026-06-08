import { AlertTriangle, Loader2, MonitorPlay } from "lucide-react";
import type { WcStatus } from "@/hooks/useWebContainer";

const STATUS_LABEL: Record<WcStatus, string> = {
  idle: "Waiting for the project to finish generating…",
  booting: "Booting WebContainer…",
  installing: "Installing dependencies…",
  starting: "Starting the dev server…",
  ready: "Ready",
  error: "Something went wrong",
};

export default function PreviewPanel({
  url,
  status,
  error,
}: {
  url: string | null;
  status: WcStatus;
  error: string | null;
}) {
  // Live preview from the WebContainer dev server.
  if (url) {
    return (
      <iframe
        title="Live preview"
        src={url}
        className="h-full w-full border-0 bg-white"
        allow="cross-origin-isolated"
      />
    );
  }

  if (status === "error") {
    return (
      <Centered>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-900/50 bg-red-950/40">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200">
          Preview failed to start
        </h3>
        <p className="max-w-sm font-mono text-xs text-red-300/80">
          {error ?? "Unknown error"}
        </p>
        <p className="text-xs text-zinc-600">Check the terminal for details.</p>
      </Centered>
    );
  }

  // Booting / installing / starting / idle
  const spinning =
    status === "booting" || status === "installing" || status === "starting";

  return (
    <Centered>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        {spinning ? (
          <Loader2 className="h-7 w-7 animate-spin text-indigo-400" />
        ) : (
          <MonitorPlay className="h-7 w-7 text-indigo-400" />
        )}
      </div>
      <h3 className="text-base font-semibold text-zinc-200">
        {spinning ? "Building your preview" : "Live preview"}
      </h3>
      <p className="max-w-sm text-sm text-zinc-500">{STATUS_LABEL[status]}</p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 px-8 text-center">
      {children}
    </div>
  );
}
