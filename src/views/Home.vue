<script setup lang="ts">
import { computed, onMounted } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useAuthStore } from "@/store";

const authStore = useAuthStore();

// 获取用户信息
const userInfo = computed(() => authStore.userInfo);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const userAvatar = computed(() => authStore.userAvatar);

// 可按需启用开发日志
onMounted(() => {
  if (import.meta.env.DEV) return; // 默认不输出
});
</script>

<template>
  <MainLayout>
    <!-- 主内容区域 -->
    <div class="flex h-full w-full flex-col items-center justify-center p-8">
      <!-- 用户信息卡片 -->
      <div v-if="isLoggedIn && userInfo" class="user-card mb-8">
        <!-- 头像 -->
        <div class="avatar-wrapper">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userInfo.username"
            class="avatar"
          />
          <div v-else class="avatar avatar-placeholder">
            {{ userInfo.username?.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <h2 class="user-name">{{ userInfo.username }}</h2>
          <p class="user-email">{{ userInfo.email }}</p>
          <p v-if="userInfo.bio" class="user-bio">{{ userInfo.bio }}</p>

          <!-- 用户角色标签 -->
          <div class="user-meta">
            <span
              class="role-badge"
              :class="
                userInfo.role === 1 || userInfo.role === 2
                  ? 'role-admin'
                  : 'role-user'
              "
            >
              {{
                userInfo.role === 1
                  ? "超级管理员"
                  : userInfo.role === 2
                    ? "管理员"
                    : "普通用户"
              }}
            </span>
            <span class="status-badge">
              {{ userInfo.status === 1 ? "正常" : "禁用" }}
            </span>
          </div>
        </div>
      </div>

      <!-- 欢迎信息 -->
      <div class="text-center">
        <h1
          class="title mb-4 text-6xl font-bold"
          :style="{ color: 'var(--color-text-primary)' }"
        >
          PixelPunk
        </h1>
        <p class="subtitle text-xl" :style="{ color: 'var(--color-primary)' }">
          赛博朋克风格桌面应用
        </p>
        <p class="mt-4 text-sm" :style="{ color: 'var(--color-text-muted)' }">
          布局已就绪，点击侧边栏切换不同功能模块
        </p>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* 用户信息卡片 */
.user-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 255, 255, 0.1) 100%
  );
  color: var(--color-primary);
  font-size: 32px;
  font-weight: bold;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.user-email {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 8px 0;
}

.user-bio {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.user-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.role-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.role-badge {
  background: rgba(0, 255, 255, 0.1);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.role-badge.role-admin {
  background: rgba(255, 107, 0, 0.1);
  color: #ff6b00;
  border-color: #ff6b00;
}

.status-badge {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  border: 1px solid #00ff00;
}

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
