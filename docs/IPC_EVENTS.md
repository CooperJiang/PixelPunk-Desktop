## IPC Events

当前使用的跨窗口事件及载荷约定。

### Events

- `auth:updated`
  - Payload: `{ token: string, userInfo: object, at?: number, source?: string }`
  - Sender: `login`
  - Receiver: `main`（更新认证状态并保存）

- `auth:logged-out`
  - Payload: `{ at?: number, source?: string }`
  - Sender: any（401/手动登出）
  - Receiver: `main`（清空认证并切到 login）

### Examples

```ts
import { getCurrentWindow } from "@tauri-apps/api/window";

// login → main: 登录成功后发会话
await getCurrentWindow().emitTo("main", "auth:updated", {
  token,
  userInfo,
  source: "login",
});

// 任意窗口：令牌失效时发登出
await getCurrentWindow().emit("auth:logged-out", { source: "http" });
```
