/**
 * API模块统一入口
 * 导出所有API服务和类型定义
 */

/* ==================== 类型定义导出 ==================== */
export * from "./types";

/* ==================== API模块导出 ==================== */
import * as userApi from "./user";

export { userApi };

export default {
  user: userApi,
};
