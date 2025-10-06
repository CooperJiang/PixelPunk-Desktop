<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "确认",
  confirmText: "确定",
  cancelText: "取消",
  type: "warning",
  loading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  visible.value = false;
  emit("cancel");
};
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div v-if="visible" class="confirm-overlay" @click.self="handleCancel">
        <div class="confirm-dialog">
          <!-- 标题栏 -->
          <div class="dialog-header">
            <h3 class="dialog-title">{{ title }}</h3>
            <button class="close-btn" aria-label="Close" @click="handleCancel">
              <i class="fas fa-times" />
            </button>
          </div>

          <!-- 内容区 -->
          <div class="dialog-body">
            <slot />
          </div>

          <!-- 按钮区 -->
          <div class="dialog-footer">
            <button
              class="btn btn-cancel"
              :disabled="loading"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              class="btn btn-confirm"
              :class="`btn-${type}`"
              :disabled="loading"
              @click="handleConfirm"
            >
              <i
                v-if="loading"
                class="fas fa-spinner fa-spin"
                style="margin-right: 6px"
              />
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* 动画 */
.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.3s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-active .confirm-dialog {
  animation: dialogBounceIn 0.3s ease;
}

.confirm-dialog-leave-active .confirm-dialog {
  animation: dialogBounceOut 0.2s ease;
}

@keyframes dialogBounceIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dialogBounceOut {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

/* 对话框 */
.confirm-dialog {
  min-width: 360px;
  max-width: 480px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  overflow: hidden;
}

/* 标题栏 */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* 内容区 */
.dialog-body {
  padding: 24px 20px;
}

.dialog-message {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

/* 按钮区 */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-primary);
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm {
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.btn-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.btn-info:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

/* 暗黑模式增强 */
:global(.dark) .confirm-overlay {
  background: rgba(0, 0, 0, 0.7);
}

:global(.dark) .confirm-dialog {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(0, 255, 255, 0.1);
}
</style>
