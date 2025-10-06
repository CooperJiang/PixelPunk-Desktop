export interface DropdownOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
  icon?: string; // 图标类名
  [key: string]: unknown;
}

export interface DropdownProps {
  modelValue:
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean>;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  maxHeight?: string;
  clearable?: boolean;
  width?: string;
  height?: string;
}

export interface DropdownEmits {
  (
    e: "update:modelValue",
    value:
      | string
      | number
      | boolean
      | null
      | undefined
      | Array<string | number | boolean>,
  ): void;
  (
    e: "change",
    value:
      | string
      | number
      | boolean
      | null
      | undefined
      | Array<string | number | boolean>,
  ): void;
}
