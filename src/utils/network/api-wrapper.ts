/**
 * API调用包装器 - 解决Result模式和异常模式混用的问题
 */
import type { ApiResult } from "./http-types";

/**
 * 将Result模式转换为异常模式
 * 使用场景：需要try-catch处理的地方
 */
export async function apiCall<T>(
  apiPromise: Promise<ApiResult<T>>,
): Promise<T> {
  const result = await apiPromise;
  if (result.success) {
    return result.data;
  }
  const error = new Error(result.message) as any;
  error.code = result.code;
  error.result = result;
  throw error;
}

/**
 * 安全的API调用 - 总是返回Result，不会抛异常
 * 使用场景：简单的CRUD操作，希望统一处理成功/失败
 */
export async function safeApiCall<T>(
  apiPromise: Promise<ApiResult<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    finallyCallback?: () => void;
  } = {},
): Promise<ApiResult<T>> {
  try {
    const result = await apiPromise;

    if (result.success && options.onSuccess) {
      options.onSuccess(result.data);
    } else if (!result.success && options.onError) {
      options.onError(result.message);
    }

    return result;
  } catch (error: any) {
    const errorMessage = error.message || "请求失败";
    if (options.onError) {
      options.onError(errorMessage);
    }

    return {
      success: false,
      code: error.code || 999,
      message: errorMessage,
      data: null as T,
      timestamp: Date.now(),
    };
  } finally {
    if (options.finallyCallback) {
      options.finallyCallback();
    }
  }
}

/**
 * 带loading状态的API调用
 * 使用场景：需要管理loading状态的组件
 */
export async function apiCallWithLoading<T>(
  apiPromise: Promise<ApiResult<T>>,
  loadingRef: { value: boolean },
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showToast?: boolean; // 是否自动显示toast，默认true
  } = {},
): Promise<ApiResult<T>> {
  loadingRef.value = true;

  const { showToast = true } = options;

  return safeApiCall(apiPromise, {
    onSuccess: (data: T) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: string) => {
      if (showToast) {
        // TODO: 集成Desktop通知系统
        // logger.error('[API Error]', { error });
      }
      if (options.onError) {
        options.onError(error);
      }
    },
    finallyCallback: () => {
      loadingRef.value = false;
    },
  });
}

export default {
  apiCall,
  safeApiCall,
  apiCallWithLoading,
};
