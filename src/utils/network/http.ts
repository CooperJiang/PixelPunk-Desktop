/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetch } from "@tauri-apps/plugin-http";
import { storage } from "@/utils/storage";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { logger } from "@/utils/logger";
import message from "@/components/Message/message";
import type {
  ApiError,
  ApiResult,
  ApiSuccess,
  ExtendedRequestConfig,
} from "./http-types";
import {
  ErrorCodes,
  getErrorCategory,
  shouldShowError,
  shouldThrowError,
} from "./http-types";
import { TOKEN_KEY, USER_INFO_KEY } from "@/constants/api";

/* 处理未授权访问 - 跳转到登录窗口 */
async function handleUnauthorized() {
  try {
    await logger.warn("[HTTP] Unauthorized, redirecting to login");
    await invoke("show_login_window");
    await logger.info("[HTTP] Switched to login");
  } catch (error) {
    await logger.error("[HTTP] Failed to handle unauthorized", {
      error: String(error),
    });
  }
}

/* 广播登出事件，通知所有窗口刷新认证状态 */
async function broadcastLoggedOut() {
  try {
    const win = getCurrentWindow();
    await win.emit("auth:logged-out", { at: Date.now(), source: "http" });
    await logger.info("[HTTP] Broadcasted auth:logged-out");
  } catch (e) {
    await logger.warn("[HTTP] Failed to broadcast auth:logged-out", {
      error: String(e),
    });
  }
}

/* 请求超时配置 */
export const REQUEST_TIMEOUT = {
  DEFAULT: 10000, // 10秒 - 默认超时时间
  UPLOAD: 60000, // 60秒 - 文件上传超时
  DOWNLOAD: 30000, // 30秒 - 文件下载超时
};

/* 从环境变量获取API基础URL */
export const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return (
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"
      );
    }
  } catch (error) {
    logger.warn("无法读取环境变量VITE_API_BASE_URL", { error: String(error) });
  }
  return "http://localhost:3000/api/v1";
};

const apiBaseUrl = getApiBaseUrl();

/* API响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  request_id?: string;
  timestamp: number;
}

/* 创建统一的响应结果 */
function createApiResult<T = any>(
  success: boolean,
  code: number,
  message: string,
  data: T,
  request_id?: string,
): ApiResult<T> {
  return {
    success,
    code,
    message,
    data,
    request_id,
    timestamp: Date.now(),
  };
}

/* 创建成功响应 */
function createSuccessResult<T = any>(
  data: T,
  message: string = "操作成功",
  request_id?: string,
): ApiSuccess<T> {
  return createApiResult(
    true,
    ErrorCodes.SUCCESS,
    message,
    data,
    request_id,
  ) as ApiSuccess<T>;
}

/* 创建错误响应 */
function createErrorResult(
  code: number,
  message: string,
  request_id?: string,
): ApiError {
  return createApiResult(false, code, message, null, request_id) as ApiError;
}

/* Toast通知 */
const showToast = {
  success: (msg: string) => {
    message.success(msg);
  },
  error: (msg: string) => {
    message.error(msg);
  },
};

