// 分类来源类型
export type CategorySource = "user" | "ai_suggestion" | "system_template";

// 分类状态
export type CategoryStatus = "active" | "archived";

// 图片分类信息
export interface ImageCategory {
  id: number;
  name: string;
  description: string;
  user_id?: number;
  source: CategorySource;
  template_id?: number;
  file_count: number;
  sort_order: number;
  status: CategoryStatus;
  created_at: string;
  updated_at: string;
}

// 获取分类列表参数
export interface GetCategoryListParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: CategoryStatus | "";
  sort_by?: "created_at" | "sort_order" | "file_count" | "name";
  sort_order_dir?: "asc" | "desc";
}

// 获取分类列表响应
export interface GetCategoryListResponse {
  categories: ImageCategory[];
  total: number;
  page: number;
  size: number;
}

// 创建分类参数
export interface CreateCategoryParams {
  name: string;
  description?: string;
  sort_order?: number;
}

// 更新分类参数
export interface UpdateCategoryParams {
  id: number;
  name: string;
  description?: string;
  sort_order?: number;
}

// 更新分类状态参数
export interface UpdateCategoryStatusParams {
  id: number;
  status: CategoryStatus;
}

// 删除分类参数
export interface DeleteCategoryParams {
  id: number;
}

// 批量删除参数
export interface BatchDeleteParams {
  ids: number[];
}

// 批量删除响应
export interface BatchDeleteResponse {
  deleted_count: number;
  failed_ids?: number[];
}
