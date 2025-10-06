<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  FileImage,
  Link2,
  X,
  RotateCw,
  Play,
  Check,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-vue-next";

export interface UploadFile {
  file: File;
  name: string;
  size: number;
  progress: number;
  status:
    | "pending"
    | "uploading"
    | "success"
    | "error"
    | "analyzing"
    | "paused"
    | "completed";
  url?: string;
  full_url?: string;
  preview?: string;
  error?: string;
  id?: string;
  statusMessage?: string;
  speed?: number; // KB/s
  remainingTime?: number; // 秒
  is_duplicate?: boolean; // 是否秒传
}

const props = defineProps<{
  files: UploadFile[];
}>();

const emit = defineEmits<{
  remove: [index: number];
  retry: [index: number];
  resume: [index: number];
  copyUrl: [url: string];
}>();

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 格式化剩余时间
const formatRemainingTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.ceil(seconds)}秒`;
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}分钟`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
};

// 判断是否秒传
const isInstantUpload = (file: UploadFile): boolean => {
  return !!file.is_duplicate;
};

// 获取成功文本
const getSuccessText = (file: UploadFile): string => {
  return isInstantUpload(file) ? "秒传成功" : "上传成功";
};

// 创建文件预览
const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 为文件生成预览
const generatePreviews = () => {
  props.files.forEach((file) => {
    if (!file.preview && file.file instanceof File) {
      createFilePreview(file.file)
        .then((preview) => {
          file.preview = preview;
        })
        .catch(() => {
          // 预览加载失败，忽略
        });
    }
  });
};

// 初始化预览
onMounted(() => {
  generatePreviews();
});

// 监听文件变化，为新文件生成预览
watch(
  () => props.files.length,
  () => {
    generatePreviews();
  },
);
</script>

<template>
  <div class="upload-progress">
    <div
      v-for="(file, index) in files"
      :key="file.id || index"
      class="upload-progress__item"
    >
      <!-- 预览图 -->
      <div class="upload-progress__preview">
        <img
          v-if="file.preview"
          :src="file.preview"
          :alt="file.name"
          class="upload-progress__preview-img"
        />
        <FileImage
          v-else
          :size="24"
          class="upload-progress__preview-placeholder"
        />
      </div>

      <!-- 文件信息 -->
      <div class="upload-progress__info">
        <div class="upload-progress__header">
          <span class="upload-progress__name" :title="file.name">{{
            file.name
          }}</span>
          <span class="upload-progress__size">{{
            formatFileSize(file.size)
          }}</span>
        </div>

        <!-- 状态显示 -->
        <div class="upload-progress__status">
          <!-- 错误状态 -->
          <div
            v-if="file.status === 'error'"
            class="upload-progress__status-badge upload-progress__status-badge--error"
          >
            <AlertCircle :size="14" />
            <span>{{ file.error || "上传失败" }}</span>
          </div>

          <!-- 成功状态 -->
          <div
            v-else-if="file.status === 'success' || file.status === 'completed'"
            class="upload-progress__status-badge"
            :class="{
              'upload-progress__status-badge--success': !isInstantUpload(file),
              'upload-progress__status-badge--instant': isInstantUpload(file),
            }"
          >
            <Zap v-if="isInstantUpload(file)" :size="14" />
            <Check v-else :size="14" />
            <span>{{ getSuccessText(file) }}</span>
          </div>

          <!-- 上传中 -->
          <div
            v-else-if="file.status === 'uploading'"
            class="upload-progress__uploading"
          >
            <div class="upload-progress__progress-bar">
              <div
                class="upload-progress__progress-fill"
                :style="{ width: `${file.progress}%` }"
              />
            </div>
            <span class="upload-progress__progress-text"
              >{{ file.progress }}%</span
            >
          </div>

          <!-- 分析中 -->
          <div
            v-else-if="file.status === 'analyzing'"
            class="upload-progress__status-badge upload-progress__status-badge--analyzing"
          >
            <div class="upload-progress__spinner" />
            <span>正在分析...</span>
          </div>

          <!-- 暂停 -->
          <div
            v-else-if="file.status === 'paused'"
            class="upload-progress__status-badge upload-progress__status-badge--paused"
          >
            <Clock :size="14" />
            <span>{{ file.statusMessage || "已暂停" }}</span>
          </div>

          <!-- 等待中 -->
          <div
            v-else
            class="upload-progress__status-badge upload-progress__status-badge--pending"
          >
            <Clock :size="14" />
            <span>{{ file.statusMessage || "等待上传" }}</span>
          </div>
        </div>

        <!-- 上传详情（速度、剩余时间） -->
        <div
          v-if="
            file.status === 'uploading' &&
            (file.statusMessage || file.remainingTime)
          "
          class="upload-progress__details"
        >
          <span v-if="file.statusMessage">{{ file.statusMessage }}</span>
          <span v-if="file.remainingTime && file.remainingTime > 0">
            剩余 {{ formatRemainingTime(file.remainingTime) }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="upload-progress__actions">
        <!-- 复制链接 -->
        <button
          v-if="
            (file.status === 'success' || file.status === 'completed') &&
            file.full_url
          "
          class="upload-progress__btn upload-progress__btn--copy"
          title="复制链接"
          @click="emit('copyUrl', file.full_url)"
        >
          <Link2 :size="16" />
        </button>

        <!-- 继续上传 -->
        <button
          v-if="file.status === 'paused'"
          class="upload-progress__btn upload-progress__btn--resume"
          title="继续上传"
          @click="emit('resume', index)"
        >
          <Play :size="16" />
        </button>

        <!-- 重试 -->
        <button
          v-if="file.status === 'error'"
          class="upload-progress__btn upload-progress__btn--retry"
          title="重试"
          @click="emit('retry', index)"
        >
          <RotateCw :size="16" />
        </button>

        <!-- 移除 -->
        <button
          class="upload-progress__btn upload-progress__btn--remove"
          :disabled="file.status === 'uploading'"
          title="移除"
          @click="emit('remove', index)"
        >
          <X :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-progress__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-progress__item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.05),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-progress__item:hover {
  background: linear-gradient(
    135deg,
    var(--color-bg-hover),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.04)
  );
  transform: translateY(-2px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.upload-progress__item:hover::before {
  opacity: 1;
}

.upload-progress__preview {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    var(--color-bg-base),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.05)
  );
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s;
}

