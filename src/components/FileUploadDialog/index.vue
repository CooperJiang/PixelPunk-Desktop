<!--
  文件上传对话框组件

  功能：
  - 显示从悬浮球接收到的文件列表
  - 提供取消和确认按钮
  - 支持自定义上传逻辑扩展

  使用方法：
  1. 在父组件中引入并通过 ref 获取实例
  2. 调用 show(filePaths) 方法显示对话框
  3. 在 handleConfirm 中添加实际的上传逻辑

  扩展点：
  - handleConfirm: 添加你的上传业务逻辑（API 调用、进度更新等）
-->
<template>
  <Transition name="dialog">
    <div v-if="visible" class="dialog-overlay" @click="handleClose">
      <div class="dialog-container" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">📁 接收到文件</h3>
          <button class="close-btn" @click="handleClose">
            <X :size="20" />
          </button>
        </div>

        <div class="dialog-body">
          <p class="dialog-description">
            悬浮球接收到 {{ files.length }} 个文件，可以在这里处理上传逻辑。
          </p>

          <div class="file-list">
            <div v-for="(file, index) in files" :key="index" class="file-item">
              <div class="file-icon">
                <FileText :size="24" />
              </div>
              <div class="file-info">
                <div class="file-name">{{ getFileName(file) }}</div>
                <div class="file-path">{{ file }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="handleClose">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">
            确认上传
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X, FileText } from "lucide-vue-next";

const visible = ref(false);
const files = ref<string[]>([]);

const show = (filePaths: string[]) => {
  files.value = filePaths;
  visible.value = true;
};

const hide = () => {
  visible.value = false;
};

const handleClose = () => {
  hide();
};

const handleConfirm = () => {
  // TODO: 在此处添加实际的上传逻辑
  // 例如：调用上传 API、更新上传进度等
  hide();
};

const getFileName = (path: string) => {
  return path.split(/[\\/]/).pop() || path;
};

defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-index-modal, 2000);
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg, 24px);
  border-bottom: 1px solid var(--color-border);
}

.dialog-title {
  margin: 0;
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-base, 0.2s) var(--transition-ease, ease-in-out);
}

.close-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.dialog-body {
  flex: 1;
  padding: var(--spacing-lg, 24px);
  overflow-y: auto;
}

.dialog-description {
  margin: 0 0 var(--spacing-lg, 20px) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm, 14px);
  line-height: var(--line-height-normal, 1.6);
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 12px);
  padding: var(--spacing-md, 12px);
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  transition: all var(--transition-base, 0.2s) var(--transition-ease, ease-in-out);
}

.file-item:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-md, 8px);
  color: var(--color-primary);
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.file-path {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md, 12px);
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base, 0.2s) var(--transition-ease, ease-in-out);
  height: var(--size-button-md, 40px);
}

.btn-secondary {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-border-hover);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

/* 对话框动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity var(--transition-slow, 0.3s) var(--transition-ease, ease-in-out);
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: all var(--transition-slow, 0.3s) var(--transition-ease, ease-in-out);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container {
  transform: scale(0.95) translateY(-20px);
}

.dialog-leave-to .dialog-container {
  transform: scale(0.95) translateY(-20px);
}
</style>
