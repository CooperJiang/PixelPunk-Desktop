<h1 align="center">PixelPunk</h1>

<p align="center">
  <strong>基于 Tauri 2.0 + Vue 3 + TypeScript 的现代化桌面应用开发模板</strong>
</p>

<p align="center">
  开箱即用 · 配置驱动 · 功能完备
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#核心模块">核心模块</a> •
  <a href="#配置指南">配置指南</a> •
  <a href="#文档">文档</a>
</p>

---

## 预览

<div align="center">
  <img src="docs/image/preview-1.png" alt="PixelPunk Preview" width="800">
</div>

## 特性

### 🎯 核心功能

- **🔄 自动更新** - 内置更新器，支持版本检查、下载进度、自动安装
- **💾 数据持久化** - 本地存储方案，支持嵌套访问、自动保存、Vue 响应式
- **⌨️ 快捷键系统** - 全局/局部快捷键，配置驱动，跨平台支持
- **🔔 系统通知** - 原生通知集成，自动权限管理，预置快捷方法
- **🎯 悬浮球** - 文件拖放上传、实时进度、可拖动、始终置顶

### ✨ 开发体验

- **⚡️ 现代技术栈** - Tauri 2.0 + Vue 3 + TypeScript + Vite + Tailwind CSS
- **🎨 自定义窗口** - macOS 风格标题栏，完美透明窗口支持
- **🔔 系统托盘** - 多级菜单分组，完全可配置
- **📦 轻量高效** - Rust 底层，体积小巧，性能卓越
- **🛠️ 配置驱动** - TypeScript 配置自动同步到 Rust
- **💅 代码规范** - ESLint + Prettier + Husky 开箱即用

## 技术栈

```
Frontend:  Vue 3.5 + TypeScript 5.8 + Vite 7.1 + Tailwind CSS 3.4
Backend:   Tauri 2.8 + Rust 1.70+
State:     Pinia 3.0
```

## 快速开始

### 环境准备

- Node.js 20.19+ 或 22.12+
- Rust 1.70+
- 系统依赖：参考 [Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/)

### 安装运行

```bash
# 克隆项目
git clone <your-repo-url>
cd pixelpunk

# 安装依赖
npm install

# 开发模式
npm run tauri:dev

# 构建应用
npm run tauri:build
```

## 核心模块

本模板预置了四个企业级功能模块，开箱即用，全部基于配置驱动。

### 🔄 自动更新器

支持应用自动更新，内置下载进度跟踪、版本检查。

```typescript
import { updater } from "@/utils/updater";

// 检查并安装更新
const info = await updater.checkForUpdates();
if (info.available) {
  await updater.downloadAndInstall();
}

// 监听下载进度
updater.onProgress((progress) => {
  console.log(`${progress.percentage}%`);
});
```

**配置文件**: `src/config/updater.config.ts`

### 💾 数据持久化

本地数据存储，支持嵌套访问、自动保存、Vue 响应式。

```typescript
import { storage } from "@/utils/storage";
import { useStorage } from "@/composables/useStorage";

// 直接使用
await storage.init();
storage.set("user.name", "Alice");
const name = storage.get("user.name");

// Vue 响应式（推荐）
const theme = useStorage("theme", "light");
theme.value = "dark"; // 自动保存
```

**配置文件**: `src/config/storage.config.ts`

### ⌨️ 快捷键系统

全局/局部快捷键，配置驱动，支持动态注册。

```typescript
import { shortcutManager } from "@/utils/shortcuts";

// 注册处理函数
shortcutManager.registerHandler("toggleFloatBall", async () => {
  await invoke("toggle_float_ball", { show: true });
});

// 注册所有快捷键
await shortcutManager.registerAll();
```

**配置文件**: `src/config/shortcuts.config.ts`

### 🔔 系统通知

原生系统通知，自动权限管理，预置快捷方法。

```typescript
import { notification } from "@/utils/notification";
import { useNotification } from "@/composables/useNotification";

// 直接使用
await notification.success("成功", "操作完成");
await notification.error("错误", "操作失败");

// Vue Composable
const { success, error } = useNotification();
await success("保存成功", "数据已保存");
```

**工具模块**: `src/utils/notification.ts`

## 配置指南

### 应用配置

所有配置集中在 `src/config/app.config.ts`，修改后自动同步到 Rust。

```typescript
export const appConfig = {
  name: "你的应用名称",
  version: "1.0.0",
  author: "你的名字",
  description: "应用描述",

  window: {
    width: 1200,
    height: 800,
    // ... 更多窗口配置
  },

  tray: {
    enabled: true,
    tooltip: "应用提示",
    menus: [
      {
        label: "应用",
        items: [
          { id: "about", label: "关于", action: "about" },
          { id: "quit", label: "退出", action: "quit" },
        ],
      },
    ],
  },
};
```

