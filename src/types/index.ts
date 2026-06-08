export type StepStatus = "pending" | "in-progress" | "completed";

export interface Step {
  id: number;
  title: string;
  description?: string;
  status: StepStatus;
}

export type FileNodeType = "file" | "folder";

export interface FileNode {
  name: string;
  type: FileNodeType;
  path: string;
  content?: string;
  children?: FileNode[];
}
