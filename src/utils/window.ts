/**
 * 窗口管理工具
 */
import { getCurrentWindow, Window } from "@tauri-apps/api/window";
import { logger } from "@/utils/logger";
import { invoke } from "@tauri-apps/api/core";

/**
 * 获取指定标签的窗口
 */
export function getWindowByLabel(label: string): Window {
  // 直接创建 Window 实例，Tauri 会自动查找对应 label 的窗口
  return new Window(label);
}

/**
 * 关闭当前窗口并显示主窗口
 */
export async function closeAndShowMain(): Promise<void> {
  try {
    await invoke("show_main_window");

    const currentWindow = getCurrentWindow();
    await currentWindow.close();
  } catch (error) {
    await logger.error("[Window] Failed to switch to main window", {
      error: String(error),
    });
    throw error;
  }
}

/**
 * 关闭当前窗口并显示登录窗口
 */
export async function closeAndShowLogin(): Promise<void> {
  try {
    await invoke("show_login_window");

    const currentWindow = getCurrentWindow();
    await currentWindow.close();
  } catch (error) {
    await logger.error("[Window] Failed to switch to login window", {
      error: String(error),
    });
    throw error;
  }
}

/**
 * 隐藏当前窗口并显示主窗口
 */
export async function hideAndShowMain(): Promise<void> {
  try {
    await invoke("show_main_window");

    const currentWindow = getCurrentWindow();
    await currentWindow.hide();
  } catch (error) {
    await logger.error("[Window] Failed to hide and show main window", {
      error: String(error),
    });
    throw error;
  }
}
