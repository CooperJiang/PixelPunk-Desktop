<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { VueDraggable } from "vue-draggable-plus";
import Breadcrumb from "@/components/Breadcrumb/index.vue";
import Button from "@/components/Button/index.vue";
import FolderCard from "@/components/FolderCard/index.vue";
import FileCard from "@/components/FileCard/index.vue";
import EmptyState from "@/components/EmptyState/index.vue";
import ConfirmDialog from "@/components/ConfirmDialog/index.vue";
import FileViewer from "@/components/FileViewer/index.vue";
import ContextMenu from "@/components/ContextMenu/index.vue";
import CreateFolderDialog from "./components/CreateFolderDialog.vue";
import {
  getFolderListWithImages,
  deleteFolder,
  getFolderPathChain,
} from "@/api/folder";
import { deleteFile, toggleFileAccessLevel } from "@/api/file";
import type { FolderInfo, FileInfo } from "@/api/types";
import { message } from "@/components/Message/message";
import { downloadFileQuick } from "@/utils/file/downloader";
import { useFileContextMenu } from "@/composables/useFileContextMenu";
import { useFolderContextMenu } from "@/composables/useFolderContextMenu";
import { useDragSort } from "@/composables/useDragSort";

const router = useRouter();

// 面包屑导航
const breadcrumbItems = ref<FolderInfo[]>([]);
const currentFolderId = ref<string | undefined>(undefined);

// 文件夹列表
const folders = ref<FolderInfo[]>([]);
const files = ref<FileInfo[]>([]);
const isLoading = ref(false);

// 可变的文件夹和文件列表（用于拖拽排序）
const mutableFolders = ref<FolderInfo[]>([]);
const mutableFiles = ref<FileInfo[]>([]);

// 监听原始数据变化，同步到可变数据
watch(
  () => folders.value,
  (newFolders) => {
    console.log(
      "🔥 Folders changed, updating mutableFolders:",
      newFolders.length,
    );
    mutableFolders.value = [...newFolders];
  },
);

watch(
  () => files.value,
  (newFiles) => {
    console.log("🔥 Files changed, updating mutableFiles:", newFiles.length);
    mutableFiles.value = [...newFiles];
  },
);

// 监听 mutableFolders 变化（VueDraggable 会改变这个）
watch(
  () => mutableFolders.value,
  (newVal) => {
    console.log(
      "🔥 mutableFolders v-model changed:",
      newVal.map((f) => f?.name || "undefined"),
    );
  },
  { deep: true },
);

watch(
  () => mutableFiles.value,
  (newVal) => {
    console.log(
      "🔥 mutableFiles v-model changed:",
      newVal.map(
        (f) => f?.name || f?.display_name || f?.original_name || "undefined",
      ),
    );
  },
  { deep: true },
);

// 对话框状态
const createDialogVisible = ref(false);
const dialogMode = ref<"create" | "edit">("create");
const currentFolder = ref<FolderInfo | null>(null);

// 删除确认对话框
const deleteDialogVisible = ref(false);
const deleteTarget = ref<FolderInfo | FileInfo | null>(null);
const deleteType = ref<"folder" | "file">("folder");
const isDeleting = ref(false);

// 批量操作状态
const batchMode = ref(false);
const selectedBatchFiles = ref<string[]>([]);
const batchDeleteDialogVisible = ref(false);
const isBatchDeleting = ref(false);

// 文件预览状态
const previewDialogVisible = ref(false);
const previewFile = ref<FileInfo | null>(null);
const previewFileIndex = ref(0);

// 文件右键菜单
const {
  showContextMenu,
  contextMenuPosition,
  contextMenuItems,
  showFileContextMenu,
  hideContextMenu,
} = useFileContextMenu({
  onPreview: (file) => {
    handlePreviewFile(file);
  },
  onDownload: (file) => {
    handleDownload(file);
  },
  onDelete: (file) => {
    handleDeleteFile(file);
  },
  onFileDeleted: () => {
    loadFolders(currentFolderId.value);
  },
  onFileMoved: () => {
    loadFolders(currentFolderId.value);
  },
});

