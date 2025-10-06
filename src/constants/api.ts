/**
 * API相关常量定义
 */

/* ===== API端点常量 ===== */
export const API_ENDPOINTS = {
  /* 认证相关 */
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  /* 用户相关 */
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    AVATAR: "/user/avatar",
    SETTINGS: "/user/settings",
  },

  /* 文件相关 */
  FILE: {
    LIST: "/files",
    UPLOAD: "/files/upload",
    DELETE: "/files",
    BATCH_DELETE: "/files/batch",
    UPDATE: "/files",
    SEARCH: "/files/search",
  },

  /* 文件夹相关 */
  FOLDER: {
    LIST: "/folders",
    CREATE: "/folders",
    UPDATE: "/folders",
    DELETE: "/folders",
    MOVE: "/folders/move",
  },

  /* 分享相关 */
  SHARE: {
    CREATE: "/shares",
    LIST: "/shares",
    DELETE: "/shares",
  },
} as const;

/* ===== HTTP方法常量 ===== */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

/* ===== HTTP状态码常量 ===== */
export const HTTP_STATUS = {
  /* 成功状态码 */
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  /* 客户端错误 */
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  /* 服务器错误 */
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/* ===== 错误码映射 ===== */
export const ERROR_CODE_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: "请求参数错误",
  [HTTP_STATUS.UNAUTHORIZED]: "未授权访问",
  [HTTP_STATUS.FORBIDDEN]: "权限不足",
  [HTTP_STATUS.NOT_FOUND]: "资源不存在",
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: "请求方法不允许",
  [HTTP_STATUS.CONFLICT]: "资源冲突",
  [HTTP_STATUS.PAYLOAD_TOO_LARGE]: "请求体过大",
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: "数据验证失败",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "请求过于频繁",
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "服务器内部错误",
  [HTTP_STATUS.BAD_GATEWAY]: "网关错误",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "服务不可用",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "网关超时",
} as const;

/* ===== 请求超时配置 ===== */
export const REQUEST_TIMEOUT = {
  DEFAULT: 10000, // 10秒 - 默认超时时间
  UPLOAD: 60000, // 60秒 - 文件上传超时
  DOWNLOAD: 30000, // 30秒 - 文件下载超时
} as const;

/* ===== 内容类型常量 ===== */
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
  TEXT_PLAIN: "text/plain",
  OCTET_STREAM: "application/octet-stream",
} as const;

/* ===== 缓存配置 ===== */
export const CACHE_CONFIG = {
  /* 缓存键前缀 */
  PREFIX: {
    USER: "user:",
    FILE: "file:",
    FOLDER: "folder:",
    SHARE: "share:",
    SETTINGS: "settings:",
  },

  /* 缓存过期时间 (秒) */
  TTL: {
    SHORT: 300, // 5分钟
    MEDIUM: 1800, // 30分钟
    LONG: 3600, // 1小时
    VERY_LONG: 86400, // 24小时
  },
} as const;

/* ===== 分页配置 ===== */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
  SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/* ===== Token存储键 ===== */
export const TOKEN_KEY = "token";
export const USER_INFO_KEY = "userInfo";
export const TOKEN_EXPIRES = 24 * 7; // 7天（小时）
