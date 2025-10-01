<template>
  <div class="float-ball-view">
    <FloatBall />
  </div>
</template>

<script setup lang="ts">
import FloatBall from "@/features/float-ball/FloatBall.vue";
</script>

<style>
/* 全局样式，确保透明 */
html,
body {
  background: transparent !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

#app {
  background: transparent !important;
}
</style>

<style scoped>
.float-ball-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent !important;
  overflow: hidden;
}
</style>