// 文件夹右键菜单
const {
  showContextMenu: showFolderContextMenu,
  contextMenuPosition: folderContextMenuPosition,
  contextMenuItems: folderContextMenuItems,
  showFolderContextMenu: handleShowFolderContextMenu,
  hideContextMenu: hideFolderContextMenu,
} = useFolderContextMenu({
  onFolderMoved: async () => {
    // 文件夹移动后，重新构建面包屑和加载文件夹
    if (currentFolderId.value) {
      await buildBreadcrumb(currentFolderId.value);
    }
    loadFolders(currentFolderId.value);
  },
  onEdit: (folder) => {
    handleEditFolder(folder);
  },
  onDelete: (folder) => {
    handleDeleteFolder(folder);
  },
});

// 拖拽排序
const dragSort = useDragSort();

// 拖拽结束处理函数（避免在模板里直接解构 .value 导致取值异常）
const handleFolderDragEnd = (event: any) => {
  console.log("🔥 Folder drag end event:", event);
  console.log("🔥 Event keys:", Object.keys(event));
  console.log("🔥 Event oldIndex:", event.oldIndex);
  console.log("🔥 Event newIndex:", event.newIndex);
  console.log("🔥 Event oldDraggableIndex:", event.oldDraggableIndex);
  console.log("🔥 Event newDraggableIndex:", event.newDraggableIndex);
  console.log(
    "🔥 mutableFolders BEFORE:",
    mutableFolders.value.map((f) => f.name),
  );

  // 等待下一帧，确保 v-model 已更新
  setTimeout(() => {
    console.log(
      "🔥 mutableFolders AFTER (next tick):",
      mutableFolders.value.map((f) => f.name),
    );
    dragSort.onFolderDragEnd(
      event,
      mutableFolders.value,
      currentFolderId.value,
      () => loadFolders(currentFolderId.value),
    );
  }, 0);
};

const handleFileDragEnd = (event: any) => {
  console.log("🔥 File drag end event:", event);
  console.log("🔥 Event keys:", Object.keys(event));
  console.log("🔥 Event oldIndex:", event.oldIndex);
  console.log("🔥 Event newIndex:", event.newIndex);
  console.log(
    "🔥 mutableFiles BEFORE:",
    mutableFiles.value.map(
      (f) => f?.name || f?.display_name || f?.original_name,
    ),
  );

  // 等待下一帧，确保 v-model 已更新
  setTimeout(() => {
    console.log(
      "🔥 mutableFiles AFTER (next tick):",
      mutableFiles.value.map(
        (f) => f?.name || f?.display_name || f?.original_name,
      ),
    );
    dragSort.onFileDragEnd(
      event,
      mutableFiles.value,
      currentFolderId.value,
      () => loadFolders(currentFolderId.value),
    );
  }, 0);
};

// 加载文件夹列表和文件列表
const loadFolders = async (folderId?: string) => {
  isLoading.value = true;

  try {
    const result = await getFolderListWithImages(folderId);

    if (result.success && result.data) {
      const { data } = result;

      // 设置文件夹列表
      folders.value = data.folders || [];

      // 设置文件列表 - 支持多种字段名
      const filesList = data.files || data.images || data.items || [];
      files.value = filesList;
    } else {
      folders.value = [];
      files.value = [];
    }
  } catch (error) {
    console.error("加载文件夹列表失败:", error);
    folders.value = [];
    files.value = [];
  } finally {
    // 延迟关闭loading，避免闪烁
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  }
};

