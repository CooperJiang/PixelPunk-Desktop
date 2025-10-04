<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
</script>

<template>
  <MainLayout>
    <!-- 主内容区域 - 占位内容 -->
    <div class="flex h-full w-full items-center justify-center">
      <div class="text-center">
        <h1
          class="title mb-4 text-6xl font-bold"
          :style="{ color: 'var(--color-text-primary)' }"
        >
          PixelPunk
        </h1>
        <p
          class="subtitle text-xl"
          :style="{ color: 'var(--color-primary)' }"
        >
          赛博朋克风格桌面应用
        </p>
        <p
          class="mt-4 text-sm"
          :style="{ color: 'var(--color-text-muted)' }"
        >
          布局已就绪，点击侧边栏切换不同功能模块
        </p>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* 让文字更有赛博朋克感（仅在暗黑模式） */
:global(.dark) .title {
  text-shadow:
    0 0 10px var(--color-glow),
    0 0 20px var(--color-glow),
    0 0 30px var(--color-glow);
}

:global(.dark) .subtitle {
  text-shadow:
    0 0 5px var(--color-glow),
    0 0 10px var(--color-glow);
}
</style>
