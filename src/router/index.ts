import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  // 主应用路由 - 默认重定向到 dashboard
  {
    path: "/",
    redirect: "/dashboard",
  },

  // 1. 首页 Dashboard
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/views/dashboard/index.vue"),
    meta: {
      title: "首页",
      requiresAuth: true,
    },
  },

  // 2. 上传 Upload
  {
    path: "/upload",
    redirect: "/upload/quick",
  },
  {
    path: "/upload/quick",
    name: "upload-quick",
    component: () => import("@/views/upload/quick/index.vue"),
    meta: {
      title: "快速上传",
      requiresAuth: true,
    },
  },
  {
    path: "/upload/screenshot",
    name: "upload-screenshot",
    component: () => import("@/views/upload/screenshot/index.vue"),
    meta: {
      title: "截图上传",
      requiresAuth: true,
    },
  },
  {
    path: "/upload/clipboard",
    name: "upload-clipboard",
    component: () => import("@/views/upload/clipboard/index.vue"),
    meta: {
      title: "剪贴板上传",
      requiresAuth: true,
    },
  },
  {
    path: "/upload/settings",
    name: "upload-settings",
    component: () => import("@/views/upload/settings/index.vue"),
    meta: {
      title: "上传设置",
      requiresAuth: true,
    },
  },

  // 3. 我的文件 Files
  {
    path: "/files",
    redirect: "/files/all",
  },
  {
    path: "/files/all",
    name: "files-all",
    component: () => import("@/views/files/all/index.vue"),
    meta: {
      title: "全部文件",
      requiresAuth: true,
    },
  },
  {
    path: "/files/folders",
    name: "files-folders",
    component: () => import("@/views/files/folders/index.vue"),
    meta: {
      title: "文件夹",
      requiresAuth: true,
    },
  },
  {
    path: "/files/tags",
    name: "files-tags",
    component: () => import("@/views/files/tags/index.vue"),
    meta: {
      title: "标签",
      requiresAuth: true,
    },
  },
  {
    path: "/files/categories",
    name: "files-categories",
    component: () => import("@/views/files/categories/index.vue"),
    meta: {
      title: "分类",
      requiresAuth: true,
    },
  },
  {
    path: "/files/search",
    name: "files-search",
    component: () => import("@/views/files/search/index.vue"),
    meta: {
      title: "高级搜索",
      requiresAuth: true,
    },
  },

  // 4. 分享管理 Shares
  {
    path: "/shares",
    redirect: "/shares/list",
  },
  {
    path: "/shares/list",
    name: "shares-list",
    component: () => import("@/views/shares/list/index.vue"),
    meta: {
      title: "我的分享",
      requiresAuth: true,
    },
  },
  {
    path: "/shares/stats",
    name: "shares-stats",
    component: () => import("@/views/shares/stats/index.vue"),
    meta: {
      title: "分享统计",
      requiresAuth: true,
    },
  },

  // 5. 工具箱 Tools
  {
    path: "/tools",
    redirect: "/tools/image-process",
  },
  {
    path: "/tools/image-process",
    name: "tools-image",
    component: () => import("@/views/tools/image-process/index.vue"),
    meta: {
      title: "图片处理",
      requiresAuth: true,
    },
  },
  {
    path: "/tools/clipboard-history",
    name: "tools-clipboard-history",
    component: () => import("@/views/tools/clipboard-history/index.vue"),
    meta: {
      title: "剪贴板历史",
      requiresAuth: true,
    },
  },
  {
    path: "/tools/api",
    name: "tools-api",
    component: () => import("@/views/tools/api/index.vue"),
    meta: {
      title: "API 管理",
      requiresAuth: true,
    },
  },
  {
    path: "/tools/batch",
    name: "tools-batch",
    component: () => import("@/views/tools/batch/index.vue"),
    meta: {
      title: "批量操作",
      requiresAuth: true,
    },
  },
  {
    path: "/tools/history",
    name: "tools-history",
    component: () => import("@/views/tools/history/index.vue"),
    meta: {
      title: "上传历史",
      requiresAuth: true,
    },
  },

  // 6. 设置 Settings
  {
    path: "/settings",
    redirect: "/settings/appearance",
  },
  {
    path: "/settings/appearance",
    name: "settings-appearance",
    component: () => import("@/views/settings/appearance/index.vue"),
    meta: {
      title: "外观设置",
      requiresAuth: true,
    },
  },
  {
    path: "/settings/shortcuts",
    name: "settings-shortcuts",
    component: () => import("@/views/settings/shortcuts/index.vue"),
    meta: {
      title: "快捷键",
      requiresAuth: true,
    },
  },
  {
    path: "/settings/notifications",
    name: "settings-notifications",
    component: () => import("@/views/settings/notifications/index.vue"),
    meta: {
      title: "通知",
      requiresAuth: true,
    },
  },
  {
    path: "/settings/server",
    name: "settings-server",
    component: () => import("@/views/settings/server/index.vue"),
    meta: {
      title: "服务器",
      requiresAuth: true,
    },
  },
  {
    path: "/settings/upload-defaults",
    name: "settings-upload-defaults",
    component: () => import("@/views/settings/upload-defaults/index.vue"),
    meta: {
      title: "上传默认配置",
      requiresAuth: true,
    },
  },
  {
    path: "/settings/cache",
    name: "settings-cache",
    component: () => import("@/views/settings/cache/index.vue"),
    meta: {
      title: "本地缓存",
      requiresAuth: true,
    },
  },

  // 7. 个人中心 Profile
  {
    path: "/profile",
    redirect: "/profile/stats",
  },
  {
    path: "/profile/stats",
    name: "profile-stats",
    component: () => import("@/views/profile/stats/index.vue"),
    meta: {
      title: "我的统计",
      requiresAuth: true,
    },
  },
  {
    path: "/profile/security",
    name: "profile-security",
    component: () => import("@/views/profile/security/index.vue"),
    meta: {
      title: "账号安全",
      requiresAuth: true,
    },
  },
  {
    path: "/profile/storage",
    name: "profile-storage",
    component: () => import("@/views/profile/storage/index.vue"),
    meta: {
      title: "存储空间",
      requiresAuth: true,
    },
  },

  // 8. 管理中心 Admin
  {
    path: "/admin",
    redirect: "/admin/users",
  },
  {
    path: "/admin/users",
    name: "admin-users",
    component: () => import("@/views/admin/users/index.vue"),
    meta: {
      title: "用户管理",
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/admin/files",
    name: "admin-files",
    component: () => import("@/views/admin/files/index.vue"),
    meta: {
      title: "文件审核",
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/admin/ai",
    name: "admin-ai",
    component: () => import("@/views/admin/ai/index.vue"),
    meta: {
      title: "AI 管理",
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/admin/monitor",
    name: "admin-monitor",
    component: () => import("@/views/admin/monitor/index.vue"),
    meta: {
      title: "系统监控",
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/admin/settings",
    name: "admin-settings",
    component: () => import("@/views/admin/settings/index.vue"),
    meta: {
      title: "系统设置",
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  // 原有路由保留
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
    meta: {
      guest: true,
      title: "登录",
    },
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/views/TestInfrastructure.vue"),
    meta: {
      title: "测试页面",
    },
  },
  {
    path: "/float-ball",
    name: "float-ball",
    component: () => import("@/views/FloatBallView.vue"),
    meta: {
      title: "悬浮球",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
