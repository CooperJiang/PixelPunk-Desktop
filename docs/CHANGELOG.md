# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 🔄 **自动更新器模块**
  - 应用自动更新，支持版本检查、下载进度跟踪、自动安装
  - 配置驱动，可在 `src/config/updater.config.ts` 中配置
  - 提供 `updater` 工具类和进度回调 API
  - 支持启动时检查和定时检查更新

- 💾 **数据持久化模块**
  - 本地 JSON 文件存储，跨平台路径管理
  - 支持嵌套键访问（如 `user.settings.theme`）
  - 自动保存机制，可配置保存间隔
  - 提供 `storage` 工具类和 `useStorage` 响应式 Composable
  - 完整的 TypeScript 类型支持

- ⌨️ **键盘快捷键模块**
  - 支持全局快捷键（应用最小化时也能触发）
  - 支持应用内快捷键（仅在应用聚焦时触发）
  - 配置驱动，可在 `src/config/shortcuts.config.ts` 中配置
  - 提供 `shortcutManager` 工具类
  - 跨平台键位映射（Cmd/Ctrl 自动适配）

- 🔔 **系统通知模块**
  - 原生系统通知集成
  - 自动请求和管理通知权限
  - 提供预置快捷方法：success、error、info、warning
  - 提供 `notification` 工具类和 `useNotification` Composable

- 📚 **完善的文档体系**
  - 重构 README.md（从 406 行精简到 205 行，精简 50%）
  - 添加项目预览图展示，直观展示项目特性
  - 创建独立的开发文档 DEVELOPMENT.md（详细的使用指南、API 参考）
  - README 专注于核心内容，详细使用通过链接跳转
  - 应用内 Home 页面详细介绍四个核心模块
  - 添加折叠式常见问题解答

- 🔌 **Tauri 插件集成**
  - tauri-plugin-updater (自动更新)
  - tauri-plugin-fs (文件系统)
  - tauri-plugin-notification (系统通知)
  - tauri-plugin-global-shortcut (全局快捷键)
  - tauri-plugin-process (进程管理)

### Changed

- 📝 重构 README.md 为专业开源项目格式
  - 居中对齐的标题和副标题
  - 清晰的功能分类（核心功能 + 开发体验）
  - 简洁的代码示例
  - 折叠式常见问题
- 🎨 优化 Home.vue 页面，新增"核心功能模块"文档展示区
  - 四个功能模块的详细介绍卡片
  - 配置文件位置提示
  - 使用示例展示
  - 文档链接汇总
- 🔧 更新项目结构
  - 新增 `src/config/` 配置目录
  - 新增 `src/utils/` 工具模块目录
  - 新增 `src/composables/` Vue Composables 目录
  - 新增 `docs/image/` 文档图片目录

### Fixed

- 🐛 修复 macOS 窗口透明度相关的未使用导入警告
- 🐛 修复 fs 插件初始化错误（移除不支持的 scope 配置）
- 🐛 修复悬浮球拖动失效问题
- 🐛 修复悬浮球窗口尺寸不匹配导致的点击问题
- 🐛 修复 Tauri 2.0 事件名称错误

### Improved

- 📦 添加 `.claude` 到 `.gitignore`
- 🎯 统一配置驱动架构，所有模块都可通过配置文件管理
- 💅 改进代码组织结构，功能模块化
- 📖 完善类型定义，提升开发体验

## [0.1.0] - 2025-01-XX

### Added

- 基于 Tauri 2.0 + Vue 3 + TypeScript 的桌面应用模板
- 自定义标题栏（macOS）
- 系统托盘支持
- 多级菜单分组配置
- 完整的配置管理系统
- TypeScript 类型安全
- Pinia 状态管理
- Tailwind CSS 样式系统
- ESLint + Prettier 代码规范

### Features

- ⚡️ 现代技术栈
- 🎯 悬浮球功能
- 🎨 自定义标题栏
- 🔔 系统托盘
- 📦 轻量打包
- 🛠️ 完全配置化
- 💅 代码规范

---

## 版本说明

### 版本号规范

本项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)：

- **主版本号（Major）**：当你做了不兼容的 API 修改
- **次版本号（Minor）**：当你做了向下兼容的功能性新增
- **修订号（Patch）**：当你做了向下兼容的问题修正

### 变更类型

- **Added**：新增功能
- **Changed**：功能变更
- **Deprecated**：即将废弃的功能
- **Removed**：已移除的功能
- **Fixed**：问题修复
- **Security**：安全性修复

---

[Unreleased]: https://github.com/yourusername/pixelpunk/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/pixelpunk/releases/tag/v0.1.0
