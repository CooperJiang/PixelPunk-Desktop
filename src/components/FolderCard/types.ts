import type { FolderInfo } from "@/api/types";

export interface FolderCardProps {
  folder: FolderInfo;
}

export interface FolderCardEmits {
  (e: "click", folder: FolderInfo): void;
  (e: "edit", folder: FolderInfo): void;
  (e: "delete", folder: FolderInfo): void;
  (e: "toggle-visibility", folder: FolderInfo, event: MouseEvent): void;
  (e: "contextmenu", folder: FolderInfo, event: MouseEvent): void;
}
