<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import TitleBar from "./components/layout/TitleBar.vue";
import { useWindowState } from "@/composables/useWindowState";
import { useTheme } from "@/composables/useTheme";
import { storage } from "@/utils/storage";

const route = useRoute();

// 悬浮球窗口不需要标题栏
const showTitleBar = computed(() => route.name !== "float-ball");

// 初始化基础设施
// 必须在 onMounted 回调之前调用 composables（在任何 await 之前）
if (route.name !== "float-ball") {
  useWindowState();
}
useTheme();

onMounted(async () => {
  // 初始化存储
  await storage.init();
});
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col overflow-hidden"
    :class="{ 'bg-transparent': !showTitleBar }"
  >
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
