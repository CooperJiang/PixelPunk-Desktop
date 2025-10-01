<template>
  <div class="float-ball-wrapper">
    <div
      data-tauri-drag-region
      class="float-ball-container"
      :class="{ 'drag-over': isDragOver }"
    >
      <div class="float-ball">
        <!-- 悬浮球图标 -->
        <div class="float-ball-icon">
          <Upload :size="22" />
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
import { ref, onMounted, onUnmounted } from "vue";
import { Upload } from "lucide-vue-next";
import { listen, emit } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

const isDragOver = ref(false);

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

  // 监听文件拖放 (Tauri 2.0 事件)
  unlistenDrop = await listen("tauri://drag-drop", async (event: any) => {
    const files = event.payload.paths || event.payload;
    isDragOver.value = false;

    // 显示主窗口
    try {
      await invoke("show_main_window");

      // 延迟发送事件，确保主窗口已经完全显示
      // eslint-disable-next-line no-undef
      setTimeout(async () => {
        await emit("files-dropped", { files });
      }, 100);
    } catch (error) {
      console.error("Failed to show main window or emit event:", error);
    }
  });

  unlistenDragOver = await listen("tauri://drag-over", () => {
    isDragOver.value = true;
  });

  unlistenDragLeave = await listen("tauri://drag-leave", () => {
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

/* 拖拽悬停状态 */
.float-ball-container.drag-over .float-ball {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  box-shadow: 0 6px 20px rgba(74, 222, 128, 0.6);
  transform: scale(1.05);
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
