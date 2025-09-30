export interface TrayMenuItem {
  id: string; // 菜单项 ID
  label: string; // 菜单项文本
  action?: "about" | "show" | "quit" | "custom"; // 预定义动作
  customAction?: () => void; // 自定义动作（仅用于前端参考）
}

export interface TrayMenuGroup {
  label: string; // 菜单分组标题
  items: TrayMenuItem[]; // 该分组下的菜单项
}

export interface TrayConfig {
  enabled: boolean; // 是否启用托盘
  tooltip?: string; // 托盘悬停提示
  title?: string; // 托盘标题（macOS 会显示在图标旁）
  menus: TrayMenuGroup[]; // 菜单分组列表
}