// 构建面包屑路径 - 使用 API 获取完整路径链
const buildBreadcrumb = async (folderId?: string) => {
  if (!folderId) {
    breadcrumbItems.value = [];
    return;
  }

  try {
    const result = await getFolderPathChain(folderId);
    if (result.success && result.data) {
      // 将 path_chain 转换为 FolderInfo 数组
      breadcrumbItems.value = result.data.path_chain.map((chain) => ({
        id: chain.id,
        name: chain.name,
        parent_id: chain.parent_id,
        created_at: "",
        permission: "public" as const,
      }));
    } else {
      breadcrumbItems.value = [];
    }
  } catch (error) {
    console.error("构建面包屑失败:", error);
    breadcrumbItems.value = [];
  }
};

// 处理面包屑点击
const handleBreadcrumbClick = (folder: FolderInfo | null) => {
  if (folder === null) {
    // 点击根目录
    currentFolderId.value = undefined;
    breadcrumbItems.value = [];
    loadFolders();
  } else {
    // 点击某个文件夹 - 截取面包屑到点击的位置
    const index = breadcrumbItems.value.findIndex(
      (item) => item.id === folder.id,
    );
    if (index !== -1) {
      currentFolderId.value = folder.id;
      breadcrumbItems.value = breadcrumbItems.value.slice(0, index + 1);
      loadFolders(folder.id);
    }
  }
};

// 导航到文件夹
const navigateToFolder = async (folder: FolderInfo) => {
  // 正在拖拽时忽略点击，避免误触导航
  if (dragSort.isDragging.value) return;
  currentFolderId.value = folder.id;
  await buildBreadcrumb(folder.id);
  loadFolders(folder.id);
};

// 导航到上传页面
const navigateToUpload = () => {
  if (currentFolderId.value) {
    router.push({
      path: "/upload/quick",
      query: { folderId: currentFolderId.value },
    });
  } else {
    router.push("/upload/quick");
  }
};

// 显示创建文件夹对话框
const showCreateDialog = () => {
  dialogMode.value = "create";
  currentFolder.value = null;
  createDialogVisible.value = true;
};

// 显示编辑文件夹对话框
const handleEditFolder = (folder: FolderInfo) => {
  dialogMode.value = "edit";
  currentFolder.value = folder;
  createDialogVisible.value = true;
};

// 处理文件夹创建成功
const handleFolderCreated = () => {
  loadFolders(currentFolderId.value);
};

// 处理文件夹更新成功
const handleFolderUpdated = () => {
  loadFolders(currentFolderId.value);
};

// 显示删除文件夹确认对话框
const handleDeleteFolder = (folder: FolderInfo) => {
  deleteTarget.value = folder;
  deleteType.value = "folder";
  deleteDialogVisible.value = true;
};

// 显示删除文件确认对话框
const handleDeleteFile = (file: FileInfo) => {
  deleteTarget.value = file;
  deleteType.value = "file";
  deleteDialogVisible.value = true;
};

// 确认删除
const confirmDelete = async () => {
  if (!deleteTarget.value) return;

  isDeleting.value = true;
  try {
    if (deleteType.value === "folder") {
      const result = await deleteFolder(deleteTarget.value.id);
      if (result.success) {
        message.success("文件夹删除成功");
        loadFolders(currentFolderId.value);
        deleteDialogVisible.value = false;
        deleteTarget.value = null;
      } else {
        message.error(result.message || "文件夹删除失败");
      }
    } else {
      const result = await deleteFile(deleteTarget.value.id);
      if (result.success) {
        message.success("文件删除成功");
        loadFolders(currentFolderId.value);
        deleteDialogVisible.value = false;
        deleteTarget.value = null;
      } else {
        message.error(result.message || "文件删除失败");
      }
    }
  } catch (error) {
    console.error(
      `删除${deleteType.value === "folder" ? "文件夹" : "文件"}失败:`,
      error,
    );
    message.error(
      `删除${deleteType.value === "folder" ? "文件夹" : "文件"}失败`,
    );
  } finally {
    isDeleting.value = false;
  }
};

