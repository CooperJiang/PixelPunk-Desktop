<script setup lang="ts">
import { X } from "lucide-vue-next";

interface Props {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

withDefaults(defineProps<Props>(), {
  title: "确认",
  confirmText: "确定",
  cancelText: "取消",
  type: "warning",
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <div class="confirm-overlay" @click.self="handleCancel">
    <div class="confirm-dialog">
      <!-- 标题栏 -->
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
        <button class="close-btn" aria-label="Close" @click="handleCancel">
          <X :size="16" />
        </button>
      </div>

      <!-- 内容区 -->
      <div class="dialog-body">
        <p class="dialog-message">{{ message }}</p>
      </div>

      <!-- 按钮区 -->
      <div class="dialog-footer">
        <button class="btn btn-cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button
          class="btn btn-confirm"
          :class="`btn-${type}`"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 遮罩层 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

/* 对话框 */
.confirm-dialog {
  min-width: 360px;
  max-width: 480px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-cancel:hover {
  background: var(--color-bg-hover);
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
