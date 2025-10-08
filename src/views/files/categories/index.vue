<script setup lang="ts">
import { h, onMounted, reactive, ref } from "vue";
import { formatDate } from "@/utils/format";
import { message } from "@/components/Message/message";
import type { ImageCategory } from "@/api/types/category";
import {
  getCategoryList,
  updateCategory,
  deleteCategory,
  batchDeleteCategories,
  updateCategoryStatus,
} from "@/api/category";
import type { TableColumn } from "@/components/Table/types";
import CategoryForm from "./components/CategoryForm.vue";
import CategoryFilterPanel from "./components/CategoryFilterPanel.vue";
import CreateCategoryDialog from "./components/CreateCategoryDialog.vue";
import BatchOperations from "./components/BatchOperations.vue";
import Table from "@/components/Table/index.vue";
import Button from "@/components/Button/index.vue";
import Dialog from "@/components/Dialog/index.vue";
import Skeleton from "@/components/Skeleton/index.vue";
import ConfirmDialog from "@/components/ConfirmDialog/index.vue";
import {
  FolderTree,
  Plus,
  RefreshCw,
  Filter,
  FolderOpen,
} from "lucide-vue-next";

const dataTableColumns: TableColumn<ImageCategory>[] = [
  {
    key: "name",
    title: "分类名称",
    width: 200,
    align: "left",
    render: (_value, record) =>
      h("div", { class: "flex flex-col" }, [
        h("div", { class: "font-medium" }, record.name),
        h(
          "div",
          { class: "text-xs", style: { color: "var(--color-text-secondary)" } },
          `ID: ${record.id}`,
        ),
      ]),
  },
  {
    key: "description",
    title: "描述",
    dataIndex: "description",
    width: 250,
    align: "left",
    ellipsis: true,
    render: (value) =>
      h(
        "span",
        { style: { color: "var(--color-text-secondary)" } },
        value || "暂无描述",
      ),
  },
  {
    key: "source",
    title: "来源",
    width: 110,
    align: "center",
    render: (_value, record) => {
      const sourceMap = {
        user: {
          text: "手动创建",
          class: "badge-purple",
        },
        ai_suggestion: {
          text: "AI建议",
          class: "badge-success",
        },
        system_template: {
          text: "系统模板",
          class: "badge-info",
        },
      };
      const source = sourceMap[record.source as keyof typeof sourceMap] || {
        text: record.source,
        class: "badge-default",
      };
      return h(
        "span",
        {
          class: `badge ${source.class}`,
        },
        source.text,
      );
    },
  },
  {
    key: "file_count",
    title: "文件数量",
    width: 100,
    align: "center",
    render: (value) =>
      h(
        "span",
        { class: "font-mono", style: { color: "var(--color-primary)" } },
        value || 0,
      ),
  },
  {
    key: "sort_order",
    title: "排序",
    width: 80,
    align: "center",
    render: (value) =>
      h(
        "span",
        { class: "font-mono", style: { color: "var(--color-text-secondary)" } },
        value,
      ),
  },
  {
    key: "status",
    title: "状态",
    width: 90,
    align: "center",
    render: (_value, record) => {
      const isActive = record.status === "active";
      return h(
        "span",
        {
          class: `badge ${isActive ? "badge-success" : "badge-muted"}`,
        },
        isActive ? "激活" : "归档",
      );
    },
  },
  {
    key: "created_at",
    title: "创建时间",
    width: 160,
    align: "center",
    render: (value) =>
      h(
        "span",
        { style: { color: "var(--color-text-secondary)" } },
        formatDate(value),
      ),
  },
  {
    key: "actions",
    title: "操作",
    width: 180,
    align: "center",
    render: (_value, record) =>
      h(
        "div",
        {
          class: "action-buttons",
          style: {
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
          },
        },
        [
          h(
            Button,
            {
              type: "secondary",
              size: "small",
              onClick: () => editCategory(record),
            },
            () => "编辑",
          ),
          h(
            Button,
            {
              type: "secondary",
              size: "small",
              onClick: () => toggleCategoryStatus(record),
            },
            () => (record.status === "active" ? "归档" : "激活"),
          ),
          h(
            Button,
            {
              type: "danger",
              size: "small",
              onClick: () => confirmDelete(record),
            },
            () => "删除",
          ),
        ],
      ),
  },
];

