<template>
  <div v-if="loading" class="skeleton-container">
    <!-- 文本骨架 -->
    <template v-if="type === 'text'">
      <div
        v-for="i in rows"
        :key="i"
        :class="['skeleton-item', 'skeleton-text', { animated: animated }]"
        :style="{ width: typeof width === 'number' ? `${width}px` : width }"
      ></div>
    </template>

    <!-- 圆形骨架 -->
    <div
      v-else-if="type === 'circle'"
      :class="['skeleton-item', 'skeleton-circle', { animated: animated }]"
      :style="{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }"
    ></div>

    <!-- 矩形骨架 -->
    <div
      v-else-if="type === 'rect'"
      :class="['skeleton-item', 'skeleton-rect', { animated: animated }]"
      :style="{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }"
    ></div>

    <!-- 表格骨架 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div
          v-for="i in 5"
          :key="`header-${i}`"
          :class="[
            'skeleton-item',
            'skeleton-header-cell',
            { animated: animated },
          ]"
        ></div>
      </div>
      <div v-for="row in count" :key="`row-${row}`" class="skeleton-table-row">
        <div
          v-for="col in 5"
          :key="`cell-${row}-${col}`"
          :class="['skeleton-item', 'skeleton-cell', { animated: animated }]"
        ></div>
      </div>
    </div>

    <!-- 卡片骨架 -->
    <div v-else-if="type === 'card'" class="skeleton-card-container">
      <div
        v-for="i in count"
        :key="`card-${i}`"
        :class="['skeleton-card', { animated: animated }]"
      >
        <div class="skeleton-item skeleton-card-image"></div>
        <div class="skeleton-card-content">
          <div class="skeleton-item skeleton-card-title"></div>
          <div class="skeleton-item skeleton-card-desc"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 实际内容 -->
  <slot v-else></slot>
</template>

<script setup lang="ts">
import type { SkeletonProps } from "./types";

withDefaults(defineProps<SkeletonProps>(), {
  loading: false,
  type: "text",
  rows: 3,
  count: 5,
  width: "100%",
  height: "20px",
  animated: true,
});
</script>

<style scoped>
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    var(--color-bg-elevated) 0%,
    var(--color-bg-hover) 50%,
    var(--color-bg-elevated) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
}

.skeleton-item.animated {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 文本骨架 */
.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text:last-child {
  width: 60%;
  margin-bottom: 0;
}

/* 圆形骨架 */
.skeleton-circle {
  border-radius: 50%;
}

/* 矩形骨架 */
.skeleton-rect {
  width: 100%;
  height: 100px;
}

/* 表格骨架 */
.skeleton-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-table-header {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border);
}

.skeleton-header-cell {
  height: 20px;
}

.skeleton-table-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

.skeleton-table-row:last-child {
  border-bottom: none;
}

.skeleton-cell {
  height: 16px;
}

/* 卡片骨架 */
.skeleton-card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton-card {
  background: var(--color-bg-elevated);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.skeleton-card-image {
  width: 100%;
  height: 150px;
  border-radius: 0;
}

.skeleton-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-card-title {
  height: 20px;
  width: 70%;
}

.skeleton-card-desc {
  height: 16px;
  width: 100%;
}
</style>
