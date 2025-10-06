import type { FileInfo } from "@/api/types";

export interface FileCardProps {
  file: FileInfo;
  batchMode?: boolean;
  selected?: boolean;
}

export interface FileCardEmits {
  click: [file: FileInfo];
  preview: [file: FileInfo];
  delete: [file: FileInfo];
  "toggle-visibility": [file: FileInfo, event: MouseEvent];
  "toggle-select": [fileId: string];
  "copy-link": [file: FileInfo];
  download: [file: FileInfo];
  contextmenu: [file: FileInfo, event: MouseEvent];
}
