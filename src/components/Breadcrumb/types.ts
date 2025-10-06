import type { FolderInfo } from "@/api/types";

export interface BreadcrumbProps {
  /* Breadcrumb items list */
  items: FolderInfo[];
  /* Maximum items to display before collapse */
  maxItems?: number;
  /* Visible items at start when collapsed */
  startVisible?: number;
  /* Visible items at end when collapsed */
  endVisible?: number;
}

export interface BreadcrumbEmits {
  (e: "click", folder: FolderInfo | null): void;
}
