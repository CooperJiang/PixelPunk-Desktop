/**
 * 快捷键管理模块
 *
 * 功能：
 * - 全局快捷键支持（应用最小化也能响应）
 * - 应用内快捷键
 * - 动态添加/移除快捷键
 * - 配置驱动
 *
 * 使用示例：
 * ```typescript
 * import { shortcutManager } from '@/utils/shortcuts';
 * import { invoke } from '@tauri-apps/api/core';
 *
 * // 注册处理函数
 * shortcutManager.registerHandler('toggleFloatBall', async () => {
 *   await invoke('toggle_flat_ball', { show: true });
 * });
 *
 * shortcutManager.registerHandler('openSettings', () => {
 *   router.push('/settings');
 * });
 *
 * // 初始化所有快捷键
 * await shortcutManager.registerAll();
 *
 * // 动态添加快捷键
 * await shortcutManager.addShortcut({
 *   key: 'F5',
 *   description: '刷新',
 *   handler: 'refresh'
 * });
 * ```
 */

import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { logger } from "@/utils/logger";
import {
  shortcutsConfig,
  type ShortcutConfig,
} from "@/config/shortcuts.config";

export class ShortcutManager {
  private handlers = new Map<string, () => void | Promise<void>>();
  private registered = new Set<string>();
  private localShortcuts = new Map<string, (e: KeyboardEvent) => void>();

  /**
   * 注册快捷键处理函数
   * @param name 处理函数名（对应配置中的 handler）
   * @param handler 处理函数
   */
  registerHandler(name: string, handler: () => void | Promise<void>): void {
    this.handlers.set(name, handler);
  }

  /**
   * 注册所有配置的快捷键
   */
  async registerAll(): Promise<void> {
    for (const shortcut of shortcutsConfig) {
      await this.registerShortcut(shortcut);
    }
    logger.info(`Registered ${shortcutsConfig.length} shortcuts`);
  }

  /**
   * 注册单个快捷键
   */
  async registerShortcut(shortcut: ShortcutConfig): Promise<void> {
    try {
      if (shortcut.global) {
        // 全局快捷键（应用最小化也能响应）
        await register(shortcut.key, () => {
          this.executeHandler(shortcut);
        });
        this.registered.add(shortcut.key);
        logger.debug(`Registered global shortcut: ${shortcut.key}`);
      } else {
        // 应用内快捷键
        const listener = (e: KeyboardEvent) => {
          if (this.matchesShortcut(e, shortcut.key)) {
            e.preventDefault();
            this.executeHandler(shortcut);
          }
        };
        window.addEventListener("keydown", listener);
        this.localShortcuts.set(shortcut.key, listener);
        logger.debug(`Registered local shortcut: ${shortcut.key}`);
      }
    } catch (error) {
      logger.error(`Failed to register shortcut ${shortcut.key}`, {
        error: String(error),
      });
    }
  }

  /**
   * 动态添加快捷键
   */
  async addShortcut(shortcut: ShortcutConfig): Promise<void> {
    await this.registerShortcut(shortcut);
  }

  /**
   * 注销单个快捷键
   */
  async unregisterShortcut(key: string): Promise<void> {
    // 注销全局快捷键
    if (this.registered.has(key)) {
      try {
        await unregister(key);
        this.registered.delete(key);
        logger.debug(`Unregistered global shortcut: ${key}`);
      } catch (error) {
        logger.error(`Failed to unregister ${key}`, { error: String(error) });
      }
    }

    // 注销本地快捷键
    if (this.localShortcuts.has(key)) {
      const listener = this.localShortcuts.get(key)!;
      window.removeEventListener("keydown", listener);
      this.localShortcuts.delete(key);
      logger.debug(`Unregistered local shortcut: ${key}`);
    }
  }

  /**
   * 注销所有快捷键
   */
  async unregisterAll(): Promise<void> {
    // 注销全局快捷键
    for (const key of this.registered) {
      try {
        await unregister(key);
      } catch (error) {
        logger.error(`Failed to unregister ${key}`, { error: String(error) });
      }
    }
    this.registered.clear();

    // 注销本地快捷键
    for (const [, listener] of this.localShortcuts.entries()) {
      window.removeEventListener("keydown", listener);
    }
    this.localShortcuts.clear();

    logger.info("All shortcuts unregistered");
  }

  /**
   * 执行处理函数
   */
  private executeHandler(shortcut: ShortcutConfig): void {
    const handler = this.handlers.get(shortcut.handler);
    if (handler) {
      handler();
    } else {
      logger.warn(
        `Handler "${shortcut.handler}" not found for shortcut ${shortcut.key}`,
      );
    }
  }

  /**
   * 匹配快捷键
   */
  private matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    const parts = shortcut.split("+");
    const targetKey = parts.pop()!.toLowerCase();

    const hasCtrl =
      parts.includes("CommandOrControl") || parts.includes("Control");
    const hasCmd =
      parts.includes("CommandOrControl") || parts.includes("Command");
    const hasShift = parts.includes("Shift");
    const hasAlt = parts.includes("Alt") || parts.includes("Option");

    // 处理特殊键
    let eventKey = event.key.toLowerCase();
    if (targetKey === "comma") {
      // 匹配逗号键
      const keyMatches = eventKey === ",";
      return (
        keyMatches &&
        (hasCtrl ? event.ctrlKey : !event.ctrlKey || hasCmd) &&
        (hasCmd ? event.metaKey : !event.metaKey || hasCtrl) &&
        (hasShift ? event.shiftKey : !event.shiftKey) &&
        (hasAlt ? event.altKey : !event.altKey)
      );
    }

    const keyMatches =
      eventKey === targetKey ||
      event.code.toLowerCase() === targetKey.toLowerCase();

    return (
      keyMatches &&
      (hasCtrl ? event.ctrlKey : !event.ctrlKey || hasCmd) &&
      (hasCmd ? event.metaKey : !event.metaKey || hasCtrl) &&
      (hasShift ? event.shiftKey : !event.shiftKey) &&
      (hasAlt ? event.altKey : !event.altKey)
    );
  }

  /**
   * 获取所有已注册的快捷键
   */
  getRegistered(): string[] {
    return [
      ...Array.from(this.registered),
      ...Array.from(this.localShortcuts.keys()),
    ];
  }
}

// 导出单例
export const shortcutManager = new ShortcutManager();
