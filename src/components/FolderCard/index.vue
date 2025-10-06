<script setup lang="ts">
import type { FolderCardEmits, FolderCardProps } from "./types";

defineOptions({
  name: "FolderCard",
});

const props = defineProps<FolderCardProps>();
const emit = defineEmits<FolderCardEmits>();

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const handleClick = () => {
  emit("click", props.folder);
};

const handleEdit = (e: MouseEvent) => {
  e.stopPropagation();
  emit("edit", props.folder);
};

const handleDelete = (e: MouseEvent) => {
  e.stopPropagation();
  emit("delete", props.folder);
};

const handleToggleVisibility = (e: MouseEvent) => {
  e.stopPropagation();
  emit("toggle-visibility", props.folder, e);
};

const handleContextMenu = (e: MouseEvent) => {
  emit("contextmenu", props.folder, e);
};
</script>

<template>
  <div
    class="folder-card"
    @click="handleClick"
    @contextmenu="handleContextMenu"
  >
    <div
      class="folder-visibility"
      :class="folder.permission === 'private' ? 'private' : 'public'"
      :title="folder.permission === 'private' ? '私密' : '公开'"
      @click="handleToggleVisibility"
    >
      <i
        :class="
          folder.permission === 'private' ? 'fas fa-lock' : 'fas fa-globe'
        "
      />
    </div>

    <div class="folder-card-content">
      <div class="folder-icon-container">
        <div class="folder-icon-wrapper">
          <i class="fas fa-folder" />
        </div>
      </div>
      <div class="folder-details">
        <div class="folder-name" :title="folder.name">{{ folder.name }}</div>
        <div class="folder-meta">
          <div class="folder-meta-item">
            <i class="fas fa-clock" />
            <span class="meta-text">{{ formatDate(folder.created_at) }}</span>
          </div>
          <div v-if="folder.file_count !== undefined" class="folder-meta-item">
            <i class="fas fa-image" />
            <span class="meta-text">{{ folder.file_count || 0 }} 张</span>
          </div>
        </div>
      </div>
    </div>

    <div class="folder-card-actions">
      <button
        class="folder-action-btn delete-btn"
        title="删除文件夹"
        @click="handleDelete"
      >
        <i class="fas fa-trash" />
      </button>
      <button
        class="folder-action-btn edit-btn"
        title="编辑文件夹"
        @click="handleEdit"
      >
        <i class="fas fa-edit" />
      </button>
    </div>

    <div class="folder-highlight" />
  </div>
</template>

<style scoped>
.folder-card {
  position: relative;
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 12px;
  cursor: inherit;
  touch-action: inherit;
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -webkit-touch-callout: none;
  pointer-events: auto;
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
  overflow: hidden;
}

.folder-card::before {
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

.folder-card:active {
  cursor: grabbing;
}

/* 确保拖动时不影响事件 */
.folder-card * {
  pointer-events: none;
}

.folder-card .folder-action-btn,
.folder-card .folder-visibility {
  pointer-events: auto;
}

.folder-card:hover {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.8);
  transform: translateY(-3px);
}

.folder-card:hover::before {
  opacity: 1;
}

.folder-card-content {
  padding: 12px;
  padding-right: 44px;
  padding-bottom: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.folder-icon-container {
  flex-shrink: 0;
}

.folder-icon-wrapper {
  width: 44px;
  height: 44px;
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

.folder-icon-wrapper i {
  font-size: 20px;
  color: var(--color-primary);
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 6px rgba(var(--color-primary-rgb, 5, 217, 232), 0.6));
}

.folder-card:hover .folder-icon-wrapper {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.3) 0%,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1) 100%
  );
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.folder-card:hover .folder-icon-wrapper i {
  transform: scale(1.1);
  filter: drop-shadow(
    0 0 10px rgba(var(--color-primary-rgb, 5, 217, 232), 0.8)
  );
}

.folder-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.folder-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.folder-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.folder-meta-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.folder-meta-item i {
  margin-right: 6px;
  color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.8);
  font-size: 0.7rem;
  width: 10px;
  text-align: center;
  flex-shrink: 0;
}

.folder-meta-item .meta-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.folder-visibility {
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

.folder-visibility.private {
  background: rgba(255, 110, 199, 0.12);
  color: rgba(255, 110, 199, 0.9);
  border: 1px solid rgba(255, 110, 199, 0.25);
}

.folder-visibility.public {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.12);
  color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.9);
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.25);
}

.folder-visibility.private:hover {
  background: rgba(255, 110, 199, 0.25);
  color: rgb(255, 110, 199);
  border-color: rgba(255, 110, 199, 0.5);
  transform: scale(1.1);
}

.folder-visibility.public:hover {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.25);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.5);
  transform: scale(1.1);
}

.folder-visibility i {
  font-size: 0.75rem;
}

.folder-card-actions {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  opacity: 1;
  z-index: 3;
}

.folder-action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--color-text-secondary);
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 0.7rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.folder-action-btn.delete-btn {
  color: rgba(239, 68, 68, 0.7);
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

.folder-action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(239, 68, 68);
  border-color: rgba(239, 68, 68, 0.6);
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

.folder-action-btn.edit-btn {
  color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.8);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.folder-action-btn.edit-btn:hover {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.5);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
}

.folder-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 0;
  background: linear-gradient(
    to bottom,
    var(--color-primary),
    rgb(255, 110, 199)
  );
  transition: height 0.3s ease;
}

.folder-card:hover .folder-highlight {
  height: 100%;
}
</style>
