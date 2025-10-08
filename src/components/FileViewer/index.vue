<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import type { FileViewerProps, FileViewerEmits } from "./types";
import type { FileInfo } from "@/api/types";
import { downloadFileQuick } from "@/utils/file/downloader";
import { message } from "@/components/Message/message";
import { useTheme } from "@/composables/useTheme";

interface Props extends FileViewerProps {
  modelValue: boolean;
  showKeyboardTips?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  file: null,
  files: () => [],
  initialIndex: 0,
  showKeyboardTips: true,
});

const emit = defineEmits<FileViewerEmits>();

// 主题
const { isDark } = useTheme();

// 显示控制
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// 当前索引
const currentIndex = ref(props.initialIndex);

// 监听 initialIndex 变化，同步更新 currentIndex
watch(
  () => props.initialIndex,
  (newIndex) => {
    console.log("🔄 [FileViewer] initialIndex 变化:", {
      旧索引: currentIndex.value,
      新索引: newIndex,
    });
    currentIndex.value = newIndex;
  },
);

// 当前文件
const currentFile = computed(() => {
  let file;
  if (props.files && props.files.length > 0) {
    file = props.files[currentIndex.value] || props.file;
  } else {
    file = props.file;
  }

  // 🔍 调试日志：打印当前文件的详细信息
  console.log("📌 [FileViewer] currentFile computed 触发:", {
    "props.file": props.file
      ? {
          id: props.file.id,
          name:
            props.file.display_name ||
            props.file.name ||
            props.file.original_name,
          full_url: props.file.full_url,
          url: props.file.url,
        }
      : null,
    "props.files.length": props.files?.length || 0,
    currentIndex: currentIndex.value,
    返回的file: file
      ? {
          id: file.id,
          name: file.display_name || file.name || file.original_name,
          full_url: file.full_url,
          url: file.url,
        }
      : null,
  });

  return file;
});

// 文件URL
const fileUrl = computed(() => {
  const file = currentFile.value;
  const url = file?.full_url || file?.url || "";

  // 🔍 调试日志：打印FileViewer接收到的文件数据
  if (file) {
    console.log("🖼️ [FileViewer] 当前预览文件:", {
      id: file.id,
      name: file.display_name || file.name || file.original_name,
      url: file.url,
      full_url: file.full_url,
      thumb_url: file.thumb_url,
      full_thumb_url: file.full_thumb_url,
      thumbnail_url: file.thumbnail_url,
      最终使用的URL: url,
    });
  }

  return url;
});

// 导航控制
const hasMultipleFiles = computed(() => props.files && props.files.length > 1);
const hasPreviousFile = computed(
  () => hasMultipleFiles.value && currentIndex.value > 0,
);
const hasNextFile = computed(
  () =>
    hasMultipleFiles.value &&
    currentIndex.value < (props.files?.length || 0) - 1,
);

// 图片变换状态
const scale = ref(1);
const rotate = ref(0);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// 填充/适应模式
const isFillMode = ref(false);

// 加载状态
const isLoading = ref(true);
const hasError = ref(false);

// UI显示控制
const showControls = ref(true);
let controlsTimer: number | null = null;

// 快捷键提示显示
const showKeyboardTipsVisible = ref(false);
let keyboardTipsTimer: number | null = null;

// 图片亮度检测
const imageBrightness = ref(0.5);
const isLightBackground = computed(() => imageBrightness.value > 0.55);

// 图片样式 - 根据模式动态调整
const imageStyle = computed(() => {
  const baseTransform = `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotate.value}deg)`;

  if (isFillMode.value) {
    // 填充模式：占满整个容器
    return {
      transform: baseTransform,
      transition: isDragging.value ? "none" : "transform 0.3s ease",
      cursor: isDragging.value
        ? "grabbing"
        : scale.value > 1
          ? "grab"
          : "default",
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "cover" as const,
    };
  } else {
    // 适应模式：保持宽高比，最大化使用窗口
    return {
      transform: baseTransform,
      transition: isDragging.value ? "none" : "transform 0.3s ease",
      cursor: isDragging.value
        ? "grabbing"
        : scale.value > 1
          ? "grab"
          : "default",
      maxWidth: "90%",
      maxHeight: "90%",
      objectFit: "contain" as const,
    };
  }
});

