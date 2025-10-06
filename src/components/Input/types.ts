import type { Component } from "vue";

export type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "textarea";

export type InputSize = "small" | "medium" | "large";

export interface InputProps {
  /** 输入框值 */
  modelValue?: string | number;
  /** 输入框类型 */
  type?: InputType;
  /** 尺寸 */
  size?: InputSize;
  /** 占位符 */
  placeholder?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 只读状态 */
  readonly?: boolean;
  /** 是否可清除 */
  clearable?: boolean;
  /** 自动聚焦 */
  autofocus?: boolean;
  /** 自动完成 */
  autocomplete?: string;
  /** name属性 */
  name?: string;
  /** 最大长度 */
  maxlength?: number;
  /** 文本域行数 */
  rows?: number;
  /** 错误状态 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 前缀图标组件 */
  prefixIcon?: Component;
  /** 后缀图标组件 */
  suffixIcon?: Component;
  /** input id */
  inputId?: string;
  /** 自定义宽度 */
  width?: string;
  /** 自定义高度 */
  height?: string;
}

export interface InputEmits {
  (e: "update:modelValue", value: string | number): void;
  (e: "input", event: Event): void;
  (e: "change", event: Event): void;
  (e: "focus", event: FocusEvent): void;
  (e: "blur", event: FocusEvent): void;
  (e: "keyup", event: KeyboardEvent): void;
  (e: "keydown", event: KeyboardEvent): void;
  (e: "enter", event: KeyboardEvent): void;
  (e: "clear"): void;
}
