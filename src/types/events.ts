/**
 * Tauri 事件类型定义
 *
 * 用于跨窗口通信和文件拖放功能的类型安全
 *
 * 事件流程：
 * 1. 用户拖动文件到悬浮球
 * 2. Tauri 触发 tauri://drag-drop 事件（DragDropPayload）
 * 3. 悬浮球发送自定义 files-dropped 事件（FilesDroppedPayload）
 * 4. 主窗口监听并处理文件
 */

/**
 * Tauri 2.0 原生拖放事件 payload
 *
 * 事件名：tauri://drag-drop
 * 注意：Tauri 1.x 使用 tauri://file-drop（已弃用）
 */
export interface DragDropPayload {
  /** 文件路径数组 */
  paths: string[];
  /** 拖放位置 */
  position: {
    x: number;
    y: number;
  };
}

/**
 * 文件掉落自定义事件 payload
 */
export interface FilesDroppedPayload {
  /** 文件路径数组 */
  files: string[];
}
