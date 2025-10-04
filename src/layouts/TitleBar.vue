<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { platform } from "@tauri-apps/plugin-os";
import { X, Minus, Maximize2, LogOut } from "lucide-vue-next";
import { appConfig } from "@/config";
import ThemeSwitch from "@/components/ThemeSwitch/index.vue";
import { useAuthStore } from "@/store";
import message from "@/components/Message/message";
import { invoke } from "@tauri-apps/api/core";

const currentPlatform = ref<string>("");
const isMaximized = ref(false);
const isFullscreen = ref(false);
const appWindow = getCurrentWindow();
const hoveredButton = ref<string>("");
const authStore = useAuthStore();

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

const handleLogout = async () => {
  try {
    console.log('[TitleBar] Starting logout...');

    // 1. 清除登录态
    await authStore.logout();
    console.log('[TitleBar] Auth store cleared');

    // 2. 通过 Rust 命令切换到登录窗口（避免跨窗口权限/时序问题）
    await invoke('show_login_window');
    console.log('[TitleBar] Switched to login via backend');

    message.success('已退出登录');
  } catch (error) {
    console.error('[TitleBar] Logout failed:', error);
    message.error('退出登录失败');
  }
};
</script>

<template>
  <div
    data-tauri-drag-region
    class="relative flex h-12 items-center justify-center border-b backdrop-blur-sm"
    :style="{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-elevated)'
    }"
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
      <div
        class="text-sm font-medium"
        :style="{ color: 'var(--color-text-primary)' }"
        data-tauri-drag-region
      >
        {{ appConfig.name }}
      </div>

      <!-- 右侧：主题切换 + 退出登录 -->
      <div class="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
          :style="{ color: 'var(--color-text-primary)' }"
          aria-label="Logout"
          @click="handleLogout"
        >
          <LogOut :size="16" />
        </button>
        <ThemeSwitch />
      </div>
    </template>

    <!-- Windows/Linux 样式 -->
    <template v-else>
      <!-- 左侧：Logo 和标题 -->
      <div class="flex items-center gap-3" data-tauri-drag-region>
        <div
          class="text-xl font-bold"
          :style="{ color: 'var(--color-text-primary)' }"
        >
          {{ appConfig.name }}
        </div>
      </div>

      <!-- 中间：可拖拽区域 -->
      <div class="flex-1" data-tauri-drag-region></div>

      <!-- 右侧：主题切换 + 退出登录 + 窗口控制按钮 -->
      <div class="flex items-center gap-2">
        <!-- 主题切换 -->
        <div class="mr-2">
          <ThemeSwitch />
        </div>

        <!-- 退出登录 -->
        <button
          class="flex h-12 w-12 items-center justify-center transition-colors"
          :style="{ color: 'var(--color-text-primary)' }"
          aria-label="Logout"
          @click="handleLogout"
          @mouseenter="$event.currentTarget.style.background = 'var(--color-bg-hover)'"
          @mouseleave="$event.currentTarget.style.background = 'transparent'"
        >
          <LogOut :size="16" />
        </button>

        <!-- 窗口控制按钮 -->
        <button
          class="flex h-12 w-12 items-center justify-center transition-colors"
          :style="{ color: 'var(--color-text-primary)' }"
          aria-label="Minimize"
          @click="minimize"
          @mouseenter="$event.currentTarget.style.background = 'var(--color-bg-hover)'"
          @mouseleave="$event.currentTarget.style.background = 'transparent'"
        >
          <Minus :size="16" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center transition-colors"
          :style="{ color: 'var(--color-text-primary)' }"
          aria-label="Maximize"
          @click="toggleMaximize"
          @mouseenter="$event.currentTarget.style.background = 'var(--color-bg-hover)'"
          @mouseleave="$event.currentTarget.style.background = 'transparent'"
        >
          <Maximize2 :size="14" />
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center transition-colors"
          :style="{ color: 'var(--color-text-primary)' }"
          aria-label="Close"
          @click="close"
          @mouseenter="$event.currentTarget.style.background = 'var(--color-error)'"
          @mouseleave="$event.currentTarget.style.background = 'transparent'"
        >
          <X :size="16" />
        </button>
      </div>
    </template>
  </div>
</template>
