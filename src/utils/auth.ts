/**
 * 认证初始化工具
 * 在应用启动时检查登录状态，决定显示哪个窗口
 */
import { getCurrentWindow } from '@tauri-apps/api/window';
import { storage } from './storage';
import { TOKEN_KEY } from '@/constants/api';
import { invoke } from '@tauri-apps/api/core';

/**
 * 初始化认证状态和窗口显示
 */
export async function initializeAuth(): Promise<void> {
  try {
    const currentWindow = getCurrentWindow();
    const currentLabel = currentWindow.label;

    // 检查是否有token
    const token = storage.get<string>(TOKEN_KEY);
    const isLoggedIn = Boolean(token);

    console.log('[Auth] 当前窗口:', currentLabel);
    console.log('[Auth] 登录状态:', isLoggedIn ? '已登录' : '未登录');

    if (currentLabel === 'login') {
      // 当前是登录窗口
      if (isLoggedIn) {
        // 已登录，应该显示主窗口
        console.log('[Auth] 已登录，切换到主窗口 via backend');
        await currentWindow.hide();
        try {
          await invoke('show_main_window');
        } catch (error) {
          console.error('[Auth] Failed to show main window via backend:', error);
        }
      } else {
        // 未登录，保持登录窗口显示
        console.log('[Auth] 未登录，显示登录窗口');
        await currentWindow.show();
        await currentWindow.setFocus();
      }
    } else if (currentLabel === 'main') {
      // 当前是主窗口
      if (isLoggedIn) {
        // 已登录，显示主窗口
        console.log('[Auth] 已登录，显示主窗口');
        await currentWindow.show();
        await currentWindow.setFocus();
      } else {
        // 未登录，切换到登录窗口（后端处理）
        console.log('[Auth] 未登录，切换到登录窗口 via backend');
        try {
          await invoke('show_login_window');
        } catch (error) {
          console.error('[Auth] Failed to show login window via backend:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Auth] 初始化失败:', error);
  }
}
