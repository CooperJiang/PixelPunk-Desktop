<template>
  <div class="float-ball-wrapper">
    <div
      data-tauri-drag-region
      class="float-ball-container"
      :class="{ uploading: isUploading, 'drag-over': isDragOver }"
    >
      <div class="float-ball">
        <!-- 上传进度环 -->
        <svg v-if="isUploading" class="progress-ring" viewBox="0 0 56 56">
          <circle
            class="progress-ring-bg"
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke-width="3"
          />
          <circle
            class="progress-ring-circle"
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke-width="3"
            :stroke-dasharray="`${circumference} ${circumference}`"
            :stroke-dashoffset="progressOffset"
          />
        </svg>

        <!-- 悬浮球图标 -->
        <div class="float-ball-icon">
          <Upload v-if="!isUploading" :size="22" />
          <div v-else class="upload-percent">{{ uploadPercent }}%</div>
        </div>

        <!-- 拖放提示 -->
        <div v-if="isDragOver" class="drag-hint">
          <span class="drag-hint-text">松开上传</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Upload } from "lucide-vue-next";
import { listen } from "@tauri-apps/api/event";
import { useUploadStore } from "@/stores/upload";

const uploadStore = useUploadStore();

const isDragOver = ref(false);

const isUploading = computed(() => uploadStore.isUploading);
const uploadPercent = computed(() => Math.round(uploadStore.totalProgress));

// 进度环计算
const circumference = 2 * Math.PI * 24;
const progressOffset = computed(() => {
  const progress = uploadStore.totalProgress / 100;
  return circumference - progress * circumference;
});

// 监听文件拖放事件
let unlistenDrop: (() => void) | null = null;
let unlistenDragOver: (() => void) | null = null;
let unlistenDragLeave: (() => void) | null = null;

onMounted(async () => {
  // 设置 body 背景透明
  // eslint-disable-next-line no-undef
  document.body.style.background = "transparent";
  // eslint-disable-next-line no-undef
  document.documentElement.style.background = "transparent";

  // 监听文件拖放
  unlistenDrop = await listen<string[]>("tauri://file-drop", (event) => {
    const files = event.payload;
    isDragOver.value = false;
    console.log("Files dropped:", files);
    uploadStore.addFiles(files);
  });

  unlistenDragOver = await listen("tauri://file-drop-hover", () => {
    isDragOver.value = true;
  });

  unlistenDragLeave = await listen("tauri://file-drop-cancelled", () => {
    isDragOver.value = false;
  });
});

onUnmounted(() => {
  if (unlistenDrop) unlistenDrop();
  if (unlistenDragOver) unlistenDragOver();
  if (unlistenDragLeave) unlistenDragLeave();
});
</script>

<style scoped>
.float-ball-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.float-ball-container {
  width: 56px;
  height: 56px;
  cursor: grab;
  user-select: none;
  background: transparent;
}

.float-ball-container:active {
  cursor: grabbing;
}

.float-ball {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  pointer-events: none;
}

/* Hover 效果：提亮颜色 */
.float-ball-container:hover .float-ball {
  background: linear-gradient(135deg, #7c8ef5 0%, #8b5bb5 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

/* Active 效果：轻微缩小 */
.float-ball-container:active .float-ball {
  transform: scale(0.95);
}

/* 上传状态 */
.float-ball-container.uploading .float-ball {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: uploading-pulse 1.5s ease-in-out infinite;
}

.float-ball-container.uploading:hover .float-ball {
  background: linear-gradient(135deg, #f5a5ff 0%, #ff6b7f 100%);
}

/* 拖拽悬停状态 */
.float-ball-container.drag-over .float-ball {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.6);
  transform: scale(1.05);
}

/* 上传脉动动画 */
@keyframes uploading-pulse {
  0%,
  100% {
    box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);
  }
  50% {
    box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
  }
}

.float-ball-icon {
  color: white;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.upload-percent {
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

/* 进度环 */
.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-ring-bg {
  stroke: rgba(255, 255, 255, 0.2);
}

.progress-ring-circle {
  stroke: white;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

/* 拖放提示 */
.drag-hint {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  animation: fade-in 0.2s ease;
}

.drag-hint-text {
  color: white;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
