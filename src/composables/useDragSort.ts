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
    console.log("🔥 Folder drag START");
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
    console.log("🔥 onFolderDragEnd called with event:", event);
    const { oldIndex, newIndex } = event;
    console.log("🔥 oldIndex:", oldIndex, "newIndex:", newIndex);
    isDragging.value = false;

    /* 如果位置没有变化，不做处理 */
    if (oldIndex === newIndex) {
      console.log("🔥 No position change, skipping");
      return;
    }

    /* 清除之前的定时器 */
    if (dragTimeout.value) {
      clearTimeout(dragTimeout.value);
    }

    /* 防抖处理，避免快速拖拽时频繁调用API */
    dragTimeout.value = window.setTimeout(async () => {
      try {
        /* 获取重新排序后的文件夹ID数组 */
        const orderedFolderIds = folders.map((folder) => folder.id);

        /* 调用API更新排序 */
        await reorderFolders({
          parent_id: currentFolderId || "",
          folder_ids: orderedFolderIds,
        });

        // 成功后不立即强制刷新，保留前端顺序以获得更顺滑的动画体验
        // 若后端有服务端排序逻辑差异，可根据需要在此延后刷新
        message.success("文件夹排序已更新");
      } catch (error) {
        /* 如果排序失败，恢复原来的顺序 */
        console.error("文件夹排序失败:", error);
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
    console.log("🔥 File drag START");
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

    /* 如果位置没有变化，不做处理 */
    if (oldIndex === newIndex) {
      return;
    }

    /* 清除之前的定时器 */
    if (fileDragTimeout.value) {
      clearTimeout(fileDragTimeout.value);
    }

    /* 防抖处理，避免快速拖拽时频繁调用API */
    fileDragTimeout.value = window.setTimeout(async () => {
      try {
        /* 获取重新排序后的文件ID数组 */
        const orderedFileIds = files.map((file) => file.id);

        /* 调用API更新排序 */
        await reorderFiles({
          folder_id: currentFolderId || "",
          file_ids: orderedFileIds,
        });

        // 成功后不立即强制刷新，保留前端顺序以获得更顺滑的动画体验
        message.success("文件排序已更新");
      } catch (error) {
        /* 如果排序失败，恢复原来的顺序 */
        console.error("文件排序失败:", error);
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
