import { get, post } from "@/utils/network/http";
import type {
  GetCategoryListParams,
  GetCategoryListResponse,
  CreateCategoryParams,
  UpdateCategoryParams,
  UpdateCategoryStatusParams,
  DeleteCategoryParams,
  BatchDeleteParams,
  BatchDeleteResponse,
  ImageCategory,
} from "./types/category";

/**
 * 获取分类列表
 */
export const getCategoryList = (params?: GetCategoryListParams) => {
  return get<GetCategoryListResponse>("/user-categories/list", {
    params: {
      page: params?.page || 1,
      size: params?.size || 10,
      keyword: params?.keyword,
      status: params?.status,
      sort_by: params?.sort_by || "sort_order",
      sort_order_dir: params?.sort_order_dir || "asc",
    },
  });
};

/**
 * 创建分类
 */
export const createCategory = (data: CreateCategoryParams) => {
  return post<ImageCategory>("/user-categories/create", data);
};

/**
 * 更新分类
 */
export const updateCategory = (data: UpdateCategoryParams) => {
  return post<ImageCategory>("/user-categories/update", data);
};

/**
 * 更新分类状态
 */
export const updateCategoryStatus = (data: UpdateCategoryStatusParams) => {
  return post<void>("/user-categories/update-status", data);
};

/**
 * 删除分类
 */
export const deleteCategory = (params: DeleteCategoryParams) => {
  return post<void>("/user-categories/delete", params);
};

/**
 * 批量删除分类
 */
export const batchDeleteCategories = (data: BatchDeleteParams) => {
  return post<BatchDeleteResponse>("/user-categories/batch-delete", data);
};
