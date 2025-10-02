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

/* eslint-disable no-undef */
import { trace, debug, info, warn, error } from "@tauri-apps/plugin-log";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
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
    console.log(`[TRACE] ${formattedMessage}`);
    await trace(formattedMessage);
  }

  /**
   * Debug 级别日志
   */
  async debug(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    console.log(`[DEBUG] ${formattedMessage}`);
    await debug(formattedMessage);
  }

  /**
   * Info 级别日志
   */
  async info(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    console.info(`[INFO] ${formattedMessage}`);
    await info(formattedMessage);
  }

  /**
   * Warn 级别日志
   */
  async warn(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    console.warn(`[WARN] ${formattedMessage}`);
    await warn(formattedMessage);
  }

  /**
   * Error 级别日志
   */
  async error(message: string, context?: LogContext): Promise<void> {
    const formattedMessage = this.formatMessage(message, context);
    console.error(`[ERROR] ${formattedMessage}`);
    await error(formattedMessage);
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