const categories = ref<ImageCategory[]>([]);
const loading = ref(false);
const saveLoading = ref(false);

const totalCategories = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const showFilter = ref(false);
const currentFilters = reactive({
  keyword: "",
  status: "",
  sort_by: "created_at",
  sort_order_dir: "desc",
});

const showEditDialog = ref(false);
const currentEditCategory = ref<ImageCategory | null>(null);

const showCreateDialog = ref(false);

const selectedCategoryIds = ref<number[]>([]);

// 确认对话框
const showDeleteConfirm = ref(false);
const deleteTarget = ref<ImageCategory | null>(null);

// 批量删除确认对话框
const showBatchDeleteConfirm = ref(false);

const fetchCategoryList = async () => {
  loading.value = true;

  const params = {
    page: currentPage.value,
    size: pageSize.value,
    keyword: currentFilters.keyword || undefined,
    status: (currentFilters.status as any) || undefined,
    sort_by: currentFilters.sort_by as any,
    sort_order_dir: currentFilters.sort_order_dir as "asc" | "desc",
  };

  try {
    console.log("[Category] 获取分类列表，参数:", params);
    const result = await getCategoryList(params);
    console.log("[Category] 获取分类列表结果:", result);

    if (result.success && result.data) {
      categories.value = result.data.categories;
      totalCategories.value = result.data.total;

      selectedCategoryIds.value = selectedCategoryIds.value.filter((id) =>
        categories.value.some((category) => category.id === id),
      );
      console.log("[Category] 成功加载分类:", categories.value.length);
    }
  } catch (error: any) {
    console.error("[Category] 获取分类列表失败:", error);

    // 检查是否是未登录错误
    if (error?.code === 102 || error?.message?.includes("未登录")) {
      message.warning("请先登录后再访问分类管理");
    } else {
      message.error(error?.message || "获取分类列表失败");
    }
  }

  loading.value = false;
};

const handleFilter = (filters: any) => {
  Object.assign(currentFilters, filters);
  currentPage.value = 1;
  selectedCategoryIds.value = [];
  fetchCategoryList();
  showFilter.value = false;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchCategoryList();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchCategoryList();
};

const editCategory = (category: ImageCategory) => {
  currentEditCategory.value = JSON.parse(JSON.stringify(category));
  showEditDialog.value = true;
};

const saveCategoryChanges = async () => {
  if (!currentEditCategory.value) {
    return;
  }

  saveLoading.value = true;

  try {
    const result = await updateCategory({
      id: currentEditCategory.value.id,
      name: currentEditCategory.value.name,
      description: currentEditCategory.value.description,
      sort_order: currentEditCategory.value.sort_order,
    });

    if (result.success) {
      message.success("分类已更新");
      showEditDialog.value = false;
      fetchCategoryList();
    }
  } catch {
    message.error("更新分类失败");
  }
  saveLoading.value = false;
};

const toggleCategoryStatus = async (category: ImageCategory) => {
  const newStatus = category.status === "active" ? "archived" : "active";
  const actionText = newStatus === "archived" ? "归档" : "激活";

  try {
    const result = await updateCategoryStatus({
      id: category.id,
      status: newStatus,
    });
    if (result.success) {
      message.success(`${actionText}成功`);
      fetchCategoryList();
    }
  } catch {
    message.error(`${actionText}失败`);
  }
};

const confirmDelete = (category: ImageCategory) => {
  deleteTarget.value = category;
  showDeleteConfirm.value = true;
};

