import { get, post, put, del } from "@/utils/network/http";
import type { ApiResult } from "@/utils/network/http-types";
import type { FolderInfo, FileInfo } from "./types";

export interface FolderContentsResponse {
  folders: FolderInfo[];
  files?: FileInfo[];
  images?: FileInfo[];
  items?: FileInfo[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
  };
}

/**
 * 获取文件夹列表
 */
export async function getFolderList(
  parentId?: string,
): Promise<ApiResult<FolderInfo[]>> {
  return get<FolderInfo[]>(
    "/folders/list",
    parentId ? { parent_id: parentId } : undefined,
  );
}

/**
 * 获取文件夹列表（包含文件）
 */
export async function getFolderListWithImages(
  parentId?: string,
): Promise<ApiResult<FolderContentsResponse>> {
  return get<FolderContentsResponse>(
    "/folders/contents",
    parentId ? { parent_id: parentId } : undefined,
  );
}

/**
 * 搜索文件夹
 */
export async function searchFolders(
  keyword: string,
): Promise<ApiResult<FolderInfo[]>> {
  return get<FolderInfo[]>("/folders/search", { keyword });
}

export interface FolderPathChain {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
}

export interface FolderPathChainResponse {
  folder_id: string;
  full_path: string;
  path_chain: FolderPathChain[];
  total_levels: number;
}

/**
 * 获取文件夹路径链 - 从根目录到目标文件夹的完整路径
 */
export async function getFolderPathChain(
  folderId: string,
): Promise<ApiResult<FolderPathChainResponse>> {
  return get<FolderPathChainResponse>(`/folders/${folderId}/path-chain`);
}

/**
 * 创建文件夹
 */
export async function createFolder(data: {
  name: string;
  permission?: "public" | "private";
  description?: string;
  parent_id?: string;
}): Promise<ApiResult<FolderInfo>> {
  return post<FolderInfo>("/folders/create", data);
}

/**
 * 更新文件夹
 */
export async function updateFolder(
  folderId: string,
  data: {
    name?: string;
    permission?: "public" | "private";
    description?: string;
  },
): Promise<ApiResult<FolderInfo>> {
  return put<FolderInfo>(`/folders/${folderId}`, data);
}

/**
 * 删除文件夹
 */
export async function deleteFolder(folderId: string): Promise<ApiResult<void>> {
  return del<void>(`/folders/${folderId}`);
}

/**
 * 批量移动文件夹到指定父级（空字符串/undefined 代表根目录）
 */
export async function moveFolders(
  folderIds: string[],
  newParentId?: string,
): Promise<ApiResult<void>> {
  return post<void>("/folders/move", {
    folder_ids: folderIds,
    new_parent_id: newParentId || "",
  });
}

/**
 * 单个文件夹移动的便捷封装
 */
export async function moveFolder(
  folderId: string,
  newParentId?: string,
): Promise<ApiResult<void>> {
  return moveFolders([folderId], newParentId);
}

/**
 * 重新排序文件夹
 */
export async function reorderFolders(data: {
  parent_id?: string;
  folder_ids: string[];
}): Promise<ApiResult<void>> {
  return post<void>("/folders/reorder", data);
}
