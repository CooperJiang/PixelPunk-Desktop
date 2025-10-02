# PixelPunk 开发文档

<p align="right">
  <a href="./DEVELOPMENT.md">English</a> | 简体中文
</p>

本文档提供详细的使用指南、API 参考和最佳实践。

## 目录

- [核心模块详解](#核心模块详解)
  - [自动更新器](#自动更新器)
  - [数据持久化](#数据持久化)
  - [快捷键系统](#快捷键系统)
  - [系统通知](#系统通知)
- [配置指南](#配置指南)
  - [应用配置](#应用配置)
  - [托盘配置](#托盘配置)
  - [悬浮球配置](#悬浮球配置)
- [高级功能](#高级功能)
  - [图标配置](#图标配置)
  - [自定义命令](#自定义命令)
  - [跨窗口通信](#跨窗口通信)
- [开发建议](#开发建议)
- [故障排查](#故障排查)

---

## 核心模块详解

### 🔄 自动更新器

支持应用自动更新，内置下载进度跟踪、版本检查。

#### 配置

编辑 `src/config/updater.config.ts`：

```typescript
export const updaterConfig = {
  enabled: true, // 启用自动更新
  checkOnStartup: true, // 启动时检查
  checkInterval: 3600000, // 1小时检查一次
  silent: false, // 是否静默更新
  endpoints: ["https://your-update-server.com/{{target}}/{{current_version}}"],
};
```

#### 生成密钥对

```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

将生成的公钥配置到 `src-tauri/tauri.conf.json`：

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

#### 使用方法

```typescript
import { updater } from "@/utils/updater";

// 手动检查更新
const result = await updater.checkForUpdates();
if (result.available) {
  console.log("新版本:", result.version);
  await updater.downloadAndInstall();
}

// 监听下载进度
updater.onProgress((progress) => {
  console.log(`下载进度: ${progress.percentage}%`);
});

// 启动时自动检查
onMounted(() => {
  updater.startAutoCheck();
});
```

#### API 参考

| 方法                   | 参数                 | 返回值                | 说明               |
| ---------------------- | -------------------- | --------------------- | ------------------ |
| `checkForUpdates()`    | -                    | `Promise<UpdateInfo>` | 检查是否有可用更新 |
| `downloadAndInstall()` | -                    | `Promise<void>`       | 下载并安装更新     |
| `onProgress(callback)` | `(progress) => void` | `void`                | 监听下载进度       |
| `startAutoCheck()`     | -                    | `void`                | 启动定时自动检查   |
| `stopAutoCheck()`      | -                    | `void`                | 停止自动检查       |

#### 服务器响应格式

```json
{
  "version": "1.2.0",
  "date": "2025-01-15T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "...",
      "url": "https://releases.myapp.com/MyApp_1.2.0.app.tar.gz"
    }
  }
}
```

---

### 💾 数据持久化

支持将应用数据持久化到本地文件，自动保存、嵌套访问。

#### 配置默认数据

编辑 `src/config/storage.config.ts`：

```typescript
export const storageConfig = {
  file: {
    dir: "AppData", // 存储目录
    filename: "app-data.json",
    autoSave: true,
    saveInterval: 5000, // 5秒自动保存
  },
  defaults: {
    theme: "light",
    language: "zh-CN",
    apiUrl: "https://api.example.com",
    userSettings: {
      notifications: true,
    },
  },
};
```

#### 使用方式 1：直接使用

```typescript
import { storage } from "@/utils/storage";

// 初始化（在 main.ts）
await storage.init();

// 读写数据
storage.set("theme", "dark");
const theme = storage.get("theme", "light");

// 嵌套访问
storage.set("user.name", "Alice");
const name = storage.get("user.name");

// 检查键是否存在
if (storage.has("user.name")) {
  console.log("用户名已设置");
}

// 删除数据
storage.remove("user.name");

// 清空所有数据
await storage.clear();

// 手动保存
await storage.save();
```

#### 使用方式 2：Vue 响应式（推荐）

```vue
<script setup lang="ts">
import { useStorage } from "@/composables/useStorage";

// 创建响应式的持久化数据
const theme = useStorage("theme", "light");
const username = useStorage("user.name", "");

// 修改会自动保存到本地
theme.value = "dark";
username.value = "Alice";
</script>
```

#### API 参考

| 方法                | 参数                       | 返回值          | 说明           |
| ------------------- | -------------------------- | --------------- | -------------- |
| `init()`            | -                          | `Promise<void>` | 初始化存储     |
| `get(key, default)` | `key: string, default?: T` | `T`             | 获取值         |
| `set(key, value)`   | `key: string, value: any`  | `void`          | 设置值         |
| `has(key)`          | `key: string`              | `boolean`       | 检查键是否存在 |
| `remove(key)`       | `key: string`              | `void`          | 删除键         |
| `clear()`           | -                          | `Promise<void>` | 清空所有数据   |
| `save()`            | -                          | `Promise<void>` | 手动保存       |

#### 数据存储位置

- **Windows**: `%APPDATA%\{app-name}\app-data.json`
- **macOS**: `~/Library/Application Support/{app-name}/app-data.json`
- **Linux**: `~/.config/{app-name}/app-data.json`

---

### ⌨️ 快捷键系统

支持全局和应用内快捷键，完全可配置。

#### 配置快捷键

编辑 `src/config/shortcuts.config.ts`：

```typescript
export const shortcutsConfig = [
  {
    key: "CommandOrControl+Shift+F",
    description: "显示/隐藏悬浮球",
    global: true, // 全局快捷键
    handler: "toggleFloatBall",
  },
  {
    key: "CommandOrControl+,",
    description: "打开设置",
    global: false, // 应用内快捷键
    handler: "openSettings",
  },
  {
    key: "F11",
    description: "全屏切换",
    handler: "toggleFullscreen",
  },
];
```

#### 注册处理函数

```typescript
import { shortcutManager } from "@/utils/shortcuts";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 注册处理函数
shortcutManager.registerHandler("toggleFloatBall", async () => {
  await invoke("toggle_float_ball", { show: true });
});

shortcutManager.registerHandler("openSettings", () => {
  router.push("/settings");
});

shortcutManager.registerHandler("toggleFullscreen", async () => {
  const window = getCurrentWindow();
  const isFullscreen = await window.isFullscreen();
  await window.setFullscreen(!isFullscreen);
});

// 初始化所有快捷键
await shortcutManager.registerAll();
```

#### 动态添加快捷键

```typescript
await shortcutManager.addShortcut({
  key: "F5",
  description: "刷新",
  handler: "refresh",
});
```

#### API 参考

| 方法                             | 参数                              | 返回值          | 说明               |
| -------------------------------- | --------------------------------- | --------------- | ------------------ |
| `registerHandler(name, handler)` | `name: string, handler: Function` | `void`          | 注册处理函数       |
| `registerAll()`                  | -                                 | `Promise<void>` | 注册所有快捷键     |
| `addShortcut(config)`            | `config: ShortcutConfig`          | `Promise<void>` | 动态添加快捷键     |
| `unregisterShortcut(key)`        | `key: string`                     | `Promise<void>` | 注销快捷键         |
| `unregisterAll()`                | -                                 | `Promise<void>` | 注销所有快捷键     |
| `getRegistered()`                | -                                 | `string[]`      | 获取已注册的快捷键 |

#### 快捷键格式说明

- **修饰键**: `CommandOrControl`, `Command`, `Control`, `Alt`, `Shift`
- **普通键**: `A-Z`, `0-9`, `F1-F12`, `Enter`, `Space`, `ArrowUp` 等
- **组合示例**: `'CommandOrControl+Shift+F'`, `'Alt+Enter'`, `'F11'`
- **平台说明**: `CommandOrControl` 在 macOS 上是 `Command`，在 Windows/Linux 上是 `Control`

---

### 🔔 系统通知

支持发送系统原生通知，自动请求权限。

#### 初始化

```typescript
import { notification } from "@/utils/notification";

// 在 main.ts 中初始化
await notification.init();
```

#### 使用方式 1：直接调用

```typescript
// 发送通知
await notification.send({
  title: "操作成功",
  body: "文件已上传",
});

// 使用快捷方法
await notification.success("保存成功", "数据已保存");
await notification.error("保存失败", "网络错误");
await notification.info("提示", "有新消息");
await notification.warning("警告", "磁盘空间不足");
```

#### 使用方式 2：Composable（推荐）

```vue
<script setup lang="ts">
import { useNotification } from "@/composables/useNotification";

const { success, error, info } = useNotification();

const handleSave = async () => {
  try {
    await saveData();
    await success("保存成功", "数据已保存");
  } catch (err) {
    await error("保存失败", err.message);
  }
};
</script>
```

#### API 参考

| 方法                   | 参数                  | 返回值          | 说明             |
| ---------------------- | --------------------- | --------------- | ---------------- |
| `init()`               | -                     | `Promise<void>` | 初始化并请求权限 |
| `send(options)`        | `NotificationOptions` | `Promise<void>` | 发送通知         |
| `success(title, body)` | `string, string`      | `Promise<void>` | 成功通知         |
| `error(title, body)`   | `string, string`      | `Promise<void>` | 错误通知         |
| `info(title, body)`    | `string, string`      | `Promise<void>` | 信息通知         |
| `warning(title, body)` | `string, string`      | `Promise<void>` | 警告通知         |
| `isGranted()`          | -                     | `boolean`       | 检查权限状态     |

---

## 配置指南

### 应用配置

所有配置集中在 `src/config/app.config.ts`：

```typescript
export const appConfig: AppConfig = {
  // 应用信息
  name: "你的应用名称",
  version: "1.0.0",
  author: "你的名字",
  description: "应用描述",
  homepage: "https://your-website.com",
  repository: "https://github.com/your/repo",
  copyright: "Copyright © 2025 Your Name",

  // 窗口配置
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true,
    alwaysOnTop: false,
    center: true,
    skipTaskbar: false,
  },

  // 托盘配置
  tray: {
    enabled: true,
    tooltip: "应用提示",
    title: "",
    menus: [
      /* ... */
    ],
  },

  // 悬浮球配置
  float_ball: {
    enabled: true,
    width: 56,
    height: 56,
    default_x: 0,
    default_y: 0,
    always_on_top: true,
  },

  // 开发配置
  dev: {
    openDevTools: false,
  },
};
```

### 托盘配置

#### 多级菜单配置

```typescript
tray: {
  enabled: true,
  tooltip: '应用提示文字',
  title: '',                    // macOS 显示，空字符串不显示
  menus: [
    {
      label: '应用',
      items: [
        { id: 'about', label: '关于', action: 'about' },
        { id: 'settings', label: '设置', action: 'custom' },
      ],
    },
    {
      label: '窗口',
      items: [
        { id: 'show', label: '显示窗口', action: 'show' },
        { id: 'quit', label: '退出', action: 'quit' },
      ],
    },
  ],
}
```

#### 预定义动作

| Action  | 说明     | 行为                     |
| ------- | -------- | ------------------------ |
| `about` | 关于窗口 | 打开关于页面（独立窗口） |
| `show`  | 显示窗口 | 显示并聚焦主窗口         |
| `quit`  | 退出应用 | 退出应用程序             |

#### 添加自定义菜单项

1. 在配置中添加菜单项：

```typescript
{
  label: '应用',
  items: [
    { id: 'settings', label: '设置', action: 'custom' },
  ],
}
```

2. 在 `src-tauri/src/lib.rs` 中处理事件：

```rust
.on_menu_event(|app, event| {
  match event.id.as_ref() {
    "settings" => {
      log::info!("Settings menu clicked");
      // 你的自定义逻辑
    }
    _ => {}
  }
})
```

### 悬浮球配置

#### 基本配置

```typescript
float_ball: {
  enabled: true,            // 是否启用悬浮球
  width: 56,                // 悬浮球宽度
  height: 56,               // 悬浮球高度
  default_x: 0,             // 默认 X 位置（0 表示居中）
  default_y: 0,             // 默认 Y 位置（0 表示居中）
  always_on_top: true,      // 是否始终置顶
}
```

#### 控制悬浮球

```typescript
import { invoke } from "@tauri-apps/api/core";

// 显示/隐藏悬浮球
await invoke("toggle_float_ball", { show: true });

// 检查状态
const isVisible = await invoke<boolean>("is_float_ball_visible");
```

#### 监听文件拖放事件

```typescript
import { listen } from "@tauri-apps/api/event";
import type { FilesDroppedPayload } from "@/types/events";

const unlisten = await listen<FilesDroppedPayload>("files-dropped", (event) => {
  const filePaths = event.payload.files;
  console.log("接收到文件:", filePaths);
  // 处理文件...
});

// 组件卸载时清理监听器
onUnmounted(() => {
  unlisten();
});
```

---

## 高级功能

### 图标配置

#### 自动生成图标

准备一个 1024×1024 的 PNG 图标，命名为 `logo.png` 放在项目根目录：

```bash
npm run generate-icons
```

自动生成所有平台的应用图标。

详见 [ICON_GUIDE.md](./ICON_GUIDE.md)。

### 自定义命令

#### 在 Rust 中定义命令

编辑 `src-tauri/src/commands.rs`：

```rust
#[tauri::command]
pub fn my_custom_command(param: String) -> String {
    format!("Received: {}", param)
}
```

#### 注册命令

在 `src-tauri/src/lib.rs` 中注册：

```rust
.invoke_handler(tauri::generate_handler![
    commands::my_custom_command,
])
```

#### 在前端调用

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("my_custom_command", {
  param: "Hello from frontend",
});
console.log(result);
```

### 跨窗口通信

#### 发送事件

```typescript
import { emit } from "@tauri-apps/api/event";

await emit("custom-event", { message: "Hello" });
```

#### 监听事件

```typescript
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen("custom-event", (event) => {
  console.log("Received:", event.payload);
});
```

---

## 开发建议

### 添加新功能

推荐使用 `features/` 目录组织功能模块：

```
src/features/
├── about/               # 关于功能
└── your-feature/        # 你的新功能
    ├── YourFeature.vue
    └── index.ts
```

### 状态管理

使用 Pinia 管理全局状态：

```typescript
import { defineStore } from "pinia";

export const useExampleStore = defineStore("example", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

### 调试技巧

- **前端调试**: 浏览器开发者工具
- **Rust 日志**: 查看终端输出
- **启用 DevTools**: 在 `app.config.ts` 中设置 `dev.openDevTools: true`

---

## 故障排查

### 配置不生效

```bash
npm run sync:config
npm run tauri:dev
```

### Rust 编译错误

```bash
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

### 悬浮球不响应文件拖放

确保使用 Tauri 2.0 的事件名称：

- ✅ `tauri://drag-drop`（Tauri 2.0）
- ❌ `tauri://file-drop`（Tauri 1.x，已弃用）

检查权限配置（`src-tauri/tauri.conf.json`）：

```json
{
  "identifier": "float-ball-capability",
  "windows": ["float-ball"],
  "permissions": [
    "core:window:allow-start-dragging",
    "core:event:allow-listen",
    "core:event:allow-emit"
  ]
}
```

### 更多问题

查看 [Issues](../../issues) 或提交新问题。
