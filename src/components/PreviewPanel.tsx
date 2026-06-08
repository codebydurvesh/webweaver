import { MonitorPlay } from "lucide-react";

/**
 * Placeholder for the live preview. The generated project will be booted in a
 * WebContainer here in a later iteration; until then we explain what the tab
 * will do rather than fake a render.
 */
export default function PreviewPanel({ fileCount }: { fileCount: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-zinc-950 px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <MonitorPlay className="h-7 w-7 text-indigo-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-zinc-200">
          Live preview coming soon
        </h3>
        <p className="max-w-sm text-sm text-zinc-500">
          {fileCount > 0
            ? `${fileCount} file${fileCount === 1 ? "" : "s"} generated. They'll run in an in-browser WebContainer here so you can see the site live.`
            : "Once the project is generated it will run in an in-browser WebContainer here."}
        </p>
      </div>
      <p className="text-xs text-zinc-600">
        For now, switch to the <span className="text-zinc-400">Code</span> tab to
        inspect the generated files.
      </p>
    </div>
  );
}