// AI描述
const description = computed(() => {
  const file = currentFile.value;
  return file?.ai_info?.description || file?.description || null;
});

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// 格式化文件信息
const sizeFormatted = computed(() => {
  const file = currentFile.value;
  return file?.size_formatted || (file?.size ? formatFileSize(file.size) : "");
});

// 检测图片亮度
const detectImageBrightness = (imageUrl: string) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let total = 0;
      let count = 0;

      // 采样像素计算平均亮度
      for (let i = 0; i < data.length; i += 12) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 使用相对亮度公式
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        total += brightness;
        count++;
      }

      imageBrightness.value = total / count;
    } catch {
      // 跨域等错误时使用默认值
      imageBrightness.value = 0.5;
    }
  };

  img.onerror = () => {
    imageBrightness.value = 0.5;
  };

  img.src = imageUrl;
};

// 方法
const handleClose = () => {
  visible.value = false;
  emit("close");
};

const handlePrevious = () => {
  if (hasPreviousFile.value) {
    currentIndex.value--;
    resetTransform();
  }
};

const handleNext = () => {
  if (hasNextFile.value) {
    currentIndex.value++;
    resetTransform();
  }
};

const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 5);
  resetControlsTimer();
};

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.1);
  resetControlsTimer();
};

const rotateLeft = () => {
  rotate.value -= 90;
  resetControlsTimer();
};

const rotateRight = () => {
  rotate.value += 90;
  resetControlsTimer();
};

const resetTransform = () => {
  scale.value = 1;
  rotate.value = 0;
  translateX.value = 0;
  translateY.value = 0;
};

const toggleFitMode = () => {
  // 如果已经缩放或移动，先重置再切换模式
  if (scale.value !== 1) {
    resetTransform();
  }
  isFillMode.value = !isFillMode.value;
  resetControlsTimer();
};

const handleDownload = async () => {
  const file = currentFile.value;
  if (file) {
    const fileId = file.id;
    const fileName = file.display_name || file.name || file.original_name;

    message.info("正在下载文件...");

    const result = await downloadFileQuick(fileId, fileName);

    if (result.success) {
      message.success("文件已保存");
    } else if (result.error !== "用户取消了保存") {
      message.error(`下载失败：${result.error || "未知错误"}`);
    }
  }
};

const handleImageLoad = () => {
  console.log("✅ [FileViewer] 图片加载成功:", {
    file: currentFile.value
      ? {
          id: currentFile.value.id,
          name:
            currentFile.value.display_name ||
            currentFile.value.name ||
            currentFile.value.original_name,
        }
      : null,
    url: fileUrl.value,
  });
  isLoading.value = false;
  hasError.value = false;
  if (currentFile.value) {
    emit("load", currentFile.value);
  }
};

const handleImageError = (event: Event) => {
  console.error("❌ [FileViewer] 图片加载失败:", {
    file: currentFile.value
      ? {
          id: currentFile.value.id,
          name:
            currentFile.value.display_name ||
            currentFile.value.name ||
            currentFile.value.original_name,
        }
      : null,
    url: fileUrl.value,
    event: event,
  });
  isLoading.value = false;
  hasError.value = true;
  if (currentFile.value) {
    emit("error", { file: currentFile.value, event: new Event("error") });
  }
};

