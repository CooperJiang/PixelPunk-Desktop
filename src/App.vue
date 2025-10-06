<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import TitleBar from "./layouts/TitleBar.vue";
import MainLayout from "./layouts/MainLayout.vue";
import CyberpunkBackground from "./components/CyberpunkBackground/index.vue";
import { useWindowState } from "@/composables/useWindowState";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/store";
import { storage } from "@/utils/storage";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TOKEN_KEY } from "@/constants/api";
import { invoke } from "@tauri-apps/api/core";
import { logger } from "@/utils/logger";

const route = useRoute();

// 存储初始化状态
const storageReady = ref(false);
// 应用初始化完成状态
const appInitialized = ref(false);

// 在存储初始化之前不调用 useTheme
const themeInstance = ref<ReturnType<typeof useTheme>>();

// 当前窗口 label - 立即获取，避免异步问题
const currentWindowLabel = ref<string>(getCurrentWindow().label);

// 悬浮球窗口和登录窗口不需要标题栏和背景
// 使用窗口 label 而不是路由 name，避免路由未加载时的问题
const showTitleBar = computed(
  () =>
    currentWindowLabel.value !== "float-ball" &&
    currentWindowLabel.value !== "login",
);
// 只在暗黑模式且不是悬浮球窗口和登录窗口时显示赛博朋克背景
const showBackground = computed(
  () =>
    currentWindowLabel.value !== "float-ball" &&
    currentWindowLabel.value !== "login" &&
    themeInstance.value?.isDark.value,
);
// 只在主窗口显示侧边栏
const showSidebar = computed(
  () => currentWindowLabel.value === "main" && appInitialized.value,
);

// 初始化基础设施 - 必须在 storage.init 之后
onBeforeMount(async () => {
  try {
    // 1. 先初始化存储（同步等待）
    await storage.init();
    storageReady.value = true;
    if (import.meta.env.DEV) await logger.debug("[App] Storage initialized");

    // 2. 初始化认证状态（从存储读取并同步到 authStore）
    const authStore = useAuthStore();
    authStore.initAuth();
    if (import.meta.env.DEV) await logger.debug("[App] Auth store initialized");

    // 监听来自登录窗口的认证状态变更事件 + 存储写入代理（main 作为单一写者）
    try {
      const win = getCurrentWindow();
      await win.listen("auth:updated", async (event) => {
        await logger.info("[App] 收到 auth:updated 事件，刷新认证状态");
        try {
          const payload: any = (event as any).payload || {};
          if (payload.token && payload.userInfo) {
            // 直接更新 store 并持久化，避免读写竞态
            await authStore.setUserInfo(payload.userInfo);
            await authStore.setToken(payload.token);
          } else {
            if (!storageReady.value) await storage.init();
            await storage.reload();
            authStore.checkAuth();
          }
        } catch (e) {
          await logger.error("[App] 刷新认证状态失败", { error: String(e) });
        }
      });

      await win.listen("auth:logged-out", async () => {
        await logger.info("[App] 收到 auth:logged-out 事件，刷新认证状态");
        try {
          if (!storageReady.value) await storage.init();
          await storage.reload();
          authStore.checkAuth();
        } catch (e) {
          await logger.error("[App] 处理登出事件失败", { error: String(e) });
        }
      });

      // （已移除）storage:set/remove 代理逻辑，改回由调用方直接写入
    } catch (e) {
      await logger.warn("[App] 注册认证事件监听失败", { error: String(e) });
    }

    // 3. 获取当前窗口信息
    const currentWindow = getCurrentWindow();
    const currentLabel = currentWindow.label;
    if (import.meta.env.DEV)
      await logger.debug("[App] 当前窗口信息", {
        label: currentLabel,
        route: String(route.name),
      });

    // 4. 在main和login窗口执行启动时的鉴权和窗口显示逻辑
    if (currentLabel === "main" || currentLabel === "login") {
      if (import.meta.env.DEV)
        await logger.debug(
          `[App] Executing auth check in ${currentLabel} window`,
        );
      await initializeAuthAndWindow();
    }

    // 5. 再初始化其他基础设施（仅主窗口需要窗口状态保存）
    if (currentLabel === "main") {
      useWindowState();
    }

    // 6. 最后初始化主题系统（此时存储已就绪）
    themeInstance.value = useTheme();

    // 7. 标记初始化完成
    appInitialized.value = true;
    if (import.meta.env.DEV)
      await logger.info("[App] Application initialized successfully");
  } catch (error) {
    await logger.error("[App] Initialization error", { error: String(error) });
    // 即使出错也要标记为已初始化，避免卡在 loading
    appInitialized.value = true;
  }
});

// 启动时的鉴权和窗口显示逻辑
async function initializeAuthAndWindow() {
  try {
    const currentWindow = getCurrentWindow();
    const currentLabel = currentWindow.label;

    // 从持久化存储读取登录信息
    const token = storage.get<string>(TOKEN_KEY);
    const isLoggedIn = Boolean(token);

    if (import.meta.env.DEV)
      await logger.debug("[App] 启动鉴权检查", {
        window: currentLabel,
        loggedIn: isLoggedIn,
      });

    if (currentLabel === "main") {
      // 主窗口
      if (isLoggedIn) {
        // 已登录，确保主窗口可见并获得焦点
        if (import.meta.env.DEV)
          await logger.debug("[App] 已登录，确保主窗口可见");
        try {
          await currentWindow.show();
          await currentWindow.setFocus();
        } catch (error) {
          await logger.error("[App] 显示主窗口失败", { error: String(error) });
        }
      } else {
        // 未登录，切换到登录窗口
        if (import.meta.env.DEV)
          await logger.debug("[App] 未登录，切换到登录窗口");
        try {
          await invoke("show_login_window");
        } catch (error) {
          await logger.error("[App] 切换到登录窗口失败", {
            error: String(error),
          });
        }
      }
    } else if (currentLabel === "login") {
      // 登录窗口（动态创建的）
      if (isLoggedIn) {
        // 已登录，切换到主窗口
        if (import.meta.env.DEV)
          await logger.debug("[App] 登录窗口中检测到已登录，切换到主窗口");
        try {
          await invoke("show_main_window");
        } catch (error) {
          await logger.error("[App] 切换到主窗口失败", {
            error: String(error),
          });
        }
      } else {
        // 未登录，显示登录窗口
        if (import.meta.env.DEV)
          await logger.debug("[App] 未登录，显示登录窗口");
        await currentWindow.show();
        await currentWindow.setFocus();
      }
    }
  } catch (error) {
    await logger.error("[App] 初始化鉴权失败", { error: String(error) });
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
      :class="
        showTitleBar ? 'flex-1 overflow-hidden flex' : 'h-full bg-transparent'
      "
    >
      <!-- 主窗口使用完整布局（IconSidebar + SubMenu + 内容区） -->
      <MainLayout v-if="showSidebar">
        <router-view v-if="appInitialized" />
      </MainLayout>

      <!-- 其他窗口直接显示路由视图 -->
      <div v-else class="flex-1 overflow-auto">
        <router-view v-if="appInitialized" />
      </div>
    </div>
  </div>
</template>
