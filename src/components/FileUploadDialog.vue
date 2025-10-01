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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.dialog-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.dialog-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.dialog-description {
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.file-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  color: #667eea;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.file-path {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 对话框动画 */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-enter-active .dialog-container,
.dialog-leave-active .dialog-container {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-container {
  transform: scale(0.9) translateY(-20px);
}

.dialog-leave-to .dialog-container {
  transform: scale(0.9) translateY(-20px);
}
</style>
