# PixelPunk Development Guide

This document provides detailed usage guides, API references, and best practices.

## Table of Contents

- [Core Modules](#core-modules)
  - [Auto Updater](#auto-updater)
  - [Data Persistence](#data-persistence)
  - [Shortcuts System](#shortcuts-system)
  - [System Notifications](#system-notifications)
- [Infrastructure](#infrastructure)
  - [Window State](#window-state)
  - [Single Instance](#single-instance)
  - [Theme System](#theme-system)
  - [Logger](#logger)
- [Configuration Guide](#configuration-guide)
  - [App Configuration](#app-configuration)
  - [Tray Configuration](#tray-configuration)
  - [Floating Ball Configuration](#floating-ball-configuration)
- [Advanced Features](#advanced-features)
  - [Custom Commands](#custom-commands)
  - [Cross-Window Communication](#cross-window-communication)
- [Development Tips](#development-tips)
- [Troubleshooting](#troubleshooting)

---

## Core Modules

### 🔄 Auto Updater

Supports automatic application updates with download progress tracking and version checking.

#### Configuration

Edit `src/config/updater.config.ts`:

```typescript
export const updaterConfig = {
  enabled: true, // Enable auto-update
  checkOnStartup: true, // Check on startup
  checkInterval: 3600000, // Check every 1 hour
  silent: false, // Silent update
  endpoints: ["https://your-update-server.com/{{target}}/{{current_version}}"],
};
```

#### Generate Key Pair

```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

Configure the public key in `src-tauri/tauri.conf.json`:

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

#### Usage

```typescript
import { updater } from "@/utils/updater";

// Manual update check
const result = await updater.checkForUpdates();
if (result.available) {
  console.log("New version:", result.version);
  await updater.downloadAndInstall();
}

// Listen to download progress
updater.onProgress((progress) => {
  console.log(`Download progress: ${progress.percentage}%`);
});

// Auto-check on startup
onMounted(() => {
  updater.startAutoCheck();
});
```

#### API Reference

| Method                 | Parameters           | Return Value          | Description                 |
| ---------------------- | -------------------- | --------------------- | --------------------------- |
| `checkForUpdates()`    | -                    | `Promise<UpdateInfo>` | Check for updates           |
| `downloadAndInstall()` | -                    | `Promise<void>`       | Download and install update |
| `onProgress(callback)` | `(progress) => void` | `void`                | Listen to download progress |
| `startAutoCheck()`     | -                    | `void`                | Start auto-check            |
| `stopAutoCheck()`      | -                    | `void`                | Stop auto-check             |

#### Server Response Format

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

### 💾 Data Persistence

Supports persisting application data to local files with auto-save and nested access.

#### Configure Default Data

Edit `src/config/storage.config.ts`:

```typescript
export const storageConfig = {
  file: {
    dir: "AppData", // Storage directory
    filename: "app-data.json",
    autoSave: true,
    saveInterval: 5000, // Auto-save every 5 seconds
  },
  defaults: {
    theme: "light",
    language: "en-US",
    apiUrl: "https://api.example.com",
    userSettings: {
      notifications: true,
    },
  },
};
```

#### Usage Method 1: Direct Access

```typescript
import { storage } from "@/utils/storage";

// Initialize (in main.ts)
await storage.init();

// Read/write data
storage.set("theme", "dark");
const theme = storage.get("theme", "light");

// Nested access
storage.set("user.name", "Alice");
const name = storage.get("user.name");

// Check if key exists
if (storage.has("user.name")) {
  console.log("Username is set");
}

// Delete data
storage.remove("user.name");

// Clear all data
await storage.clear();

// Manual save
await storage.save();
```

#### Usage Method 2: Vue Reactive (Recommended)

```vue
<script setup lang="ts">
import { useStorage } from "@/composables/useStorage";

// Create reactive persistent data
const theme = useStorage("theme", "light");
const username = useStorage("user.name", "");

// Changes are automatically saved to local storage
theme.value = "dark";
username.value = "Alice";
</script>
```

#### API Reference

| Method              | Parameters                 | Return Value    | Description         |
| ------------------- | -------------------------- | --------------- | ------------------- |
| `init()`            | -                          | `Promise<void>` | Initialize storage  |
| `get(key, default)` | `key: string, default?: T` | `T`             | Get value           |
| `set(key, value)`   | `key: string, value: any`  | `void`          | Set value           |
| `has(key)`          | `key: string`              | `boolean`       | Check if key exists |
| `remove(key)`       | `key: string`              | `void`          | Delete key          |
| `clear()`           | -                          | `Promise<void>` | Clear all data      |
| `save()`            | -                          | `Promise<void>` | Manual save         |

#### Data Storage Location

- **Windows**: `%APPDATA%\{app-name}\app-data.json`
- **macOS**: `~/Library/Application Support/{app-name}/app-data.json`
- **Linux**: `~/.config/{app-name}/app-data.json`

---

### ⌨️ Shortcuts System

Supports global and application shortcuts with full configurability.

#### Configure Shortcuts

Edit `src/config/shortcuts.config.ts`:

```typescript
export const shortcutsConfig = [
  {
    key: "CommandOrControl+Shift+F",
    description: "Toggle floating ball",
    global: true, // Global shortcut
    handler: "toggleFloatBall",
  },
  {
    key: "CommandOrControl+,",
    description: "Open settings",
    global: false, // App-level shortcut
    handler: "openSettings",
  },
  {
    key: "F11",
    description: "Toggle fullscreen",
    handler: "toggleFullscreen",
  },
];
```

#### Register Handlers

```typescript
import { shortcutManager } from "@/utils/shortcuts";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// Register handlers
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

// Initialize all shortcuts
await shortcutManager.registerAll();
```

#### Dynamic Shortcuts

```typescript
await shortcutManager.addShortcut({
  key: "F5",
  description: "Refresh",
  handler: "refresh",
});
```

#### API Reference

| Method                           | Parameters                        | Return Value    | Description              |
| -------------------------------- | --------------------------------- | --------------- | ------------------------ |
| `registerHandler(name, handler)` | `name: string, handler: Function` | `void`          | Register handler         |
| `registerAll()`                  | -                                 | `Promise<void>` | Register all shortcuts   |
| `addShortcut(config)`            | `config: ShortcutConfig`          | `Promise<void>` | Add shortcut dynamically |
| `unregisterShortcut(key)`        | `key: string`                     | `Promise<void>` | Unregister shortcut      |
| `unregisterAll()`                | -                                 | `Promise<void>` | Unregister all shortcuts |
| `getRegistered()`                | -                                 | `string[]`      | Get registered shortcuts |

#### Shortcut Format

- **Modifiers**: `CommandOrControl`, `Command`, `Control`, `Alt`, `Shift`
- **Keys**: `A-Z`, `0-9`, `F1-F12`, `Enter`, `Space`, `ArrowUp`, etc.
- **Examples**: `'CommandOrControl+Shift+F'`, `'Alt+Enter'`, `'F11'`
- **Platform**: `CommandOrControl` is `Command` on macOS, `Control` on Windows/Linux

---

### 🔔 System Notifications

Supports sending native system notifications with automatic permission management.

#### Initialize

```typescript
import { notification } from "@/utils/notification";

// Initialize in main.ts
await notification.init();
```

#### Usage Method 1: Direct Call

```typescript
// Send notification
await notification.send({
  title: "Success",
  body: "File uploaded",
});

// Use shortcut methods
await notification.success("Save successful", "Data saved");
await notification.error("Save failed", "Network error");
await notification.info("Info", "New message");
await notification.warning("Warning", "Low disk space");
```

#### Usage Method 2: Composable (Recommended)

```vue
<script setup lang="ts">
import { useNotification } from "@/composables/useNotification";

const { success, error, info } = useNotification();

const handleSave = async () => {
  try {
    await saveData();
    await success("Save successful", "Data saved");
  } catch (err) {
    await error("Save failed", err.message);
  }
};
</script>
```

#### API Reference

| Method                 | Parameters            | Return Value    | Description                       |
| ---------------------- | --------------------- | --------------- | --------------------------------- |
| `init()`               | -                     | `Promise<void>` | Initialize and request permission |
| `send(options)`        | `NotificationOptions` | `Promise<void>` | Send notification                 |
| `success(title, body)` | `string, string`      | `Promise<void>` | Success notification              |
| `error(title, body)`   | `string, string`      | `Promise<void>` | Error notification                |
| `info(title, body)`    | `string, string`      | `Promise<void>` | Info notification                 |
| `warning(title, body)` | `string, string`      | `Promise<void>` | Warning notification              |
| `isGranted()`          | -                     | `boolean`       | Check permission status           |

---

## Infrastructure

### 🪟 Window State

Automatically saves and restores window position and size.

#### Usage

```vue
<script setup lang="ts">
import { useWindowState } from "@/composables/useWindowState";

// In App.vue
onMounted(() => {
  useWindowState(); // Auto-save window state
});
</script>
```

#### Configuration

Enable in `src/config/app.config.ts`:

```typescript
app: {
  rememberWindowState: true,
}
```

#### Features

- Auto-save window position on move
- Auto-save window size on resize
- Restore state on app launch
- Debounced saves (500ms)

---

### 🔒 Single Instance

Prevents multiple instances of the application from running.

#### Configuration

Enable in `src/config/app.config.ts`:

```typescript
app: {
  singleInstance: true,
}
```

#### Behavior

- **macOS/Linux**: Uses file locking mechanism
- **Windows**: Uses exclusive file access (basic)
- When second instance is launched, shows message and exits

---

### 🎨 Theme System

Automatic dark/light mode with system theme detection.

#### Usage

```vue
<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";

const { theme, isDark, setTheme, toggleTheme } = useTheme();

// Set theme
setTheme("dark"); // Force dark
setTheme("light"); // Force light
setTheme("system"); // Follow system

// Toggle theme
toggleTheme();

// Check current theme
console.log(isDark.value); // true/false
</script>
```

#### Features

- Auto-detect system theme preference
- Listen to system theme changes
- Persist user preference
- Apply to DOM via `data-theme` attribute and `dark` class
- Compatible with TailwindCSS dark mode

#### CSS Usage

```css
/* Using data-theme */
[data-theme="dark"] {
  background: #1a1a1a;
}

/* Using TailwindCSS */
.dark:bg-gray-900 {
  /* ... */
}
```

---

### 📝 Logger

Structured logging system with persistence.

#### Usage

```typescript
import { logger, createTimer } from "@/utils/logger";

// Basic logging
await logger.info("User logged in", { userId: 123 });
await logger.error("Failed to save", { error: err });
await logger.debug("Debug info", { data });

// Exception logging
try {
  // ...
} catch (err) {
  await logger.exception(err, { context: "save_user" });
}

// Performance tracking
const timer = createTimer("data_load");
// ... do work
await timer.end({ count: 100 });
```

#### API Reference

| Method                         | Parameters                   | Description              |
| ------------------------------ | ---------------------------- | ------------------------ |
| `trace(msg, ctx?)`             | `string, LogContext`         | Trace level logging      |
| `debug(msg, ctx?)`             | `string, LogContext`         | Debug level logging      |
| `info(msg, ctx?)`              | `string, LogContext`         | Info level logging       |
| `warn(msg, ctx?)`              | `string, LogContext`         | Warning level logging    |
| `error(msg, ctx?)`             | `string, LogContext`         | Error level logging      |
| `exception(err, ctx?)`         | `Error, LogContext`          | Log exception with stack |
| `performance(label, ms, ctx?)` | `string, number, LogContext` | Log performance metric   |

#### Log Storage

- **Development**: Console only
- **Production**: Persisted to file via `tauri-plugin-log`
  - **Windows**: `%APPDATA%\{app}\logs\`
  - **macOS**: `~/Library/Logs/{app}/`
  - **Linux**: `~/.local/share/{app}/logs/`

---

### 🧪 Testing Infrastructure

A test page is included to verify all infrastructure modules work correctly.

#### Access Test Page

1. Run the application: `npm run tauri:dev`
2. Click "🧪 测试基础设施功能" button on home page
3. Or navigate to `/test` route

#### What You Can Test

- **Theme System**: Toggle dark/light/system modes, see visual changes
- **Data Persistence**: Save key-value pairs, restart app to verify persistence
- **Logger**: Test different log levels, check browser console (Cmd+Option+I)
- **Window State**: Move/resize window, restart to verify it restores position
- **Single Instance**: Try launching app again while running, should show dialog

---

## Configuration Guide

### App Configuration

All configurations are centralized in `src/config/app.config.ts`:

```typescript
export const appConfig: AppConfig = {
  // App info
  name: "Your App Name",
  version: "1.0.0",
  author: "Your Name",
  description: "App description",
  homepage: "https://your-website.com",
  repository: "https://github.com/your/repo",
  copyright: "Copyright © 2025 Your Name",

  // App behavior
  app: {
    singleInstance: true, // Prevent multiple app instances
    rememberWindowState: true, // Remember window position and size
    quitOnClose: false, // false = hide to tray on close, true = quit app
  },

  // Window config
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

  // Tray config
  tray: {
    enabled: true,
    tooltip: "App tooltip",
    title: "",
    menus: [
      /* ... */
    ],
  },

  // Floating ball config
  float_ball: {
    enabled: true,
    width: 56,
    height: 56,
    default_x: 0,
    default_y: 0,
    always_on_top: true,
  },

  // Dev config
  dev: {
    openDevTools: false,
  },
};
```

### Tray Configuration

#### Multi-level Menu Config

```typescript
tray: {
  enabled: true,
  tooltip: 'App tooltip',
  title: '',                    // macOS display, empty string hides it
  menus: [
    {
      label: 'App',
      items: [
        { id: 'about', label: 'About', action: 'about' },
        { id: 'settings', label: 'Settings', action: 'custom' },
      ],
    },
    {
      label: 'Window',
      items: [
        { id: 'show', label: 'Show Window', action: 'show' },
        { id: 'quit', label: 'Quit', action: 'quit' },
      ],
    },
  ],
}
```

#### Predefined Actions

| Action  | Description  | Behavior                          |
| ------- | ------------ | --------------------------------- |
| `about` | About window | Open About page (separate window) |
| `show`  | Show window  | Show and focus main window        |
| `quit`  | Quit app     | Exit application                  |

#### Add Custom Menu Items

1. Add menu items in config:

```typescript
{
  label: 'App',
  items: [
    { id: 'settings', label: 'Settings', action: 'custom' },
  ],
}
```

2. Handle events in `src-tauri/src/lib.rs`:

```rust
.on_menu_event(|app, event| {
  match event.id.as_ref() {
    "settings" => {
      log::info!("Settings menu clicked");
      // Your custom logic
    }
    _ => {}
  }
})
```

### Floating Ball Configuration

#### Basic Config

```typescript
float_ball: {
  enabled: true,            // Enable floating ball
  width: 56,                // Width
  height: 56,               // Height
  default_x: 0,             // Default X position (0 = center)
  default_y: 0,             // Default Y position (0 = center)
  always_on_top: true,      // Always on top
}
```

#### Control Floating Ball

```typescript
import { invoke } from "@tauri-apps/api/core";

// Show/hide floating ball
await invoke("toggle_float_ball", { show: true });

// Check status
const isVisible = await invoke<boolean>("is_float_ball_visible");
```

#### Listen to File Drop Events

```typescript
import { listen } from "@tauri-apps/api/event";
import type { FilesDroppedPayload } from "@/types/events";

const unlisten = await listen<FilesDroppedPayload>("files-dropped", (event) => {
  const filePaths = event.payload.files;
  console.log("Received files:", filePaths);
  // Handle files...
});

// Cleanup on unmount
onUnmounted(() => {
  unlisten();
});
```

---

## Advanced Features

### Custom Commands

#### Define Commands in Rust

Edit `src-tauri/src/commands.rs`:

```rust
#[tauri::command]
pub fn my_custom_command(param: String) -> String {
    format!("Received: {}", param)
}
```

#### Register Commands

In `src-tauri/src/lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    commands::my_custom_command,
])
```

#### Call from Frontend

```typescript
import { invoke } from "@tauri-apps/api/core";

const result = await invoke<string>("my_custom_command", { param: "Hello" });
```

### Cross-Window Communication

#### Emit Events

```typescript
import { emit } from "@tauri-apps/api/event";

await emit("custom-event", { message: "Hello" });
```

#### Listen to Events

```typescript
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen("custom-event", (event) => {
  console.log("Received:", event.payload);
});
```

---

## Development Tips

### Add New Features

Recommended to use `features/` directory:

```
src/features/
├── about/               # About feature
└── your-feature/        # Your new feature
    ├── YourFeature.vue
    └── index.ts
```

### State Management

Use Pinia for global state:

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

### Debugging Tips

- **Frontend Debug**: Browser DevTools
- **Rust Logs**: Check terminal output
- **Enable DevTools**: Set `dev.openDevTools: true` in `app.config.ts`

---

## Troubleshooting

### Configuration Not Working

```bash
npm run sync:config
npm run tauri:dev
```

### Rust Build Errors

```bash
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

### Floating Ball Not Responding to File Drops

Ensure using Tauri 2.0 event names:

- ✅ `tauri://drag-drop` (Tauri 2.0)
- ❌ `tauri://file-drop` (Tauri 1.x, deprecated)

Check permissions config (`src-tauri/tauri.conf.json`):

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

### More Issues

Check [Issues](../../issues) or submit a new issue.
