/**
 * 快捷键配置
 *
 * 使用说明：
 * 1. 在此配置文件中定义快捷键
 * 2. 使用 shortcutManager.registerHandler() 注册处理函数
 * 3. 调用 shortcutManager.registerAll() 启用所有快捷键
 *
 * 快捷键格式：
 * - 修饰键: CommandOrControl, Command, Control, Alt, Shift, Option
 * - 普通键: A-Z, 0-9, F1-F12, Enter, Space, ArrowUp, ArrowDown 等
 * - 组合示例: 'CommandOrControl+Shift+F', 'Alt+Enter', 'F11'
 *
 * 平台说明：
 * - CommandOrControl: macOS 上是 Command，Windows/Linux 上是 Control
 * - global: true 表示全局快捷键（应用最小化也能响应）
 */

export interface ShortcutConfig {
  key: string; // 快捷键组合
  description: string; // 描述
  global?: boolean; // 是否全局快捷键
  handler: string; // 处理函数名（需要通过 registerHandler 注册）
}

export const shortcutsConfig: ShortcutConfig[] = [
  {
    key: "CommandOrControl+Shift+F",
    description: "显示/隐藏悬浮球",
    global: true,
    handler: "toggleFloatBall",
  },
  {
    key: "CommandOrControl+,",
    description: "打开设置",
    global: false,
    handler: "openSettings",
  },
  {
    key: "F11",
    description: "全屏切换",
    global: false,
    handler: "toggleFullscreen",
  },

  // 开发者可以在此添加更多快捷键
  // {
  //   key: 'CommandOrControl+N',
  //   description: '新建',
  //   global: false,
  //   handler: 'createNew',
  // },
];
