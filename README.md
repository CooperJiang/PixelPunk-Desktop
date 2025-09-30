# Tauri Vue Template

<p align="center">
  基于 Tauri 2.0 + Vue 3 + TypeScript 的跨平台桌面应用开发模板
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#配置说明">配置说明</a> •
  <a href="#托盘配置">托盘配置</a> •
  <a href="#图标配置">图标配置</a>
</p>

---

## 特性

- ⚡️ **现代技术栈** - Tauri 2.0 + Vue 3 + TypeScript + Vite + Tailwind CSS
- 🎨 **自定义标题栏** - macOS 风格标题栏，支持窗口控制
- 🔔 **系统托盘** - 支持多级菜单分组，完全可配置
- 📦 **轻量打包** - 基于 Rust，打包体积小，性能优异
- 🛠️ **完全配置化** - 所有配置通过 TypeScript 统一管理，自动同步到 Rust
- 🎯 **状态管理** - 集成 Pinia 状态管理
- 💅 **代码规范** - ESLint + Prettier + Husky

## 技术栈

| 技术         | 版本   | 说明         |
| ------------ | ------ | ------------ |
| Tauri        | 2.8.5  | 桌面应用框架 |
| Vue          | 3.5.21 | 前端框架     |
| TypeScript   | 5.8.3  | 类型支持     |
| Vite         | 7.1.7  | 构建工具     |
| Tailwind CSS | 3.4.17 | 样式框架     |
| Pinia        | 3.0.3  | 状态管理     |

## 快速开始

### 环境要求