// 鼠标拖拽
const handleMouseDown = (e: MouseEvent) => {
  if (scale.value > 1) {
    isDragging.value = true;
    dragStart.value = {
      x: e.clientX - translateX.value,
      y: e.clientY - translateY.value,
    };
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    translateX.value = e.clientX - dragStart.value.x;
    translateY.value = e.clientY - dragStart.value.y;
  } else {
    resetControlsTimer();
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// 滚轮缩放
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

// 控制栏显示管理
const resetControlsTimer = () => {
  showControls.value = true;
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
  controlsTimer = setTimeout(() => {
    showControls.value = false;
  }, 3000);
};

// 快捷键提示管理
const showKeyboardTipsTemporary = () => {
  if (!props.showKeyboardTips) return;

  showKeyboardTipsVisible.value = true;
  if (keyboardTipsTimer) {
    clearTimeout(keyboardTipsTimer);
  }
  keyboardTipsTimer = setTimeout(() => {
    showKeyboardTipsVisible.value = false;
  }, 5000);
};

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return;

  switch (e.key) {
    case "Escape":
      handleClose();
      break;
    case "ArrowLeft":
      handlePrevious();
      break;
    case "ArrowRight":
      handleNext();
      break;
    case "+":
    case "=":
      zoomIn();
      break;
    case "-":
      zoomOut();
      break;
    case "0":
      resetTransform();
      break;
    case "r":
    case "R":
      rotateRight();
      break;
    case "l":
    case "L":
      rotateLeft();
      break;
    case " ":
      e.preventDefault();
      toggleFitMode();
      break;
  }
};

// 监听文件变化
watch(currentIndex, (newIndex) => {
  if (props.files && props.files[newIndex]) {
    emit("change", props.files[newIndex], newIndex);
    isLoading.value = true;
    hasError.value = false;
  }
});

watch(
  () => props.file,
  (newFile) => {
    console.log("🔄 [FileViewer] props.file 变化:", {
      新文件: newFile
        ? {
            id: newFile.id,
            name: newFile.display_name || newFile.name || newFile.original_name,
            full_url: newFile.full_url,
            url: newFile.url,
          }
        : null,
    });
    isLoading.value = true;
    hasError.value = false;
    resetTransform();
  },
);

watch(visible, (newValue) => {
  if (newValue) {
    resetControlsTimer();
    showKeyboardTipsTemporary();
  } else {
    if (controlsTimer) {
      clearTimeout(controlsTimer);
    }
    if (keyboardTipsTimer) {
      clearTimeout(keyboardTipsTimer);
    }
  }
});

// 监听文件URL变化，检测亮度
watch(
  fileUrl,
  (newUrl) => {
    if (newUrl) {
      detectImageBrightness(newUrl);
    }
  },
  { immediate: true },
);

// 生命周期
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("mousemove", handleMouseMove);

  if (visible.value) {
    showKeyboardTipsTemporary();
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("mouseup", handleMouseUp);
  document.removeEventListener("mousemove", handleMouseMove);
  if (controlsTimer) {
    clearTimeout(controlsTimer);
  }
  if (keyboardTipsTimer) {
    clearTimeout(keyboardTipsTimer);
  }
});
</script>

