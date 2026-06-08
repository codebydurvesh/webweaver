export type StepStatus = "pending" | "in-progress" | "completed";

/** What kind of action a build step represents. */
export type StepKind = "title" | "file" | "shell";

export interface Step {
  id: number;
  title: string;
  description?: string;
  status: StepStatus;
  kind?: StepKind;
  /** For file steps: the file path that was created/updated. */
  path?: string;
  /** Raw content (file body or shell command). */
  code?: string;
}

export type FileNodeType = "file" | "folder";

export interface FileNode {
  name: string;
  type: FileNodeType;
  /** Full path from project root, used as a stable key. */
  path: string;
  /** File contents — only present for files. */
  content?: string;
  /** Child nodes — only present for folders. */
  children?: FileNode[];
}

/** A single <boltAction> extracted from the model's artifact. */
export interface ParsedAction {
  type: "file" | "shell";
  /** Present for file actions. */
  filePath?: string;
  content: string;
  /** True once the closing </boltAction> tag has been seen. */
  complete: boolean;
}

export interface ParsedArtifact {
  title?: string;
  actions: ParsedAction[];
}

/** Chat message exchanged with the LLM. */
export interface LlmMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
