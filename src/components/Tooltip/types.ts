export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

export type TooltipTrigger = 'hover' | 'click' | 'manual';

export interface TooltipProps {
  /** 提示内容 */
  content?: string;
  /** 显示位置 */
  placement?: TooltipPlacement;
  /** 触发方式 */
  trigger?: TooltipTrigger;
  /** 是否禁用 */
  disabled?: boolean;
  /** 偏移量 */
  offset?: number;
  /** 显示延迟（毫秒） */
  showDelay?: number;
  /** 隐藏延迟（毫秒） */
  hideDelay?: number;
  /** 最大宽度 */
  maxWidth?: string;
}
