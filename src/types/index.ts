/**
 * Global type definitions
 */

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface UploadConfig {
  provider: string;
  endpoint: string;
  accessKey?: string;
  secretKey?: string;
}

export type Theme = "light" | "dark";

// 导出配置类型
export type { AppConfig } from "./config";