const deleteCategoryItem = async () => {
  if (!deleteTarget.value) return;

  try {
    const result = await deleteCategory({ id: deleteTarget.value.id });
    if (result.success) {
      message.success("分类已删除");
      showDeleteConfirm.value = false;
      deleteTarget.value = null;
      fetchCategoryList();
    }
  } catch {
    message.error("删除分类失败");
  }
};

const handleBatchDelete = () => {
  if (selectedCategoryIds.value.length === 0) {
    message.warning("请先选择要删除的分类");
    return;
  }
  showBatchDeleteConfirm.value = true;
};

const confirmBatchDelete = async () => {
  try {
    const result = await batchDeleteCategories({
      ids: selectedCategoryIds.value,
    });
    if (result.success && result.data) {
      message.success(`成功删除 ${result.data.deleted_count} 个分类`);
      showBatchDeleteConfirm.value = false;
      selectedCategoryIds.value = [];
      fetchCategoryList();
    }
  } catch {
    message.error("批量删除失败");
  }
};

const handleRefresh = () => {
  selectedCategoryIds.value = [];
  fetchCategoryList();
};

const handleCategoryCreated = () => {
  message.success("分类创建成功");
  fetchCategoryList();
};

const handleBatchCompleted = () => {
  selectedCategoryIds.value = [];
  fetchCategoryList();
};

const handleSelectionChange = (selectedRows: (string | number)[]) => {
  selectedCategoryIds.value = selectedRows.map((id) => Number(id));
};

onMounted(() => {
  fetchCategoryList();
});
</script>

<template>
  <div class="category-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <FolderTree :size="24" :stroke-width="2" />
          </div>
          <div class="header-info">
            <h1 class="page-title">
              分类管理
              <span class="category-count">{{ totalCategories }} 个分类</span>
            </h1>
            <p class="page-desc">管理您的文件分类，组织和整理您的资源</p>
          </div>
        </div>

        <div class="header-actions">
          <Button type="primary" size="small" @click="showCreateDialog = true">
            <template #icon>
              <Plus :size="14" :stroke-width="2" />
            </template>
            新建分类
          </Button>

          <Button
            type="secondary"
            size="small"
            :loading="loading"
            @click="handleRefresh"
          >
            <template #icon>
              <RefreshCw :size="14" :stroke-width="2" />
            </template>
            刷新
          </Button>

          <Button
            type="secondary"
            size="small"
            :class="{ active: showFilter }"
            @click="showFilter = !showFilter"
          >
            <template #icon>
              <Filter :size="14" :stroke-width="2" />
            </template>
            筛选
          </Button>
        </div>
      </div>
    </div>

    <Transition name="filter-slide">
      <CategoryFilterPanel
        v-if="showFilter"
        :initial-filters="currentFilters"
        @filter="handleFilter"
      />
    </Transition>

    <BatchOperations
      v-if="selectedCategoryIds.length > 0"
      :selected-categories="selectedCategoryIds"
      :all-categories="categories"
      @clear-selection="() => (selectedCategoryIds = [])"
      @batch-delete="handleBatchDelete"
      @batch-completed="handleBatchCompleted"
    />

    <!-- 数据表格 -->
    <div class="table-container">
      <Skeleton type="table" :count="pageSize" :loading="loading">
        <!-- 空状态 -->
        <div v-if="!loading && categories.length === 0" class="empty-state">
          <div class="empty-icon">
            <FolderOpen
              :size="48"
              :stroke-width="1.5"
              style="color: var(--color-text-muted)"
            />
          </div>
          <h3 class="empty-title">暂无分类数据</h3>
          <p class="empty-desc">
            还没有创建任何分类，点击「新建分类」按钮开始创建您的第一个分类
          </p>
          <Button type="primary" size="small" @click="showCreateDialog = true">
            <template #icon>
              <Plus :size="14" :stroke-width="2" />
            </template>
            新建分类
          </Button>
        </div>

        <Table
          v-if="!loading && categories.length > 0"
          :data="categories"
          :columns="dataTableColumns"
          :loading="loading"
          :selectable="true"
          :hoverable="true"
          :striped="true"
          :bordered="true"
          size="medium"
          max-height="calc(100vh - 280px)"
          row-key="id"
          :selected-row-keys="selectedCategoryIds"
          loading-text="正在加载分类数据..."
          :pagination="{
            current: currentPage,
            pageSize: pageSize,
            total: totalCategories,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: [10, 20, 50, 100],
          }"
          @update:selected-row-keys="handleSelectionChange"
          @page-change="handlePageChange"
          @page-size-change="handlePageSizeChange"
        />
      </Skeleton>
    </div>

    <!-- 编辑对话框 -->
    <Dialog v-model="showEditDialog" title="编辑分类" width="500px">
      <CategoryForm v-model="currentEditCategory" />

      <template #footer>
        <div class="dialog-footer">
          <Button type="secondary" size="small" @click="showEditDialog = false"
            >取消</Button
          >
          <Button
            type="primary"
            size="small"
            :loading="saveLoading"
            @click="saveCategoryChanges"
          >
            保存更改
          </Button>
        </div>
      </template>
    </Dialog>

    <!-- 创建对话框 -->
    <CreateCategoryDialog
      v-model="showCreateDialog"
      @category-created="handleCategoryCreated"
    />

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除分类「${deleteTarget?.name}」吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="deleteCategoryItem"
      @cancel="() => (deleteTarget = null)"
    />

    <!-- 批量删除确认对话框 -->
    <ConfirmDialog
      v-model="showBatchDeleteConfirm"
      title="批量删除"
      :message="`确定要删除选中的 ${selectedCategoryIds.length} 个分类吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      type="danger"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>

