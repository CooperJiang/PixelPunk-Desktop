import { ref, reactive } from "vue";
import { message } from "@/components/Message/message";
import type { ContextMenuItem } from "@/components/ContextMenu/types";
import type { FolderInfo } from "@/api/types/user";
import { getFolderList, moveFolder } from "@/api/folder";

export interface FolderContextMenuOptions {
  onFolderMoved?: (folderId: string, targetFolderId?: string) => void;
  onEdit?: (folder: FolderInfo) => void;
  onDelete?: (folder: FolderInfo) => void;
}

export function useFolderContextMenu(options: FolderContextMenuOptions = {}) {
  const showContextMenu = ref(false);
  const contextMenuPosition = reactive({ x: 0, y: 0 });
  const selectedFolder = ref<FolderInfo | null>(null);

  // 构建文件夹菜单项（递归，支持子文件夹）
  const buildFolderMenuItem = (folder: FolderInfo): ContextMenuItem => {
    return {
      key: `folder-${folder.id}`,
      label: folder.name,
      icon: "Folder",
      onClick: async () => {
        if (!selectedFolder.value) {
          message.error("没有选中的文件夹");
          return;
        }
        const { id } = selectedFolder.value;
        try {
          const result = await moveFolder(id, folder.id);
          if (result.success) {
            message.success(`已将文件夹移动到 "${folder.name}"`);
            options.onFolderMoved?.(id, folder.id);
          } else {
            message.error(result.message || "移动文件夹失败");
          }
        } catch (error) {
          console.error("移动文件夹失败:", error);
          message.error("移动文件夹失败");
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
              if (!selectedFolder.value) {
                message.error("没有选中的文件夹");
                return;
              }
              const { id } = selectedFolder.value;
              try {
                const result = await moveFolder(id, undefined);
                if (result.success) {
                  message.success("已将文件夹移动到根目录");
                  options.onFolderMoved?.(id, undefined);
                } else {
                  message.error(result.message || "移动文件夹失败");
                }
              } catch (error) {
                console.error("移动文件夹失败:", error);
                message.error("移动文件夹失败");
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
      key: "edit",
      label: "重命名/编辑",
      icon: "Edit",
      onClick: () => {
        if (!selectedFolder.value) return;
        options.onEdit?.(selectedFolder.value);
      },
    },
    {
      key: "delete",
      label: "删除",
      icon: "Trash2",
      danger: true,
      onClick: () => {
        if (!selectedFolder.value) return;
        options.onDelete?.(selectedFolder.value);
      },
    },
  ];

  const showFolderContextMenu = (folder: FolderInfo, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    selectedFolder.value = folder;
    contextMenuPosition.x = event.clientX;
    contextMenuPosition.y = event.clientY;
    showContextMenu.value = true;
  };

  const hideContextMenu = () => {
    showContextMenu.value = false;
    selectedFolder.value = null;
  };

  return {
    showContextMenu,
    contextMenuPosition,
    contextMenuItems,
    selectedFolder,
    showFolderContextMenu,
    hideContextMenu,
  };
}
