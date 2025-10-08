<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h3 class="filter-title">筛选条件</h3>
    </div>

    <div class="filter-content">
      <!-- 关键词搜索 -->
      <div class="filter-group">
        <label class="filter-label">关键词</label>
        <Input
          v-model="filters.keyword"
          size="small"
          placeholder="搜索分类名称..."
          clearable
        />
      </div>

      <!-- 状态筛选 -->
      <div class="filter-group">
        <label class="filter-label">状态</label>
        <Dropdown
          v-model="filters.status"
          size="small"
          :options="statusOptions"
          placeholder="全部状态"
          width="100%"
        />
      </div>

      <!-- 排序字段 -->
      <div class="filter-group">
        <label class="filter-label">排序字段</label>
        <Dropdown
          v-model="filters.sort_by"
          size="small"
          :options="sortByOptions"
          placeholder="排序"
          width="100%"
        />
      </div>

      <!-- 排序方向 -->
      <div class="filter-group">
        <label class="filter-label">排序方向</label>
        <Dropdown
          v-model="filters.sort_order_dir"
          size="small"
          :options="sortOrderOptions"
          placeholder="升序"
          width="100%"
        />
      </div>
    </div>

    <div class="filter-actions">
      <Button type="secondary" size="small" @click="handleReset">
        <template #icon>
          <RefreshCw :size="14" :stroke-width="2" />
        </template>
        重置
      </Button>
      <Button type="primary" size="small" @click="handleApply">
        <template #icon>
          <Check :size="14" :stroke-width="2" />
        </template>
        应用筛选
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import Input from "@/components/Input/index.vue";
import Button from "@/components/Button/index.vue";
import Dropdown from "@/components/Dropdown/index.vue";
import { RefreshCw, Check } from "lucide-vue-next";
import {
  CATEGORY_STATUS_OPTIONS,
  CATEGORY_SORT_BY_OPTIONS,
  CATEGORY_SORT_ORDER_OPTIONS,
} from "@/constants/category";

interface FilterPanelProps {
  initialFilters?: {
    keyword?: string;
    status?: string;
    sort_by?: string;
    sort_order_dir?: string;
  };
}

interface FilterPanelEmits {
  (e: "filter", filters: any): void;
}

const props = withDefaults(defineProps<FilterPanelProps>(), {
  initialFilters: () => ({}),
});

const emit = defineEmits<FilterPanelEmits>();

const filters = reactive({
  keyword: props.initialFilters?.keyword || "",
  status: props.initialFilters?.status || "",
  sort_by: props.initialFilters?.sort_by || "sort_order",
  sort_order_dir: props.initialFilters?.sort_order_dir || "asc",
});

// 下拉选项（使用常量）
const statusOptions = CATEGORY_STATUS_OPTIONS;
const sortByOptions = CATEGORY_SORT_BY_OPTIONS;
const sortOrderOptions = CATEGORY_SORT_ORDER_OPTIONS;

const handleReset = () => {
  filters.keyword = "";
  filters.status = "";
  filters.sort_by = "sort_order";
  filters.sort_order_dir = "asc";
};

const handleApply = () => {
  emit("filter", { ...filters });
};
</script>

<style scoped>
.filter-panel {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.filter-header {
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.filter-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}
</style>
