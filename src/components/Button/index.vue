<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @mouseover="onMouseover"
    @mouseleave="onMouseleave"
  >
    <!-- Replace模式：只显示loading -->
    <div v-if="loading && loadingMode === 'replace'" class="spinner" />

    <!-- Normal模式和Inline模式 -->
    <template v-else>
      <!-- Inline模式的loading图标 -->
      <div
        v-if="loading && loadingMode === 'inline'"
        class="spinner inline-spinner"
      />

      <!-- 左侧图标 -->
      <span
        v-if="!loading && (icon || $slots.icon)"
        class="icon-wrap left-icon"
      >
        <slot name="icon">
          <component :is="icon" v-if="icon" :size="iconSize" :stroke-width="2" />
        </slot>
      </span>

      <!-- 按钮内容 -->
      <span
        v-if="loadingMode === 'replace' || !loading"
        class="button-content"
      >
        <slot />
      </span>

      <!-- Inline loading时也显示内容 -->
      <span v-if="loadingMode === 'inline' && loading" class="button-content">
        <slot />
      </span>

      <!-- 右侧图标 -->
      <span v-if="rightIcon || $slots.rightIcon" class="icon-wrap right-icon">
        <slot name="rightIcon">
          <component
            :is="rightIcon"
            v-if="rightIcon"
            :size="iconSize"
            :stroke-width="2"
          />
        </slot>
      </span>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonProps, ButtonEmits } from './types';

defineOptions({
  name: 'Button',
});

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  loading: false,
  loadingMode: 'inline',
  disabled: false,
  block: false,
  customClass: '',
});

