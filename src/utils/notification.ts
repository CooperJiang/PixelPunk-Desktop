/**
 * 系统通知模块
 *
 * 功能：
 * - 发送系统通知
 * - 自动请求权限
 * - 预设通知类型（成功、错误、信息）
 *
 * 使用示例：
 * ```typescript
 * import { notification } from '@/utils/notification';
 *
 * // 初始化（通常在 main.ts）
 * await notification.init();
 *
 * // 发送通知
 * await notification.send({
 *   title: '操作成功',
 *   body: '文件已上传',
 * });
 *
 * // 使用快捷方法
 * await notification.success('保存成功', '数据已保存');
 * await notification.error('保存失败', '网络错误');
 * await notification.info('提示', '有新消息');
 * ```
 */

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export interface NotificationOptions {
  title: string; // 通知标题
  body: string; // 通知内容
  icon?: string; // 图标路径（可选）
  sound?: string; // 声音（可选）
}

export class NotificationManager {
  private permissionGranted = false;

  /**
   * 初始化通知管理器（请求权限）
   */
  async init(): Promise<void> {
    this.permissionGranted = await isPermissionGranted();

    if (!this.permissionGranted) {
      const permission = await requestPermission();
      this.permissionGranted = permission === "granted";

      if (!this.permissionGranted) {
        console.warn("Notification permission denied");
      } else {
        console.log("Notification permission granted");
      }
    }
  }

  /**
   * 发送通知
   */
  async send(options: NotificationOptions): Promise<void> {
    if (!this.permissionGranted) {
      await this.init();
    }

    if (!this.permissionGranted) {
      console.warn("Notification permission not granted");
      return;
    }

    try {
      await sendNotification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        sound: options.sound,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  /**
   * 发送成功通知
   */
  async success(title: string, body: string): Promise<void> {
    await this.send({ title: `✓ ${title}`, body });
  }

  /**
   * 发送错误通知
   */
  async error(title: string, body: string): Promise<void> {
    await this.send({ title: `✗ ${title}`, body });
  }

  /**
   * 发送信息通知
   */
  async info(title: string, body: string): Promise<void> {
    await this.send({ title: `ℹ ${title}`, body });
  }

  /**
   * 发送警告通知
   */
  async warning(title: string, body: string): Promise<void> {
    await this.send({ title: `⚠ ${title}`, body });
  }

  /**
   * 检查权限状态
   */
  isGranted(): boolean {
    return this.permissionGranted;
  }
}

// 导出单例
export const notification = new NotificationManager();
