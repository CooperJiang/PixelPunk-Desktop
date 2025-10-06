/**
 * 对话框组件属性
 */
export interface DialogProps {
  /**
   * 控制对话框的显示状态
   */
  modelValue: boolean;

  /**
   * 对话框标题
   */
  title?: string;

  /**
   * 对话框宽度
   */
  width?: string;

  /**
   * 对话框高度
   */
  height?: string;

  /**
   * 对话框最大宽度
   */
  maxWidth?: string;

  /**
   * 对话框最大高度
   */
  maxHeight?: string;

  /**
   * 是否显示默认底部按钮
   */
  showDefaultFooter?: boolean;

  /**
   * 是否显示关闭按钮
   */
  showCloseButton?: boolean;

  /**
   * 是否去除内容区域的内边距
   */
  noPadding?: boolean;

  /**
   * 是否去除内容区域的滚动
   */
  noScroll?: boolean;

  /**
   * 是否显示底部按钮
   */
  showFooter?: boolean;

  /**
   * 取消按钮文本
   */
  cancelText?: string;

  /**
   * 确认按钮文本
   */
  confirmText?: string;

  /**
   * 是否显示确认按钮加载状态
   */
  loading?: boolean;

  /**
   * 是否允许按ESC键关闭对话框
   */
  closeOnEsc?: boolean;

  /**
   * 是否允许点击遮罩层关闭对话框
   */
  closeOnClickOverlay?: boolean;

  /**
   * 是否隐藏对话框的边框
   */
  hideBorder?: boolean;
}

/**
 * 对话框组件事件
 */
export interface DialogEmits {
  /**
   * 更新对话框显示状态
   */
  (e: "update:modelValue", value: boolean): void;

  /**
   * 点击确认按钮时触发
   */
  (e: "confirm"): void;

  /**
   * 点击取消按钮或关闭按钮时触发
   */
  (e: "cancel"): void;

  /**
   * 关闭对话框时触发
   */
  (e: "close"): void;
}