const emit = defineEmits<ButtonEmits>();

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.type}`,
  `btn--${props.size}`,
  {
    'btn--loading': props.loading,
    'btn--disabled': props.disabled,
    'btn--block': props.block,
    'btn--has-icon': props.icon || props.rightIcon,
    'btn--replace-mode': props.loading && props.loadingMode === 'replace',
  },
  props.customClass,
]);

const iconSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 14;
    case 'large':
      return 18;
    default:
      return 16;
  }
});

const handleClick = (event: MouseEvent) => {
  if (props.loading || props.disabled) return;
  emit('click', event);
};

const onMouseover = (event: MouseEvent) => {
  emit('mouseover', event);
};

const onMouseleave = (event: MouseEvent) => {
  emit('mouseleave', event);
};
</script>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  border-radius: var(--radius-md, 6px);
  border: 1px solid transparent;
  transition: all var(--transition-base, 0.2s) var(--transition-ease, ease);
  box-sizing: border-box;
  font-weight: var(--font-weight-medium, 500);
  letter-spacing: 0.025em;
  outline: none;
  font-family: inherit;
}

/* 尺寸规范 */
.btn--small {
  gap: 0.25rem;
  padding: 4px 8px;
  min-height: 24px;
  font-size: var(--font-size-xs, 11px);
}

.btn--medium {
  gap: 0.5rem;
  padding: 8px 16px;
  min-height: 32px;
  font-size: var(--font-size-base, 13px);
}

.btn--large {
  gap: 0.5rem;
  padding: 12px 24px;
  min-height: 40px;
  font-size: var(--font-size-md, 14px);
}

/* Primary按钮 */
.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  position: relative;
  overflow: hidden;
}

.btn--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* Secondary按钮 */
.btn--secondary {
  background: rgba(0, 255, 255, 0.1);
  color: var(--color-primary);
  border-color: var(--color-primary);
  position: relative;
  overflow: hidden;
}

.btn--secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 255, 255, 0.1),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
  background: rgba(0, 255, 255, 0.15);
  border-color: var(--color-primary-hover);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.25);
  transform: translateY(-1px);
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* Outlined按钮 */
.btn--outlined {
  background: transparent;
  color: var(--color-primary);
  border-color: rgba(0, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.btn--outlined::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 255, 255, 0.05);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
  z-index: -1;
}

.btn--outlined:hover:not(.btn--disabled):not(.btn--loading) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn--outlined:hover:not(.btn--disabled):not(.btn--loading)::before {
  transform: scaleX(1);
}

/* Text按钮 */
.btn--text {
  background: transparent;
  color: var(--color-primary);
  border-color: transparent;
  position: relative;
  overflow: hidden;
}

.btn--text::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 255, 255, 0.1);
  border-radius: var(--radius-md, 6px);
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.3s ease;
}

.btn--text:hover:not(.btn--disabled):not(.btn--loading) {
  color: var(--color-primary);
}

.btn--text:hover:not(.btn--disabled):not(.btn--loading)::before {
  transform: scale(1);
  opacity: 1;
}

/* Danger按钮 */
.btn--danger {
  background: var(--color-error);
  color: var(--color-text-inverse);
  border-color: var(--color-error);
  position: relative;
  overflow: hidden;
}

.btn--danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--danger:hover:not(.btn--disabled):not(.btn--loading) {
  background: #FF003D;
  border-color: #FF003D;
  box-shadow: 0 0 15px rgba(255, 23, 68, 0.4);
  transform: translateY(-1px);
}

.btn--danger:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* Success按钮 */
.btn--success {
  background: var(--color-success);
  color: var(--color-text-inverse);
  border-color: var(--color-success);
  position: relative;
  overflow: hidden;
}

.btn--success::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--success:hover:not(.btn--disabled):not(.btn--loading) {
  background: #00C853;
  border-color: #00C853;
  box-shadow: 0 0 15px rgba(0, 230, 118, 0.3);
  transform: translateY(-1px);
}

.btn--success:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* Warning按钮 */
.btn--warning {
  background: var(--color-warning);
  color: var(--color-text-inverse);
  border-color: var(--color-warning);
  position: relative;
  overflow: hidden;
}

.btn--warning::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--warning:hover:not(.btn--disabled):not(.btn--loading) {
  background: #FFC400;
  border-color: #FFC400;
  box-shadow: 0 0 15px rgba(255, 214, 0, 0.3);
  transform: translateY(-1px);
}

.btn--warning:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* Info按钮 */
.btn--info {
  background: rgba(0, 184, 212, 0.8);
  color: var(--color-text-primary);
  border-color: rgba(0, 184, 212, 0.8);
  position: relative;
  overflow: hidden;
}

.btn--info::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.6s ease;
}

.btn--info:hover:not(.btn--disabled):not(.btn--loading) {
  background: rgba(0, 184, 212, 0.9);
  border-color: rgba(0, 184, 212, 0.9);
  box-shadow: 0 0 15px rgba(0, 184, 212, 0.25);
  transform: translateY(-1px);
}

.btn--info:hover:not(.btn--disabled):not(.btn--loading)::before {
  left: 100%;
}

/* 块级按钮 */
.btn--block {
  width: 100%;
  display: flex;
}

/* 禁用状态 */
.btn--disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(0.3);
}

/* Loading状态 */
.btn--loading {
  pointer-events: none;
  opacity: 0.8;
}

/* Replace模式 */
.btn--replace-mode {
  color: transparent;
}

.btn--replace-mode .button-content,
.btn--replace-mode .icon-wrap {
  opacity: 0;
  visibility: hidden;
}

/* Loading图标 */
.spinner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 2px currentColor);
}

.inline-spinner {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  border-width: 1.5px;
  top: auto;
  left: auto;
  transform: none;
  margin-right: 6px;
  flex-shrink: 0;
}

.button-content {
  display: inline-flex;
  align-items: center;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3));
}

.left-icon {
  margin-right: 0.25rem;
}

.right-icon {
  margin-left: 0.25rem;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* 无障碍 - 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .btn::before,
  .spinner {
    animation: none !important;
    transition: none !important;
  }

  .btn:hover {
    transform: none !important;
  }
}
</style>
