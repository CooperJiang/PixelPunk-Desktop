<h1 align="center">PixelPunk Desktop</h1>

<p align="center">
  Modern desktop template powered by Tauri 2 · Vue 3 · TypeScript
</p>

## Overview

PixelPunk Desktop 提供生产级的桌面应用脚手架：多窗口、自动更新、系统托盘、快捷键、主题系统、统一日志与配置同步。架构重点是多窗口一致性、稳定的鉴权流程和清晰的边界分工。

## Quick Start

### Prerequisites

- Node.js ≥ 20.19 / 22.12
- Rust ≥ 1.70（参见 Tauri Prerequisites）

### Install & Run

```bash
npm install
npm run tauri:dev        # 前后端一体开发（推荐）

# 常用
npm run dev              # 仅前端
npm run build            # 仅前端构建
npm run tauri:build      # 打包桌面应用
```

## Common Commands

```bash
# 配置同步（TS → Rust）
npm run sync:config

# 代码质量
npm run lint
npm run format
npm run type-check

# 资源
npm run generate-icons
```

## Project Structure

```
src/
  components/     # UI 组件
  views/          # 页面视图（Home/Login/...）
  layouts/        # 布局（TitleBar 等）
  composables/    # 可复用逻辑（useTheme/useWindowState）
  utils/          # 工具（storage/logger/network/...）
  router/         # 路由
src-tauri/        # Rust 侧（窗口/托盘/命令/插件）
```

## Configuration

- 应用配置：`src/config/app.config.ts`
- 持久化存储：`src/config/storage.config.ts`
- 日志开关：`.env`
  - `VITE_LOG_LEVEL` = off | error | warn | info | debug | trace
  - `VITE_LOG_CONSOLE_DEV` = true/false（开发环境是否镜像到控制台）

## Documentation

- Architecture Overview → `docs/ARCHITECTURE.md`
- IPC Events → `docs/IPC_EVENTS.md`
- Development Guide → `docs/DEVELOPMENT.md`
- Contributing → `docs/CONTRIBUTING.md`

## License

MIT · 详见 `LICENSE`
