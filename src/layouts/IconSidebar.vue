<script setup lang="ts">
import {
  Home,
  Upload,
  FolderOpen,
  Share2,
  Tags,
  Settings,
  Bot,
} from "lucide-vue-next";
import Tooltip from "@/components/Tooltip/index.vue";

defineProps<{
  activeMenu: string;
}>();

const emit = defineEmits<{
  menuChange: [menuId: string];
}>();

// 主菜单配置
const mainMenus = [
  { id: "dashboard", icon: Home, label: "首页" },
  { id: "upload", icon: Upload, label: "上传" },
  { id: "files", icon: FolderOpen, label: "我的文件" },
  { id: "shares", icon: Share2, label: "分享管理" },
  { id: "tools", icon: Bot, label: "工具箱" },
  { id: "settings", icon: Settings, label: "设置" },
  { id: "profile", icon: Tags, label: "个人中心" },
  { id: "admin", icon: Settings, label: "管理中心" },
];
</script>

<template>
  <div
    class="flex w-16 flex-col items-center gap-3 border-r py-6 backdrop-blur-sm"
    :style="{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-elevated)',
    }"
  >
    <Tooltip
      v-for="menu in mainMenus"
      :key="menu.id"
      :content="menu.label"
      placement="right"
      :offset="12"
    >
      <button
        class="group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all"
        :style="{
          background:
            activeMenu === menu.id ? 'var(--color-bg-active)' : 'transparent',
          color:
            activeMenu === menu.id
              ? 'var(--color-primary)'
              : 'var(--color-text-muted)',
          boxShadow:
            activeMenu === menu.id ? '0 0 15px var(--color-shadow)' : 'none',
          transitionDuration: 'var(--transition-base, 0.2s)',
        }"
        :aria-label="menu.label"
        @click="emit('menuChange', menu.id)"
        @mouseenter="
          $event.currentTarget.style.background =
            activeMenu === menu.id
              ? 'var(--color-bg-active)'
              : 'var(--color-bg-hover)'
        "
        @mouseleave="
          $event.currentTarget.style.background =
            activeMenu === menu.id ? 'var(--color-bg-active)' : 'transparent'
        "
      >
        <component :is="menu.icon" :size="18" :stroke-width="2" />

        <!-- 激活指示器 -->
        <div
          v-if="activeMenu === menu.id"
          class="absolute left-0 h-5 w-1 rounded-r-full"
          :style="{
            background: 'var(--color-primary)',
            boxShadow: '0 0 10px var(--color-glow)',
          }"
        />
      </button>
    </Tooltip>
  </div>
</template>