// 取消删除
const cancelDelete = () => {
  deleteDialogVisible.value = false;
  deleteTarget.value = null;
};

// 上传按钮文案
const uploadButtonText = computed(() => {
  const currentFolder = breadcrumbItems.value;
  if (currentFolder.length <= 0) {
    return "上传文件";
  }
  const currentFolderName = currentFolder[currentFolder.length - 1]?.name;
  if (currentFolderName && currentFolderName.length > 8) {
    return `上传到 "${currentFolderName.substring(0, 6)}..."`;
  }
  return currentFolderName ? `上传到 "${currentFolderName}"` : "上传文件";
});

// 处理文件预览
const handlePreviewFile = (file: FileInfo) => {
  // 正在拖拽文件时忽略点击，避免误触预览
  if (dragSort.isFileDragging.value) return;
  const index = files.value.findIndex((f) => f.id === file.id);
  if (index !== -1) {
    previewFileIndex.value = index;
  }
  previewFile.value = file;
  previewDialogVisible.value = true;
};

// 处理文件复制链接
const handleCopyLink = async (file: FileInfo) => {
  try {
    const fileUrl = file.full_url || file.url;
    if (fileUrl) {
      await navigator.clipboard.writeText(fileUrl);
      message.success("链接已复制到剪贴板");
    } else {
      message.error("文件链接不存在");
    }
  } catch (error) {
    console.error("复制链接失败:", error);
    message.error("复制链接失败");
  }
};

// 处理文件下载
const handleDownload = async (file: FileInfo) => {
  try {
    const fileId = file.id;
    const fileName = file.display_name || file.name || file.original_name;

    message.info("正在下载文件...");

    const result = await downloadFileQuick(fileId, fileName);

    if (result.success) {
      message.success("文件已保存");
    } else if (result.error !== "用户取消了保存") {
      message.error(`下载失败：${result.error || "未知错误"}`);
    }
  } catch (error) {
    console.error("下载文件失败:", error);
    message.error("下载文件失败");
  }
};

// 处理文件权限切换
const handleToggleFileVisibility = async (file: FileInfo) => {
  try {
    const result = await toggleFileAccessLevel(file.id);
    if (result.success) {
      message.success("文件权限修改成功");
      loadFolders(currentFolderId.value);
    } else {
      message.error(result.message || "文件权限修改失败");
    }
  } catch (error) {
    console.error("修改文件权限失败:", error);
    message.error("修改文件权限失败");
  }
};

// 批量操作相关
const startBatchMode = () => {
  batchMode.value = true;
  selectedBatchFiles.value = [];
};

const cancelBatchMode = () => {
  batchMode.value = false;
  selectedBatchFiles.value = [];
};

const toggleBatchFileSelect = (fileId: string) => {
  const index = selectedBatchFiles.value.indexOf(fileId);
  if (index === -1) {
    selectedBatchFiles.value.push(fileId);
  } else {
    selectedBatchFiles.value.splice(index, 1);
  }
};

const toggleSelectAllFiles = () => {
  if (selectedBatchFiles.value.length === files.value.length) {
    selectedBatchFiles.value = [];
  } else {
    selectedBatchFiles.value = files.value.map((f) => f.id);
  }
};

const invertFileSelection = () => {
  const allFileIds = files.value.map((f) => f.id);
  selectedBatchFiles.value = allFileIds.filter(
    (id) => !selectedBatchFiles.value.includes(id),
  );
};

const confirmBatchDeleteFiles = () => {
  if (selectedBatchFiles.value.length === 0) {
    message.warning("请先选择要删除的文件");
    return;
  }
  batchDeleteDialogVisible.value = true;
};

