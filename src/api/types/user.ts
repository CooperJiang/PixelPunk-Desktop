/**
 * 用户相关类型定义
 */
import type { BaseUserInfo, TimeStamps } from "./common";

/* ==================== 用户信息类型 ==================== */
export interface UserInfo extends BaseUserInfo, TimeStamps {
  email: string;
  avatarFullPath?: string;
  bio: string;
  website?: string;
  status?: number;
  role: number;
}

/* ==================== 用户认证类型 ==================== */
export interface UserLoginRequest {
  account: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  code: string;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

/* ==================== 验证码相关类型 ==================== */
export interface SendCodeRequest {
  email: string;
}

export interface SendCodeResponse {
  email: string;
  expires_in: number;
}
