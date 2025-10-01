<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import TitleBar from "./components/layout/TitleBar.vue";

const route = useRoute();

// 悬浮球窗口不需要标题栏
const showTitleBar = computed(() => route.name !== "float-ball");
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
