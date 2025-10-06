/**
 * 文件下载工具
 * 使用 Tauri API + 后端 API 实现文件下载
 */

import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import {
  sendNotification,
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { downloadFile as apiDownloadFile } from "@/api/file";

/**
 * 快速下载文件（通过 fileId）
 * @param fileId 文件ID
 * @param fileName 可选的文件名（如果不提供，使用后端返回的文件名）
 * @returns 返回下载路径或错误信息
 */
export async function downloadFileQuick(
  fileId: string,
  fileName?: string,
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // 调用后端 API 获取文件 blob
    const { blob, filename: serverFilename } = await apiDownloadFile(fileId, {
      quality: "original",
    });

    // 使用提供的文件名或后端返回的文件名
    const finalFileName = fileName || serverFilename || `file_${fileId}.jpg`;

    // 将 blob 转换为 arrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 使用保存对话框让用户选择保存位置
    const savePath = await save({
      defaultPath: finalFileName,
      filters: [
        {
          name: "图片文件",
          extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp"],
        },
        {
          name: "所有文件",
          extensions: ["*"],
        },
      ],
    });

    if (!savePath) {
      return {
        success: false,
        error: "用户取消了保存",
      };
    }

    // 写入文件
    await writeFile(savePath, uint8Array);

    // 发送系统通知
    try {
      let permissionGranted = await isPermissionGranted();

      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }

      if (permissionGranted) {
        await sendNotification({
          title: "✅ 下载完成",
          body: `文件 ${finalFileName} 已保存到本地`,
          sound: "default",
        });
      }
    } catch (error) {
      // 通知发送失败不影响下载结果
      console.error("发送通知失败:", error);
    }

    return {
      success: true,
      path: savePath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("下载文件失败:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
