import type { Component } from "vue";

export type ButtonType =
  | "primary"
  | "secondary"
  | "outlined"
  | "text"
  | "danger"
  | "success"
  | "warning"
  | "info";

export type ButtonSize = "small" | "medium" | "large";

export type LoadingMode = "inline" | "replace";

export interface ButtonProps {
  /** 按钮类型 */
  type?: ButtonType;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 左侧图标组件 */
  icon?: Component;
  /** 右侧图标组件 */
  rightIcon?: Component;
  /** 加载状态 */
  loading?: boolean;
  /** 加载模式 - inline: 图标内联, replace: 替换内容 */
  loadingMode?: LoadingMode;
  /** 禁用状态 */
  disabled?: boolean;
  /** 块级按钮（占满容器宽度） */
  block?: boolean;
  /** 自定义类名 */
  customClass?: string;
}

export interface ButtonEmits {
  (e: "click", event: MouseEvent): void;
  (e: "mouseover", event: MouseEvent): void;
  (e: "mouseleave", event: MouseEvent): void;
}
