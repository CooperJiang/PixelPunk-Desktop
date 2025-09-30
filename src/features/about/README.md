# About 功能模块

## 文件结构

```
src/features/about/
├── About.vue       # 关于页面组件
├── about.ts        # 关于页面入口文件
└── README.md       # 本说明文件
```

## 说明

关于页面是一个独立的 Tauri 窗口，用于展示应用的基本信息。

### 主要功能

- 展示应用名称、版本
- 展示作者、描述信息
- 提供主页和仓库链接
- 显示版权信息

### 自定义方法

1. **修改内容**：编辑 `src/config/app.config.ts` 配置文件
2. **修改样式**：编辑 `About.vue` 组件
3. **调整窗口**：编辑 `src-tauri/src/lib.rs` 中的窗口配置

### 窗口配置

在 `src-tauri/src/lib.rs` 中：

```rust
WebviewWindowBuilder::new(app, "about", WebviewUrl::App(about_url.into()))
  .title("关于")
  .inner_size(480.0, 520.0)  // 窗口尺寸
  .resizable(false)           // 是否可调整大小
  .center()                   // 居中显示
  .decorations(true)          // 显示系统标题栏
  .build();
```

### 触发方式

- 通过系统托盘菜单的"关于"选项
- 可以在应用内添加菜单项调用
