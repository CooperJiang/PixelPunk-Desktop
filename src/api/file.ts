import { get, post, del } from "@/utils/network/http";
import type { ApiResult } from "@/utils/network/http-types";
import type { FileInfo } from "./types";
import { storage } from "@/utils/storage";
import { TOKEN_KEY } from "@/constants/api";

export interface FileListResponse {
  items: FileInfo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
  };
}

/**
 * 获取文件列表
 */
export async function getFileList(params?: {
  folder_id?: string;
  access_level?: "public" | "private" | "protected" | "";
  sort?: "newest" | "oldest" | "name" | "size";
  page?: number;
  size?: number; // 每页数量
  limit?: number; // 兼容旧参数名
}): Promise<ApiResult<FileListResponse>> {
  return get<FileListResponse>("/files/list", params);
}

/**
 * 删除文件
 */
export async function deleteFile(
  fileId: string,
): Promise<ApiResult<{ id: string }>> {
  return del<{ id: string }>(`/files/${fileId}`);
}

/**
 * 切换文件访问权限
 */
export async function toggleFileAccessLevel(
  fileId: string,
): Promise<ApiResult<FileInfo>> {
  return post<FileInfo>(`/files/${fileId}/toggle-access-level`);
}

/**
 * 批量删除文件
 */
export async function batchDeleteFiles(
  fileIds: string[],
): Promise<ApiResult<{ deleted: number; errors: string[] }>> {
  return post<{ deleted: number; errors: string[] }>("/files/batch-delete", {
    file_ids: fileIds,
  });
}

/**
 * 移动文件到文件夹
 */
export async function moveFiles(
  fileIds: string[],
  folderId?: string,
): Promise<ApiResult<{ moved: number }>> {
  return post<{ moved: number }>("/files/move", {
    file_ids: fileIds,
    target_folder_id: folderId,
  });
}

/**
 * 下载文件（返回 blob 和文件名）
 */
export async function downloadFile(
  fileId: string,
  options?: {
    quality?: "original" | "compressed";
    format?: "jpg" | "png" | "webp";
  },
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percent: number;
  }) => void,
): Promise<{ blob: Blob; filename?: string }> {
  const params = new URLSearchParams();
  if (options?.quality) {
    params.append("quality", options.quality);
  }
  if (options?.format) {
    params.append("format", options.format);
  }

  const url = `/files/${fileId}/download${params.toString() ? `?${params.toString()}` : ""}`;

  // 使用 Tauri 的 fetch API
  const { fetch } = await import("@tauri-apps/plugin-http");

  const token = storage.get<string>(TOKEN_KEY);
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`);
  }

  // 从响应头获取文件名
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "";
  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/,
    );
    if (filenameStarMatch) {
      try {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } catch {
        // Failed to decode filename*, using fallback
      }
    }
    if (!filename) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
  }

  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer]);

  return { blob, filename };
}

/**
 * 重新排序文件
 */
export async function reorderFiles(data: {
  folder_id?: string;
  file_ids: string[];
}): Promise<ApiResult<void>> {
  return post<void>("/files/reorder", data);
}
