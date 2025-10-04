import { get, post } from '@/utils/network/http';
import type { ApiResult } from '@/utils/network/http-types';
import type {
  LoginResponse,
  SendCodeRequest,
  SendCodeResponse,
  UserInfo,
  UserLoginRequest,
  UserRegisterRequest,
} from './types';

/**
 * 用户注册
 */
export function register(
  data: UserRegisterRequest,
): Promise<ApiResult<UserInfo>> {
  return post<UserInfo>('/user/register', data);
}

/**
 * 用户登录
 */
export function login(
  data: UserLoginRequest,
): Promise<ApiResult<LoginResponse>> {
  return post<LoginResponse>('/user/login', data, {
    autoShowError: false, // 禁用自动错误提示，由前端组件手动处理
    useResultMode: true, // 使用Result模式兼容现有的auth.ts逻辑
  });
}

/**
 * 发送注册验证码
 */
export function sendRegistrationCode(
  data: SendCodeRequest,
): Promise<ApiResult<SendCodeResponse>> {
  return post<SendCodeResponse>('/user/send-registration-code', data);
}

/**
 * 获取用户信息
 */
export function getUserProfile(): Promise<ApiResult<UserInfo>> {
  return get<UserInfo>('/user/personal/profile');
}

/**
 * 更新用户信息
 */
export function updateUserProfile(
  data: UserInfo,
): Promise<ApiResult<UserInfo>> {
  return post<UserInfo>('/user/personal/profile', data);
}

export default {
  register,
  login,
  sendRegistrationCode,
  getUserProfile,
  updateUserProfile,
};
