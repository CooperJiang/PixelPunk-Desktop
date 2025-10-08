<script setup lang="ts">
import type { FileCardEmits, FileCardProps } from "./types";

defineOptions({
  name: "FileCard",
});

const props = withDefaults(defineProps<FileCardProps>(), {
  batchMode: false,
  selected: false,
});

const emit = defineEmits<FileCardEmits>();

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const handleClick = () => {
  if (props.batchMode) {
    emit("toggle-select", props.file.id);
  } else {
    // 点击卡片直接预览
    emit("preview", props.file);
  }
};

const handlePreview = (e: MouseEvent) => {
  e.stopPropagation();
  if (!props.batchMode) {
    emit("preview", props.file);
  }
};

const handleDelete = (e: MouseEvent) => {
  e.stopPropagation();
  if (!props.batchMode) {
    emit("delete", props.file);
  }
};

const handleToggleVisibility = (e: MouseEvent) => {
  e.stopPropagation();
  if (!props.batchMode) {
    emit("toggle-visibility", props.file, e);
  }
};

const handleCopyLink = (e: MouseEvent) => {
  e.stopPropagation();
  if (!props.batchMode) {
    emit("copy-link", props.file);
  }
};

const handleDownload = (e: MouseEvent) => {
  e.stopPropagation();
  if (!props.batchMode) {
    emit("download", props.file);
  }
};

const handleContextMenu = (e: MouseEvent) => {
  if (!props.batchMode) {
    emit("contextmenu", props.file, e);
  }
};

// 判断文件是否是图片
const isImage = (format: string) => {
  const imageFormats = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  return imageFormats.includes(format.toLowerCase());
};
</script>

<template>
  <div
    class="file-card"
    :class="{ 'batch-mode': batchMode, selected }"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <!-- 批量选择复选框 -->
    <div v-if="batchMode" class="batch-checkbox" @click.stop="handleClick">
      <div class="checkbox-icon" :class="{ checked: selected }">
        <i v-if="selected" class="fas fa-check" />
      </div>
    </div>

    <div
      v-if="!batchMode"
      class="file-visibility"
      :class="file.access_level"
      :title="
        file.access_level === 'private'
          ? '私密'
          : file.access_level === 'protected'
            ? '受保护'
            : '公开'
      "
      @click.stop.prevent="handleToggleVisibility"
      @mousedown.stop.prevent
    >
      <i
        :class="
          file.access_level === 'private'
            ? 'fas fa-lock'
            : file.access_level === 'protected'
              ? 'fas fa-shield-alt'
              : 'fas fa-globe'
        "
      />
    </div>

    <div class="file-thumbnail">
      <img
        v-if="isImage(file.format) && (file.thumb_url || file.thumbnail_url)"
        :src="file.full_thumb_url || file.thumb_url || file.thumbnail_url"
        :alt="file.display_name || file.name || file.original_name"
        draggable="false"
        class="file-image"
      />
      <div v-else class="file-icon-placeholder">
        <div class="file-icon-wrapper">
          <i class="fas fa-file-alt" />
        </div>
        <span class="file-extension">{{ file.format || file.extension }}</span>
      </div>

      <div v-if="!batchMode" class="file-hover-overlay">
        <div class="hover-actions">
          <button
            class="action-btn preview-btn"
            title="预览文件"
            @click.stop="handlePreview"
          >
            <i class="fas fa-eye" />
          </button>
          <button
            class="action-btn copy-btn"
            title="复制链接"
            @click.stop="handleCopyLink"
          >
            <i class="fas fa-link" />
          </button>
          <button
            class="action-btn download-btn"
            title="下载文件"
            @click.stop="handleDownload"
          >
            <i class="fas fa-download" />
          </button>
          <button
            class="action-btn delete-btn"
            title="删除文件"
            @click.stop="handleDelete"
          >
            <i class="fas fa-trash" />
          </button>
        </div>
      </div>
    </div>

    <div class="file-info">
      <div
        class="file-name"
        :title="file.display_name || file.name || file.original_name"
      >
        {{ file.display_name || file.name || file.original_name }}
      </div>
      <div class="file-meta">
        <div class="file-meta-item">
          <i class="fas fa-hdd" />
          <span class="meta-text">{{ formatFileSize(file.size) }}</span>
        </div>
        <div class="file-meta-item">
          <i class="fas fa-clock" />
          <span class="meta-text">{{ formatDate(file.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-card {
  position: relative;
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(var(--color-primary-rgb, 5, 217, 232), 0.08);
  border: 1px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.2);
  min-height: 80px;
  width: 100%;
  height: auto;
  min-width: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.03) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.file-card.batch-mode {
  cursor: pointer;
}

/* 可交互元素启用事件 */
.action-btn,
.file-visibility,
.batch-checkbox,
.file-hover-overlay {
  pointer-events: auto;
}

.file-card:hover {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.8);
  transform: translateY(-3px);
}

.file-card:hover::before {
  opacity: 1;
}

.file-visibility {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.file-visibility.private {
  background: rgba(255, 110, 199, 0.12);
  color: rgba(255, 110, 199, 0.9);
  border: 1px solid rgba(255, 110, 199, 0.25);
}

.file-visibility.protected {
  background: rgba(255, 159, 10, 0.12);
  color: rgba(255, 159, 10, 0.9);
  border: 1px solid rgba(255, 159, 10, 0.25);
}

.file-visibility.public {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.12);
  color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.9);
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.25);
}

