<template>
  <div class="input-container">
    <div
      class="input-wrapper"
      :class="[
        `input-wrapper--${size}`,
        {
          'input-wrapper--disabled': disabled,
          'input-wrapper--error': error || !!errorMessage,
          'input-wrapper--focused': focused,
          'input-wrapper--readonly': readonly,
        },
      ]"
      :style="wrapperStyle"
    >
      <div v-if="$slots.prepend" class="input__prepend">
        <slot name="prepend" />
      </div>

      <div class="input__inner">
        <!-- 前缀图标 -->
        <div v-if="$slots.prefix || prefixIcon" class="input__prefix">
          <slot name="prefix">
            <component
              :is="prefixIcon"
              v-if="prefixIcon"
              :size="iconSize"
              :stroke-width="2"
            />
          </slot>
        </div>

        <!-- 多行文本域 -->
        <textarea
          v-if="type === 'textarea'"
          :id="inputId || undefined"
          ref="inputRef"
          :value="modelValue"
          class="input"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :rows="rows"
          :maxlength="maxlength"
          :name="name"
          v-bind="filteredAttrs"
          @input="onInput"
          @change="onChange"
          @focus="onFocus"
          @blur="onBlur"
          @keyup="onKeyup"
          @keydown="onKeydown"
        />

        <!-- 单行输入框 -->
        <input
          v-else
          :id="inputId || undefined"
          ref="inputRef"
          :value="modelValue"
          :type="inputType"
          class="input"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :name="name"
          :autocomplete="autocomplete"
          v-bind="filteredAttrs"
          @input="onInput"
          @change="onChange"
          @focus="onFocus"
          @blur="onBlur"
          @keyup="onKeyup"
          @keydown="onKeydown"
        />

        <!-- 后缀图标/清除按钮 -->
        <div v-if="showSuffix" class="input__suffix">
          <!-- 清除按钮 -->
          <component
            :is="XIcon"
            v-if="clearable && modelValue && !disabled"
            class="input__clear"
            :size="14"
            @click.stop="onClear"
          />
          <!-- 自定义后缀 -->
          <slot name="suffix">
            <component
              :is="suffixIcon"
              v-if="suffixIcon"
              :size="iconSize"
              :stroke-width="2"
            />
          </slot>
        </div>

        <!-- 密码可见性切换 -->
        <div v-if="type === 'password'" class="input__password-toggle">
          <component
            :is="showPassword ? EyeOffIcon : EyeIcon"
            :size="iconSize"
            @click.stop="togglePasswordVisibility"
          />
        </div>
      </div>

      <div v-if="$slots.append" class="input__append">
        <slot name="append" />
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="input__error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useSlots } from "vue";
import {
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  X as XIcon,
} from "lucide-vue-next";
import type { InputEmits, InputProps } from "./types";

defineOptions({
  name: "Input",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: "",
  type: "text",
  size: "medium",
  placeholder: "",
  disabled: false,
  readonly: false,
  clearable: false,
  autofocus: false,
  autocomplete: "off",
  name: "",
  rows: 3,
  error: false,
  errorMessage: "",
  inputId: "",
  width: undefined,
  height: undefined,
});

const emit = defineEmits<InputEmits>();

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const focused = ref(false);
const showPassword = ref(false);
const slots = useSlots();
const attrs = useAttrs();

const filteredAttrs = computed(() => {
  const filtered = { ...attrs };
  delete filtered.class;
  delete filtered.style;
  delete filtered.size;
  return filtered;
});

const showSuffix = computed(() =>
  Boolean(
    slots.suffix ||
      props.suffixIcon ||
      (props.clearable && props.modelValue && !props.disabled),
  ),
);

const wrapperStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.width) {
    style.width = props.width;
  }
  if (props.height) {
    style.height = props.height;
    style.minHeight = props.height;
  }
  return style;
});

const inputType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type === "textarea" ? "text" : props.type;
});

