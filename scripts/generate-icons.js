import sharp from "sharp";
import { createICNS } from "png2icons";
import toIco from "to-ico";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const SOURCE_LOGO = resolve(__dirname, "../logo.png"); // 源图片路径
const ICONS_DIR = resolve(__dirname, "../src-tauri/icons");
const ICONSET_DIR = resolve(ICONS_DIR, "App.iconset");

// 需要生成的 PNG 尺寸
const PNG_SIZES = [
  { size: 16, name: "16x16.png" },
  { size: 32, name: "32x32.png" },
  { size: 128, name: "128x128.png" },
  { size: 256, name: "128x128@2x.png" },
  { size: 512, name: "icon.png" },
  // Windows Store logos
  { size: 30, name: "Square30x30Logo.png" },
  { size: 44, name: "Square44x44Logo.png" },
  { size: 71, name: "Square71x71Logo.png" },
  { size: 89, name: "Square89x89Logo.png" },
  { size: 107, name: "Square107x107Logo.png" },
  { size: 142, name: "Square142x142Logo.png" },
  { size: 150, name: "Square150x150Logo.png" },
  { size: 284, name: "Square284x284Logo.png" },
  { size: 310, name: "Square310x310Logo.png" },
  { size: 50, name: "StoreLogo.png" },
  // 方形应用图标
  { size: 1024, name: "app-icon-square.png" },
];

// macOS iconset 需要的尺寸
const ICONSET_SIZES = [
  { size: 16, name: "icon_16x16.png" },
  { size: 32, name: "icon_16x16@2x.png" },
  { size: 32, name: "icon_32x32.png" },
  { size: 64, name: "icon_32x32@2x.png" },
  { size: 128, name: "icon_128x128.png" },
  { size: 256, name: "icon_128x128@2x.png" },
  { size: 256, name: "icon_256x256.png" },
  { size: 512, name: "icon_256x256@2x.png" },
  { size: 512, name: "icon_512x512.png" },
  { size: 1024, name: "icon_512x512@2x.png" },
];

async function generateIcons() {
  try {
    console.log("🎨 开始生成图标...\n");

    // 检查源文件
    if (!existsSync(SOURCE_LOGO)) {
      console.error("❌ 错误：找不到源图片文件 logo.png");
      console.error("请将你的 logo 图片放在项目根目录，命名为 logo.png");
      console.error("建议尺寸：1024x1024 或更大");
      process.exit(1);
    }

    // 读取源图片信息
    const metadata = await sharp(SOURCE_LOGO).metadata();
    console.log(`📐 源图片尺寸：${metadata.width}x${metadata.height}`);

    if (metadata.width < 512 || metadata.height < 512) {
      console.warn(
        "⚠️  警告：源图片分辨率较低，建议使用 1024x1024 或更大的图片",
      );
    }

    // 确保目录存在
    if (!existsSync(ICONS_DIR)) {
      mkdirSync(ICONS_DIR, { recursive: true });
    }
    if (!existsSync(ICONSET_DIR)) {
      mkdirSync(ICONSET_DIR, { recursive: true });
    }

    // 生成 PNG 图标
    console.log("\n📦 生成 PNG 图标...");
    for (const { size, name } of PNG_SIZES) {
      const outputPath = resolve(ICONS_DIR, name);
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toColorspace("srgb") // 转换颜色空间
        .ensureAlpha() // 确保有 alpha 通道
        .png({ compressionLevel: 9 })
        .toFile(outputPath);
      console.log(`  ✓ ${name} (${size}x${size})`);
    }

    // 生成 iconset 文件（用于生成 .icns）
    console.log("\n🍎 生成 macOS iconset...");
    for (const { size, name } of ICONSET_SIZES) {
      const outputPath = resolve(ICONSET_DIR, name);
      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toColorspace("srgb")
        .ensureAlpha() // 确保有 alpha 通道
        .png({ compressionLevel: 9 })
        .toFile(outputPath);
      console.log(`  ✓ ${name} (${size}x${size})`);
    }

    // 生成 .icns (macOS)
    console.log("\n🍎 生成 icon.icns...");
    // 优先使用 macOS 原生的 iconutil 命令
    try {
      execSync(
        `iconutil -c icns "${ICONSET_DIR}" -o "${resolve(ICONS_DIR, "icon.icns")}"`,
        {
          stdio: "pipe",
        },
      );
      console.log("  ✓ icon.icns (使用 iconutil)");
    } catch {
      // 如果 iconutil 不可用（非 macOS 系统），使用 png2icons
      console.log("  ⚠️  iconutil 不可用，使用 png2icons 生成...");
      const icnsBuffer = await generateICNS();
      writeFileSync(resolve(ICONS_DIR, "icon.icns"), icnsBuffer);
      console.log("  ✓ icon.icns (使用 png2icons)");
    }

    // 生成 .ico (Windows)
    console.log("\n🪟 生成 icon.ico...");
    const icoBuffer = await generateICO();
    writeFileSync(resolve(ICONS_DIR, "icon.ico"), icoBuffer);
    console.log("  ✓ icon.ico");

    console.log("\n✅ 所有图标生成完成！");
    console.log(`\n图标位置：${ICONS_DIR}`);
    console.log("\n运行 npm run tauri:build 来使用新图标构建应用");
  } catch (error) {
    console.error("\n❌ 生成图标时出错：", error.message);
    process.exit(1);
  }
}

// 生成 ICNS 文件
async function generateICNS() {
  // 读取不同尺寸的 PNG
  const pngBuffers = await Promise.all(
    [16, 32, 64, 128, 256, 512, 1024].map(async (size) => {
      return await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .ensureAlpha() // 确保有 alpha 通道
        .png()
        .toBuffer();
    }),
  );

  return createICNS(
    pngBuffers[6], // 1024
    0, // 不需要 RGBA 数据
    {
      sizes: [16, 32, 64, 128, 256, 512, 1024],
    },
  );
}

// 生成 ICO 文件
async function generateICO() {
  // Windows ICO 通常包含 16, 32, 48, 256 尺寸
  const pngBuffers = await Promise.all(
    [16, 32, 48, 256].map(async (size) => {
      return await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .ensureAlpha() // 确保有 alpha 通道
        .png()
        .toBuffer();
    }),
  );

  return await toIco(pngBuffers);
}

generateIcons();