/* 构建完整URL */
function buildUrl(url: string, params?: Record<string, any>): string {
  const fullUrl = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;

  if (!params || Object.keys(params).length === 0) {
    return fullUrl;
  }

  const searchParams = new globalThis.URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${fullUrl}?${queryString}` : fullUrl;
}

/* 请求拦截 - 添加认证头等 */
async function requestInterceptor(
  url: string,
  config: ExtendedRequestConfig = {},
): Promise<{ url: string; headers: Record<string, string> }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  // 从storage获取token
  const token = storage.get<string>(TOKEN_KEY);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 设置默认配置
  if (config.autoShowError === undefined) {
    config.autoShowError = true;
  }
  if (config.silent === undefined) {
    config.silent = false;
  }
  if (config.autoShowSuccess === undefined) {
    config.autoShowSuccess = false;
  }
  if (config.throwOnError === undefined) {
    config.throwOnError = false;
  }
  if (config.useResultMode === undefined) {
    config.useResultMode = false;
  }
  if (config.minLoadingTime === undefined) {
    config.minLoadingTime = 300;
  }

  // Loading管理
  if (config.loadingTarget) {
    config.loadingTarget.value = true;
  }

  return { url, headers };
}

/* 响应拦截 - 统一处理响应和错误 */
async function responseInterceptor<T>(
  response: Response,
  config: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  // 重置loading状态
  if (config.loadingTarget) {
    const minTime = config.minLoadingTime || 300;
    window.setTimeout(() => {
      if (config.loadingTarget) {
        config.loadingTarget.value = false;
      }
    }, minTime);
  }

  try {
    const responseData: ApiResponse<T> = await response.json();
    const requestId =
      responseData.request_id || response.headers.get("x-request-id") || "";

    // 检查业务状态码
    if (responseData.code === ErrorCodes.SUCCESS) {
      // 成功响应
      if (config.autoShowSuccess && responseData.message && !config.silent) {
        showToast.success(responseData.message);
      }
      return createSuccessResult(
        responseData.data,
        responseData.message,
        requestId,
      );
    }

    // 业务错误
    const errorResult = createErrorResult(
      responseData.code,
      responseData.message,
      requestId,
    );

    // 检查是否是认证相关错误（token过期或无效）
    if (
      responseData.code === ErrorCodes.INVALID_AUTH_TOKEN ||
      responseData.code === ErrorCodes.EXPIRED_AUTH_TOKEN
    ) {
      await logger.warn(
        "[HTTP] Auth token invalid or expired, clearing and redirecting",
      );
      storage.remove(TOKEN_KEY);
      storage.remove(USER_INFO_KEY);
      await storage.save();
      await broadcastLoggedOut();
      handleUnauthorized();
    }

    // 判断是否显示错误提示
    if (shouldShowError(responseData.code, config)) {
      showToast.error(responseData.message || "操作失败");
    }

    // 判断是否使用Result模式
    if (config.useResultMode === true) {
      // Result模式：除非是严重错误，否则返回结果而不抛异常
      if (shouldThrowError(responseData.code, config)) {
        return Promise.reject(errorResult);
      }
      return errorResult;
    }

    // 默认模式：业务错误也抛出异常
    return Promise.reject(errorResult);
  } catch (error) {
    // JSON解析失败
    const errorResult = createErrorResult(999, "Invalid response format", "");
    return Promise.reject(errorResult);
  }
}

/* 错误处理 */
async function handleError(
  error: any,
  config: ExtendedRequestConfig,
): Promise<ApiError> {
  // 重置loading状态
  if (config.loadingTarget) {
    config.loadingTarget.value = false;
  }

  let message = "网络连接失败，请检查网络";
  let errorCode = 999;

  if (error.response) {
    // HTTP错误
    errorCode = error.response.status;
    switch (errorCode) {
      case 401:
        message = "未授权访问，请重新登录";
        // 清除token
        storage.remove(TOKEN_KEY);
        storage.remove(USER_INFO_KEY);
        await storage.save();
        // 广播并跳转到登录窗口
        await broadcastLoggedOut();
        handleUnauthorized();
        break;
      case 403:
        message = "权限不足";
        break;
      case 404:
        message = "资源不存在";
        break;
      case 500:
        message = "服务器内部错误";
        break;
      case 502:
        message = "网关错误";
        break;
      case 503:
        message = "服务不可用";
        break;
      case 504:
        message = "网关超时";
        break;
      default:
        message = `请求失败 (${errorCode})`;
    }
  } else if (error.message) {
    message = error.message;
  }

  // 显示错误提示
  if (!config.silent) {
    showToast.error(message);
  }

  // 创建错误结果
  const errorResult = createErrorResult(errorCode, message, "");

  // 记录错误日志
  const category = getErrorCategory(errorCode);
  await logger.error(`[HTTP ${category.toUpperCase()}]`, {
    error: String(error),
    message,
    code: errorCode,
  });

  return Promise.reject(errorResult);
}

/* 核心请求方法 */
async function request<T = any>(
  method: string,
  url: string,
  data?: any,
  config: ExtendedRequestConfig = {},
): Promise<ApiResult<T>> {
  try {
    // 请求拦截
    const { url: finalUrl, headers } = await requestInterceptor(url, config);

    // 构建请求选项
    const timeout = config.timeout || REQUEST_TIMEOUT.DEFAULT;
    const fullUrl = buildUrl(
      finalUrl,
      method === "GET" || method === "DELETE" ? data : config.params,
    );

    const requestOptions: any = {
      method,
      headers,
      connectTimeout: timeout,
    };

    // 添加请求体（非GET/DELETE请求）
    if (data && method !== "GET" && method !== "DELETE") {
      requestOptions.body = JSON.stringify(data);
    }

    // 发送请求
    const response = await fetch(fullUrl, requestOptions);

    // 响应拦截
    return await responseInterceptor<T>(response, config);
  } catch (error) {
    // 错误处理
    return await handleError(error, config);
  }
}

/* 封装GET请求 */
export function get<T = any>(
  url: string,
  params?: any,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  return request<T>("GET", url, params, config);
}

/* 封装POST请求 */
export function post<T = any>(
  url: string,
  data?: any,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  return request<T>("POST", url, data, config);
}

/* 封装PUT请求 */
export function put<T = any>(
  url: string,
  data?: any,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  return request<T>("PUT", url, data, config);
}

/* 封装PATCH请求 */
export function patch<T = any>(
  url: string,
  data?: any,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  return request<T>("PATCH", url, data, config);
}

/* 封装DELETE请求 */
export function del<T = any>(
  url: string,
  params?: any,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  return request<T>("DELETE", url, params, config);
}

/* 封装文件上传请求 */
export async function upload<T = any>(
  url: string,
  file: File,
  data?: Record<string, any>,
  onProgress?: (progress: number) => void,
  config?: ExtendedRequestConfig,
): Promise<ApiResult<T>> {
  try {
    // 请求拦截
    const { url: finalUrl, headers } = await requestInterceptor(
      url,
      config || {},
    );

    // 构建FormData
    const formData = new FormData();
    formData.append("file", file);

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }
    }

    // 移除Content-Type，让浏览器自动设置（包含boundary）
    delete headers["Content-Type"];

    const timeout = config?.timeout || REQUEST_TIMEOUT.UPLOAD;
    const fullUrl = buildUrl(finalUrl, config?.params);

    // 发送请求
    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: formData as any,
      connectTimeout: timeout,
    });

    // 响应拦截
    return await responseInterceptor<T>(response, config || {});
  } catch (error) {
    return await handleError(error, config || {});
  }
}

/* 导出默认对象 */
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
};
