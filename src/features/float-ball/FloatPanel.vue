<template>
  <div class="float-panel">
    <div class="panel-header">
      <h3>文件上传</h3>
      <div class="header-actions">
        <button
          v-if="uploadStore.files.length > 0"
          class="btn-clear"
          @click="uploadStore.clearCompleted"
        >
          清空记录
        </button>
      </div>
    </div>

    <div class="panel-body">
      <!-- 统计信息 -->
      <div v-if="uploadStore.isUploading" class="upload-stats">
        <div class="stat-item">
          <span class="stat-label">总进度</span>
          <span class="stat-value"
            >{{ Math.round(uploadStore.totalProgress) }}%</span
          >
        </div>
        <div class="stat-item">
          <span class="stat-label">等待中</span>
          <span class="stat-value">{{ uploadStore.pendingCount }}</span>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list">
        <div v-if="uploadStore.files.length === 0" class="empty-state">
          <Upload :size="48" class="empty-icon" />
          <p>拖放文件到悬浮球开始上传</p>
        </div>

        <div
          v-for="file in uploadStore.files"
          :key="file.id"
          class="file-item"
          :class="[`status-${file.status}`]"
        >
          <div class="file-icon">
            <FileText :size="20" />
          </div>

          <div class="file-info">
            <div class="file-name" :title="file.name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatSize(file.size) }}</span>
              <span class="file-status">{{ getStatusText(file.status) }}</span>
            </div>

            <!-- 进度条 -->
            <div v-if="file.status === 'uploading'" class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${file.progress}%` }"
              ></div>
            </div>

            <!-- 错误信息 -->
            <div v-if="file.error" class="file-error">{{ file.error }}</div>
          </div>

          <div class="file-actions">
            <!-- 成功图标 -->
            <CheckCircle
              v-if="file.status === 'success'"
              :size="20"
              class="icon-success"
            />

            <!-- 错误图标和重试按钮 -->
            <button
              v-if="file.status === 'error'"
              class="btn-retry"
              @click="uploadStore.retryFile(file.id)"
            >
              <RotateCw :size="16" />
            </button>

            <!-- 删除按钮 -->
            <button class="btn-remove" @click="uploadStore.removeFile(file.id)">
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-footer">
      <div class="upload-summary">
        <span>成功: {{ uploadStore.successCount }}</span>
        <span>失败: {{ uploadStore.errorCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Upload, FileText, CheckCircle, RotateCw, X } from "lucide-vue-next";
import { useUploadStore } from "@/stores/upload";

const uploadStore = useUploadStore();

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "等待中",
    uploading: "上传中",
    success: "已完成",
    error: "失败",
  };
  return statusMap[status] || status;
};

const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
</script>

<style scoped>
.float-panel {
  width: 320px;
  height: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-clear {
  padding: 4px 12px;
  font-size: 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-clear:hover {
  background: #e5e7eb;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.upload-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.file-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f3f4f6;
}

.file-item.status-success {
  background: #ecfdf5;
}

.file-item.status-error {
  background: #fef2f2;
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
  color: #6b7280;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.file-error {
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}

.file-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.icon-success {
  color: #10b981;
}

.btn-retry,
.btn-remove {
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-retry:hover {
  background: #e5e7eb;
  color: #3b82f6;
}

.btn-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.upload-summary {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: #6b7280;
}
</style>
