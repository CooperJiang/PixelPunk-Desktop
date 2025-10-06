import type { FileInfo } from "@/api/types";

export interface FileViewerProps {
  file: FileInfo | null;
  files?: FileInfo[];
  initialIndex?: number;
}

export interface FileViewerEmits {
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "change", file: FileInfo, index: number): void;
  (e: "load", file: FileInfo): void;
  (e: "error", data: { file: FileInfo; event: Event }): void;
}