<template>
  <Teleport to="body">
    <transition name="viewer-fade">
      <div v-if="visible" class="file-viewer">
        <!-- 背景 -->
        <div
          class="viewer-backdrop"
          :class="{ 'is-light': !isDark }"
          @click="handleClose"
        />

        <!-- 内容区 -->
        <div class="viewer-container">
          <!-- 顶部导航栏 -->
          <div
            class="navigation-bar"
            :class="{ 'is-hidden': !showControls, 'is-light': !isDark }"
          >
            <div class="nav-title">
              <span class="file-name">
                {{
                  currentFile?.display_name ||
                  currentFile?.name ||
                  currentFile?.original_name ||
                  "文件预览"
                }}
              </span>
              <div class="file-info-tags">
                <span
                  v-if="currentFile?.resolution"
                  class="info-tag resolution-tag"
                >
                  {{ currentFile.resolution }}
                </span>
                <span
                  v-if="currentFile?.width && currentFile?.height"
                  class="info-tag dimension-tag"
                >
                  {{ currentFile.width }} × {{ currentFile.height }}
                </span>
                <span v-if="sizeFormatted" class="info-tag size-tag">
                  {{ sizeFormatted }}
                </span>
                <span v-if="currentFile?.format" class="info-tag format-tag">
                  {{ currentFile.format.toUpperCase() }}
                </span>
              </div>
            </div>

            <div class="nav-actions">
              <button
                class="action-btn"
                title="下载 (D)"
                @click="handleDownload"
              >
                <i class="fas fa-download" />
              </button>
              <button
                class="action-btn"
                title="关闭 (Esc)"
                @click="handleClose"
              >
                <i class="fas fa-times" />
              </button>
            </div>
          </div>

          <!-- 图片显示区 -->
          <div class="viewer-content" @wheel="handleWheel">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="loading-state">
              <i class="fas fa-spinner fa-spin" />
              <span>加载中...</span>
            </div>

            <!-- 错误状态 -->
            <div v-if="hasError" class="error-state">
              <i class="fas fa-exclamation-triangle" />
              <span>加载失败</span>
            </div>

            <!-- 图片 -->
            <img
              v-show="!isLoading && !hasError"
              :src="fileUrl"
              :alt="
                currentFile?.display_name ||
                currentFile?.name ||
                currentFile?.original_name
              "
              :style="imageStyle"
              class="viewer-image"
              @load="handleImageLoad"
              @error="handleImageError"
              @mousedown="handleMouseDown"
            />

            <!-- 左右导航按钮 -->
            <button
              v-if="hasPreviousFile"
              class="nav-btn nav-prev"
              :class="{ 'is-hidden': !showControls, 'is-light': !isDark }"
              @click.stop="handlePrevious"
            >
              <i class="fas fa-chevron-left" />
            </button>
            <button
              v-if="hasNextFile"
              class="nav-btn nav-next"
              :class="{ 'is-hidden': !showControls, 'is-light': !isDark }"
              @click.stop="handleNext"
            >
              <i class="fas fa-chevron-right" />
            </button>

            <!-- 快捷键提示 - 左下角 -->
            <div
              v-if="showKeyboardTips && showControls && showKeyboardTipsVisible"
              class="keyboard-tips"
              :class="{ 'is-light': !isDark }"
            >
              <div class="tips-header">
                <i class="fas fa-keyboard" />
                <span>快捷键</span>
              </div>
              <div class="tips-content">
                <div class="tip-item">
                  <kbd>←→</kbd>
                  <span>切换文件</span>
                </div>
                <div class="tip-item">
                  <kbd>空格</kbd>
                  <span>{{ isFillMode ? "适应" : "填充" }}模式</span>
                </div>
                <div class="tip-item">
                  <kbd>±</kbd>
                  <span>缩放</span>
                </div>
                <div class="tip-item">
                  <kbd>R/L</kbd>
                  <span>旋转</span>
                </div>
                <div class="tip-item">
                  <kbd>ESC</kbd>
                  <span>退出</span>
                </div>
              </div>
            </div>

            <!-- AI描述 - 底部中间 -->
            <div
              v-if="description"
              class="file-description"
              :class="{ 'is-hidden': !showControls, 'is-light': !isDark }"
            >
              <div class="description-content">
                <div class="description-text">
                  {{ description }}
                </div>
              </div>
            </div>
          </div>

          <!-- 底部工具栏 -->
          <div
            class="viewer-footer"
            :class="{ 'is-hidden': !showControls, 'is-light': !isDark }"
          >
            <div class="footer-left">
              <span v-if="hasMultipleFiles" class="file-counter">
                {{ currentIndex + 1 }} / {{ props.files?.length }}
              </span>
            </div>
            <div class="footer-center">
              <button class="tool-btn" title="放大 (+)" @click="zoomIn">
                <i class="fas fa-search-plus" />
              </button>
              <button class="tool-btn" title="缩小 (-)" @click="zoomOut">
                <i class="fas fa-search-minus" />
              </button>
              <button class="tool-btn" title="左旋转 (L)" @click="rotateLeft">
                <i class="fas fa-undo" />
              </button>
              <button class="tool-btn" title="右旋转 (R)" @click="rotateRight">
                <i class="fas fa-redo" />
              </button>
              <button class="tool-btn" title="重置 (0)" @click="resetTransform">
                <i class="fas fa-compress" />
              </button>
              <button
                class="tool-btn"
                :title="
                  isFillMode ? '切换到适应模式 (空格)' : '切换到填充模式 (空格)'
                "
                @click="toggleFitMode"
              >
                <i
                  :class="
                    isFillMode
                      ? 'fas fa-compress-arrows-alt'
                      : 'fas fa-expand-arrows-alt'
                  "
                />
              </button>
              <span class="zoom-indicator">{{ Math.round(scale * 100) }}%</span>
            </div>
            <div class="footer-right" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.file-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-bg-base);
  opacity: 0.98;
  backdrop-filter: blur(10px);
}

