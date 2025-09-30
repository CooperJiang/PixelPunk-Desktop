import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 动态导入配置
async function syncConfig() {
  try {
    // 导入 TS 配置（需要先构建或使用 tsx）
    const configModule = await import("../src/config/app.config.ts");
    const config = configModule.appConfig;

    // 转换为 Rust 可读的格式（snake_case）
    const rustConfig = {
      name: config.name,
      version: config.version,
      author: config.author,
      description: config.description,
      homepage: config.homepage || null,
      repository: config.repository || null,
      copyright: config.copyright || null,
      window: {
        width: config.window.width,
        height: config.window.height,
        min_width: config.window.minWidth || null,
        min_height: config.window.minHeight || null,
        max_width: config.window.maxWidth || null,
        max_height: config.window.maxHeight || null,
        resizable: config.window.resizable,
        maximizable: config.window.maximizable,
        minimizable: config.window.minimizable,
        closable: config.window.closable,
        always_on_top: config.window.alwaysOnTop,
        center: config.window.center,
        skip_taskbar: config.window.skipTaskbar,
      },
      tray: {
        enabled: config.tray.enabled,
        tooltip: config.tray.tooltip || null,
        title: config.tray.title || null,
        menus: config.tray.menus.map((group) => ({
          label: group.label,
          items: group.items.map((item) => ({
            id: item.id,
            label: item.label,
            action: item.action,
          })),
        })),
      },
      dev: {
        open_dev_tools: config.dev.openDevTools,
      },
    };

    // 写入 JSON 文件
    const outputPath = resolve(__dirname, "../src-tauri/app.config.json");
    writeFileSync(outputPath, JSON.stringify(rustConfig, null, 2));

    console.log("✅ Config synced to:", outputPath);
  } catch (error) {
    console.error("❌ Failed to sync config:", error);
    process.exit(1);
  }
}

syncConfig();
