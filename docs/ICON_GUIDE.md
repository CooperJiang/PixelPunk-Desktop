# 图标生成指南

本项目提供了自动图标生成脚本，只需提供一个高分辨率的 PNG logo，即可自动生成所有平台所需的图标。

## 使用步骤

### 1. 准备源图片

将你的 logo 图片命名为 `logo.png`，放在项目根目录。

**图片要求**：

- 格式：PNG（支持透明背景）
- 建议尺寸：**1024x1024** 或更大
- 图片应该是正方形
- 建议使用透明背景

**正确的文件位置**：

```
pixelpunk/
├── logo.png          ← 你的 logo 放这里
├── package.json
├── src/
└── src-tauri/
```

### 2. 运行生成脚本

```bash
npm run generate-icons
```

### 3. 完成！

脚本会自动生成所有需要的图标文件：

**生成的文件**：

- ✅ 托盘图标：`src-tauri/icons/32x32.png`
- ✅ macOS 图标：`src-tauri/icons/icon.icns` + `App.iconset/`
- ✅ Windows 图标：`src-tauri/icons/icon.ico`
- ✅ Linux 图标：`src-tauri/icons/icon.png`
- ✅ 各种尺寸的 PNG 图标

### 4. 重新构建应用

```bash
npm run tauri:build
```

## 生成的图标详情

| 文件                  | 用途               | 尺寸      |
| --------------------- | ------------------ | --------- |
| `32x32.png`           | 系统托盘图标       | 32×32     |
| `128x128.png`         | 应用图标           | 128×128   |
| `128x128@2x.png`      | 高清应用图标       | 256×256   |
| `icon.png`            | Linux 应用图标     | 512×512   |
| `icon.icns`           | macOS 应用图标包   | 多尺寸    |
| `icon.ico`            | Windows 应用图标   | 多尺寸    |
| `app-icon-square.png` | 方形应用图标       | 1024×1024 |
| `Square*.png`         | Windows Store 图标 | 多尺寸    |

## 示例输出

运行 `npm run generate-icons` 后，你会看到：

```
🎨 开始生成图标...

📐 源图片尺寸：1024x1024

📦 生成 PNG 图标...
  ✓ 32x32.png (32x32)
  ✓ 128x128.png (128x128)
  ✓ icon.png (512x512)
  ...

🍎 生成 macOS iconset...
  ✓ icon_16x16.png (16x16)
  ✓ icon_32x32.png (32x32)
  ...

🍎 生成 icon.icns...
  ✓ icon.icns

🪟 生成 icon.ico...
  ✓ icon.ico

✅ 所有图标生成完成！

图标位置：/path/to/src-tauri/icons

运行 npm run tauri:build 来使用新图标构建应用
```

## 托盘图标设计建议

### macOS

- 使用**黑白透明图标**（模板图标）
- 简洁的线条设计
- 图标会自动适应系统主题（浅色/深色）

### Windows

- 可以使用彩色图标
- 建议包含透明背景
- 提供多个尺寸以适应不同 DPI

### Linux

- 使用 SVG 或高分辨率 PNG
- 支持透明背景
- 遵循 freedesktop.org 图标规范

## 常见问题

### Q: 源图片分辨率太低怎么办？

A: 如果源图片小于 512×512，脚本会发出警告。建议使用至少 1024×1024 的高分辨率图片，以确保所有尺寸的图标都清晰。

### Q: 可以使用 JPG 格式吗？

A: 不建议。JPG 不支持透明背景。请使用 PNG 格式。

### Q: 生成的图标在哪里？

A: 所有图标都在 `src-tauri/icons/` 目录中。

### Q: 如何只更新托盘图标？

A: 可以直接替换 `src-tauri/icons/32x32.png`，然后重新运行应用。但建议使用脚本统一生成。

### Q: 生成错误怎么办？

A: 常见错误：

1. **找不到 logo.png**：确保文件在项目根目录
2. **依赖缺失**：运行 `npm install` 安装依赖
3. **图片格式错误**：确保是有效的 PNG 文件

## 高级用法

### 自定义源图片路径

如果你的源图片不叫 `logo.png`，可以修改 `scripts/generate-icons.js` 的第 9 行：

```javascript
const SOURCE_LOGO = resolve(__dirname, "../your-logo-name.png");
```

### 自定义生成尺寸

在 `scripts/generate-icons.js` 中修改 `PNG_SIZES` 数组，添加或删除需要的尺寸。

## 相关资源

- [Tauri 图标指南](https://tauri.app/v2/guides/features/icons/)
- [macOS 人机界面指南 - 图标](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows 应用图标](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-construction)

---

如有问题，请查看 [README.md](./README.md) 或提交 Issue。
