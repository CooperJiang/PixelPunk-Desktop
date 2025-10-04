## Architecture Overview

### Windows & Responsibilities

- `main`: 主窗口，承载已登录应用；负责认证状态持久化与窗口管理。
- `login`: 登录/注册窗口；执行登录后通过事件将会话信息发给 `main`。
- `float-ball`: 悬浮球工具窗口；负责拖拽上传触发、唤起主窗。

### Boot & Auth Flow

1. App 启动：`storage.init()` → `authStore.initAuth()`。
2. `login` 成功后，发送 `auth:updated` 事件（携带 `{ token, userInfo }`）给 `main`。
3. `main` 接收后立即 `authStore.setUserInfo/setToken` 并保存；主页立即刷新 UI。
4. 401/令牌失效：网络层清理本地凭证，发送 `auth:logged-out`，`main` 清空状态并切回 `login`。

### IPC Events（跨窗口）

- `auth:updated`：从 `login` 发往 `main`，载荷 `{ token, userInfo }`。
- `auth:logged-out`：任何窗口触发，`main` 响应并切到 `login`。

发送示例：

```ts
import { getCurrentWindow } from "@tauri-apps/api/window";
await getCurrentWindow().emitTo("main", "auth:updated", { token, userInfo });
```

### Storage

- 组件/页面通过 `@/utils/storage` 访问；关键数据（认证）保存时立即 `save()`，减少依赖 autosave。
- 窗口状态通过 `useWindowState` 自动保存与恢复。

### Networking

- 使用 `@tauri-apps/plugin-http`，统一错误分类；401/令牌失效路径会发出 `auth:logged-out`。
- 建议引入响应 schema 校验（zod/valibot），提升类型与数据安全。

### Logging

- 统一 logger（`@/utils/logger`），支持 `VITE_LOG_LEVEL` 与 `VITE_LOG_CONSOLE_DEV`。
- 非 `main` 窗口不调用插件日志，避免权限错误；DEV 可镜像到控制台。

### Routing

- 当前不启用路由守卫，窗口切换控制访问；后续可渐进增强（`requiresAuth/guest`）。

### Next Steps（建议）

- 给 `auth` 的更新方法补充立即保存（减少 autosave 风险）。
- `app.config.errorHandler` 全局兜底，toast + logger。
- API 响应 schema 校验与 `x-request-id` 注入，提升可观测性。
