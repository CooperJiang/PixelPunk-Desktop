import type { AppConfig } from "@/types/config";

export const appConfig: AppConfig = {
  name: "Tauri Vue Template", // 应用名称
  version: "1.0.0", // 应用版本号
  author: "Your Name", // 作者/组织名称
  description: "基于 Tauri + Vue 3 + TypeScript 的跨平台桌面应用开发模板", // 应用描述
  homepage: "https://github.com", // 主页地址（可选）
  repository: "https://github.com", // 仓库地址（可选）
  copyright: `Copyright © ${new Date().getFullYear()} Your Name. All rights reserved.`, // 版权信息（可选）

  app: {
    singleInstance: true, // 启用单实例模式，防止应用多开
    rememberWindowState: true, // 记住窗口位置和大小
    quitOnClose: false, // 点击关闭按钮时不退出程序，最小化到托盘（设为 true 则点击关闭按钮退出程序）
  },

  window: {
    width: 1200, // 窗口默认宽度（像素）
    height: 800, // 窗口默认高度（像素）
    minWidth: 800, // 窗口最小宽度（像素）
    minHeight: 600, // 窗口最小高度（像素）
    resizable: true, // 是否可调整大小
    maximizable: true, // 是否可最大化
    minimizable: true, // 是否可最小化
    closable: true, // 是否可关闭
    alwaysOnTop: false, // 是否窗口置顶
    center: true, // 启动时是否居中显示
    skipTaskbar: false, // 是否在任务栏/程序坞中显示
  },

  tray: {
    enabled: true, // 是否启用系统托盘
    tooltip: "Tauri Vue Template", // 托盘图标悬停提示文字
    title: "", // 托盘标题（可选，macOS 显示在图标旁，空字符串表示不显示）
    menus: [
      {
        label: "应用",
        items: [
          { id: "about", label: "关于", action: "about" },
          { id: "settings", label: "设置", action: "custom" },
        ],
      },
      {
        label: "窗口",
        items: [
          { id: "show", label: "显示窗口", action: "show" },
          { id: "quit", label: "退出", action: "quit" },
        ],
      },
    ],
  },

  floatBall: {
    enabled: true, // 是否启用悬浮球
    width: 400, // 窗口宽度（容纳悬浮球 + 面板）
    height: 450, // 窗口高度（容纳面板）
    defaultX: 0, // 默认 X 位置（0 表示自动右下角）
    defaultY: 0, // 默认 Y 位置（0 表示自动右下角）
    alwaysOnTop: true, // 是否始终置顶
    margin: 120, // 距离屏幕边缘的边距（像素）
    panel: {
      width: 320, // 展开面板宽度
      height: 450, // 展开面板高度
      expandOnHover: true, // 鼠标悬停时展开
      hoverDelay: 300, // 悬停延迟（毫秒）
    },
    upload: {
      apiUrl: "/api/upload", // 上传接口地址
      maxFileSize: 100 * 1024 * 1024, // 最大文件大小（字节，默认 100MB）
      allowedTypes: [], // 允许的文件类型（空数组表示不限制）
      concurrent: 3, // 并发上传数量
    },
  },

  dev: {
    openDevTools: false, // 开发模式下是否自动打开开发者工具
  },
};

export default appConfig;
