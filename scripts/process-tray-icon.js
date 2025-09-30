import sharp from "sharp";
import { resolve } from "path";

const SOURCE = "/Users/lilithgames/Desktop/image-removebg-preview.png";
const OUTPUT = resolve(process.cwd(), "src-tauri/icons/32x32.png");

async function processTrayIcon() {
  try {
    console.log("📝 Processing tray icon...");
    console.log(`   Source: ${SOURCE}`);
    console.log(`   Output: ${OUTPUT}`);

    // Process icon: resize, convert to grayscale, threshold to black/white
    await sharp(SOURCE)
      .resize(32, 32, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .grayscale() // Convert to grayscale
      .normalise() // Normalize contrast
      .threshold(128) // Convert to pure black/white
      .negate({ alpha: false }) // Invert (so dark parts become black)
      .toColorspace("srgb")
      .ensureAlpha()
      .png({ compressionLevel: 9 })
      .toFile(OUTPUT);

    console.log("✅ Tray icon processed successfully!");
    console.log(`   Saved to: ${OUTPUT}`);
  } catch (error) {
    console.error("❌ Failed to process tray icon:", error);
    process.exit(1);
  }
}

processTrayIcon();
