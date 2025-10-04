<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import TitleBar from "./layouts/TitleBar.vue";
import CyberpunkBackground from "./components/CyberpunkBackground/index.vue";
import { useWindowState } from "@/composables/useWindowState";
import { useTheme } from "@/composables/useTheme";
import { storage } from "@/utils/storage";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TOKEN_KEY } from '@/constants/api';
import { invoke } from '@tauri-apps/api/core';

const route = useRoute();

// 存储初始化状态
const storageReady = ref(false);

// 在存储初始化之前不调用 useTheme
const themeInstance = ref<ReturnType<typeof useTheme>>();

// 当前窗口 label - 立即获取，避免异步问题
const currentWindowLabel = ref<string>(getCurrentWindow().label);

// 悬浮球窗口和登录窗口不需要标题栏和背景
// 使用窗口 label 而不是路由 name，避免路由未加载时的问题
const showTitleBar = computed(() =>
  currentWindowLabel.value !== "float-ball" &&
  currentWindowLabel.value !== "login"
);
// 只在暗黑模式且不是悬浮球窗口和登录窗口时显示赛博朋克背景
const showBackground = computed(() =>
  currentWindowLabel.value !== "float-ball" &&
  currentWindowLabel.value !== "login" &&
  themeInstance.value?.isDark.value
);

// 初始化基础设施 - 必须在 storage.init 之后
onBeforeMount(async () => {
  try {
    // 1. 先初始化存储（同步等待）
    await storage.init();
    storageReady.value = true;
    console.log('[App] Storage initialized');

    // 2. 获取当前窗口信息
    const currentWindow = getCurrentWindow();
    const currentLabel = currentWindow.label;
    console.log('[App] Current window label:', currentLabel);
    console.log('[App] Current route name:', route.name);

    // 3. 在main和login窗口执行启动时的鉴权和窗口显示逻辑
    if (currentLabel === 'main' || currentLabel === 'login') {
      console.log(`[App] Executing auth check in ${currentLabel} window`);
      await initializeAuthAndWindow();
    }

    // 4. 再初始化其他基础设施（仅主窗口需要窗口状态保存）
    if (currentLabel === 'main') {
      useWindowState();
    }

    // 5. 最后初始化主题系统（此时存储已就绪）
    themeInstance.value = useTheme();
  } catch (error) {
    console.error('[App] Initialization error:', error);
  }
});

// 启动时的鉴权和窗口显示逻辑
async function initializeAuthAndWindow() {
  try {
    const currentWindow = getCurrentWindow();
    const currentLabel = currentWindow.label;

    // 检查是否有token
    const token = storage.get<string>(TOKEN_KEY);
    const isLoggedIn = Boolean(token);

    console.log('[App] 当前窗口:', currentLabel);
    console.log('[App] 登录状态:', isLoggedIn ? '已登录' : '未登录');

    if (currentLabel === 'main') {
      // 当前是主窗口
      if (isLoggedIn) {
        // 已登录，显示主窗口
        console.log('[App] 已登录，显示主窗口');
        await currentWindow.show();
        await currentWindow.setFocus();
      } else {
        // 未登录，切换到登录窗口（由后端处理显示/隐藏）
        console.log('[App] 未登录，切换到登录窗口 via backend');
        try {
          await invoke('show_login_window');
        } catch (error) {
          console.error('[App] Failed to switch to login via backend:', error);
        }
      }
    } else if (currentLabel === 'login') {
      // 当前是登录窗口
      if (isLoggedIn) {
        // 已登录，显示主窗口，隐藏登录窗口
        console.log('[App] 已登录，切换到主窗口');
        await currentWindow.hide();

        try {
          await invoke('show_main_window');
        } catch (error) {
          console.error('[App] Failed to show main window via backend:', error);
        }
      } else {
        // 未登录，显示登录窗口
        console.log('[App] 未登录，显示登录窗口');
        await currentWindow.show();
        await currentWindow.setFocus();
      }
    }
  } catch (error) {
    console.error('[App] 初始化鉴权失败:', error);
  }
}
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col overflow-hidden"
    :class="{ 'bg-transparent': !showTitleBar }"
  >
    <!-- 赛博朋克背景（仅主窗口） -->
    <CyberpunkBackground v-if="showBackground" />

    <!-- 自定义标题栏（主窗口） -->
    <TitleBar v-if="showTitleBar" />

    <!-- 主内容区域 -->
    <div
      :class="showTitleBar ? 'flex-1 overflow-auto' : 'h-full bg-transparent'"
    >
      <router-view />
    </div>
  </div>
</template>
