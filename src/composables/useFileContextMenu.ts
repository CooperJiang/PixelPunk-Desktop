import { ref, reactive } from "vue";
import { message } from "@/components/Message/message";
import type { ContextMenuItem } from "@/components/ContextMenu/types";
import type { FileInfo, FolderInfo } from "@/api/types/user";
import { downloadFileQuick } from "@/utils/file/downloader";
import { getFolderList } from "@/api/folder";
import { moveFiles } from "@/api/file";

export interface FileContextMenuOptions {
  onFileDeleted?: (fileId: string) => void;
  onFileMoved?: (fileId: string, targetFolderId?: string) => void;
  onPreview?: (file: FileInfo) => void;
  onDownload?: (file: FileInfo) => void;
  onDelete?: (file: FileInfo) => void;
}

export function useFileContextMenu(options: FileContextMenuOptions = {}) {
  const showContextMenu = ref(false);
  const contextMenuPosition = reactive({ x: 0, y: 0 });
  const selectedFile = ref<FileInfo | null>(null);

  // 构建文件夹菜单项（递归，支持子文件夹）
  const buildFolderMenuItem = (folder: FolderInfo): ContextMenuItem => {
    return {
      key: `folder-${folder.id}`,
      label: folder.name,
      icon: "Folder",
      onClick: async () => {
        if (!selectedFile.value) {
          message.error("没有选中的文件");
          return;
        }
        const { id } = selectedFile.value;
        try {
          await moveFiles([id], folder.id);
          message.success(`已将文件移动到 "${folder.name}"`);
          options.onFileMoved?.(id, folder.id);
        } catch {
          message.error("移动文件失败");
        }
      },
      hasAsyncChildren: folder.has_children,
      loadChildren: folder.has_children
        ? async () => {
            try {
              const result = await getFolderList(folder.id);
              if (result.success && result.data) {
                const childItems = result.data.map(buildFolderMenuItem);
                return childItems;
              }
              return [];
            } catch {
              throw new Error("加载子文件夹失败");
            }
          }
        : undefined,
    };
  };

  // 加载根目录文件夹列表
  const loadRootFolders = async (): Promise<ContextMenuItem[]> => {
    try {
      const result = await getFolderList();
      if (result.success && result.data) {
        const folderItems = result.data.map(buildFolderMenuItem);
        return [
          {
            key: "root-folder",
            label: "根目录",
            icon: "Home",
            onClick: async () => {
              if (!selectedFile.value) {
                message.error("没有选中的文件");
                return;
              }
              const { id } = selectedFile.value;
              try {
                await moveFiles([id], undefined);
                message.success("已将文件移动到根目录");
                options.onFileMoved?.(id, undefined);
              } catch {
                message.error("移动文件失败");
              }
            },
          },
          ...folderItems,
        ];
      }
      return [];
    } catch {
      throw new Error("加载文件夹列表失败");
    }
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      key: "preview",
      label: "预览",
      icon: "Eye",
      onClick: () => {
        if (!selectedFile.value) return;
        options.onPreview?.(selectedFile.value);
      },
    },
    {
      key: "divider-preview-copy",
      label: "",
      divided: true,
    },
    {
      key: "copy-link",
      label: "复制链接",
      icon: "Link",
      children: [
        {
          key: "copy-thumb",
          label: "复制缩略图",
          icon: "Image",
          onClick: async () => {
            if (!selectedFile.value) return;
            const url = selectedFile.value.thumb_url || "";
            if (!url) {
              message.error("没有可复制的缩略图链接");
              return;
            }
            try {
              await navigator.clipboard.writeText(url);
              message.success("已复制缩略图链接");
            } catch {
              message.error("复制失败");
            }
          },
        },
        {
          key: "copy-original",
          label: "复制原图",
          icon: "Film",
          onClick: async () => {
            if (!selectedFile.value) return;
            const url = selectedFile.value.url || "";
            if (!url) {
              message.error("没有可复制的原图链接");
              return;
            }
            try {
              await navigator.clipboard.writeText(url);
              message.success("已复制原图链接");
            } catch {
              message.error("复制失败");
            }
          },
        },
      ],
    },
    {
      key: "divider-after-copy",
      label: "",
      divided: true,
    },
    {
      key: "download",
      label: "下载",
      icon: "Download",
      onClick: async () => {
        if (!selectedFile.value) return;
        if (options.onDownload) {
          options.onDownload(selectedFile.value);
          return;
        }
        const fileId = selectedFile.value.id;
        const fileName =
          selectedFile.value.display_name ||
          selectedFile.value.name ||
          selectedFile.value.original_name;
        message.info("正在下载文件...");
        const result = await downloadFileQuick(fileId, fileName);
        if (result.success) {
          message.success("文件已保存");
        } else if (result.error !== "用户取消了保存") {
          message.error(`下载失败：${result.error || "未知错误"}`);
        }
      },
    },
    {
      key: "move-to",
      label: "移动到...",
      icon: "Move",
      hasAsyncChildren: true,
      loadChildren: loadRootFolders,
    },
    {
      key: "divider-after-move",
      label: "",
      divided: true,
    },
    {
      key: "delete",
      label: "删除",
      icon: "Trash2",
      danger: true,
      onClick: async () => {
        if (!selectedFile.value) return;
        if (options.onDelete) {
          options.onDelete(selectedFile.value);
          return;
        }
        const name =
          selectedFile.value.display_name || selectedFile.value.name || "文件";
        const confirmed = window.confirm(
          `确定要删除文件 "${name}" 吗？此操作不可撤销。`,
        );
        if (confirmed) {
          try {
            // TODO: Implement file deletion API
            message.success("文件已删除");
            options.onFileDeleted?.(selectedFile.value.id);
          } catch {
            message.error("删除文件失败");
          }
        }
      },
    },
  ];

  const showFileContextMenu = (file: FileInfo, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    selectedFile.value = file;
    contextMenuPosition.x = event.clientX;
    contextMenuPosition.y = event.clientY;
    showContextMenu.value = true;
  };

  const hideContextMenu = () => {
    showContextMenu.value = false;
    selectedFile.value = null;
  };

  return {
    showContextMenu,
    contextMenuPosition,
    contextMenuItems,
    selectedFile,
    showFileContextMenu,
    hideContextMenu,
  };
}
