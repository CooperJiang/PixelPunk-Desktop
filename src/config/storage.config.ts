/**
 * 数据持久化配置
 *
 * 使用说明：
 * 1. 在 defaults 中定义应用的默认数据结构
 * 2. 使用 storage.get/set 读写数据
 * 3. 或使用 useStorage composable 实现响应式数据持久化
 *
 * 数据存储位置（根据平台）：
 * - Windows: %APPDATA%\{app-name}\app-data.json
 * - macOS: ~/Library/Application Support/{app-name}/app-data.json
 * - Linux: ~/.config/{app-name}/app-data.json
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StorageConfig {
  // 文件存储配置
  file: {
    dir: "AppData" | "AppConfig" | "AppCache" | "AppLocalData"; // 存储目录
    filename: string; // 文件名
    autoSave: boolean; // 是否自动保存
    saveInterval: number; // 自动保存间隔（毫秒）
  };

  // 默认数据结构（开发者在此定义应用的默认配置）
  defaults: Record<string, any>;
}

export const storageConfig: StorageConfig = {
  file: {
    dir: "AppData",
    filename: "app-data.json",
    autoSave: true,
    saveInterval: 5000, // 5秒自动保存一次
  },

  // 默认数据结构 - 开发者可以在此添加自己的配置
  defaults: {
    // 主题设置
    theme: "light",

    // 语言设置
    language: "zh-CN",

    // 窗口状态
    windowState: {
      width: 1200,
      height: 800,
      x: 0,
      y: 0,
      maximized: false,
    },

    // 用户设置示例
    userSettings: {
      notifications: true,
      autoStart: false,
      minimizeToTray: true,
    },

    // 示例：可以添加更多自定义配置
    // apiUrl: 'https://api.example.com',
    // recentFiles: [],
    // customData: {},
  },
};
