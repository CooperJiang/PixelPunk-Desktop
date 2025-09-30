<script setup lang="ts">
import TitleBar from "./components/layout/TitleBar.vue";
import Home from "./views/Home.vue";
</script>

<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <!-- 自定义标题栏 -->
    <TitleBar />

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-auto">
      <Home />
    </div>
  </div>
</template>
