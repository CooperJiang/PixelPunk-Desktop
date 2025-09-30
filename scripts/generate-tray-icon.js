import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_LOGO = resolve(__dirname, "../logo.png");
const OUTPUT_ICON = resolve(__dirname, "../src-tauri/icons/32x32.png");

async function generateTrayIcon() {
  try {
    console.log("🎨 生成 macOS 托盘图标...\n");

    // macOS 托盘图标要求：
    // 1. 黑白图标（单色 + 透明背景）
    // 2. 白色部分会被系统渲染为前景色（自动适应主题）
    // 3. 透明部分保持透明

    // 方案：将彩色图标转为黑白轮廓图标
    const buffer = await sharp(SOURCE_LOGO)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .grayscale() // 转为灰度
      .normalize() // 标准化对比度
      .threshold(128) // 阈值处理，转为纯黑白
      .negate({ alpha: false }) // 反转颜色（黑变白，白变黑）
      .toColorspace("srgb")
      .ensureAlpha()
      .png()
      .toBuffer();

    await sharp(buffer).toFile(OUTPUT_ICON);

    console.log("✅ 托盘图标生成成功！");
    console.log(`📁 位置：${OUTPUT_ICON}\n`);
    console.log("💡 提示：");
    console.log("  - macOS 托盘图标应该是黑白图标");
    console.log("  - 白色区域会显示为前景色（自动适应系统主题）");
    console.log("  - 如果效果不理想，建议手动设计一个黑白线条图标\n");
    console.log("📝 运行 npm run tauri:dev 查看效果");
  } catch (error) {
    console.error("❌ 生成失败：", error.message);
    process.exit(1);
  }
}

generateTrayIcon();
