<script setup lang="ts">
import { ref, nextTick } from "vue";
import UploadDropZone from "@/components/Upload/DropZone.vue";
import UploadSettings from "@/components/Upload/Settings.vue";
import UploadProgress from "@/components/Upload/Progress.vue";
import UploadStats from "@/components/Upload/Stats.vue";
import { useGlobalUpload } from "@/composables/useGlobalUpload";
import { Rocket, Plus, Copy, Trash2, Eraser } from "lucide-vue-next";
import { message } from "@/components/Message/message";

// 上传设置
const folderId = ref("");
const accessLevel = ref<"public" | "private" | "protected">("private");
const optimize = ref(true);
const autoRemove = ref(false);

// 队列区域引用
const queueRef = ref<HTMLElement>();

// 查找滚动容器
const getScrollContainer = (): HTMLElement | null => {
  let parent = queueRef.value?.parentElement;
  while (parent) {
    const overflow = window.getComputedStyle(parent).overflow;
    if (overflow === "auto" || overflow === "scroll") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

// 使用上传 composable
const {
  uploadQueue,
  isUploading,
  globalProgress,
  globalSpeed,
  pendingCount,
  uploadingCount,
  successCount,
  errorCount,
  totalFileSize,
  hasPendingFiles,
  hasSuccessFiles,
  addFiles,
  removeFile,
  clearQueue,
  startUpload,
  cancelUpload,
  retryUpload,
  resumeUpload,
  copyAllUrls,
  formatFileSize,
} = useGlobalUpload({
  folderId: folderId,
  accessLevel: accessLevel,
  optimize: optimize,
});

// 文件选择
const handleFilesSelected = (files: FileList) => {
  addFiles(files);

  // 等待DOM更新后滚动到队列区域
  nextTick(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const element = queueRef.value;
        if (!element) return;

        // 查找滚动容器
        const scrollContainer = getScrollContainer();

        if (scrollContainer) {
          // 计算元素相对于滚动容器的位置
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const offset =
            elementRect.top -
            containerRect.top +
            scrollContainer.scrollTop -
            20;

          // 滚动容器
          scrollContainer.scrollTo({
            top: offset,
            behavior: "smooth",
          });
        } else {
          // 如果找不到滚动容器，使用window滚动
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    });
  });
};

// 开始上传
const handleStartUpload = async () => {
  if (!hasPendingFiles.value) {
    message.warning("队列中暂无需要上传的文件");
    return;
  }
  await startUpload();
};

// 复制所有链接
const handleCopyAllUrls = async () => {
  const success = await copyAllUrls();
  if (success) {
    message.success("所有链接已复制到剪贴板");
  } else {
    message.warning("暂无可复制的文件链接");
  }
};

// 复制单个链接
const handleCopyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    message.success("链接已复制到剪贴板");
  } catch (error) {
    message.error("复制失败");
  }
};

// 设置变更
const handleSettingsChange = (settings: any) => {
  folderId.value = settings.folderId;
  accessLevel.value = settings.accessLevel;
  optimize.value = settings.optimize;
  autoRemove.value = settings.autoRemove;
};
</script>

<template>
  <div class="upload-page">
    <!-- 页面标题 -->
    <div class="upload-page__header">
      <div>
        <h1 class="upload-page__title">快速上传</h1>
        <p class="upload-page__description">拖拽或选择文件上传，支持批量上传</p>
      </div>
    </div>

    <!-- 上传区域 + 设置面板 -->
    <div class="upload-page__top">
      <div class="upload-page__grid">
        <!-- 左侧：拖拽上传区 -->
        <div class="upload-page__drop">
          <UploadDropZone
            accept="image/*"
            :multiple="true"
            max-size-text="单个文件最大 10MB"
            @files-selected="handleFilesSelected"
          />
        </div>

        <!-- 右侧：上传设置 -->
        <div class="upload-page__settings">
          <div class="upload-page__settings-header">
            <h2 class="upload-page__settings-title">上传设置</h2>
          </div>
          <div class="upload-page__settings-content">
            <UploadSettings
              v-model:folder-id="folderId"
              v-model:access-level="accessLevel"
              v-model:optimize="optimize"
              v-model:auto-remove="autoRemove"
              @change="handleSettingsChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作按钮 -->
    <div class="upload-page__actions">
      <div class="upload-page__actions-wrapper">
        <button
          class="upload-page__btn upload-page__btn--primary"
          :disabled="!hasPendingFiles || isUploading"
          @click="handleStartUpload"
        >
          <Rocket :size="16" />
          <span>开始上传</span>
        </button>

        <button
          v-if="hasSuccessFiles"
          class="upload-page__btn upload-page__btn--success"
          @click="handleCopyAllUrls"
        >
          <Copy :size="16" />
          <span>复制链接</span>
        </button>

        <button
          class="upload-page__btn upload-page__btn--secondary"
          @click="clearQueue"
        >
          <Trash2 :size="16" />
          <span>清空队列</span>
        </button>
      </div>
    </div>

    <!-- 上传队列 -->
    <div ref="queueRef" class="upload-page__queue">
      <div class="upload-page__queue-header">
        <div class="upload-page__queue-title">
          <h2>上传队列</h2>
          <span v-if="uploadQueue.length > 0" class="upload-page__queue-count">
            {{ uploadQueue.length }} 个文件
          </span>
        </div>
        <button
          v-if="isUploading"
          class="upload-page__btn upload-page__btn--danger upload-page__btn--sm"
          @click="cancelUpload"
        >
          取消上传
        </button>
      </div>

      <!-- 统计信息 -->
      <div v-if="uploadQueue.length > 0" class="upload-page__stats">
        <UploadStats
          :pending-count="pendingCount"
          :uploading-count="uploadingCount"
          :success-count="successCount"
          :error-count="errorCount"
          :total-file-size="totalFileSize"
          :global-speed="globalSpeed"
          :global-progress="globalProgress"
        />
      </div>

      <!-- 文件列表 -->
      <div v-if="uploadQueue.length > 0" class="upload-page__list">
        <UploadProgress
          :files="uploadQueue"
          @remove="removeFile"
          @retry="retryUpload"
          @resume="resumeUpload"
          @copy-url="handleCopyUrl"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="upload-page__empty">
        <div class="upload-page__empty-icon">📤</div>
        <h3 class="upload-page__empty-title">暂无上传任务</h3>
        <p class="upload-page__empty-text">
          从上方上传区选择文件，或直接拖放文件到上传区域
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.upload-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}

