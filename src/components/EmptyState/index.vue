<script setup lang="ts">
import Button from "../Button/index.vue";

defineOptions({
  name: "EmptyState",
});

defineEmits<{
  "create-folder": [];
}>();
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">
      <i class="fas fa-folder-open" />
    </div>
    <h3>当前文件夹为空</h3>
    <p>您可以上传文件或创建新的文件夹开始使用</p>
    <Button type="primary" @click="$emit('create-folder')">
      <template #icon>
        <i class="fas fa-folder-plus" />
      </template>
      创建文件夹
    </Button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  width: 100%;
  margin-top: 60px;
  background: linear-gradient(
    145deg,
    rgba(15, 25, 35, 0.4) 0%,
    rgba(22, 33, 46, 0.6) 100%
  );
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.08);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  min-height: 200px;
}

.empty-state::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(
      circle at 30% 20%,
      rgba(var(--color-primary-rgb, 5, 217, 232), 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 70% 80%,
      rgba(255, 110, 199, 0.05) 0%,
      transparent 50%
    );
  pointer-events: none;
}

.empty-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08) 0%,
    rgba(255, 110, 199, 0.08) 100%
  );
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow:
    0 4px 16px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.12);
  position: relative;
  z-index: 2;
}

.empty-icon::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: linear-gradient(
    45deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    transparent,
    rgba(255, 110, 199, 0.2)
  );
  border-radius: 15px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.empty-state:hover .empty-icon::before {
  opacity: 1;
}

.empty-icon i {
  font-size: 28px;
  color: var(--color-primary);
  filter: drop-shadow(0 0 6px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4));
  position: relative;
  z-index: 3;
}

.empty-state h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  text-shadow:
    0 0 6px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.3px;
  position: relative;
  z-index: 2;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--color-text-secondary);
  max-width: 400px;
  line-height: 1.5;
  position: relative;
  z-index: 2;
}
</style>
