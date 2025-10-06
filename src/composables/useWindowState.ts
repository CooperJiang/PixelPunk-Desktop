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

import { getCurrentWindow } from "@tauri-apps/api/window";
import { logger } from "@/utils/logger";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { storage } from "@/utils/storage";

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

        // 验证数据有效性
        if (
          typeof position?.x !== "number" ||
          typeof position?.y !== "number" ||
          typeof size?.width !== "number" ||
          typeof size?.height !== "number" ||
          isNaN(position.x) ||
          isNaN(position.y) ||
          isNaN(size.width) ||
          isNaN(size.height) ||
          !isFinite(position.x) ||
          !isFinite(position.y) ||
          !isFinite(size.width) ||
          !isFinite(size.height) ||
          size.width <= 0 ||
          size.height <= 0
        ) {
          await logger.warn(
            `[WindowState] Invalid data for ${windowLabel}, skipping save`,
            { position, size },
          );
          return;
        }

        const state: WindowState = {
          x: position.x,
          y: position.y,
          width: size.width,
          height: size.height,
          maximized,
        };

        storage.set(`${STORAGE_KEY}.${windowLabel}`, state);
        // 移除频繁日志，仅在需要调试时打开
        // await logger.debug(`[WindowState] Saved state for ${windowLabel}`, state);
      } catch (error) {
        await logger.error(
          `[WindowState] Failed to save state for ${windowLabel}`,
          { error: String(error) },
        );
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
        await logger.debug(
          `[WindowState] No saved state found for window: ${windowLabel}`,
        );
        return;
      }

      await logger.debug(
        `[WindowState] Loaded state for ${windowLabel}`,
        state as any,
      );

      // 严格验证数据有效性
      const isValid =
        state &&
        typeof state === "object" &&
        typeof state.x === "number" &&
        typeof state.y === "number" &&
        typeof state.width === "number" &&
        typeof state.height === "number" &&
        !isNaN(state.x) &&
        !isNaN(state.y) &&
        !isNaN(state.width) &&
        !isNaN(state.height) &&
        isFinite(state.x) &&
        isFinite(state.y) &&
        isFinite(state.width) &&
        isFinite(state.height) &&
        state.width > 0 &&
        state.height > 0;

      if (!isValid) {
        await logger.warn(
          `[WindowState] Invalid state data for ${windowLabel}, clearing`,
          state as any,
        );
        storage.remove(`${STORAGE_KEY}.${windowLabel}`);
        await storage.save();
        return;
      }

      const window = getCurrentWindow();

      // 计算并验证最终值
      const x = Math.round(state.x);
      const y = Math.round(state.y);
      const width = Math.round(state.width);
      const height = Math.round(state.height);

      await logger.debug(`[WindowState] Restoring ${windowLabel}`, {
        x,
        y,
        width,
        height,
      });

      // 再次验证计算后的值
      if (
        isNaN(x) ||
        isNaN(y) ||
        isNaN(width) ||
        isNaN(height) ||
        !isFinite(x) ||
        !isFinite(y) ||
        !isFinite(width) ||
        !isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {
        await logger.warn(
          `[WindowState] Invalid calculated values for ${windowLabel}, clearing`,
        );
        storage.remove(`${STORAGE_KEY}.${windowLabel}`);
        await storage.save();
        return;
      }

      // 恢复位置和大小（使用 Physical 类型，避免类型不匹配）
      await window.setPosition(new PhysicalPosition(x, y));
      await window.setSize(new PhysicalSize(width, height));

      // 恢复最大化状态
      if (state.maximized) {
        await window.maximize();
      }

      await logger.info(
        `[WindowState] Successfully restored state for ${windowLabel}`,
      );
    } catch (error) {
      await logger.error(
        `[WindowState] Failed to restore state for ${windowLabel}`,
        { error: String(error) },
      );
      // 发生错误时清除可能损坏的数据
      try {
        storage.remove(`${STORAGE_KEY}.${windowLabel}`);
        await storage.save();
      } catch (e) {
        await logger.error("[WindowState] Failed to clear corrupted data", {
          error: String(e),
        });
      }
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

      // logger.debug("Window state listener started");
    } catch (error) {
      await logger.error("Failed to start window state listener", {
        error: String(error),
      });
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
    // logger.debug("Window state listener stopped");
  };

  // 启动时清除可能损坏的窗口状态数据
  const clearCorruptedData = async () => {
    try {
      const state = storage.get<WindowState>(`${STORAGE_KEY}.${windowLabel}`);
      if (state) {
        // 检查数据是否有效
        const hasInvalidData =
          state.x === undefined ||
          state.y === undefined ||
          state.width === undefined ||
          state.height === undefined ||
          typeof state.x !== "number" ||
          typeof state.y !== "number" ||
          typeof state.width !== "number" ||
          typeof state.height !== "number" ||
          isNaN(state.x) ||
          isNaN(state.y) ||
          isNaN(state.width) ||
          isNaN(state.height);

        if (hasInvalidData) {
          await logger.warn(
            `[WindowState] Clearing corrupted data for ${windowLabel}`,
          );
          storage.remove(`${STORAGE_KEY}.${windowLabel}`);
          storage.save();
        }
      }
    } catch (error) {
      await logger.error("[WindowState] Error checking corrupted data", {
        error: String(error),
      });
      // 出错时清除数据
      storage.remove(`${STORAGE_KEY}.${windowLabel}`);
      storage.save();
    }
  };

  // 先清除损坏数据，再恢复窗口状态
  clearCorruptedData().then(() => {
    // 立即初始化（不使用 onMounted 避免在 async setup 中的警告）
    restoreWindowState().then(() => {
      startListening();
    });
  });

  return {
    saveWindowState,
    restoreWindowState,
    cleanup: stopListening,
  };
}
