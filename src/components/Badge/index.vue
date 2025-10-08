<template>
  <div class="badge-wrapper">
    <slot></slot>
    <span
      v-if="showBadge"
      :class="['badge', `badge-${type}`, { 'badge-dot': dot }]"
    >
      {{ badgeContent }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { BadgeProps } from "./types";

const props = withDefaults(defineProps<BadgeProps>(), {
  type: "danger",
  dot: false,
  count: 0,
  max: 99,
  showZero: false,
});

const showBadge = computed(() => {
  if (props.dot) return true;
  if (props.count === 0 && !props.showZero) return false;
  return true;
});

const badgeContent = computed(() => {
  if (props.dot) return "";
  if (props.count > props.max) return `${props.max}+`;
  return props.count;
});
</script>

<style scoped>
.badge-wrapper {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  min-width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  border-radius: 10px;
  white-space: nowrap;
  z-index: 10;
  border: 2px solid var(--color-bg-base);
}

.badge-dot {
  padding: 0;
  min-width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 主题颜色 */
.badge-primary {
  background: var(--color-primary);
  color: white;
}

.badge-success {
  background: var(--color-success);
  color: white;
}

.badge-warning {
  background: var(--color-warning);
  color: white;
}

.badge-danger {
  background: var(--color-danger);
  color: white;
}

.badge-info {
  background: var(--color-info);
  color: white;
}

.badge-default {
  background: var(--color-text-secondary);
  color: white;
}
</style>
