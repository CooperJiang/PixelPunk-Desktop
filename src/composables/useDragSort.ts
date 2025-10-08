import { ref } from "vue";
import { reorderFolders } from "@/api/folder";
import { reorderFiles } from "@/api/file";
import { message } from "@/components/Message/message";
import type { FolderInfo, FileInfo } from "@/api/types";

/**
 * 拖拽排序管理 Hook
 * 负责文件夹和文件的拖拽排序功能
 */
export function useDragSort() {
  /* 文件夹拖拽状态 */
  const isDragging = ref(false);
  const dragTimeout = ref<number | null>(null);

  /* 文件拖拽状态 */
  const isFileDragging = ref(false);
  const fileDragTimeout = ref<number | null>(null);

  /**
   * 处理文件夹拖拽开始
   */
  const onFolderDragStart = (_event: Event) => {
    isDragging.value = true;
  };

  /**
   * 处理文件夹拖拽排序
   */
  const onFolderDragEnd = async (
    event: any,
    folders: FolderInfo[],
    currentFolderId: string | undefined,
    onReloadData: () => Promise<void>,
  ) => {
    const { oldIndex, newIndex } = event;
    isDragging.value = false;

    console.log("📦 文件夹拖拽结束:", { oldIndex, newIndex });

    /* 如果位置没有变化，不做处理 */
    if (oldIndex === newIndex) {
      console.log("⏭️ 位置未变化，跳过排序");
      return;
    }

    /* 清除之前的定时器 */
    if (dragTimeout.value) {
      clearTimeout(dragTimeout.value);
    }

    /* 防抖处理，避免快速拖拽时频繁调用API */
    dragTimeout.value = window.setTimeout(async () => {
      try {
        /* 获取移动的文件夹信息 */
        const movedFolder = folders[newIndex];
        const folderName =
          movedFolder?.name && movedFolder.name.length > 12
            ? `${movedFolder.name.substring(0, 12)}...`
            : movedFolder?.name || "文件夹";

        /* 获取重新排序后的文件夹ID数组 */
        const orderedFolderIds = folders.map((folder) => folder.id);

        console.log("📤 发送文件夹排序请求:", {
          parent_id: currentFolderId || "",
          folder_ids: orderedFolderIds,
        });

        /* 调用API更新排序 */
        const result = await reorderFolders({
          parent_id: currentFolderId || "",
          folder_ids: orderedFolderIds,
        });

        console.log("✅ 文件夹排序响应:", result);

        // 成功后不立即强制刷新，保留前端顺序以获得更顺滑的动画体验
        message.success(`已将「${folderName}」移至第 ${newIndex + 1} 位`);
      } catch (error) {
        /* 如果排序失败，恢复原来的顺序 */
        console.error("❌ 文件夹排序失败:", error);
        message.error("文件夹排序失败，请重试");

        // 失败时恢复原状态
        await onReloadData();
      }
    }, 500);
  };

  /**
   * 处理文件拖拽开始
   */
  const onFileDragStart = (_event: Event) => {
    isFileDragging.value = true;
  };

  /**
   * 处理文件拖拽结束
   */
  const onFileDragEnd = async (
    event: any,
    files: FileInfo[],
    currentFolderId: string | undefined,
    onReloadData: () => Promise<void>,
  ) => {
    const { oldIndex, newIndex } = event;
    isFileDragging.value = false;

    console.log("🖼️ 文件拖拽结束:", { oldIndex, newIndex });

    /* 如果位置没有变化，不做处理 */
    if (oldIndex === newIndex) {
      console.log("⏭️ 位置未变化，跳过排序");
      return;
    }

    /* 清除之前的定时器 */
    if (fileDragTimeout.value) {
      clearTimeout(fileDragTimeout.value);
    }

    /* 防抖处理，避免快速拖拽时频繁调用API */
    fileDragTimeout.value = window.setTimeout(async () => {
      try {
        /* 获取移动的文件信息 */
        const movedFile = files[newIndex];
        const fileName =
          movedFile?.display_name ||
          movedFile?.name ||
          movedFile?.original_name ||
          "文件";
        const shortFileName =
          fileName.length > 12 ? `${fileName.substring(0, 12)}...` : fileName;

        /* 获取重新排序后的文件ID数组 */
        const orderedFileIds = files.map((file) => file.id);

        console.log("📤 发送文件排序请求:", {
          folder_id: currentFolderId || "",
          file_ids: orderedFileIds,
        });

        /* 调用API更新排序 */
        const result = await reorderFiles({
          folder_id: currentFolderId || "",
          file_ids: orderedFileIds,
        });

        console.log("✅ 文件排序响应:", result);

        // 成功后不立即强制刷新，保留前端顺序以获得更顺滑的动画体验
        message.success(`已将「${shortFileName}」移至第 ${newIndex + 1} 位`);
      } catch (error) {
        /* 如果排序失败，恢复原来的顺序 */
        console.error("❌ 文件排序失败:", error);
        message.error("文件排序失败，请重试");

        // 失败时恢复原状态
        await onReloadData();
      }
    }, 500);
  };

  /**
   * 清理定时器
   */
  const cleanup = () => {
    if (dragTimeout.value) {
      clearTimeout(dragTimeout.value);
      dragTimeout.value = null;
    }
    if (fileDragTimeout.value) {
      clearTimeout(fileDragTimeout.value);
      fileDragTimeout.value = null;
    }
  };

  return {
    /* 文件夹拖拽状态 */
    isDragging,

    /* 文件拖拽状态 */
    isFileDragging,

    /* 文件夹拖拽方法 */
    onFolderDragStart,
    onFolderDragEnd,

    /* 文件拖拽方法 */
    onFileDragStart,
    onFileDragEnd,

    /* 工具方法 */
    cleanup,
  };
}
