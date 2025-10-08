<template>
  <div class="page-container">
    <div class="page-content">
      <!-- 文件网格容器 -->
      <div v-if="files.length > 0" class="section-container">
        <div class="section-header">
          <h2 class="section-title">
            <i class="fas fa-images" /> 全部文件
            <span class="item-count">{{ files.length }}</span>
          </h2>
        </div>

        <!-- 文件列表 -->
        <div class="files-grid">
          <FileCard
            v-for="file in files"
            :key="file.id"
            :file="file"
            @preview="handlePreview"
            @download="handleDownload"
            @delete="handleDelete"
            @toggle-visibility="handleToggleVisibility"
            @copy-link="handleCopyLink"
            @contextmenu="handleFileContextMenu"
          />
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <Pagination
            v-model:current-page="currentPage"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-size-options="pageSizeOptions"
            :show-page-size-selector="true"
            :show-quick-jumper="true"
            :show-total="true"
            @page-change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <EmptyState
        v-else-if="!isLoading"
        icon="fas fa-images"
        title="暂无文件"
        description="还没有上传任何文件"
      />

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <i class="fas fa-spinner fa-spin" />
        <span>加载中...</span>
      </div>
    </div>

    <!-- 文件预览 -->
    <FileViewer
      v-model="showPreview"
      :file="previewFile"
      :files="files"
      :initial-index="previewIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import {
  getFileList,
  deleteFile,
  toggleFileAccessLevel,
  downloadFile,
} from "@/api/file";
import type { FileInfo } from "@/api/types";
import FileCard from "@/components/FileCard/index.vue";
import EmptyState from "@/components/EmptyState/index.vue";
import FileViewer from "@/components/FileViewer/index.vue";
import { Pagination } from "@/components/Pagination/exports";
import { useFileContextMenu } from "@/composables/useFileContextMenu";
import { useResponsivePageSize } from "@/composables/useResponsivePageSize";
import { message } from "@/components/Message/message";
import { writeFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";

const isLoading = ref(false);
const files = ref<FileInfo[]>([]);
const currentPage = ref(1);
const pagination = ref({
  total: 0,
  size: 24,
  current_page: 1,
  last_page: 1,
});

const showPreview = ref(false);
const previewFile = ref<FileInfo | null>(null);
const previewIndex = ref(0);

const fileContextMenu = useFileContextMenu();

// 响应式分页大小
const {
  pageSize: autoPageSize,
  recalc,
  columns,
} = useResponsivePageSize({
  containerSelector: ".files-grid",
  gridSelector: ".files-grid",
  itemMinWidth: 200,
  columnGap: 16,
  rowMultiple: 4, // 4 行
  defaultSize: 24, // 默认 6 列 * 4 行 = 24
  preferCssColumns: true,
  mode: "observe",
});

// 分页选项
const pageSizeOptions = computed<number[]>(() => {
  const base = autoPageSize.value || pagination.value.size || 24;
  const list = [base, base * 2, base * 3, base * 5].map((n) =>
    Math.max(1, Math.floor(n)),
  );
  return Array.from(new Set(list)).sort((a, b) => a - b);
});

// 防止重复加载的标志
const isAutoUpdating = ref(false);

// 监听分页大小变化（窗口 resize 导致的自动变化）
watch(autoPageSize, (newSize, oldSize) => {
  if (newSize && oldSize && newSize !== oldSize) {
    const rows = 4;
    const cols = Math.floor(newSize / rows);
    console.log(
      `🔄 窗口大小变化: ${oldSize} -> ${newSize} (${cols}列 × ${rows}行), 重新加载数据`,
    );
    isAutoUpdating.value = true;
    pagination.value.size = newSize;
    currentPage.value = 1;
    loadFiles().finally(() => {
      isAutoUpdating.value = false;
    });
  }
});

const loadFiles = async () => {
  console.log(
    `📡 开始加载文件列表: page=${currentPage.value}, size=${pagination.value.size}`,
  );
  isLoading.value = true;
  try {
    const result = await getFileList({
      page: currentPage.value,
      size: pagination.value.size,
    });

    if (result.success && result.data) {
      files.value = result.data.items || [];

      // 🔍 调试日志：打印全部文件页面的文件数据格式
      if (files.value.length > 0) {
        console.log(
          "📸 [全部文件] 第一个文件的完整数据:",
          JSON.stringify(files.value[0], null, 2),
        );
        console.log("📸 [全部文件] URL字段:", {
          url: files.value[0].url,
          full_url: files.value[0].full_url,
          thumb_url: files.value[0].thumb_url,
          full_thumb_url: files.value[0].full_thumb_url,
          thumbnail_url: files.value[0].thumbnail_url,
        });
      }

      // 转换分页结构
      const apiPagination = result.data.pagination;
      // 保留前端设置的 size，不使用后端返回的 limit
      const currentSize = pagination.value.size;
      pagination.value = {
        total: apiPagination.total,
        size: currentSize, // 保持前端设置的值
        current_page: apiPagination.page,
        last_page: Math.ceil(apiPagination.total / currentSize),
      };
      console.log(
        `✅ 文件列表加载成功: ${files.value.length} 个文件, 共 ${apiPagination.total} 个, pageSize=${currentSize}`,
      );

      // 首次加载后重新计算，确保列数准确
      if (currentPage.value === 1 && files.value.length > 0) {
        setTimeout(() => {
          const oldPageSize = pagination.value.size;
          recalc();
          if (autoPageSize.value && autoPageSize.value !== oldPageSize) {
            console.log(
              `🔄 数据渲染后重新计算: ${oldPageSize} -> ${autoPageSize.value}`,
            );
            pagination.value.size = autoPageSize.value;
            // 如果列数变化较大，重新加载
            if (Math.abs(autoPageSize.value - oldPageSize) >= 4) {
              currentPage.value = 1;
              loadFiles();
            }
          }
        }, 200);
      }
    }
  } catch (error) {
    console.error("❌ 加载文件列表失败:", error);
  } finally {
    isLoading.value = false;
  }
};

const handlePageChange = (page: number) => {
  console.log(`📄 切换页面: ${currentPage.value} -> ${page}`);
  currentPage.value = page;
  loadFiles();
};

const handlePageSizeChange = (size: number) => {
  if (isAutoUpdating.value) {
    console.log(`⏭️ 跳过自动更新触发的 page-size-change 事件`);
    return;
  }
  console.log(`👆 用户手动修改 pageSize: ${pagination.value.size} -> ${size}`);
  currentPage.value = 1;
  loadFiles();
};

const handlePreview = (file: FileInfo) => {
  console.log("👁️ [全部文件] 点击预览文件:", {
    id: file.id,
    name: file.display_name || file.name || file.original_name,
    url: file.url,
    full_url: file.full_url,
  });

  const index = files.value.findIndex((f) => f.id === file.id);
  previewIndex.value = index >= 0 ? index : 0;
  previewFile.value = file;
  showPreview.value = true;
};

const handleDownload = async (file: FileInfo) => {
  try {
    message.info("开始下载...");

    const { blob, filename } = await downloadFile(file.id);

    // 使用 Tauri 保存对话框
    const savePath = await save({
      defaultPath: filename || file.original_name || file.display_name,
    });

    if (savePath) {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await writeFile(savePath, uint8Array);
      message.success("下载成功");
    } else {
      message.info("取消下载");
    }
  } catch (error) {
    console.error("下载失败:", error);
    message.error("下载失败，请重试");
  }
};

const handleDelete = async (file: FileInfo) => {
  try {
    const result = await deleteFile(file.id);
    if (result.success) {
      message.success("删除成功");
      await loadFiles();
    }
  } catch (error) {
    console.error("删除失败:", error);
    message.error("删除失败，请重试");
  }
};

const handleToggleVisibility = async (file: FileInfo) => {
  try {
    const result = await toggleFileAccessLevel(file.id);
    if (result.success) {
      const levelMap = {
        public: "公开",
        private: "私密",
        protected: "受保护",
      };
      const newLevel =
        result.data?.access_level || file.access_level || "public";
      message.success(`已切换到${levelMap[newLevel as keyof typeof levelMap]}`);
      await loadFiles();
    }
  } catch (error) {
    console.error("切换权限失败:", error);
    message.error("切换权限失败，请重试");
  }
};

const handleCopyLink = async (file: FileInfo) => {
  try {
    await navigator.clipboard.writeText(file.full_url || file.url);
    message.success("链接已复制到剪贴板");
  } catch (error) {
    console.error("复制链接失败:", error);
    message.error("复制链接失败，请重试");
  }
};

const handleFileContextMenu = (file: FileInfo, event: MouseEvent) => {
  fileContextMenu.showContextMenu(file, event, loadFiles);
};

onMounted(() => {
  // 延迟计算以确保DOM完全渲染
  setTimeout(() => {
    recalc();
    if (autoPageSize.value && autoPageSize.value !== pagination.value.size) {
      pagination.value.size = autoPageSize.value;
      console.log(
        `🔄 初始化: 设置 pageSize = ${autoPageSize.value} (${Math.floor(autoPageSize.value / 4)}列 × 4行)`,
      );
    }
    loadFiles();
  }, 100);
});
</script>

<style scoped>
.page-container {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  overflow: auto;
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

.item-count {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  margin-left: 8px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  grid-auto-rows: max-content;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
  border-top: 1px solid rgba(var(--color-border-rgb, 255, 255, 255), 0.1);
  flex-shrink: 0;
}

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
  .page-container {
    padding: 12px;
  }

  .section-container {
    padding: 16px;
  }

  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
}
</style>
