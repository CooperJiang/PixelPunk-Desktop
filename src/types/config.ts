import type { TrayConfig } from "./tray";

export interface AppConfig {
  name: string; // 项目名称
  version: string; // 项目版本
  author: string; // 作者/组织名称
  description: string; // 应用描述
  homepage?: string; // 主页地址
  repository?: string; // 仓库地址
  copyright?: string; // 版权信息

  window: {
    width: number; // 默认宽度
    height: number; // 默认高度
    minWidth: number; // 最小宽度
    minHeight: number; // 最小高度
    maxWidth?: number; // 最大宽度（可选）
    maxHeight?: number; // 最大高度（可选）
    resizable: boolean; // 是否可调整大小
    maximizable: boolean; // 是否可最大化
    minimizable: boolean; // 是否可最小化
    closable: boolean; // 是否可关闭
    alwaysOnTop: boolean; // 是否置顶
    center: boolean; // 启动时是否居中
    skipTaskbar: boolean; // 是否在任务栏显示
  };

  tray: TrayConfig; // 托盘配置

  floatBall: {
    enabled: boolean; // 是否启用悬浮球
    width: number; // 悬浮球宽度
    height: number; // 悬浮球高度
    defaultX: number; // 默认 X 位置
    defaultY: number; // 默认 Y 位置
    alwaysOnTop: boolean; // 是否始终置顶
    margin: number; // 距离屏幕边缘的边距
    panel: {
      width: number; // 展开面板宽度
      height: number; // 展开面板高度
      expandOnHover: boolean; // 鼠标悬停时展开
      hoverDelay: number; // 悬停延迟（毫秒）
    };
    upload: {
      apiUrl: string; // 上传接口地址
      maxFileSize: number; // 最大文件大小（字节）
      allowedTypes: string[]; // 允许的文件类型
      concurrent: number; // 并发上传数量
    };
  };

  dev: {
    openDevTools: boolean; // 是否默认打开调试控制台
  };
}
