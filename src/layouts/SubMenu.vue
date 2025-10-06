<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  FileUp,
  Camera,
  Clipboard,
  Settings as SettingsIcon,
  Files,
  FolderTree,
  Tag,
  Grid3X3,
  Search,
  List,
  TrendingUp,
  ImagePlus,
  ClipboardList,
  Key,
  Package,
  History,
  Palette,
  Keyboard,
  Bell,
  Server,
  HardDrive,
  BarChart,
  Shield,
  Database,
  Users,
  FileSearch,
  Cpu,
  Activity,
  Sliders,
} from "lucide-vue-next";

const props = defineProps<{
  activeMainMenu: string;
}>();

const router = useRouter();
const route = useRoute();

// 判断菜单是否激活
const isMenuActive = (menuRoute: string) => {
  return route.path === menuRoute;
};

// 子菜单配置（根据主菜单显示不同内容）
const subMenuConfig: Record<
  string,
  Array<{ id: string; icon: any; label: string; route: string }>
> = {
  dashboard: [],
  upload: [
    {
      id: "upload-quick",
      icon: FileUp,
      label: "快速上传",
      route: "/upload/quick",
    },
    {
      id: "upload-screenshot",
      icon: Camera,
      label: "截图上传",
      route: "/upload/screenshot",
    },
    {
      id: "upload-clipboard",
      icon: Clipboard,
      label: "剪贴板上传",
      route: "/upload/clipboard",
    },
    {
      id: "upload-settings",
      icon: SettingsIcon,
      label: "上传设置",
      route: "/upload/settings",
    },
  ],
  files: [
    { id: "files-all", icon: Files, label: "全部文件", route: "/files/all" },
    {
      id: "files-folders",
      icon: FolderTree,
      label: "文件夹",
      route: "/files/folders",
    },
    { id: "files-tags", icon: Tag, label: "标签", route: "/files/tags" },
    {
      id: "files-categories",
      icon: Grid3X3,
      label: "分类",
      route: "/files/categories",
    },
    {
      id: "files-search",
      icon: Search,
      label: "高级搜索",
      route: "/files/search",
    },
  ],
  shares: [
    { id: "shares-list", icon: List, label: "我的分享", route: "/shares/list" },
    {
      id: "shares-stats",
      icon: TrendingUp,
      label: "分享统计",
      route: "/shares/stats",
    },
  ],
  tools: [
    {
      id: "tools-image",
      icon: ImagePlus,
      label: "图片处理",
      route: "/tools/image-process",
    },
    {
      id: "tools-clipboard-history",
      icon: ClipboardList,
      label: "剪贴板历史",
      route: "/tools/clipboard-history",
    },
    { id: "tools-api", icon: Key, label: "API 管理", route: "/tools/api" },
    {
      id: "tools-batch",
      icon: Package,
      label: "批量操作",
      route: "/tools/batch",
    },
    {
      id: "tools-history",
      icon: History,
      label: "上传历史",
      route: "/tools/history",
    },
  ],
  settings: [
    {
      id: "settings-appearance",
      icon: Palette,
      label: "外观设置",
      route: "/settings/appearance",
    },
    {
      id: "settings-shortcuts",
      icon: Keyboard,
      label: "快捷键",
      route: "/settings/shortcuts",
    },
    {
      id: "settings-notifications",
      icon: Bell,
      label: "通知",
      route: "/settings/notifications",
    },
    {
      id: "settings-server",
      icon: Server,
      label: "服务器",
      route: "/settings/server",
    },
    {
      id: "settings-upload-defaults",
      icon: FileUp,
      label: "上传默认配置",
      route: "/settings/upload-defaults",
    },
    {
      id: "settings-cache",
      icon: HardDrive,
      label: "本地缓存",
      route: "/settings/cache",
    },
  ],
  profile: [
    {
      id: "profile-stats",
      icon: BarChart,
      label: "我的统计",
      route: "/profile/stats",
    },
    {
      id: "profile-security",
      icon: Shield,
      label: "账号安全",
      route: "/profile/security",
    },
    {
      id: "profile-storage",
      icon: Database,
      label: "存储空间",
      route: "/profile/storage",
    },
  ],
  admin: [
    {
      id: "admin-users",
      icon: Users,
      label: "用户管理",
      route: "/admin/users",
    },
    {
      id: "admin-files",
      icon: FileSearch,
      label: "文件审核",
      route: "/admin/files",
    },
    { id: "admin-ai", icon: Cpu, label: "AI 管理", route: "/admin/ai" },
    {
      id: "admin-monitor",
      icon: Activity,
      label: "系统监控",
      route: "/admin/monitor",
    },
    {
      id: "admin-settings",
      icon: Sliders,
      label: "系统设置",
      route: "/admin/settings",
    },
  ],
};

// 当前子菜单列表
const currentSubMenus = computed(() => {
  return subMenuConfig[props.activeMainMenu] || [];
});

// 处理菜单点击
const handleMenuClick = (route: string) => {
  router.push(route);
};
</script>

<template>
  <div
    class="flex w-48 flex-col border-r backdrop-blur-sm"
    :style="{
      borderColor: 'var(--color-border)',
      background: 'var(--color-bg-elevated)',
    }"
  >
    <!-- 子菜单列表 -->
    <div class="flex-1 overflow-y-auto py-2">
      <button
        v-for="item in currentSubMenus"
        :key="item.id"
        class="group relative flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200"
        :class="{ 'submenu-active': isMenuActive(item.route) }"
        :style="{
          color: isMenuActive(item.route)
            ? 'var(--color-primary)'
            : 'var(--color-text-secondary)',
          background: isMenuActive(item.route)
            ? 'rgba(var(--color-primary-rgb, 5, 217, 232), 0.1)'
            : 'transparent',
        }"
        @click="handleMenuClick(item.route)"
        @mouseenter="
          (e) => {
            if (!isMenuActive(item.route)) {
              e.currentTarget.style.background = 'var(--color-bg-hover)';
            }
          }
        "
        @mouseleave="
          (e) => {
            if (!isMenuActive(item.route)) {
              e.currentTarget.style.background = 'transparent';
            }
          }
        "
      >
        <component
          :is="item.icon"
          :size="18"
          :stroke-width="2"
          class="transition-colors"
          :style="{
            color: isMenuActive(item.route)
              ? 'var(--color-primary)'
              : 'var(--color-text-muted)',
          }"
        />
        <span class="font-medium">{{ item.label }}</span>

        <!-- 激活指示器 -->
        <div
          class="absolute left-0 rounded-r-full transition-all duration-200"
          :class="
            isMenuActive(item.route)
              ? 'h-6 opacity-100'
              : 'h-0 opacity-0 group-hover:h-6 group-hover:opacity-100'
          "
          :style="{
            width: '3px',
            background: 'var(--color-primary)',
            boxShadow: isMenuActive(item.route)
              ? '0 0 12px var(--color-glow)'
              : '0 0 8px var(--color-glow)',
          }"
        />
      </button>
    </div>
  </div>
</template>