- Node.js 20.19+ 或 22.12+
- Rust 1.70+
- 系统特定依赖（参考 [Tauri Prerequisites](https://tauri.app/v2/guides/prerequisites/)）

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

这个命令会：

1. 自动同步配置（`src/config/app.config.ts` → `src-tauri/app.config.json`）
2. 启动 Vite 开发服务器
3. 启动 Tauri 应用

### 构建应用

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`

## 项目结构

```
pixelpunk/
├── src/                          # Vue 前端代码
│   ├── config/                   # 📝 配置文件（主要修改位置）
│   │   └── app.config.ts        # 应用配置
│   ├── features/                 # 功能模块
│   │   └── about/               # 关于页面
│   ├── views/                    # 页面视图
│   ├── components/               # 全局组件
│   ├── types/                    # TypeScript 类型
│   └── stores/                   # Pinia 状态管理
│
├── src-tauri/                    # Rust 后端代码
│   ├── src/
│   │   ├── lib.rs               # 主入口（托盘事件处理）
│   │   └── config.rs            # 配置加载
│   ├── icons/                    # 🎨 应用图标
│   │   ├── 32x32.png           # 托盘图标
│   │   ├── icon.icns           # macOS 应用图标
│   │   ├── icon.ico            # Windows 应用图标
│   │   └── icon.png            # Linux 应用图标
│   ├── app.config.json          # 自动生成（无需手动修改）
│   └── tauri.conf.json          # Tauri 配置
│
├── scripts/
│   └── sync-config.js            # 配置同步脚本
└── public/                       # 静态资源
```

## 配置说明

### 配置文件位置

**唯一需要修改的配置文件**：`src/config/app.config.ts`

所有配置都在这个文件中完成，包括：

- 应用信息（名称、版本、作者等）
- 窗口配置（尺寸、行为）
- 托盘配置（菜单、图标）
- 开发配置

### 配置工作流程

```
1. 修改 src/config/app.config.ts
         ↓
2. 运行 npm run tauri:dev 或 npm run tauri:build
         ↓
3. 自动执行 sync-config.js 脚本
         ↓
4. 生成 src-tauri/app.config.json
         ↓
5. Rust 启动时读取配置并应用
```

### 基础配置示例

```typescript
// src/config/app.config.ts
export const appConfig: AppConfig = {
  // 应用信息
  name: '你的应用名称',
  version: '1.0.0',
  author: '你的名字',
  description: '应用描述',
  homepage: 'https://your-website.com',
  repository: 'https://github.com/your/repo',
  copyright: 'Copyright © 2025 Your Name',

  // 窗口配置
  window: {
    width: 1200,              // 窗口宽度
    height: 800,              // 窗口高度
    minWidth: 800,            // 最小宽度
    minHeight: 600,           // 最小高度
    resizable: true,          // 可调整大小
    maximizable: true,        // 可最大化
    minimizable: true,        // 可最小化
    closable: true,           // 可关闭
    alwaysOnTop: false,       // 是否置顶
    center: true,             // 启动时居中
    skipTaskbar: false,       // 是否跳过任务栏
  },

  // 托盘配置（见下文详细说明）
  tray: { ... },

  // 开发配置
  dev: {
    openDevTools: false,      // 是否自动打开开发者工具
  },
};
```

## 托盘配置

### 多级菜单配置

```typescript
tray: {
  enabled: true,              // 是否启用托盘
  tooltip: '应用提示文字',      // 鼠标悬停提示
  title: '',                  // 托盘标题（macOS 显示，空字符串不显示）
  menus: [                    // 多级菜单分组
    {
      label: '应用',          // 一级菜单标题
      items: [                // 该分组下的菜单项
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

### 菜单项配置说明

每个菜单项包含三个字段：

- **id**: 唯一标识符，用于事件处理
- **label**: 显示的菜单文本
- **action**: 预定义动作或自定义动作

### 预定义动作

| Action  | 说明     | 行为                     |
| ------- | -------- | ------------------------ |
| `about` | 关于窗口 | 打开关于页面（独立窗口） |
| `show`  | 显示窗口 | 显示并聚焦主窗口         |
| `quit`  | 退出应用 | 退出应用程序             |

### 添加自定义菜单项

#### 1. 在配置中添加菜单项

```typescript
{
  label: '应用',
  items: [
    { id: 'settings', label: '设置', action: 'custom' },
    { id: 'preferences', label: '偏好设置', action: 'custom' },
  ],
}
```

#### 2. 在 Rust 中处理事件

编辑 `src-tauri/src/lib.rs`，在 `on_menu_event` 中添加处理逻辑：

```rust
.on_menu_event(|app, event| {
  match event.id.as_ref() {
    "settings" => {
      log::info!("Settings menu clicked");
      // 打开设置窗口或执行其他逻辑
    }
    "preferences" => {
      log::info!("Preferences menu clicked");
      // 你的自定义逻辑
    }
    // ... 其他预定义动作
    _ => {
      log::warn!("Unknown menu event: {:?}", event.id);
    }
  }
})
```

## 图标配置

### 自动生成图标

**只需一个 PNG 文件，自动生成所有平台应用图标！**

1. **准备源图片**
   - 将你的 logo 命名为 `logo.png`，放在项目根目录
   - 建议尺寸：1024×1024 或更大
   - 格式：PNG（支持透明背景）

2. **运行生成脚本**

   ```bash
   npm run generate-icons
   ```

3. **重新构建应用**
   ```bash
   npm run tauri:build
   ```

脚本会自动生成：macOS icns、Windows ico、Linux png 等应用图标。

⚠️ **注意**：macOS 托盘图标（32x32.png）有特殊要求，建议手动设计。详见 [TRAY_ICON_GUIDE.md](./TRAY_ICON_GUIDE.md)

📖 详细说明请查看 [ICON_GUIDE.md](./ICON_GUIDE.md)

### 图标位置

| 用途             | 文件路径                    | 尺寸       |
| ---------------- | --------------------------- | ---------- |
| 托盘图标         | `src-tauri/icons/32x32.png` | 32×32 px   |
| macOS 应用图标   | `src-tauri/icons/icon.icns` | 多尺寸     |
| Windows 应用图标 | `src-tauri/icons/icon.ico`  | 多尺寸     |
| Linux 应用图标   | `src-tauri/icons/icon.png`  | 512×512 px |

### 手动替换图标

如果不使用自动生成，也可以手动替换：

1. 将新图标文件放到 `src-tauri/icons/` 目录
2. 保持文件名不变
3. 运行 `npm run tauri:build` 重新构建

### 托盘图标设计建议

- **macOS**：使用黑白透明图标（模板图标），会自动适应系统主题
- **Windows**：可以使用彩色图标
- **Linux**：支持透明背景的 PNG

## 常用命令

```bash
# 开发
npm run dev              # 仅启动 Vite 开发服务器
npm run tauri:dev        # 启动完整开发环境（推荐）

# 构建
npm run build            # 构建前端
npm run tauri:build      # 构建完整应用

# 配置
npm run sync:config      # 手动同步配置
npm run generate-icons   # 生成应用图标

# 代码质量
npm run lint             # 代码检查
npm run format           # 代码格式化
npm run type-check       # 类型检查
```

## 更新配置

### 方法 1：自动同步（推荐）

修改 `src/config/app.config.ts` 后，运行：

```bash
npm run tauri:dev
```

配置会自动同步并应用。

### 方法 2：手动同步

如果只想同步配置而不启动应用：

```bash
npm run sync:config
```

## 开发建议

### 1. 配置修改流程

每次修改配置后：

```bash
npm run tauri:dev  # 会自动同步配置
```

或手动同步：

```bash
npm run sync:config
```

### 2. 添加新功能模块

推荐使用 `features/` 目录组织功能：

```
src/features/
├── about/               # 关于功能
│   ├── About.vue
│   └── index.ts
└── your-feature/        # 你的新功能
    ├── YourFeature.vue
    └── index.ts
```

### 3. 状态管理

使用 Pinia 管理全局状态：

```typescript
// src/stores/example.ts
import { defineStore } from "pinia";

export const useExampleStore = defineStore("example", {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

### 4. 调试

- **前端调试**：浏览器开发者工具（自动打开）
- **Rust 日志**：查看终端输出
- **启用 DevTools**：在 `app.config.ts` 中设置 `dev.openDevTools: true`

## 常见问题

### 1. 端口被占用

```bash
Error: Port 5173 is already in use
```

**解决方案**：

```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### 2. 配置不生效

确保运行了配置同步：

```bash
npm run sync:config
```

然后重启应用：

```bash
npm run tauri:dev
```

### 3. Rust 编译错误

清理并重新构建：

```bash
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

### 4. 托盘图标不显示

- 检查 `app.config.ts` 中 `tray.enabled` 是否为 `true`
- 确认图标文件存在：`src-tauri/icons/32x32.png`
- macOS 系统：检查菜单栏是否有足够空间显示图标

### 5. Node.js 版本警告

```
You are using Node.js 20.18.3. Vite requires Node.js version 20.19+ or 22.12+
```

**解决方案**：升级 Node.js 版本到 20.19+ 或 22.12+

## 项目特点

### 完全配置化

所有应用配置集中在 `src/config/app.config.ts`，修改后自动同步到 Rust 后端，无需手动维护多份配置文件。

### 类型安全

TypeScript + Rust 双重类型保护，配置错误在编译时就能发现。

### 开发体验

- 热重载：前端代码修改实时生效
- 自动同步：配置修改自动同步到后端
- 统一管理：一处配置，全局生效

## 许可证

MIT License

---

**开发模板**: Tauri Vue Template
**模板版本**: 1.0.0
**更新日期**: 2025-10-01