.file-visibility.private:hover {
  background: rgba(255, 110, 199, 0.25);
  color: rgb(255, 110, 199);
  border-color: rgba(255, 110, 199, 0.5);
  transform: scale(1.1);
}

.file-visibility.protected:hover {
  background: rgba(255, 159, 10, 0.25);
  color: rgb(255, 159, 10);
  border-color: rgba(255, 159, 10, 0.5);
  transform: scale(1.1);
}

.file-visibility.public:hover {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.25);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.5);
  transform: scale(1.1);
}

.file-visibility i {
  font-size: 0.75rem;
}

.file-thumbnail {
  aspect-ratio: 16 / 10;
  position: relative;
  overflow: hidden;
  background: var(--color-bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.15);
  z-index: 1;
}

.file-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  -webkit-user-drag: none;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}

.file-card:not(.batch-mode):hover .file-image {
  transform: scale(1.08);
}

.file-icon-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
}

.file-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.15) 0%,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.file-icon-wrapper i {
  font-size: 28px;
  color: var(--color-primary);
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 6px rgba(var(--color-primary-rgb, 5, 217, 232), 0.6));
}

.file-card:hover .file-icon-wrapper {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.3) 0%,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1) 100%
  );
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.file-card:hover .file-icon-wrapper i {
  transform: scale(1.1);
  filter: drop-shadow(
    0 0 10px rgba(var(--color-primary-rgb, 5, 217, 232), 0.8)
  );
}

.file-extension {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4);
}

.file-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.file-card:not(.batch-mode):hover .file-hover-overlay {
  opacity: 1;
}

/* 权限按钮 hover 时隐藏遮罩 */
.file-visibility:hover ~ .file-thumbnail .file-hover-overlay {
  opacity: 0 !important;
  pointer-events: none;
}

/* 拖动时隐藏hover遮罩 */
.sortable-chosen .file-hover-overlay,
.sortable-ghost .file-hover-overlay {
  display: none !important;
  opacity: 0 !important;
}

.hover-actions {
  display: flex;
  gap: 12px;
}

.hover-actions .action-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  width: 36px;
  height: 36px;
  color: white;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hover-actions .action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hover-actions .preview-btn:hover {
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.5);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.hover-actions .copy-btn:hover {
  color: rgb(255, 193, 7);
  border-color: rgba(255, 193, 7, 0.5);
  background: rgba(255, 193, 7, 0.2);
}

.hover-actions .download-btn:hover {
  color: rgb(76, 175, 80);
  border-color: rgba(76, 175, 80, 0.5);
  background: rgba(76, 175, 80, 0.2);
}

.hover-actions .delete-btn:hover {
  color: rgb(239, 68, 68);
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.2);
}

.file-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.file-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.file-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-meta-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
  flex-shrink: 0;
}

.file-meta-item i {
  margin-right: 4px;
  color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.8);
  font-size: 0.7rem;
  width: 10px;
  text-align: center;
  flex-shrink: 0;
}

.file-meta-item .meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100px;
}

/* 批量选择模式 */
.file-card.batch-mode {
  cursor: pointer;
}

.file-card.batch-mode.selected {
  border-color: var(--color-primary);
  box-shadow:
    0 0 0 2px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    var(--shadow-lg);
}

.batch-checkbox {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 10;
  cursor: pointer;
}

.checkbox-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 2px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.3);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.checkbox-icon.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4);
}

.checkbox-icon i {
  color: white;
  font-size: 14px;
}
</style>
