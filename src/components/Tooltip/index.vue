<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';
import type { TooltipProps } from './types';

defineOptions({
  name: 'Tooltip',
});

const props = withDefaults(defineProps<TooltipProps>(), {
  placement: 'top',
  trigger: 'hover',
  disabled: false,
  offset: 8,
  showDelay: 0,
  hideDelay: 200,
  maxWidth: '300px',
});

const visible = ref(false);
const trigger = ref<HTMLElement>();
const tooltip = ref<HTMLElement>();
const tooltipStyle = ref<Record<string, string | number>>({});
const arrowStyle = ref<Record<string, string | number>>({});

let showTimer: number | null = null;
let hideTimer: number | null = null;

const clearTimers = () => {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const show = () => {
  if (props.disabled) return;

  clearTimers();
  showTimer = window.setTimeout(() => {
    visible.value = true;
    nextTick(() => {
      updatePosition();
    });
  }, props.showDelay);
};

const hide = () => {
  clearTimers();
  hideTimer = window.setTimeout(() => {
    visible.value = false;
  }, props.hideDelay);
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide();
  }
};

const handleClick = () => {
  if (props.trigger === 'click') {
    visible.value = !visible.value;
    if (visible.value) {
      nextTick(() => {
        updatePosition();
      });
    }
  }
};

const updatePosition = () => {
  if (!trigger.value || !tooltip.value) return;

  const triggerRect = trigger.value.getBoundingClientRect();
  const tooltipEl = tooltip.value;

  const tempStyle = {
    position: 'fixed',
    visibility: 'hidden',
    display: 'block',
    top: '0px',
    left: '0px',
    maxWidth: props.maxWidth,
  };

  Object.assign(tooltipEl.style, tempStyle);

  const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltipEl;

  let left = 0;
  let top = 0;

  const { placement, offset } = props;

  // 计算位置
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      top = triggerRect.top - tooltipHeight - offset;
      if (placement === 'top-start') {
        left = triggerRect.left;
      } else if (placement === 'top-end') {
        left = triggerRect.right - tooltipWidth;
      } else {
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      }
      break;

    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      top = triggerRect.bottom + offset;
      if (placement === 'bottom-start') {
        left = triggerRect.left;
      } else if (placement === 'bottom-end') {
        left = triggerRect.right - tooltipWidth;
      } else {
        left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
      }
      break;

    case 'left':
      left = triggerRect.left - tooltipWidth - offset;
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      break;

    case 'right':
      left = triggerRect.right + offset;
      top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
      break;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 调整位置以适应视口
  if (left < 10) {
    left = 10;
  } else if (left + tooltipWidth > viewportWidth - 10) {
    left = viewportWidth - tooltipWidth - 10;
  }

  if (top < 10) {
    top = 10;
  } else if (top + tooltipHeight > viewportHeight - 10) {
    top = viewportHeight - tooltipHeight - 10;
  }

  tooltipStyle.value = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    maxWidth: props.maxWidth,
    zIndex: 'var(--z-index-tooltip, 5000)',
    visibility: 'visible',
    display: 'block',
  };

  // 计算箭头位置
  arrowStyle.value = {};
  if (placement === 'top' || placement === 'bottom') {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const tooltipStart = left;
    const arrowLeft = triggerCenter - tooltipStart - 4;

    const minLeft = 8;
    const maxLeft = tooltipWidth - 16;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, arrowLeft));

    arrowStyle.value = {
      left: `${clampedLeft}px`,
    };
  } else if (placement === 'left' || placement === 'right') {
    const triggerCenter = triggerRect.top + triggerRect.height / 2;
    const tooltipStart = top;
    const arrowTop = triggerCenter - tooltipStart - 4;

    const minTop = 8;
    const maxTop = tooltipHeight - 16;
    const clampedTop = Math.max(minTop, Math.min(maxTop, arrowTop));

    arrowStyle.value = {
      top: `${clampedTop}px`,
    };
  }
};

const handleResize = () => {
  if (visible.value) {
    updatePosition();
  }
};

const handleScroll = () => {
  if (visible.value) {
    updatePosition();
  }
};

