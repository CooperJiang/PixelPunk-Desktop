# 插件安装说明

本模板已经预置了以下 Tauri 插件的配置，但需要先安装依赖才能使用。

## 已安装的插件

- **tauri-plugin-updater** - 自动更新
- **tauri-plugin-fs** - 文件系统访问
- **tauri-plugin-notification** - 系统通知
- **tauri-plugin-global-shortcut** - 全局快捷键
- **tauri-plugin-process** - 进程管理

## 自动安装（推荐）

克隆项目后，运行：

```bash
npm install
```

所有必要的依赖会自动安装。

## 手动安装

如果需要手动安装特定插件：

### 前端依赖

```bash
npm install @tauri-apps/plugin-updater
npm install @tauri-apps/plugin-fs
npm install @tauri-apps/plugin-notification
npm install @tauri-apps/plugin-global-shortcut
npm install @tauri-apps/plugin-process
```

### Rust 依赖

已在 `src-tauri/Cargo.toml` 中配置：

```toml
[dependencies]
tauri-plugin-updater = "2"
tauri-plugin-fs = "2"
tauri-plugin-notification = "2"
tauri-plugin-global-shortcut = "2"
tauri-plugin-process = "2"
```

Rust 依赖会在第一次构建时自动下载。

## 验证安装

运行开发模式：

```bash
npm run tauri:dev
```

如果没有错误，说明所有插件已正确安装。

## 可选：移除不需要的插件

如果你不需要某个功能，可以移除对应的插件：

### 1. 从 package.json 移除

```bash
npm uninstall @tauri-apps/plugin-xxx
```

### 2. 从 Cargo.toml 移除

编辑 `src-tauri/Cargo.toml`，删除对应的依赖行。

### 3. 从 lib.rs 移除

编辑 `src-tauri/src/lib.rs`，删除对应的 `.plugin()` 初始化代码。

### 4. 从 tauri.conf.json 移除

编辑 `src-tauri/tauri.conf.json`，删除 `plugins` 中对应的配置。

### 5. 删除相关文件

删除对应的配置文件和工具模块：

- 更新器: `src/config/updater.config.ts`, `src/utils/updater.ts`
- 存储: `src/config/storage.config.ts`, `src/utils/storage.ts`, `src/composables/useStorage.ts`
- 快捷键: `src/config/shortcuts.config.ts`, `src/utils/shortcuts.ts`
- 通知: `src/utils/notification.ts`, `src/composables/useNotification.ts`

## 常见问题

### Q: 安装时出现 EBADENGINE 警告

这是因为 Node.js 版本低于推荐版本。虽然可以继续使用，但建议升级到 Node.js 20.19+ 或 22.12+：

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### Q: Rust 依赖下载很慢

可以配置国内镜像加速。编辑 `~/.cargo/config.toml`：

```toml
[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
```

### Q: 某个插件功能不工作

1. 检查是否在 `tauri.conf.json` 中启用了对应插件
2. 检查是否在 `lib.rs` 中初始化了插件
3. 查看终端日志是否有错误信息
4. 确认配置文件中 `enabled` 是否为 `true`（如更新器默认是关闭的）

## 更多信息

- [Tauri 官方文档](https://tauri.app/v2/guides/)
- [Tauri 插件列表](https://tauri.app/v2/plugins/)
