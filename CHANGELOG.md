# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 悬浮球功能模块
  - 可拖动悬浮球，支持文件拖放
  - 右下角默认位置，可配置边距（margin）
  - 透明窗口，支持 macOS 透明效果
  - 拖放文件自动打开主窗口并显示上传对话框
- 文件拖放上传支持
  - Tauri 2.0 拖放事件集成
  - 跨窗口事件通信
- 配置化悬浮球参数
  - 窗口尺寸、位置、边距可在配置文件中调整

### Changed

- 简化悬浮球交互流程，移除面板功能
- 优化文件拖放体验，直接触发主窗口显示

### Fixed

- 修复悬浮球拖动失效问题
- 修复悬浮球窗口尺寸不匹配导致的点击问题
- 修复 Tauri 2.0 事件名称错误

### Improved

- 清理调试日志，优化代码可读性
- 移除不必要的日志输出，保留关键信息

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
