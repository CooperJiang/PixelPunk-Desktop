/**
 * 分类管理常量
 */

/**
 * 分类状态选项
 */
export const CATEGORY_STATUS_OPTIONS = [
  { label: "全部状态", value: "" },
  { label: "激活", value: "active" },
  { label: "归档", value: "archived" },
] as const;

/**
 * 分类排序字段选项
 */
export const CATEGORY_SORT_BY_OPTIONS = [
  { label: "排序", value: "sort_order" },
  { label: "创建时间", value: "created_at" },
  { label: "文件数量", value: "file_count" },
  { label: "名称", value: "name" },
] as const;

/**
 * 分类排序方向选项
 */
export const CATEGORY_SORT_ORDER_OPTIONS = [
  { label: "升序", value: "asc" },
  { label: "降序", value: "desc" },
] as const;

/**
 * 分类状态类型
 */
export type CategoryStatus = "active" | "archived";

/**
 * 分类排序字段类型
 */
export type CategorySortBy =
  | "sort_order"
  | "created_at"
  | "file_count"
  | "name";

/**
 * 分类排序方向类型
 */
export type CategorySortOrder = "asc" | "desc";
