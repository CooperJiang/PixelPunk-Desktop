/**
 * 日志系统
 *
 * 功能：
 * - 结构化日志记录
 * - 支持多种日志级别
 * - 自动添加时间戳和上下文
 * - 生产环境日志持久化（通过 Rust tauri-plugin-log）
 *
 * 使用示例：
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * logger.info('User logged in', { userId: 123 });
 * logger.error('Failed to save', { error: err });
 * logger.debug('Debug info', { data });
 * ```
 */

import { trace, debug, info, warn, error } from "@tauri-apps/plugin-log";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { loggerConfig } from "@/config/logging.config";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private canUsePlugin: boolean;
  private levelOrder = {
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  } as const;
  private minLevel: number;
  private mirrorConsole: boolean;

  constructor() {
    // 仅在主窗口允许调度插件日志（根据 tauri.conf 的 capability 配置）
    try {
      const label = getCurrentWindow().label;
      this.canUsePlugin = label === "main";
    } catch {
      this.canUsePlugin = false;
    }
    // 解析配置
    const lvl = loggerConfig.level;
    this.minLevel =
      lvl === "off" ? 0 : this.levelOrder[lvl as keyof typeof this.levelOrder];
    this.mirrorConsole = import.meta.env.DEV && loggerConfig.consoleInDev;
  }

  private shouldLog(level: LogLevel): boolean {
    const weight = this.levelOrder[level];
    return this.minLevel > 0 && weight >= this.minLevel;
  }

  private async safePluginCall(level: LogLevel, message: string) {
    if (!this.canUsePlugin) return;
    try {
      switch (level) {
        case "trace":
          await trace(message);
          break;
        case "debug":
          await debug(message);
          break;
        case "info":
          await info(message);
          break;
        case "warn":
          await warn(message);
          break;
        case "error":
          await error(message);
          break;
      }
    } catch {
      // 忽略插件权限或运行异常，避免影响页面渲染
    }
  }
  /**
   * 格式化日志消息
   */
  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }

    const contextStr = Object.entries(context)
      .map(([key, value]) => {
        if (value instanceof Error) {
          return `${key}=${value.message}`;
        }
        return `${key}=${JSON.stringify(value)}`;
      })
      .join(", ");

    return `${message} | ${contextStr}`;
  }

  /**
   * Trace 级别日志（最详细）
   */
  async trace(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    if (!this.shouldLog("trace")) return;
    if (this.mirrorConsole) console.log(`[TRACE] ${formattedMessage}`);
    await this.safePluginCall("trace", formattedMessage);
  }

  /**
   * Debug 级别日志
   */
  async debug(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    if (!this.shouldLog("debug")) return;
    if (this.mirrorConsole) console.log(`[DEBUG] ${formattedMessage}`);
    await this.safePluginCall("debug", formattedMessage);
  }

  /**
   * Info 级别日志
   */
  async info(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    if (!this.shouldLog("info")) return;
    if (this.mirrorConsole) console.info(`[INFO] ${formattedMessage}`);
    await this.safePluginCall("info", formattedMessage);
  }

  /**
   * Warn 级别日志
   */
  async warn(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    if (!this.shouldLog("warn")) return;
    if (this.mirrorConsole) console.warn(`[WARN] ${formattedMessage}`);
    await this.safePluginCall("warn", formattedMessage);
  }

  /**
   * Error 级别日志
   */
  async error(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    if (!this.shouldLog("error")) return;
    if (this.mirrorConsole) console.error(`[ERROR] ${formattedMessage}`);
    await this.safePluginCall("error", formattedMessage);
  }

  /**
   * 记录异常
   */
  async exception(err: Error, additionalContext?: LogContext): Promise<void> {
    const context: LogContext = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...additionalContext,
    };

    await this.error("Exception occurred", context);
  }

  /**
   * 记录性能指标
   */
  async performance(
    label: string,
    duration: number,
    context?: LogContext,
  ): Promise<void> {
    await this.info(`Performance: ${label}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });
  }
}

// 导出单例
export const logger = new Logger();

/**
 * 性能计时器辅助函数
 */
export function createTimer(label: string) {
  const start = performance.now();

  return {
    end: async (context?: LogContext) => {
      const duration = performance.now() - start;
      await logger.performance(label, duration, context);
    },
  };
}