.viewer-backdrop.is-light {
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  opacity: 0.96;
}

.viewer-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* 顶部导航栏 */
.navigation-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(
    to bottom,
    var(--color-bg-elevated) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.navigation-bar.is-light {
  background: linear-gradient(
    to bottom,
    rgba(248, 250, 252, 0.95) 0%,
    rgba(241, 245, 249, 0.7) 70%,
    transparent 100%
  );
}

.navigation-bar.is-hidden {
  opacity: 0;
  transform: translateY(-20px);
  pointer-events: none;
}

.nav-title {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 0 20px var(--color-glow);
  letter-spacing: 0.5px;
}

.file-info-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.info-tag {
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: var(--color-bg-active);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-glow);
}

/* 图片显示区 */
.viewer-content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.viewer-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  user-select: none;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
}

.loading-state i,
.error-state i {
  font-size: 48px;
  color: var(--color-primary);
}

/* 导航按钮 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-size: 18px;
}

.nav-btn:hover {
  background: var(--color-bg-active);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-50%) scale(1.05);
  box-shadow: 0 4px 20px var(--color-glow);
}

.nav-btn.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.nav-prev {
  left: 24px;
}

.nav-next {
  right: 24px;
}

/* 快捷键提示 - 左下角 */
.keyboard-tips {
  position: absolute;
  bottom: 90px;
  left: 30px;
  background: var(--color-bg-elevated);
  backdrop-filter: blur(25px);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--color-text-primary);
  animation: slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width: 240px;
  pointer-events: auto;
  box-shadow: var(--shadow-lg);
}

.keyboard-tips.is-light {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(203, 213, 225, 0.6);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
  letter-spacing: 0.3px;
}

.tips-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tip-item kbd {
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border-hover);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 10px;
  font-family: inherit;
  color: var(--color-text-primary);
  min-width: 28px;
  text-align: center;
  font-weight: 600;
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
  letter-spacing: 0.2px;
}

/* AI描述 */
.file-description {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-elevated);
  backdrop-filter: blur(25px);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 0;
  animation: slideInUp 0.5s ease;
  max-width: min(85vw, 800px);
  min-width: 350px;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s ease;
}

.file-description.is-light {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(203, 213, 225, 0.6);
}

.file-description.is-hidden {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
  pointer-events: none;
}

.description-content {
  padding: 20px 28px;
  position: relative;
}

.description-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-primary);
  text-align: center;
  word-wrap: break-word;
  position: relative;
  font-weight: 500;
  letter-spacing: 0.4px;
}

.description-text::before {
  content: '"';
  position: absolute;
  left: -12px;
  top: -8px;
  font-size: 28px;
  color: var(--color-primary);
  opacity: 0.5;
  font-family: Georgia, serif;
  line-height: 1;
}

.description-text::after {
  content: '"';
  position: absolute;
  right: -12px;
  bottom: -16px;
  font-size: 28px;
  color: var(--color-primary);
  opacity: 0.5;
  font-family: Georgia, serif;
  line-height: 1;
}

/* 底部工具栏 */
.viewer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(
    to top,
    var(--color-bg-elevated) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 100;
}

.viewer-footer.is-light {
  background: linear-gradient(
    to top,
    rgba(248, 250, 252, 0.95) 0%,
    rgba(241, 245, 249, 0.7) 70%,
    transparent 100%
  );
}

.viewer-footer.is-hidden {
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}

.footer-left,
.footer-right {
  flex: 1;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-counter {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.tool-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-hover);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tool-btn:hover {
  background: var(--color-bg-active);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
}

.zoom-indicator {
  min-width: 50px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 动画 */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .navigation-bar,
  .viewer-footer {
    padding: 12px 16px;
  }

  .file-name {
    font-size: 14px;
  }

  .info-tag {
    font-size: 10px;
    padding: 1px 6px;
  }

  .action-btn,
  .tool-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .nav-btn {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .file-description {
    min-width: 280px;
    max-width: 90vw;
    bottom: 100px;
  }

  .description-text {
    font-size: 13px;
  }

  .keyboard-tips {
    left: 20px;
    bottom: 85px;
    max-width: 200px;
    padding: 10px 12px;
  }
}
</style>
