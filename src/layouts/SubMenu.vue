<script setup lang="ts">
import { computed } from "vue";
import {
  LayoutDashboard,
  Upload,
  FolderTree,
  Users,
  Bell,
  Hash,
  FolderClosed,
  Zap,
  User,
  Cog,
} from "lucide-vue-next";

const props = defineProps<{
  activeMainMenu: string;
}>();

// 子菜单配置（根据主菜单显示不同内容）
const subMenuConfig: Record<string, Array<{ id: string; icon: any; label: string }>> = {
  home: [
    { id: "dashboard", icon: LayoutDashboard, label: "仪表盘" },
  ],
  files: [
    { id: "upload", icon: Upload, label: "资源上传" },
    { id: "management", icon: FolderTree, label: "文件管理" },
    { id: "my-resources", icon: FolderClosed, label: "我的资源" },
    { id: "browse-share", icon: Users, label: "浏览共享" },
  ],
  share: [
    { id: "share-management", icon: Users, label: "分享管理" },
  ],
  tags: [
    { id: "tag-management", icon: Hash, label: "标签管理" },
    { id: "category-management", icon: FolderClosed, label: "分类管理" },
  ],
  ai: [
    { id: "auto-tasks", icon: Zap, label: "自动任务" },
    { id: "ai-settings", icon: Cog, label: "AI 设置" },
  ],
  settings: [
    { id: "personal", icon: User, label: "个人设置" },
    { id: "system", icon: Cog, label: "系统设置" },
    { id: "messages", icon: Bell, label: "消息中心" },
  ],
};

// 当前子菜单列表
const currentSubMenus = computed(() => {
  return subMenuConfig[props.activeMainMenu] || [];
});
</script>

<template>
  <div
    class="flex w-48 flex-col border-r backdrop-blur-sm"
    :style="{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-elevated)',
    }"
  >
    <!-- 子菜单标题 -->
    <div
      class="border-b px-4 py-4"
      :style="{ borderColor: 'var(--color-border)' }"
    >
      <h2
        class="text-sm font-semibold"
        :style="{ color: 'var(--color-primary)' }"
      >
        功能菜单
      </h2>
    </div>

    <!-- 子菜单列表 -->
    <div class="flex-1 overflow-y-auto py-2">
      <button
        v-for="item in currentSubMenus"
        :key="item.id"
        class="group relative flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200"
        :style="{ color: 'var(--color-text-secondary)' }"
        @mouseenter="$event.currentTarget.style.background = 'var(--color-bg-hover)'"
        @mouseleave="$event.currentTarget.style.background = 'transparent'"
      >
        <component
          :is="item.icon"
          :size="18"
          :stroke-width="2"
          class="transition-colors"
          :style="{ color: 'var(--color-text-muted)' }"
        />
        <span>{{ item.label }}</span>

        <!-- 悬停发光效果 -->
        <div
          class="absolute left-0 h-0 w-1 rounded-r-full opacity-0 transition-all duration-200 group-hover:h-6 group-hover:opacity-100"
          :style="{
            background: 'var(--color-primary)',
            boxShadow: '0 0 8px var(--color-glow)',
          }"
        />
      </button>
    </div>
  </div>
</template>
