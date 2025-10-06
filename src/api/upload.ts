import { upload } from "@/utils/network/http";
import type { ApiResult } from "@/utils/network/http-types";
import type { FileInfo, UploadOptions, UploadProgressEvent } from "./types";

/**
 * 上传单个文件
 * 使用项目统一的 upload 方法，自动处理 token
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
  onProgress?: (event: UploadProgressEvent) => void,
): Promise<ApiResult<FileInfo>> {
  // 准备上传数据
  const uploadData: Record<string, any> = {};

  if (options.folder_id) {
    uploadData.folder_id = options.folder_id;
  }
  if (options.access_level) {
    uploadData.access_level = options.access_level;
  }
  if (options.optimize !== undefined) {
    uploadData.optimize = String(options.optimize);
  }
  if (options.storage_duration) {
    uploadData.storage_duration = options.storage_duration;
  }

  // 调用统一的上传方法，会自动添加 token
  return upload<FileInfo>("/files/upload", file, uploadData, (progress) => {
    // 转换进度格式
    if (onProgress) {
      onProgress({
        loaded: (progress * file.size) / 100,
        total: file.size,
        lengthComputable: true,
      });
    }
  });
}
