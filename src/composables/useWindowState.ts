/**
 * 窗口状态持久化
 *
 * 功能：
 * - 自动保存窗口位置、大小、最大化状态
 * - 应用启动时恢复窗口状态
 * - 防抖保存，避免频繁写入
 *
 * 使用示例：
 * ```typescript
 * import { useWindowState } from '@/composables/useWindowState';
 *
 * // 在 App.vue 中初始化
 * onMounted(() => {
 *   useWindowState();
 * });
 * ```
 */

/* eslint-disable no-undef */
import { getCurrentWindow } from "@tauri-apps/api/window";
import { storage } from "@/utils/storage";
import { onMounted, onUnmounted } from "vue";

interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

const STORAGE_KEY = "window.state";
const SAVE_DELAY = 500; // 500ms 防抖

export function useWindowState(windowLabel = "main") {
  let saveTimer: number | null = null;
  let unlistenResize: (() => void) | null = null;
  let unlistenMove: (() => void) | null = null;

  /**
   * 保存窗口状态（防抖）
   */
  const saveWindowState = async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(async () => {
      try {
        const window = getCurrentWindow();
        const position = await window.outerPosition();
        const size = await window.outerSize();
        const maximized = await window.isMaximized();

        const state: WindowState = {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          maximized,
        };

        storage.set(`${STORAGE_KEY}.${windowLabel}`, state);
        console.log("Window state saved:", state);
      } catch (error) {
        console.error("Failed to save window state:", error);
      }
    }, SAVE_DELAY);
  };

  /**
   * 恢复窗口状态
   */
  const restoreWindowState = async () => {
    try {
      const state = storage.get<WindowState>(`${STORAGE_KEY}.${windowLabel}`);

      if (!state) {
        console.log("No saved window state found");
        return;
      }

      const window = getCurrentWindow();

      // 恢复位置和大小
      await window.setPosition({ x: state.x, y: state.y });
      await window.setSize({ width: state.width, height: state.height });

      // 恢复最大化状态
      if (state.maximized) {
        await window.maximize();
      }

      console.log("Window state restored:", state);
    } catch (error) {
      console.error("Failed to restore window state:", error);
    }
  };

  /**
   * 开始监听窗口变化
   */
  const startListening = async () => {
    try {
      const window = getCurrentWindow();

      // 监听窗口移动
      unlistenMove = await window.onMoved(() => {
        saveWindowState();
      });

      // 监听窗口大小变化
      unlistenResize = await window.onResized(() => {
        saveWindowState();
      });

      console.log("Window state listener started");
    } catch (error) {
      console.error("Failed to start window state listener:", error);
    }
  };

  /**
   * 停止监听
   */
  const stopListening = () => {
    if (unlistenResize) {
      unlistenResize();
      unlistenResize = null;
    }
    if (unlistenMove) {
      unlistenMove();
      unlistenMove = null;
    }
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    console.log("Window state listener stopped");
  };

  // Vue 生命周期集成
  onMounted(async () => {
    await restoreWindowState();
    await startListening();
  });

  onUnmounted(() => {
    stopListening();
    // 组件卸载时立即保存
    saveWindowState();
  });

  return {
    saveWindowState,
    restoreWindowState,
  };
}
