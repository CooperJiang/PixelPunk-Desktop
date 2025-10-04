/**
 * 通用类型定义
 */

/* ==================== 基础时间戳类型 ==================== */
export interface TimeStamps {
  created_at: string;
  updated_at: string;
}

/* ==================== 基础用户信息类型 ==================== */
export interface BaseUserInfo {
  id: number;
  username: string;
  avatar?: string;
}
