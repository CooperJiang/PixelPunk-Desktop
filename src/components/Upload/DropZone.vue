<script setup lang="ts">
import { ref, computed } from "vue";
import { CloudUpload, Image, Minimize, Shield } from "lucide-vue-next";

interface Props {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSizeText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: "image/*",
  multiple: true,
  disabled: false,
  maxSizeText: "单个文件最大 10MB",
});

const emit = defineEmits<{
  filesSelected: [files: FileList];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);

// 快捷键提示文本
const pasteShortcut = computed(() => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  return {
    key: isMac ? "Cmd" : "Ctrl",
    isMac,
  };
});

// 触发文件选择
const triggerFileInput = () => {
  if (props.disabled) return;
  fileInput.value?.click();
};

// 拖拽进入
const onDragOver = (event: DragEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  isDragging.value = true;
};

// 拖拽离开
const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

// 放下文件
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;

  if (props.disabled) return;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    emit("filesSelected", files);
  }
};

// 文件选择变化
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit("filesSelected", target.files);
    target.value = ""; // 清空，允许重复选择同一文件
  }
};

// 粘贴上传
const handlePaste = (e: ClipboardEvent) => {
  if (props.disabled) return;

  const items = e.clipboardData?.items;
  if (!items) return;

  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        files.push(file);
      }
    }
  }

  if (files.length > 0) {
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    emit("filesSelected", dt.files);
  }
};

// 挂载时添加粘贴监听
import { onMounted, onBeforeUnmount } from "vue";

onMounted(() => {
  document.addEventListener("paste", handlePaste);
});

onBeforeUnmount(() => {
  document.removeEventListener("paste", handlePaste);
});
</script>

<template>
  <div
    class="upload-drop-zone"
    :class="{
      'upload-drop-zone--dragging': isDragging,
      'upload-drop-zone--disabled': disabled,
    }"
    @click="triggerFileInput"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      class="upload-drop-zone__input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <div class="upload-drop-zone__content">
      <!-- 上传图标 -->
      <div class="upload-drop-zone__icon">
        <CloudUpload :size="48" :stroke-width="1.5" />
      </div>

      <!-- 主要提示文字 -->
      <div class="upload-drop-zone__text">
        <p class="upload-drop-zone__title">拖放文件到这里</p>
        <p class="upload-drop-zone__subtitle">
          或<span class="upload-drop-zone__link"> 点击选择文件</span>
        </p>
      </div>

      <!-- 功能标签 -->
      <div class="upload-drop-zone__features">
        <div class="upload-drop-zone__feature">
          <Image :size="16" />
          <span>批量上传</span>
        </div>
        <div class="upload-drop-zone__feature">
          <Minimize :size="16" />
          <span>自动优化</span>
        </div>
        <div class="upload-drop-zone__feature">
          <Shield :size="16" />
          <span>安全存储</span>
        </div>
      </div>

      <!-- 快捷键提示 -->
      <div class="upload-drop-zone__shortcut">
        <span>快捷键:</span>
        <kbd class="upload-drop-zone__kbd">{{ pasteShortcut.key }}</kbd>
        <span>+</span>
        <kbd class="upload-drop-zone__kbd">V</kbd>
        <span>粘贴上传</span>
      </div>

      <!-- 大小限制 -->
      <div class="upload-drop-zone__limit">
        {{ maxSizeText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-drop-zone {
  position: relative;
  min-height: 320px;
  padding: 40px;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated) 0%,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02) 100%
  );
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.upload-drop-zone::before {
  content: "";
  position: absolute;
  inset: -50%;
  background: radial-gradient(
    circle at center,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.upload-drop-zone:hover:not(.upload-drop-zone--disabled)::before {
  opacity: 1;
}

.upload-drop-zone::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.03),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08),
    rgba(224, 50, 207, 0.03)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.upload-drop-zone:hover:not(.upload-drop-zone--disabled) {
  border-color: var(--color-primary);
  box-shadow:
    0 0 40px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    inset 0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.05);
  transform: translateY(-2px);
}

.upload-drop-zone:hover:not(.upload-drop-zone--disabled)::after {
  opacity: 1;
}

.upload-drop-zone--dragging {
  border-color: var(--color-primary);
  border-style: solid;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08),
    rgba(224, 50, 207, 0.05)
  );
  box-shadow:
    0 0 50px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    inset 0 0 30px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  transform: scale(1.01);
}

.upload-drop-zone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: var(--color-bg-base);
}

.upload-drop-zone__input {
  display: none;
}

.upload-drop-zone__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 1;
}

.upload-drop-zone__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.15),
    rgba(224, 50, 207, 0.12)
  );
  color: var(--color-primary);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 8px 32px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.upload-drop-zone__icon::before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.8)
  );
  opacity: 0;
  filter: blur(8px);
  transition: opacity 0.4s;
  z-index: -1;
}

.upload-drop-zone:hover .upload-drop-zone__icon {
  transform: scale(1.1) translateY(-4px);
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    rgba(224, 50, 207, 0.18)
  );
  box-shadow:
    0 12px 48px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    0 0 0 4px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.upload-drop-zone:hover .upload-drop-zone__icon::before {
  opacity: 0.5;
}

.upload-drop-zone__text {
  text-align: center;
}

.upload-drop-zone__title {
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
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.upload-drop-zone__subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.upload-drop-zone__link {
  font-weight: 600;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.8)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s;
  position: relative;
}

.upload-drop-zone__link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    rgba(224, 50, 207, 0.8)
  );
  transform: scaleX(0);
  transition: transform 0.3s;
}

.upload-drop-zone:hover .upload-drop-zone__link::after {
  transform: scaleX(1);
}

.upload-drop-zone__features {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 4px;
}

.upload-drop-zone__feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.upload-drop-zone__shortcut {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.upload-drop-zone__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 6px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  color: var(--color-text-primary);
}

.upload-drop-zone__limit {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
</style>