.upload-progress__item:hover .upload-progress__preview {
  border-color: var(--color-primary);
  box-shadow: 0 0 16px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.upload-progress__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-progress__preview-placeholder {
  color: var(--color-text-muted);
}

.upload-progress__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.upload-progress__name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-progress__size {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.upload-progress__status {
  font-size: 12px;
}

.upload-progress__status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.upload-progress__status-badge--error {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.08)
  );
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
}

.upload-progress__status-badge--success {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.08)
  );
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.15);
}

.upload-progress__status-badge--instant {
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.12),
    rgba(6, 182, 212, 0.08)
  );
  color: #06b6d4;
  border: 1px solid rgba(6, 182, 212, 0.3);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 12px rgba(6, 182, 212, 0.15);
  }
  50% {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
  }
}

.upload-progress__status-badge--analyzing {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.12),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08)
  );
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
}

.upload-progress__status-badge--paused {
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.12),
    rgba(251, 191, 36, 0.08)
  );
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.15);
}

.upload-progress__status-badge--pending {
  background: linear-gradient(
    135deg,
    rgba(var(--color-text-muted-rgb, 156, 163, 175), 0.12),
    rgba(var(--color-text-muted-rgb, 156, 163, 175), 0.08)
  );
  color: var(--color-text-muted);
  border: 1px solid rgba(var(--color-text-muted-rgb, 156, 163, 175), 0.3);
}

.upload-progress__uploading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-progress__progress-bar {
  flex: 1;
  height: 8px;
  background: linear-gradient(
    90deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1),
    rgba(224, 50, 207, 0.05)
  );
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-progress__progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.9)
  );
  border-radius: 4px;
  transition: width 0.3s ease-out;
  position: relative;
  box-shadow: 0 0 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4);
}

.upload-progress__progress-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.upload-progress__progress-text {
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.upload-progress__details {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.upload-progress__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.upload-progress__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-progress__btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.4s;
}

.upload-progress__btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.upload-progress__btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.upload-progress__btn:active:not(:disabled) {
  transform: translateY(0);
}

.upload-progress__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress__btn--copy {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.upload-progress__btn--copy:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.8)
  );
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4);
}

.upload-progress__btn--resume {
  border-color: #22c55e;
  color: #22c55e;
}

.upload-progress__btn--resume:hover:not(:disabled) {
  background: #22c55e;
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
}

.upload-progress__btn--retry {
  border-color: #fbbf24;
  color: #fbbf24;
}

.upload-progress__btn--retry:hover:not(:disabled) {
  background: #fbbf24;
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(251, 191, 36, 0.4);
}

.upload-progress__btn--remove {
  border-color: #ef4444;
  color: #ef4444;
}

.upload-progress__btn--remove:hover:not(:disabled) {
  background: #ef4444;
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}

.upload-progress__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
