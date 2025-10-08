/**
 * HTTP响应和错误处理类型定义
 */

/* 统一的响应结果类型 */
export interface ApiResult<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  request_id?: string;
  timestamp: number;
}

/* 成功响应类型 */
export interface ApiSuccess<T = any> extends ApiResult<T> {
  success: true;
  code: 200;
  data: T;
}

/* 错误响应类型 */
export interface ApiError extends ApiResult<null> {
  success: false;
  code: number;
  message: string;
  data: null;
}

/* 错误分类 */
export enum ErrorCategory {
  NETWORK = "network", // 网络错误 (连接失败、超时等)
  BUSINESS = "business", // 业务逻辑错误 (验证失败、资源不存在等)
  AUTH = "auth", // 认证错误 (未登录、token过期)
  PERMISSION = "permission", // 权限错误 (无权限访问)
  SYSTEM = "system", // 系统错误 (服务器内部错误)
}

/* 具体的错误类型 */
export interface NetworkError extends ApiError {
  category: ErrorCategory.NETWORK;
  code: 999 | 500 | 502 | 503 | 504;
}

export interface BusinessError extends ApiError {
  category: ErrorCategory.BUSINESS;
  code: number; // 业务错误码 1000-9999
}

export interface AuthError extends ApiError {
  category: ErrorCategory.AUTH;
  code: 401 | 1001;
}

export interface PermissionError extends ApiError {
  category: ErrorCategory.PERMISSION;
  code: 403;
}

export interface SystemError extends ApiError {
  category: ErrorCategory.SYSTEM;
  code: 500;
}

/* 错误处理配置 */
export interface ErrorHandlingConfig {
  silent?: boolean; // 静默模式，不显示任何提示
  autoShowError?: boolean; // 是否自动显示业务错误提示，默认true
  autoShowSuccess?: boolean; // 是否自动显示成功提示，默认false
  throwOnError?: boolean; // 是否在错误时抛出异常，默认false
  useResultMode?: boolean; // 是否使用Result模式（返回{success, data}），默认false
}

/* 请求配置扩展 */
export interface ExtendedRequestConfig extends ErrorHandlingConfig {
  showLoading?: boolean; // 是否显示loading，默认false
  loadingTarget?: { value: boolean }; // 自动管理的loading状态
  minLoadingTime?: number; // 最小loading时间，防止闪烁，默认300ms
  timeout?: number; // 请求超时时间（毫秒）
  headers?: Record<string, string>; // 自定义请求头
  params?: Record<string, any>; // URL查询参数
}

/* 业务错误码分类 */
export const ErrorCodes = {
  /* 成功 */
  SUCCESS: 200,

  /* 系统错误 */
  SYSTEM_ERROR: 500,

  /* 用户相关 (1000-1999) */
  USER_NOT_FOUND: 1000, // 用户不存在
  INVALID_CREDENTIALS: 1001, // 密码错误
  USER_DISABLED: 1002, // 用户被禁用
  USER_ALREADY_EXISTS: 1003, // 用户已存在
  INVALID_AUTH_TOKEN: 1004, // 无效的认证令牌
  EXPIRED_AUTH_TOKEN: 1005, // 认证令牌过期
  INVALID_VERIFY_CODE: 1006, // 无效的验证码

  /* 文件相关 (4000-4099) */
  FILE_TOO_LARGE: 4001,
  INVALID_FILE_TYPE: 4002,
  FILE_NOT_FOUND: 4003,
  UPLOAD_FAILED: 4004,

  /* 文件夹相关 (5000-5099) */
  FOLDER_NOT_FOUND: 5001,
  FOLDER_ALREADY_EXISTS: 5002,
  FOLDER_NOT_EMPTY: 5003,
} as const;

/* 自动显示错误提示的错误码 */
export const AUTO_SHOW_ERROR_CODES = [
  /* 用户相关错误 */
  ErrorCodes.USER_NOT_FOUND,
  ErrorCodes.INVALID_CREDENTIALS,
  ErrorCodes.USER_DISABLED,
  ErrorCodes.USER_ALREADY_EXISTS,
  // ErrorCodes.INVALID_AUTH_TOKEN, // token相关错误由handleUnauthorized统一处理
  // ErrorCodes.EXPIRED_AUTH_TOKEN, // token相关错误由handleUnauthorized统一处理
  ErrorCodes.INVALID_VERIFY_CODE,

  /* 文件相关错误 */
  ErrorCodes.FILE_TOO_LARGE,
  ErrorCodes.INVALID_FILE_TYPE,
  ErrorCodes.FILE_NOT_FOUND,
  ErrorCodes.UPLOAD_FAILED,

  /* 文件夹相关错误 */
  ErrorCodes.FOLDER_NOT_FOUND,
  ErrorCodes.FOLDER_ALREADY_EXISTS,
  ErrorCodes.FOLDER_NOT_EMPTY,
];

/* 静默处理的错误码 */
export const SILENT_ERROR_CODES: number[] = [
  /* 可根据需要添加不需要显示提示的错误码 */
];

/* 需要抛出异常的错误码(严重错误) */
export const THROW_ERROR_CODES = [ErrorCodes.SYSTEM_ERROR];

/* 错误分类映射 */
export const ERROR_CATEGORY_MAP: Record<number, ErrorCategory> = {
  /* 网络错误 */
  999: ErrorCategory.NETWORK,
  502: ErrorCategory.NETWORK,
  503: ErrorCategory.NETWORK,
  504: ErrorCategory.NETWORK,

  /* 认证错误 */
  401: ErrorCategory.AUTH,
  [ErrorCodes.INVALID_CREDENTIALS]: ErrorCategory.AUTH,
  [ErrorCodes.USER_NOT_FOUND]: ErrorCategory.AUTH,
  [ErrorCodes.USER_DISABLED]: ErrorCategory.AUTH,
  [ErrorCodes.INVALID_AUTH_TOKEN]: ErrorCategory.AUTH,
  [ErrorCodes.EXPIRED_AUTH_TOKEN]: ErrorCategory.AUTH,
  [ErrorCodes.INVALID_VERIFY_CODE]: ErrorCategory.AUTH,

  /* 权限错误 */
  403: ErrorCategory.PERMISSION,

  /* 系统错误 */
  500: ErrorCategory.SYSTEM,
  [ErrorCodes.SYSTEM_ERROR]: ErrorCategory.SYSTEM,
};

/* 获取错误分类 */
export function getErrorCategory(code: number): ErrorCategory {
  return ERROR_CATEGORY_MAP[code] || ErrorCategory.BUSINESS;
}

/* 判断是否应该显示错误提示 */
export function shouldShowError(
  code: number,
  config: ErrorHandlingConfig,
): boolean {
  if (config.silent) {
    return false;
  }
  if (config.autoShowError === false) {
    return false;
  }
  if (SILENT_ERROR_CODES.includes(code)) {
    return false;
  }
  return AUTO_SHOW_ERROR_CODES.includes(code);
}

/* 判断是否应该抛出异常 */
export function shouldThrowError(
  code: number,
  config: ErrorHandlingConfig,
): boolean {
  if (config.throwOnError === true) {
    return true;
  }
  return THROW_ERROR_CODES.includes(code);
}
