<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { X, Minus, Maximize2 } from "lucide-vue-next";
import { appConfig } from "@/config";

const currentPlatform = ref<string>("");
const isMaximized = ref(false);
const isFullscreen = ref(false);
const appWindow = getCurrentWindow();
const hoveredButton = ref<string>("");

onMounted(async () => {
  currentPlatform.value = platform();
  isMaximized.value = await appWindow.isMaximized();
  isFullscreen.value = await appWindow.isFullscreen();

  // 监听全屏状态变化
  appWindow.listen("tauri://resize", async () => {
    isFullscreen.value = await appWindow.isFullscreen();
  });
});

const minimize = async () => {
  await appWindow.minimize();
};

const toggleMaximize = async () => {
  // macOS 使用全屏模式，其他平台使用最大化
  if (currentPlatform.value === "macos") {
    const fullscreen = await appWindow.isFullscreen();
    await appWindow.setFullscreen(!fullscreen);
    isFullscreen.value = !fullscreen;
  } else {
    await appWindow.toggleMaximize();
    isMaximized.value = await appWindow.isMaximized();
  }
};

const close = async () => {
  await appWindow.close();
};
</script>

<template>
  <div
    data-tauri-drag-region
    class="relative flex h-12 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md"
  >
    <!-- macOS 样式 -->
    <template v-if="currentPlatform === 'macos'">
      <!-- 左侧：窗口控制按钮（绝对定位） -->
      <div
        v-show="!isFullscreen"
        class="absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2"
      >
        <!-- 关闭按钮 -->
        <button
          class="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F57] transition-all hover:bg-[#FF4136]"
          aria-label="Close"
          @click="close"
          @mouseenter="hoveredButton = 'close'"
          @mouseleave="hoveredButton = ''"
        >
          <X
            v-show="hoveredButton === 'close'"
            :size="10"
            class="text-[#990000]"
            :stroke-width="3"
          />
        </button>

        <!-- 最小化按钮 -->
        <button
          :disabled="isFullscreen"
          :class="[
            'group relative flex h-3 w-3 items-center justify-center rounded-full transition-all',
            isFullscreen
              ? 'cursor-not-allowed bg-[#FFBD2E]/40'
              : 'bg-[#FFBD2E] hover:bg-[#FFB700]',
          ]"
          aria-label="Minimize"
          @click="minimize"
          @mouseenter="!isFullscreen && (hoveredButton = 'minimize')"
          @mouseleave="hoveredButton = ''"
        >
          <Minus
            v-show="hoveredButton === 'minimize' && !isFullscreen"
            :size="10"
            class="text-[#995700]"
            :stroke-width="3"
          />
        </button>

        <!-- 最大化按钮 -->
        <button
          class="group relative flex h-3 w-3 items-center justify-center rounded-full bg-[#28C840] transition-all hover:bg-[#1FA032]"
          aria-label="Maximize"
          @click="toggleMaximize"
          @mouseenter="hoveredButton = 'maximize'"
          @mouseleave="hoveredButton = ''"
        >
          <Maximize2
            v-show="hoveredButton === 'maximize'"
            :size="8"
            class="text-[#006400]"
            :stroke-width="3"
          />
        </button>
      </div>

      <!-- 中间：标题（始终居中） -->
      <div class="text-sm font-medium text-white" data-tauri-drag-region>
        {{ appConfig.name }}
      </div>
    </template>

    <!-- Windows/Linux 样式 -->
    <template v-else>
      <!-- 左侧：Logo 和标题 -->
      <div class="flex items-center gap-3" data-tauri-drag-region>
        <div class="text-xl font-bold text-white">{{ appConfig.name }}</div>
      </div>

      <!-- 中间：可拖拽区域 -->
      <div class="flex-1" data-tauri-drag-region></div>

      <!-- 右侧：窗口控制按钮 -->
      <div class="flex items-center gap-0">
        <button
          class="flex h-12 w-12 items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label="Minimize"
          @click="minimize"
        >
          <Minus :size="16" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center text-white transition-colors hover:bg-white/10"
          aria-label="Maximize"
          @click="toggleMaximize"
        >
          <Maximize2 :size="14" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center text-white transition-colors hover:bg-red-500"
          aria-label="Close"
          @click="close"
        >
          <X :size="16" />
        </button>
      </div>
    </template>
  </div>
</template>