const iconSize = computed(() => {
  switch (props.size) {
    case "small":
      return 14;
    case "large":
      return 18;
    default:
      return 16;
  }
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement;
  const { value } = target;

  if (props.type === "number") {
    if (value === "") {
      emit("update:modelValue", "");
    } else {
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        emit("update:modelValue", numberValue);
      }
    }
  } else {
    emit("update:modelValue", value);
  }

  emit("input", e);
};

const onChange = (e: Event) => {
  emit("change", e);
};

const onFocus = (e: FocusEvent) => {
  focused.value = true;
  emit("focus", e);
};

const onBlur = (e: FocusEvent) => {
  focused.value = false;
  emit("blur", e);
};

const onKeyup = (e: KeyboardEvent) => {
  if (e.key === "Enter") {
    emit("enter", e);
  }
  emit("keyup", e);
};

const onKeydown = (e: KeyboardEvent) => {
  emit("keydown", e);
};

const onClear = () => {
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
};

const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const select = () => {
  inputRef.value?.select();
};

defineExpose({
  focus,
  blur,
  select,
  inputRef,
});

onMounted(() => {
  if (props.autofocus && !props.disabled) {
    focus();
  }
});
</script>

<style scoped>
.input-container {
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  align-items: stretch;
  overflow: hidden;
  border-radius: var(--radius-md, 6px);
  border: 1px solid var(--color-border);
  background: rgba(0, 255, 255, 0.05);
  transition:
    border-color var(--transition-fast, 0.15s) ease,
    box-shadow var(--transition-fast, 0.15s) ease;
  box-sizing: border-box;
}

/* 尺寸规范 */
.input-wrapper--small {
  min-height: 28px;
}

.input-wrapper--small .input {
  padding: 4px 8px;
  font-size: var(--font-size-sm, 12px);
}

.input-wrapper--medium {
  min-height: 32px;
}

.input-wrapper--medium .input {
  padding: 6px 12px;
  font-size: var(--font-size-base, 13px);
}

.input-wrapper--large {
  min-height: 40px;
}

.input-wrapper--large .input {
  padding: 8px 16px;
  font-size: var(--font-size-md, 14px);
}

.input__inner {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
}

.input,
textarea.input {
  min-width: 0;
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  outline: none;
  color: var(--color-text-primary);
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

textarea.input {
  min-height: 80px;
  padding: 8px 12px !important;
  line-height: 1.4;
}

.input::placeholder,
textarea.input::placeholder {
  color: var(--color-text-muted);
  font-style: italic;
  font-weight: 400;
}

/* 移除number类型的spinner */
.input[type="number"]::-webkit-inner-spin-button,
.input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input[type="number"] {
  -moz-appearance: textfield;
}

.input__prepend,
.input__append {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  padding: 0 12px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.input__prefix {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.input__suffix {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--color-text-muted);
  gap: 4px;
}

.input__clear {
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s) ease;
  color: var(--color-text-muted);
}

.input__clear:hover {
  color: var(--color-error);
}

.input__password-toggle {
  display: flex;
  flex-shrink: 0;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast, 0.15s) ease;
}

.input__password-toggle:hover {
  color: var(--color-primary);
}

/* 状态样式 */
.input-wrapper:hover:not(.input-wrapper--disabled):not(
    .input-wrapper--focused
  ) {
  border-color: var(--color-border-hover);
}

.input-wrapper--focused,
.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.4);
}

.input-wrapper--error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 2px rgba(255, 23, 68, 0.1);
}

.input-wrapper--disabled {
  background: rgba(13, 17, 23, 0.2);
  border-color: rgba(0, 255, 255, 0.1);
  opacity: 0.6;
  cursor: not-allowed;
}

.input-wrapper--disabled .input {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.input-wrapper--readonly {
  background: rgba(0, 255, 255, 0.02);
  border-color: rgba(0, 255, 255, 0.3);
}

.input-wrapper--readonly .input {
  cursor: default;
}

.input__error-message {
  margin-top: 4px;
  font-size: var(--font-size-xs, 11px);
  color: var(--color-error);
}

/* 无障碍 - 减少动画 */
@media (prefers-reduced-motion: reduce) {
  .input-wrapper,
  .input__clear,
  .input__password-toggle {
    transition: none !important;
  }
}
</style>
