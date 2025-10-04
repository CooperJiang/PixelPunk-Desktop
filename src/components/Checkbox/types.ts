export type CheckboxSize = 'small' | 'medium' | 'large';

export interface CheckboxProps {
  /** 选中状态 */
  modelValue?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  /** 半选状态 */
  indeterminate?: boolean;
  /** 尺寸 */
  size?: CheckboxSize;
  /** name属性 */
  name?: string;
}

export interface CheckboxEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
}
