/**
 * 自动更新器模块
 *
 * 功能：
 * - 检查更新
 * - 下载并安装更新
 * - 定时自动检查
 * - 进度回调
 *
 * 使用示例：
 * ```typescript
 * import { updater } from '@/utils/updater';
 *
 * // 手动检查更新
 * const result = await updater.checkForUpdates();
 * if (result.available) {
 *   // logger.info('新版本', { version: result.version });
 *   await updater.downloadAndInstall();
 * }
 *
 * // 启动时自动检查
 * onMounted(() => {
 *   updater.startAutoCheck();
 * });
 * ```
 */

/* eslint-disable no-undef */
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { updaterConfig } from "@/config/updater.config";
import { logger } from "@/utils/logger";

export interface UpdateInfo {
  available: boolean;
  version?: string;
  date?: string;
  body?: string;
}

export interface UpdateProgress {
  downloaded: number;
  total: number;
  percentage: number;
}

export class Updater {
  private checkInterval: number | null = null;
  private progressCallbacks: ((progress: UpdateProgress) => void)[] = [];

  /**
   * 检查是否有可用更新
   */
  async checkForUpdates(): Promise<UpdateInfo> {
    if (!updaterConfig.enabled) {
      logger.warn("Updater is disabled in config");
      return { available: false };
    }

    try {
      const update = await check();

      if (update?.available) {
        return {
          available: true,
          version: update.version,
          date: update.date,
          body: update.body,
        };
      }
    } catch (error) {
      logger.error("Check update failed", { error: String(error) });
    }

    return { available: false };
  }

  /**
   * 下载并安装更新
   */
  async downloadAndInstall(): Promise<void> {
    const update = await check();
    if (!update?.available) {
      throw new Error("No update available");
    }

    // 下载更新（带进度回调）
    await update.downloadAndInstall((event) => {
      if (event.event === "Started") {
        logger.info("Update download started");
      } else if (event.event === "Progress") {
        const progress: UpdateProgress = {
          downloaded: event.data.downloaded,
          total: event.data.contentLength || 0,
          percentage:
            event.data.contentLength > 0
              ? Math.round(
                  (event.data.downloaded / event.data.contentLength) * 100,
                )
              : 0,
        };

        // 触发进度回调
        this.progressCallbacks.forEach((callback) => callback(progress));

        // 发送自定义事件
        window.dispatchEvent(
          new CustomEvent("update-progress", { detail: progress }),
        );
      } else if (event.event === "Finished") {
        logger.info("Update download finished");
      }
    });

    // 安装完成，重启应用
    await relaunch();
  }

  /**
   * 监听下载进度
   */
  onProgress(callback: (progress: UpdateProgress) => void) {
    this.progressCallbacks.push(callback);
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 启动定时自动检查
   */
  startAutoCheck(): void {
    if (!updaterConfig.enabled) return;

    // 启动时检查
    if (updaterConfig.checkOnStartup) {
      this.checkForUpdates();
    }

    // 定时检查
    if (updaterConfig.checkInterval > 0) {
      this.checkInterval = window.setInterval(() => {
        this.checkForUpdates();
      }, updaterConfig.checkInterval);
    }
  }

  /**
   * 停止自动检查
   */
  stopAutoCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// 导出单例
export const updater = new Updater();