### 配置工作流

```
1. 修改 src/config/app.config.ts
         ↓
2. 运行 npm run tauri:dev
         ↓
3. 配置自动同步并应用
```

### 手动同步配置

```bash
npm run sync:config
```

## 项目结构

```
pixelpunk/
├── src/                          # Vue 前端
│   ├── config/                   # 📝 配置文件（主要修改位置）
│   │   ├── app.config.ts        # 应用配置
│   │   ├── updater.config.ts    # 更新器配置
│   │   ├── storage.config.ts    # 存储配置
│   │   └── shortcuts.config.ts  # 快捷键配置
│   ├── utils/                    # 工具模块
│   ├── composables/              # Vue Composables
│   ├── features/                 # 功能模块
│   └── views/                    # 页面视图
│
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── lib.rs               # 主入口
│   │   ├── commands.rs          # Tauri 命令
│   │   ├── config.rs            # 配置加载
│   │   └── macos.rs             # macOS 特定功能
│   ├── icons/                    # 🎨 应用图标
│   └── app.config.json          # 自动生成（勿手动修改）
│
└── scripts/
    └── sync-config.js            # 配置同步脚本
```

## 悬浮球功能

悬浮球提供完整的文件拖放上传体验：

- **文件拖放**: 拖动文件到悬浮球触发上传
- **实时进度**: 显示上传进度和状态
- **自由拖动**: 可拖动到屏幕任意位置
- **始终置顶**: 不被其他窗口遮挡
- **透明窗口**: macOS 原生透明支持

**使用示例**:

```typescript
import { invoke } from "@tauri-apps/api/core";

// 显示/隐藏悬浮球
await invoke("toggle_float_ball", { show: true });

// 检查状态
const isVisible = await invoke<boolean>("is_float_ball_visible");
```

**配置**: `src/config/app.config.ts` → `float_ball` 部分

## 图标配置

### 自动生成图标

准备一个 1024×1024 的 PNG 图标，命名为 `logo.png` 放在项目根目录：

```bash
npm run generate-icons
```

自动生成所有平台的应用图标（macOS icns、Windows ico、Linux png）。

**详细说明**: 参考 [ICON_GUIDE.md](./ICON_GUIDE.md)

### 图标位置

| 用途             | 文件路径                    | 尺寸       |
| ---------------- | --------------------------- | ---------- |
| 托盘图标         | `src-tauri/icons/32x32.png` | 32×32 px   |
| macOS 应用图标   | `src-tauri/icons/icon.icns` | 多尺寸     |
| Windows 应用图标 | `src-tauri/icons/icon.ico`  | 多尺寸     |
| Linux 应用图标   | `src-tauri/icons/icon.png`  | 512×512 px |

## 常用命令

```bash
# 开发
npm run tauri:dev        # 开发模式（推荐）
npm run dev              # 仅前端开发服务器

# 构建
npm run tauri:build      # 构建完整应用
npm run build            # 仅构建前端

# 配置
npm run sync:config      # 同步配置
npm run generate-icons   # 生成图标

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查
```

## 文档

- **完整功能文档**: 查看应用内 Home 页面
- **插件安装指南**: [PLUGINS_SETUP.md](./PLUGINS_SETUP.md)
- **图标配置指南**: [ICON_GUIDE.md](./ICON_GUIDE.md)
- **托盘图标设计**: [TRAY_ICON_GUIDE.md](./TRAY_ICON_GUIDE.md)

## 常见问题

<details>
<summary><strong>配置不生效怎么办？</strong></summary>

确保运行了配置同步：

```bash
npm run sync:config
npm run tauri:dev
```

</details>

<details>
<summary><strong>如何添加自定义托盘菜单？</strong></summary>

1. 在 `src/config/app.config.ts` 中添加菜单项
2. 在 `src-tauri/src/lib.rs` 的 `on_menu_event` 中处理事件
</details>

<details>
<summary><strong>Node.js 版本警告</strong></summary>

使用 nvm 升级到 Node.js 20.19+ 或 22.12+：

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

</details>

<details>
<summary><strong>更多问题？</strong></summary>

查看 [Issues](../../issues) 或提交新问题。

</details>

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

## 贡献

欢迎提交 Issue 和 Pull Request！

在提交 PR 之前，请确保：

- 代码通过 `npm run lint` 检查
- 代码通过 `npm run type-check` 检查
- 添加必要的测试和文档

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  <sub>基于 Tauri 2.0 + Vue 3 构建</sub>
</p>
