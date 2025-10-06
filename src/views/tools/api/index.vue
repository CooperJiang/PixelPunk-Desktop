<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">API 管理</h1>
      <p class="page-description">管理 API Key</p>
    </div>

    <div class="page-content">
      <div class="placeholder">
        <p>🔑 API 管理</p>
        <p class="text-sm">待开发：API Key 生成、调用统计</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// API 管理
</script>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  opacity: 0.7;
}

.page-content {
  min-height: 400px;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 18px;
  opacity: 0.5;
}

.text-sm {
  font-size: 14px;
  margin-top: 8px;
}
</style>
