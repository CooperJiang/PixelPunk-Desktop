<script setup lang="ts">
import { computed } from "vue";
import { Check as CheckIcon, Minus as MinusIcon } from "lucide-vue-next";
import type { CheckboxEmits, CheckboxProps } from "./types";

defineOptions({ name: "Checkbox" });

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: false,
  disabled: false,
  indeterminate: false,
  size: "medium",
});

const emit = defineEmits<CheckboxEmits>();

const iconSize = computed(() => {
  switch (props.size) {
    case "small":
      return 10;
    case "large":
      return 14;
    default:
      return 12;
  }
});

const handleChange = (e: any) => {
  const value = !!e?.target?.checked;
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<template>
  <label
    class="checkbox"
    :class="{
      'checkbox--disabled': disabled,
      'checkbox--checked': modelValue,
      'checkbox--indeterminate': indeterminate,
      [`checkbox--${size}`]: size,
    }"
  >
    <span class="checkbox__input">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :name="name"
        @change="handleChange"
      />
      <span class="checkbox__inner">
        <CheckIcon
          v-if="modelValue && !indeterminate"
          class="checkbox__icon"
          :size="iconSize"
          :stroke-width="3"
        />
        <MinusIcon
          v-if="indeterminate"
          class="checkbox__icon checkbox__icon--indeterminate"
          :size="iconSize"
          :stroke-width="3"
        />
      </span>
    </span>
    <span v-if="$slots.default" class="checkbox__label">
      <slot />
    </span>
  </label>
</template>

<style scoped>
.checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-sm, 13px);
  line-height: 1.5;
  color: var(--color-text-primary);
  outline: none;
}

.checkbox--disabled {
  cursor: not-allowed;
  color: var(--color-text-disabled);
}

.checkbox__input {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.checkbox__input input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  z-index: 2;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  border: none;
  background: none;
  box-shadow: none;
}

.checkbox--disabled .checkbox__input input {
  cursor: not-allowed;
}

.checkbox__inner {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm, 4px);
  border: 2px solid var(--color-border);
  background: var(--color-bg-elevated);
  transition: all var(--transition-slow, 0.3s) cubic-bezier(0.25, 0.8, 0.25, 1);
}

.checkbox--small .checkbox__input {
  width: 14px;
  height: 14px;
}

.checkbox--small .checkbox__inner {
  width: 14px;
  height: 14px;
  border-width: 1.5px;
  border-radius: 3px;
}

.checkbox--medium .checkbox__input {
  width: 18px;
  height: 18px;
}

.checkbox--medium .checkbox__inner {
  width: 18px;
  height: 18px;
}

.checkbox--large .checkbox__input {
  width: 22px;
  height: 22px;
}

.checkbox--large .checkbox__inner {
  width: 22px;
  height: 22px;
  border-width: 2.5px;
  border-radius: 5px;
}

.checkbox--checked .checkbox__inner {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 255, 255, 0.1) 100%
  );
  border-color: var(--color-primary);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.checkbox--disabled .checkbox__inner {
  background: var(--color-bg-muted);
  border-color: var(--color-border);
  opacity: 0.5;
}

.checkbox__icon {
  color: var(--color-primary);
  filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.5));
}

.checkbox--disabled .checkbox__icon {
  color: rgba(0, 255, 255, 0.4);
  filter: none;
}

.checkbox:hover:not(.checkbox--disabled) .checkbox__inner {
  border-color: var(--color-primary);
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.2);
}

/* Hover 高光效果已通过 box-shadow 实现 */

.checkbox__label {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-sm, 13px);
  line-height: 1.5;
}

.checkbox--small .checkbox__label {
  font-size: var(--font-size-xs, 11px);
}

.checkbox--large .checkbox__label {
  font-size: var(--font-size-base, 14px);
}

/* 无障碍 - 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .checkbox__inner {
    transition: none !important;
  }
}
</style>