.upload-page__title {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--color-text-primary),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
  letter-spacing: -0.03em;
}

.upload-page__description {
  font-size: 13px;
  color: var(--color-text-muted);
  font-weight: 500;
  opacity: 0.9;
}

.upload-page__top {
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.upload-page__top::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.05),
    transparent 60%
  );
  pointer-events: none;
}

.upload-page__grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
}

.upload-page__drop {
  min-height: 200px;
}

.upload-page__settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
}

.upload-page__settings-header {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.upload-page__settings-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.upload-page__settings-content {
  flex: 1;
}

.upload-page__actions {
  display: flex;
  justify-content: center;
  padding: 10px 16px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.upload-page__actions-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.upload-page__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-page__btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1),
    transparent
  );
  transform: translateX(-100%);
  transition: transform 0.4s;
}

.upload-page__btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.15),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.upload-page__btn:hover:not(:disabled)::before {
  transform: translateX(100%);
}

.upload-page__btn:active:not(:disabled) {
  transform: translateY(0);
}

.upload-page__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-page__btn--primary {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.85)
  );
  border: none;
  color: white;
  box-shadow:
    0 4px 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.upload-page__btn--primary::before {
  background: linear-gradient(
    135deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

.upload-page__btn--primary:hover:not(:disabled) {
  box-shadow:
    0 12px 32px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4),
    0 0 30px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.upload-page__btn--secondary {
  border-color: var(--color-border);
  background: linear-gradient(
    135deg,
    var(--color-bg-base),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
}

.upload-page__btn--secondary:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--color-bg-hover),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.05)
  );
  border-color: var(--color-primary);
}

.upload-page__btn--success {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.05),
    rgba(34, 197, 94, 0.02)
  );
}

.upload-page__btn--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border-color: transparent;
  box-shadow:
    0 8px 24px rgba(34, 197, 94, 0.35),
    0 0 20px rgba(34, 197, 94, 0.25);
}

.upload-page__btn--danger {
  border-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.08)
  );
  color: #ef4444;
}

.upload-page__btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: transparent;
  box-shadow:
    0 8px 24px rgba(239, 68, 68, 0.35),
    0 0 20px rgba(239, 68, 68, 0.25);
}

.upload-page__btn--sm {
  padding: 5px 10px;
  font-size: 12px;
}

.upload-page__queue {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 16px;
  min-height: 300px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.upload-page__queue::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.03),
    transparent 50%
  );
  pointer-events: none;
}

.upload-page__queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}

.upload-page__queue-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-page__queue-title h2 {
  font-size: 19px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--color-text-primary),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
}

.upload-page__queue-count {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.12),
    rgba(224, 50, 207, 0.08)
  );
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  letter-spacing: 0.02em;
}

.upload-page__stats {
  margin-bottom: 8px;
}

.upload-page__list {
  flex: 1;
  overflow-y: auto;
}

.upload-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 80px 20px;
  position: relative;
}

.upload-page__empty::before {
  content: "";
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08),
    transparent 70%
  );
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.upload-page__empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.6;
  position: relative;
  z-index: 1;
  filter: drop-shadow(
    0 4px 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2)
  );
  animation: bounce 3s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-page__empty-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--color-text-primary),
    var(--color-primary)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
  letter-spacing: -0.02em;
}

.upload-page__empty-text {
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
  max-width: 420px;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

@media (max-width: 1200px) {
  .upload-page__grid {
    grid-template-columns: 1fr;
  }

  .upload-page__settings {
    max-width: 100%;
  }

  .upload-page__drop {
    min-height: 180px;
  }
}

@media (max-width: 768px) {
  .upload-page {
    padding: 12px;
    gap: 10px;
  }

  .upload-page__top {
    padding: 12px;
  }

  .upload-page__grid {
    gap: 12px;
  }

  .upload-page__drop {
    min-height: 160px;
  }

  .upload-page__actions {
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
  }

  .upload-page__btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .upload-page__queue {
    padding: 12px;
    min-height: 250px;
  }
}
</style>
