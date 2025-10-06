<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import type { DialogEmits, DialogProps } from "./types";
import Button from "../Button/index.vue";

defineOptions({
  name: "Dialog",
  inheritAttrs: false,
});

const props = withDefaults(defineProps<DialogProps>(), {
  modelValue: false,
  title: "",
  width: "420px",
  height: "auto",
  maxWidth: "90vw",
  maxHeight: "90vh",
  showDefaultFooter: true,
  showCloseButton: true,
  noPadding: false,
  noScroll: false,
  cancelText: "取消",
  confirmText: "确认",
  loading: false,
  showFooter: false,
  closeOnEsc: true,
  closeOnClickOverlay: true,
  hideBorder: false,
});

const emit = defineEmits<DialogEmits>();

const handleOverlayClick = () => {
  if (props.closeOnClickOverlay) {
    closeDialog();
  }
};

const lockBodyScroll = () => {
  const y = window.scrollY || window.pageYOffset;
  document.body.style.position = "fixed";
  document.body.style.top = `-${y}px`;
  document.body.style.width = "100%";
};

const unlockBodyScroll = () => {
  const scrollY = document.body.style.top;
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, parseInt(scrollY || "0") * -1);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.closeOnEsc) {
    closeDialog();
  }
  if (event.key === "Enter" && props.showDefaultFooter) {
    confirmDialog();
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.closeOnEsc) {
    document.addEventListener("keydown", handleKeyDown);
  }
  if (props.modelValue) {
    lockBodyScroll();
  }
});

onUnmounted(() => {
  if (props.closeOnEsc) {
    document.removeEventListener("keydown", handleKeyDown);
  }
  unlockBodyScroll();
});

const closeDialog = () => {
  emit("update:modelValue", false);
  emit("close");
  emit("cancel");
};

const confirmDialog = () => {
  emit("confirm");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="dialog-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          class="dialog-container"
          :style="{
            width: width,
            height: height,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            border: hideBorder ? 'none' : '1px solid var(--color-primary)',
          }"
          v-bind="$attrs"
        >
          <div class="dialog-header">
            <slot name="header">
              <h3 class="dialog-title">{{ title }}</h3>
            </slot>
            <button
              v-if="showCloseButton"
              class="dialog-close-btn"
              @click="closeDialog"
            >
              <i class="fas fa-times" />
            </button>
          </div>

          <div
            class="dialog-content"
            :class="{ 'no-padding': noPadding, 'no-scroll': noScroll }"
          >
            <slot />
          </div>

          <div v-if="$slots.footer || showFooter">
            <slot name="footer" />
          </div>
          <div v-else-if="showDefaultFooter" class="dialog-footer">
            <Button type="outlined" @click="closeDialog">
              {{ cancelText }}
            </Button>
            <Button type="primary" :loading="loading" @click="confirmDialog">
              {{ confirmText }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.dialog-container {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  overflow: hidden;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.dialog-container::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 2px;
  width: 100%;
  background: var(--color-primary);
  border-radius: 6px 6px 0 0;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  padding: 12px 16px;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.03);
}

.dialog-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.dialog-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 4px;
  font-size: 1.125rem;
  outline: none;
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  border-radius: 4px;
  width: 28px;
  height: 28px;
}

.dialog-close-btn:hover {
  color: var(--color-text);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.dialog-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px 16px;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.02);
  position: relative;
}

.dialog-content::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1rem;
  bottom: 1rem;
  width: 2px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    var(--color-primary) 50%,
    transparent 100%
  );
  opacity: 0.6;
}

.dialog-content::-webkit-scrollbar {
  width: 4px;
}

.dialog-content::-webkit-scrollbar-track {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  border-radius: 2px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 2px;
}

.dialog-content.no-padding {
  padding: 0;
}

.dialog-content.no-scroll {
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  padding: 12px 16px;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.01);
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .dialog-container {
  animation: dialogIn 0.3s cubic-bezier(0.16, 1, 0.3, 1.28);
}

.dialog-leave-active .dialog-container {
  animation: dialogOut 0.25s ease forwards;
}

@keyframes dialogIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialogOut {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

@media (max-width: 768px) {
  .dialog-overlay {
    padding: 16px;
  }

  .dialog-container {
    min-width: 280px;
    max-width: calc(100vw - 32px);
    margin: 0 auto;
  }

  .dialog-header {
    padding: 8px 12px;
  }

  .dialog-title {
    font-size: 1rem;
  }

  .dialog-content {
    padding: 16px 12px;
  }

  .dialog-footer {
    gap: 8px;
    padding: 8px 12px;
    flex-direction: column-reverse;
  }

  .dialog-footer :deep(button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dialog-overlay {
    padding: 8px;
  }

  .dialog-container {
    min-width: 260px;
    max-width: calc(100vw - 16px);
  }

  .dialog-close-btn {
    width: 24px;
    height: 24px;
    font-size: 0.875rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active {
    transition: none;
  }

  .dialog-enter-active .dialog-container,
  .dialog-leave-active .dialog-container {
    animation: none;
  }
}
</style>
