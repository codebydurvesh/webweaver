interface PreviewFrameProps {
  html: string;
}

export default function PreviewFrame({ html }: PreviewFrameProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      <iframe
        title="Website preview"
        srcDoc={html}
        className="h-full w-full border-0"
        sandbox="allow-scripts"
      />
    </div>
  );
}
