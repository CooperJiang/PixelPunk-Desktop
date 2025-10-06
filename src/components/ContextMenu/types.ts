export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: string; // Lucide icon name
  disabled?: boolean;
  divided?: boolean; // Show divider
  children?: ContextMenuItem[];
  shortcut?: string;
  danger?: boolean;
  onClick?: (item: ContextMenuItem, event: MouseEvent) => void;
  hasAsyncChildren?: boolean;
  loadChildren?: () => Promise<ContextMenuItem[]>;
  isLoading?: boolean;
  loadError?: string;
}

export interface ContextMenuProps {
  modelValue: boolean;
  items: ContextMenuItem[];
  x?: number;
  y?: number;
  trigger?: HTMLElement;
  zIndex?: number;
  className?: string;
  placement?: "auto" | "top" | "bottom" | "left" | "right";
}

export interface ContextMenuEmits {
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "item-click", item: ContextMenuItem, event: MouseEvent): void;
}

export interface MenuPosition {
  x: number;
  y: number;
  placement: "top" | "bottom" | "left" | "right";
}