const handleClickOutside = (event: Event) => {
  if (props.trigger === 'click' && visible.value) {
    const target = event.target as Node;
    if (!trigger.value?.contains(target) && !tooltip.value?.contains(target)) {
      visible.value = false;
    }
  }
};

onBeforeUnmount(() => {
  clearTimers();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  document.removeEventListener('click', handleClickOutside, true);
});

window.addEventListener('resize', handleResize);
window.addEventListener('scroll', handleScroll, true);
document.addEventListener('click', handleClickOutside, true);

defineExpose({
  show,
  hide,
  updatePosition,
});
</script>

<template>
  <div
    ref="trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="visible"
        ref="tooltip"
        class="tooltip"
        :class="`tooltip--${placement}`"
        :style="tooltipStyle"
      >
        <div
          class="tooltip__arrow"
          :class="`tooltip__arrow--${placement}`"
          :style="arrowStyle"
        />
        <div class="tooltip__content">
          <slot name="content">{{ content }}</slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tooltip {
  position: fixed;
  max-width: 300px;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  font-size: var(--font-size-xs, 12px);
  line-height: var(--line-height-normal, 1.5);
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(8px);
  z-index: var(--z-index-tooltip, 5000);
  pointer-events: none;
  user-select: none;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  transform-origin: center center;
}

.tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  transform: rotate(45deg);
}

/* Top placement */
.tooltip--top .tooltip__arrow--top,
.tooltip--top-start .tooltip__arrow--top-start,
.tooltip--top-end .tooltip__arrow--top-end {
  bottom: -5px;
  border-bottom-color: var(--color-border);
  border-right-color: var(--color-border);
  border-top-color: transparent;
  border-left-color: transparent;
}

/* Bottom placement */
.tooltip--bottom .tooltip__arrow--bottom,
.tooltip--bottom-start .tooltip__arrow--bottom-start,
.tooltip--bottom-end .tooltip__arrow--bottom-end {
  top: -5px;
  border-top-color: var(--color-border);
  border-left-color: var(--color-border);
  border-bottom-color: transparent;
  border-right-color: transparent;
}

/* Left placement */
.tooltip--left .tooltip__arrow--left {
  right: -5px;
  border-bottom-color: var(--color-border);
  border-left-color: var(--color-border);
  border-top-color: transparent;
  border-right-color: transparent;
}

/* Right placement */
.tooltip--right .tooltip__arrow--right {
  left: -5px;
  border-left-color: var(--color-border);
  border-bottom-color: var(--color-border);
  border-top-color: transparent;
  border-right-color: transparent;
}

.tooltip__content {
  position: relative;
  z-index: 10;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Transitions */
.tooltip-fade-enter-active {
  transition:
    opacity var(--transition-base, 0.2s) var(--transition-ease, ease-in-out),
    transform var(--transition-base, 0.2s) var(--transition-ease, ease-in-out);
}

.tooltip-fade-leave-active {
  transition: opacity var(--transition-fast, 0.15s) var(--transition-ease, ease-in-out);
}

.tooltip-fade-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.tooltip-fade-leave-to {
  opacity: 0;
}

/* Transform origin based on placement */
.tooltip--top,
.tooltip--top-start,
.tooltip--top-end {
  transform-origin: center bottom;
}

.tooltip--top.tooltip-fade-enter-from,
.tooltip--top-start.tooltip-fade-enter-from,
.tooltip--top-end.tooltip-fade-enter-from {
  transform: translateY(8px) scale(0.95);
}

.tooltip--bottom,
.tooltip--bottom-start,
.tooltip--bottom-end {
  transform-origin: center top;
}

.tooltip--bottom.tooltip-fade-enter-from,
.tooltip--bottom-start.tooltip-fade-enter-from,
.tooltip--bottom-end.tooltip-fade-enter-from {
  transform: translateY(-8px) scale(0.95);
}

.tooltip--left {
  transform-origin: right center;
}

.tooltip--left.tooltip-fade-enter-from {
  transform: translateX(8px) scale(0.95);
}

.tooltip--right {
  transform-origin: left center;
}

.tooltip--right.tooltip-fade-enter-from {
  transform: translateX(-8px) scale(0.95);
}
</style>
