/**
 * 数据持久化模块
 *
 * 功能：
 * - 读写应用数据到本地文件
 * - 支持嵌套键值访问（如 'user.name'）
 * - 自动保存
 * - 默认值支持
 *
 * 使用示例：
 * ```typescript
 * import { storage } from '@/utils/storage';
 *
 * // 初始化（通常在 main.ts）
 * await storage.init();
 *
 * // 读写数据
 * storage.set('theme', 'dark');
 * const theme = storage.get('theme', 'light');
 *
 * // 嵌套访问
 * storage.set('user.name', 'Alice');
 * const name = storage.get('user.name');
 *
 * // 清空数据
 * await storage.clear();
 * ```
 */

/* eslint-disable no-undef, @typescript-eslint/no-explicit-any */
import {
  BaseDirectory,
  writeTextFile,
  readTextFile,
  exists,
  mkdir,
} from "@tauri-apps/plugin-fs";
import { storageConfig } from "@/config/storage.config";

export class Storage {
  private data: Record<string, any> = {};
  private autoSaveTimer: number | null = null;
  private initialized = false;
  private dirty = false; // 数据是否被修改

  /**
   * 初始化存储
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 检查文件是否存在
      const fileExists = await exists(storageConfig.file.filename, {
        baseDir: BaseDirectory[storageConfig.file.dir],
      });

      if (fileExists) {
        // 读取文件
        const content = await readTextFile(storageConfig.file.filename, {
          baseDir: BaseDirectory[storageConfig.file.dir],
        });
        this.data = JSON.parse(content);
      } else {
        // 文件不存在，使用默认值并创建
        this.data = { ...storageConfig.defaults };
        await this.save();
      }
    } catch (error) {
      console.warn("Failed to read storage file, using defaults:", error);
      this.data = { ...storageConfig.defaults };
      await this.save();
    }

    // 启动自动保存
    if (storageConfig.file.autoSave) {
      this.startAutoSave();
    }

    this.initialized = true;
    // console.log("Storage initialized");
  }

  /**
   * 获取值
   * @param key 键名，支持嵌套如 'user.name'
   * @param defaultValue 默认值
   */
  get<T = any>(key: string, defaultValue?: T): T {
    const keys = key.split(".");
    let value = this.data;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  /**
   * 设置值
   * @param key 键名，支持嵌套如 'user.name'
   * @param value 值
   */
  set(key: string, value: any): void {
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let target = this.data;

    // 创建嵌套对象路径
    for (const k of keys) {
      if (!(k in target) || typeof target[k] !== "object") {
        target[k] = {};
      }
      target = target[k];
    }

    target[lastKey] = value;
    this.dirty = true;

    // 如果没有开启自动保存，立即保存
    if (!storageConfig.file.autoSave) {
      this.save();
    }
  }

  /**
   * 删除值
   * @param key 键名
   */
  remove(key: string): void {
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let target = this.data;

    for (const k of keys) {
      if (!(k in target)) return;
      target = target[k];
    }

    delete target[lastKey];
    this.dirty = true;

    if (!storageConfig.file.autoSave) {
      this.save();
    }
  }

  /**
   * 检查键是否存在
   * @param key 键名
   */
  has(key: string): boolean {
    const keys = key.split(".");
    let value = this.data;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取所有数据
   */
  getAll(): Record<string, any> {
    return { ...this.data };
  }

  /**
   * 保存到文件
   */
  async save(): Promise<void> {
    if (!this.dirty) return;

    try {
      // 先确保目录存在
      const baseDir = BaseDirectory[storageConfig.file.dir];
      try {
        await mkdir('', { baseDir, recursive: true });
      } catch {
        // 目录可能已存在，忽略错误
      }

      await writeTextFile(
        storageConfig.file.filename,
        JSON.stringify(this.data, null, 2),
        { baseDir },
      );
      this.dirty = false;
      // console.log("Storage saved"); // 移除频繁的日志
    } catch (error) {
      console.error("Save storage failed:", error);
    }
  }

  /**
   * 清空所有数据，恢复默认值
   */
  async clear(): Promise<void> {
    this.data = { ...storageConfig.defaults };
    this.dirty = true;
    await this.save();
    console.log("Storage cleared");
  }

  /**
   * 启动自动保存
   */
  private startAutoSave(): void {
    this.autoSaveTimer = window.setInterval(() => {
      if (this.dirty) {
        this.save();
      }
    }, storageConfig.file.saveInterval);
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 销毁存储（保存并停止自动保存）
   */
  async destroy(): Promise<void> {
    this.stopAutoSave();
    await this.save();
    this.initialized = false;
  }
}

// 导出单例
export const storage = new Storage();
