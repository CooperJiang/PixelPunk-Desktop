<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { LogOut, User, Mail, Shield } from "lucide-vue-next";
import { useAuthStore } from "@/store";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { logger } from "@/utils/logger";
import message from "@/components/Message/message";
import ConfirmDialog from "@/components/ConfirmDialog/index.vue";

const authStore = useAuthStore();
const showDropdown = ref(false);
const showLogoutConfirm = ref(false);

// 位置计算相关
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const dropdownStyle = ref<Record<string, string>>({});

// 用户信息
const userInfo = computed(() => authStore.userInfo);
const userAvatar = computed(() => authStore.userAvatar);
const isAdmin = computed(() => authStore.isAdmin);

// 头像占位符（用户名首字母）
const avatarPlaceholder = computed(() => {
  return userInfo.value?.username?.charAt(0).toUpperCase() || "U";
});

// 显示退出确认
const handleLogoutClick = () => {
  showDropdown.value = false;
  showLogoutConfirm.value = true;
};

// 确认退出登录
const confirmLogout = async () => {
  try {
    showLogoutConfirm.value = false;

    // 显示退出中提示
    message.info("正在退出登录...");

    await logger.info("[UserDropdown] Starting logout...");

    await authStore.logout();
    await logger.debug("[UserDropdown] Auth store cleared");

    // 广播登出事件，通知所有窗口刷新认证状态
    try {
      await getCurrentWindow().emit("auth:logged-out", {
        at: Date.now(),
        source: "dropdown",
      });
      await logger.debug("[UserDropdown] Emitted auth:logged-out event");
    } catch (e) {
      await logger.warn("[UserDropdown] Failed to emit logout event", {
        error: String(e),
      });
    }

    await invoke("show_login_window");
    await logger.info("[UserDropdown] Switched to login window");

    message.success("已退出登录");
  } catch (error) {
    await logger.error("[UserDropdown] Logout failed", {
      error: String(error),
    });
    message.error("退出登录失败");
  }
};

// 取消退出
const cancelLogout = () => {
  showLogoutConfirm.value = false;
};

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!triggerRef.value || !showDropdown.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
    zIndex: "9998",
  };
};

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

// 监听滚动和resize更新位置
const handleScroll = () => {
  if (showDropdown.value) {
    updateDropdownPosition();
  }
};

const handleResize = () => {
  if (showDropdown.value) {
    updateDropdownPosition();
  }
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (!triggerRef.value || !dropdownRef.value) return;
  const target = event.target as Node;
  if (
    !triggerRef.value.contains(target) &&
    !dropdownRef.value.contains(target)
  ) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="user-dropdown-container">
    <!-- 头像按钮 -->
    <button
      ref="triggerRef"
      class="user-avatar-button"
      aria-label="User menu"
      @click="toggleDropdown"
    >
      <!-- 有头像时显示图片 -->
      <img
        v-if="userAvatar"
        :src="userAvatar"
        :alt="userInfo?.username"
        class="avatar-image"
      />
      <!-- 没有头像时显示占位符 -->
      <div v-else class="avatar-placeholder">
        {{ avatarPlaceholder }}
      </div>
    </button>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="showDropdown"
          ref="dropdownRef"
          class="dropdown-menu"
          :style="dropdownStyle"
        >
          <!-- 用户信息区域 -->
          <div class="user-info-section">
            <div class="user-name-wrapper">
              <User :size="14" class="user-icon" />
              <span class="user-name">{{ userInfo?.username }}</span>
            </div>
            <div class="user-email-wrapper">
              <Mail :size="14" class="user-icon" />
              <span class="user-email">{{ userInfo?.email }}</span>
            </div>
            <div v-if="isAdmin" class="user-role-wrapper">
              <Shield :size="14" class="user-icon" />
              <span class="user-role">
                {{ userInfo?.role === 1 ? "超级管理员" : "管理员" }}
              </span>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="divider"></div>

          <!-- 退出登录按钮 -->
          <button class="logout-button" @click="handleLogoutClick">
            <LogOut :size="16" />
            <span>退出登录</span>
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- 退出确认对话框 -->
    <ConfirmDialog
      v-model="showLogoutConfirm"
      title="退出登录"
      message="确定要退出登录吗？退出后需要重新登录才能使用。"
      confirm-text="退出"
      cancel-text="取消"
      type="warning"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<style scoped>
.user-dropdown-container {
  position: relative;
}

/* 头像按钮 */
.user-avatar-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background: var(--color-bg-elevated);
}

.user-avatar-button:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
}

.user-avatar-button:active {
  transform: scale(0.95);
}

/* 头像图片 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 头像占位符 */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 255, 255, 0.1) 100%
  );
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
}

/* 下拉菜单 */
.dropdown-menu {
  position: fixed;
  min-width: 240px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 用户信息区域 */
.user-info-section {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name-wrapper,
.user-email-wrapper,
.user-role-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-email {
  font-size: 12px;
  color: var(--color-text-muted);
  word-break: break-all;
}

.user-role {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 500;
}

/* 分割线 */
.divider {
  height: 1px;
  background: var(--color-border);
  margin: 0;
}

/* 退出登录按钮 */
.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--color-error);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-button:hover {
  background: var(--color-bg-hover);
}

.logout-button:active {
  background: var(--color-bg-active);
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 赛博朋克风格增强（暗黑模式） */
:global(.dark) .dropdown-menu {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1);
}

:global(.dark) .user-avatar-button:hover {
  box-shadow:
    0 0 12px rgba(0, 255, 255, 0.5),
    0 0 24px rgba(0, 255, 255, 0.2);
}

:global(.dark) .avatar-placeholder {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.3) 0%,
    rgba(0, 255, 255, 0.15) 100%
  );
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.8);
}
</style>