const executeBatchDelete = async () => {
  isBatchDeleting.value = true;
  try {
    const deletePromises = selectedBatchFiles.value.map((fileId) =>
      deleteFile(fileId),
    );
    const results = await Promise.all(deletePromises);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      message.success(`成功删除 ${successCount} 个文件`);
    }
    if (failCount > 0) {
      message.error(`${failCount} 个文件删除失败`);
    }

    // 重新加载文件列表
    await loadFolders(currentFolderId.value);

    // 关闭对话框并退出批量模式
    batchDeleteDialogVisible.value = false;
    cancelBatchMode();
  } catch (error) {
    console.error("批量删除文件失败:", error);
    message.error("批量删除文件失败");
  } finally {
    isBatchDeleting.value = false;
  }
};

// 初始化加载
onMounted(() => {
  loadFolders();
});

// 清理
onUnmounted(() => {
  dragSort.cleanup();
});
</script>

<template>
  <div class="folders-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">我的文件夹</h1>
        <Breadcrumb
          :items="breadcrumbItems"
          class="breadcrumb"
          @click="handleBreadcrumbClick"
        />
      </div>
      <div class="header-actions">
        <Button type="primary" @click="navigateToUpload">
          <template #icon>
            <i class="fas fa-upload" />
          </template>
          {{ uploadButtonText }}
        </Button>
        <Button type="outlined" @click="showCreateDialog">
          <template #icon>
            <i class="fas fa-folder-plus" />
          </template>
          新建文件夹
        </Button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 文件夹网格 -->
      <div v-if="folders.length > 0" class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-folder" /> 文件夹
            <span class="item-count">{{ folders.length }}</span>
            <span v-if="folders.length > 1" class="drag-tip">
              <i class="fas fa-arrows-alt" /> 拖拽排序
            </span>
          </h2>
        </div>
        <VueDraggable
          v-model="mutableFolders"
          :animation="150"
          ghost-class="sortable-ghost"
          chosen-class="sortable-chosen"
          drag-class="sortable-drag"
          :force-fallback="true"
          :fallback-on-body="false"
          :group="{ name: 'folders', pull: false, put: false }"
          class="folder-grid"
          @start="
            (evt) => {
              console.log('🔥 Folder drag START with event:', evt);
              dragSort.onFolderDragStart(evt);
            }
          "
          @end="handleFolderDragEnd"
          @change="(evt) => console.log('🔥 VueDraggable change event:', evt)"
          @move="(evt) => console.log('🔥 VueDraggable move event:', evt)"
          @update="(evt) => console.log('🔥 VueDraggable update event:', evt)"
        >
          <div
            v-for="folder in mutableFolders"
            :key="folder.id"
            class="folder-item"
          >
            <FolderCard
              :folder="folder"
              @click="navigateToFolder"
              @edit="handleEditFolder"
              @delete="handleDeleteFolder"
              @contextmenu="handleShowFolderContextMenu"
            />
          </div>
        </VueDraggable>
      </div>

      <!-- 文件网格 -->
      <div v-if="files.length > 0" class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-images" /> 文件
            <span class="item-count">{{ files.length }}</span>
            <span v-if="!batchMode && files.length > 1" class="drag-tip">
              <i class="fas fa-arrows-alt" /> 拖拽排序
            </span>
          </h2>
          <div class="section-actions">
            <!-- 非批量模式：显示批量操作按钮 -->
            <Button
              v-if="!batchMode"
              type="outlined"
              size="small"
              @click="startBatchMode"
            >
              <template #icon>
                <i class="fas fa-tasks" />
              </template>
              批量操作
            </Button>

            <!-- 批量模式：显示批量操作控制栏 -->
            <template v-else>
              <span class="batch-count">
                <i class="fas fa-image" />
                已选择 {{ selectedBatchFiles.length }} 个
              </span>
              <Button
                type="outlined"
                size="small"
                @click="toggleSelectAllFiles"
              >
                <template #icon>
                  <i
                    class="fas"
                    :class="
                      selectedBatchFiles.length === files.length
                        ? 'fa-check-double'
                        : 'fa-check'
                    "
                  />
                </template>
                {{
                  selectedBatchFiles.length === files.length
                    ? "取消全选"
                    : "全选"
                }}
              </Button>
              <Button type="outlined" size="small" @click="invertFileSelection">
                <template #icon>
                  <i class="fas fa-exchange-alt" />
                </template>
                反选
              </Button>
              <Button
                type="danger"
                size="small"
                :disabled="selectedBatchFiles.length === 0"
                @click="confirmBatchDeleteFiles"
              >
                <template #icon>
                  <i class="fas fa-trash" />
                </template>
                批量删除
              </Button>
              <Button type="outlined" size="small" @click="cancelBatchMode">
                <template #icon>
                  <i class="fas fa-times" />
                </template>
                取消
              </Button>
            </template>
          </div>
        </div>
        <VueDraggable
          v-model="mutableFiles"
          :animation="150"
          ghost-class="sortable-ghost"
          chosen-class="sortable-chosen"
          drag-class="sortable-drag"
          :force-fallback="true"
          :fallback-on-body="false"
          :group="{ name: 'files', pull: false, put: false }"
          :disabled="batchMode"
          class="file-grid"
          @start="
            (evt) => {
              console.log('🔥 File drag START with event:', evt);
              dragSort.onFileDragStart(evt);
            }
          "
          @end="handleFileDragEnd"
          @change="
            (evt) => console.log('🔥 File VueDraggable change event:', evt)
          "
          @move="(evt) => console.log('🔥 File VueDraggable move event:', evt)"
          @update="
            (evt) => console.log('🔥 File VueDraggable update event:', evt)
          "
        >
          <div v-for="file in mutableFiles" :key="file.id" class="file-item">
            <FileCard
              :file="file"
              :batch-mode="batchMode"
              :selected="selectedBatchFiles.includes(file.id)"
              @preview="handlePreviewFile"
              @delete="handleDeleteFile"
              @toggle-visibility="handleToggleFileVisibility"
              @toggle-select="toggleBatchFileSelect(file.id)"
              @copy-link="handleCopyLink"
              @download="handleDownload"
              @contextmenu="showFileContextMenu"
            />
          </div>
        </VueDraggable>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-if="folders.length === 0 && files.length === 0 && !isLoading"
        @create-folder="showCreateDialog"
      />

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin" />
        <span>加载中...</span>
      </div>
    </div>

    <!-- 创建/编辑文件夹对话框 -->
    <CreateFolderDialog
      v-model="createDialogVisible"
      :parent-id="currentFolderId"
      :mode="dialogMode"
      :folder="currentFolder || undefined"
      @created="handleFolderCreated"
      @updated="handleFolderUpdated"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model="deleteDialogVisible"
      :title="deleteType === 'folder' ? '删除文件夹' : '删除文件'"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    >
      <p v-if="deleteType === 'folder'">
        确定要删除文件夹 "{{ deleteTarget?.name }}" 吗？
      </p>
      <p v-else>确定要删除文件 "{{ deleteTarget?.name }}" 吗？</p>
      <p
        style="
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin-top: 8px;
        "
      >
        {{
          deleteType === "folder"
            ? "此操作不可恢复，文件夹内的所有文件也将被删除。"
            : "此操作不可恢复。"
        }}
      </p>
    </ConfirmDialog>

    <!-- 批量删除确认对话框 -->
    <ConfirmDialog
      v-model="batchDeleteDialogVisible"
      title="批量删除文件"
      :loading="isBatchDeleting"
      @confirm="executeBatchDelete"
      @cancel="batchDeleteDialogVisible = false"
    >
      <p>确定要删除选中的 {{ selectedBatchFiles.length }} 个文件吗？</p>
      <p
        style="
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          margin-top: 8px;
        "
      >
        此操作不可恢复。
      </p>
    </ConfirmDialog>

    <!-- 文件预览对话框 -->
    <FileViewer
      v-model="previewDialogVisible"
      :file="previewFile"
      :files="files"
      :initial-index="previewFileIndex"
    />

    <!-- 文件右键菜单 -->
    <ContextMenu
      v-model="showContextMenu"
      :items="contextMenuItems"
      :x="contextMenuPosition.x"
      :y="contextMenuPosition.y"
      @close="hideContextMenu"
    />

    <!-- 文件夹右键菜单 -->
    <ContextMenu
      v-model="showFolderContextMenu"
      :items="folderContextMenuItems"
      :x="folderContextMenuPosition.x"
      :y="folderContextMenuPosition.y"
      @close="hideFolderContextMenu"
    />
  </div>