<style scoped>
.category-manage-page {
  padding: 24px;
  width: 100%;
}

/* 页面头部 */
.page-header {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  font-size: 20px;
}

.header-icon :deep(svg) {
  color: #3b82f6;
  stroke-width: 2;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-secondary, #9ca3af);
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-count {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #60a5fa;
}

.page-desc {
  font-size: 13px;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-actions .active {
  border-color: var(--color-primary) !important;
  color: var(--color-primary) !important;
  background: var(--color-primary-hover) !important;
}

/* 表格容器 */
.table-container {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.table-container :deep(.cyber-table) {
  border-top: 1px solid var(--color-border);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-primary-hover, rgba(59, 130, 246, 0.1));
  border-radius: 50%;
  font-size: 28px;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.empty-icon :deep(svg) {
  color: var(--color-text-muted, #9ca3af);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  max-width: 400px;
  margin: 0 0 20px 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* 对话框脚部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
}

/* 工具类 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-1\.5 {
  gap: 6px;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.font-medium {
  font-weight: 500;
}

.font-mono {
  font-family:
    "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New",
    monospace;
}

.text-xs {
  font-size: 12px;
}

.inline-flex {
  display: inline-flex;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.rounded-md {
  border-radius: 6px;
}

/* Badge 徽章样式 */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  white-space: nowrap;
  transition: all 0.2s;
}

.badge-purple {
  background: var(--color-secondary-bg, rgba(139, 92, 246, 0.1));
  color: var(--color-secondary, #8b5cf6);
  border-color: var(--color-secondary-border, rgba(139, 92, 246, 0.3));
}

.badge-success {
  background: var(--color-success-bg, rgba(16, 185, 129, 0.1));
  color: var(--color-success);
  border-color: var(--color-success-border, rgba(16, 185, 129, 0.3));
}

.badge-info {
  background: var(--color-info-bg, rgba(59, 130, 246, 0.1));
  color: var(--color-info);
  border-color: var(--color-info-border, rgba(59, 130, 246, 0.3));
}

.badge-muted {
  background: var(--color-bg-hover);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.badge-default {
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

/* 筛选面板过渡动画 */
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition: all 0.3s ease;
}

.filter-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.filter-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