</template>

<style scoped>
.folders-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-shrink: 0;
  min-height: 56px;
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  color: var(--color-white);
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(
    120deg,
    var(--color-primary) 0%,
    rgb(255, 110, 199) 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(
    0 0 15px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4)
  );
  letter-spacing: 0.5px;
  position: relative;
}

.breadcrumb {
  margin-top: 4px;
  width: 100%;
  min-width: 0;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.section-container {
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.2);
  border-radius: 16px;
  overflow: visible;
  padding: 24px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(var(--color-primary-rgb, 5, 217, 232), 0.06);
  position: relative;
}

.section-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.2),
    transparent
  );
  border-radius: 16px 16px 0 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.1);
  position: relative;
}

.section-header::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0)
  );
  border-radius: 2px;
}

.section-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: var(--color-primary);
  font-size: 1rem;
}

.section-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.batch-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  color: var(--color-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.batch-count i {
  font-size: 0.75rem;
}

.item-count {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-left: 8px;
}

.drag-tip {
  background: rgba(255, 110, 199, 0.1);
  color: rgba(255, 110, 199, 0.8);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.drag-tip:hover {
  opacity: 1;
  background: rgba(255, 110, 199, 0.15);
}

.drag-tip i {
  font-size: 0.65rem;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 15px;
}

.folder-item {
  min-width: 0;
  cursor: grab;
}

.folder-item:active {
  cursor: grabbing;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 15px;
}

.file-item {
  min-width: 0;
  cursor: grab;
}

.file-item:active {
  cursor: grabbing;
}

/* VueDraggable 会自动处理拖动动画，不需要手动设置 transition */

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 12px;
  color: var(--color-text-secondary);
}

.loading-state i {
  font-size: 32px;
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .folders-page {
    padding: 12px;
    gap: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .section-container {
    padding: 16px;
  }

  .folder-grid,
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
}

/* 拖拽样式 */
.sortable-ghost {
  opacity: 0.4 !important;
}

.sortable-ghost :deep(.folder-card),
.sortable-ghost :deep(.file-card) {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15) !important;
  border: 2px dashed rgba(var(--color-primary-rgb, 5, 217, 232), 0.6) !important;
  border-radius: 12px !important;
  transform: scale(0.95) !important;
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3) !important;
}

/* 原位置元素隐藏，但不影响拖动克隆 */
.folder-grid .sortable-chosen:not(.sortable-drag),
.file-grid .sortable-chosen:not(.sortable-drag) {
  opacity: 0 !important;
}
</style>

<!-- 全局拖拽克隆样式 -->
<style>
.sortable-drag,
body > .sortable-drag {
  opacity: 1 !important;
  z-index: 9999 !important;
  cursor: grabbing !important;
}

.sortable-drag :deep(.folder-card),
.sortable-drag :deep(.file-card),
body > .sortable-drag :deep(.folder-card),
body > .sortable-drag :deep(.file-card) {
  opacity: 1 !important;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1) !important;
  border: 2px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.8) !important;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4) !important;
  filter: brightness(1.1) !important;
}

/* 隐藏拖动克隆中的 hover 层 */
.sortable-drag :deep(.file-hover-overlay),
.sortable-drag :deep(.hover-actions) {
  display: none !important;
}
</style>
