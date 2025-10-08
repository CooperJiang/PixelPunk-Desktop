<template>
  <div class="cyber-table" :class="{ loading: loading }">
    <!-- 表格容器 -->
    <div
      class="table-wrapper"
      :style="{
        maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
      }"
    >
      <table
        :class="[
          'table',
          {
            bordered: bordered,
            striped: striped,
            hoverable: hoverable,
            [`table-${size}`]: size,
          },
        ]"
      >
        <!-- 表头 -->
        <thead>
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <!-- 选择列 -->
            <th v-if="selectable" class="selection-cell">
              <Checkbox
                :model-value="table.getIsAllRowsSelected()"
                :indeterminate="table.getIsSomeRowsSelected()"
                @update:model-value="table.toggleAllRowsSelected()"
              />
            </th>

            <!-- 数据列 -->
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="[
                'table-cell',
                {
                  sortable: header.column.columnDef.meta?.sortable,
                  'text-center':
                    header.column.columnDef.meta?.align === 'center',
                  'text-right': header.column.columnDef.meta?.align === 'right',
                },
              ]"
              :style="{
                width: header.column.columnDef.meta?.width,
                minWidth: header.column.columnDef.meta?.minWidth
                  ? `${header.column.columnDef.meta.minWidth}px`
                  : undefined,
                maxWidth: header.column.columnDef.meta?.maxWidth
                  ? `${header.column.columnDef.meta.maxWidth}px`
                  : undefined,
              }"
              @click="handleSort(header)"
            >
              <div class="header-content">
                <span>{{ header.column.columnDef.header }}</span>
                <span
                  v-if="header.column.columnDef.meta?.sortable"
                  class="sort-icon"
                >
                  <span v-if="header.column.getIsSorted() === 'asc'">↑</span>
                  <span v-else-if="header.column.getIsSorted() === 'desc'"
                    >↓</span
                  >
                  <span v-else class="sort-default">↕</span>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <template v-if="!loading && table.getRowModel().rows.length > 0">
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :class="{ selected: row.getIsSelected() }"
              @click="handleRowClick(row)"
            >
              <!-- 选择列 -->
              <td v-if="selectable" class="selection-cell" @click.stop>
                <Checkbox
                  :model-value="row.getIsSelected()"
                  @update:model-value="row.toggleSelected()"
                />
              </td>

              <!-- 数据列 -->
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="[
                  'table-cell',
                  {
                    'text-center':
                      cell.column.columnDef.meta?.align === 'center',
                    'text-right': cell.column.columnDef.meta?.align === 'right',
                    ellipsis: cell.column.columnDef.meta?.ellipsis,
                  },
                ]"
              >
                <component
                  :is="renderCell(cell)"
                  v-if="cell.column.columnDef.cell"
                ></component>
                <span v-else>{{ cell.getValue() }}</span>
              </td>
            </tr>
          </template>

          <!-- 空数据 -->
          <tr v-else-if="!loading">
            <td :colspan="columnCount" class="empty-cell">
              <div class="empty-state">
                <span>{{ emptyText || "暂无数据" }}</span>
              </div>
            </td>
          </tr>

          <!-- 加载中 -->
          <tr v-if="loading">
            <td :colspan="columnCount" class="loading-cell">
              <div class="loading-state">
                <span>{{ loadingText || "加载中..." }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页器 -->
    <div v-if="pagination && pagination !== false" class="table-pagination">
      <div class="pagination-info">共 {{ pagination.total }} 条</div>

      <div class="pagination-controls">
        <button
          class="pagination-btn"
          :disabled="pagination.current === 1"
          @click="handlePageChange(pagination.current - 1)"
        >
          上一页
        </button>

        <div class="pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[
              'pagination-page',
              { active: page === pagination.current },
            ]"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>

        <button
          class="pagination-btn"
          :disabled="pagination.current >= totalPages"
          @click="handlePageChange(pagination.current + 1)"
        >
          下一页
        </button>
      </div>

      <div v-if="pagination.showSizeChanger" class="pagination-size">
        <Dropdown
          v-model="currentPageSize"
          :options="pageSizeOptions"
          size="small"
          width="110px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, watch, ref } from "vue";
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/vue-table";
import type { TableProps, TableEmits, TableColumn } from "./types";
import Checkbox from "@/components/Checkbox/index.vue";
import Dropdown from "@/components/Dropdown/index.vue";

const props = withDefaults(defineProps<TableProps<T>>(), {
  loading: false,
  loadingText: "加载中...",
  rowKey: "id",
  selectable: false,
  selectedRowKeys: () => [],
  pagination: false,
  bordered: false,
  striped: false,
  hoverable: true,
  size: "medium",
  emptyText: "暂无数据",
});

const emit = defineEmits<TableEmits<T>>();

// 分页大小选项
const pageSizeOptions = computed(() => {
  if (!props.pagination || props.pagination === false) return [];
  return (props.pagination.pageSizeOptions || [10, 20, 50, 100]).map(
    (size) => ({
      label: `${size} 条/页`,
      value: size,
    }),
  );
});

const currentPageSize = computed({
  get: () =>
    props.pagination && props.pagination !== false
      ? props.pagination.pageSize
      : 10,
  set: (value: number) => {
    emit("page-size-change", value);
  },
});

// 处理列定义
const columnDefs = computed<ColumnDef<T, any>[]>(() => {
  return props.columns.map((col: TableColumn<T>) => ({
    id: col.key,
    accessorKey: col.dataIndex || col.key,
    header: col.title,
    cell: col.render
      ? ({ getValue, row }) => {
          const value = getValue();
          const record = row.original;
          const index = row.index;
          return col.render!(value, record, index);
        }
      : undefined,
    meta: {
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      align: col.align,
      sortable: col.sortable,
      ellipsis: col.ellipsis,
    },
    enableSorting: col.sortable,
  }));
});

// 行选择状态
const rowSelection = computed<RowSelectionState>(() => {
  const selection: RowSelectionState = {};
  if (props.selectable && props.selectedRowKeys) {
    props.data.forEach((row, index) => {
      const key = getRowKey(row, index);
      if (props.selectedRowKeys?.includes(key)) {
        selection[index] = true;
      }
    });
  }
  return selection;
});

// 排序状态
const sorting = computed<SortingState>(() => {
  if (props.sortBy && props.sortOrder) {
    return [{ id: props.sortBy, desc: props.sortOrder === "desc" }];
  }
  return [];
});

// 创建表格实例
const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return columnDefs.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: props.pagination ? getPaginationRowModel() : undefined,
  state: {
    get rowSelection() {
      return rowSelection.value;
    },
    get sorting() {
      return sorting.value;
    },
  },
  enableRowSelection: props.selectable,
  onRowSelectionChange: (updater) => {
    const newSelection =
      typeof updater === "function" ? updater(rowSelection.value) : updater;
    const selectedKeys = Object.keys(newSelection)
      .filter((key) => newSelection[key])
      .map((key) => {
        const index = parseInt(key);
        return getRowKey(props.data[index], index);
      });
    emit("update:selectedRowKeys", selectedKeys);
  },
  manualPagination: !!props.pagination,
  pageCount: props.pagination
    ? Math.ceil(props.pagination.total / props.pagination.pageSize)
    : undefined,
});

// 获取行键
const getRowKey = (record: T, index: number): string | number => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(record);
  }
  return (record as any)[props.rowKey] || index;
};

// 列数
const columnCount = computed(() => {
  let count = props.columns.length;
  if (props.selectable) count += 1;
  return count;
});

// 总页数
const totalPages = computed(() => {
  if (!props.pagination || props.pagination === false) return 0;
  return Math.ceil(props.pagination.total / props.pagination.pageSize);
});

// 可见页码
const visiblePages = computed(() => {
  if (!props.pagination || props.pagination === false) return [];
  const current = props.pagination.current;
  const total = totalPages.value;
  const pages: number[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i);
      }
      pages.push(total);
    }
  }

  return pages;
});

// 渲染单元格
const renderCell = (cell: any) => {
  const cellFn = cell.column.columnDef.cell;
  if (typeof cellFn === "function") {
    return cellFn(cell.getContext());
  }
  return cell.getValue();
};

// 处理排序
const handleSort = (header: any) => {
  if (!header.column.columnDef.meta?.sortable) return;

  const currentSort = header.column.getIsSorted();
  let newOrder: "asc" | "desc" | null = null;

  if (!currentSort) {
    newOrder = "asc";
  } else if (currentSort === "asc") {
    newOrder = "desc";
  } else {
    newOrder = null;
  }

  emit("sort-change", header.column.id, newOrder);
};

// 处理行点击
const handleRowClick = (row: any) => {
  emit("row-click", row.original, row.index);
};

// 处理分页变化
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  emit("page-change", page);
};

// 处理每页大小变化
const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const size = parseInt(target.value);
  emit("page-size-change", size);
};

// 监听行选择变化
watch(
  () => table.getSelectedRowModel().rows,
  (newRows) => {
    if (props.selectable) {
      const selectedKeys = newRows.map((row) =>
        getRowKey(row.original, row.index),
      );
      emit("update:selectedRowKeys", selectedKeys);
    }
  },
);

// 暴露实例方法
defineExpose({
  scrollTo: (options: { top?: number; left?: number }) => {
    const wrapper = document.querySelector(".table-wrapper") as HTMLElement;
    if (wrapper) {
      if (options.top !== undefined) wrapper.scrollTop = options.top;
      if (options.left !== undefined) wrapper.scrollLeft = options.left;
    }
  },
  clearSelection: () => {
    table.resetRowSelection();
  },
  toggleRowSelection: (row: any, selected?: boolean) => {
    const index = props.data.findIndex((item) => item === row);
    if (index !== -1) {
      table.getRow(index.toString()).toggleSelected(selected);
    }
  },
});
</script>

<style scoped>
.cyber-table {
  width: 100%;
  background: var(--color-bg-elevated);
  border-radius: 8px;
  overflow: hidden;
}

.table-wrapper {
  overflow: auto;
  border-radius: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: var(--color-text-primary);
}

/* 表头样式 */
.table thead {
  background: var(--color-bg-elevated);
  position: sticky;
  top: 0;
  z-index: 10;
}

.table thead th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
  user-select: none;
}

.table thead th.sortable {
  cursor: pointer;
  transition: background 0.2s;
}

.table thead th.sortable:hover {
  background: var(--color-bg-hover);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-icon {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.sort-default {
  opacity: 0.4;
}

/* 表体样式 */
.table tbody tr {
  transition: background 0.2s;
}

.table.hoverable tbody tr:hover {
  background: var(--color-bg-hover);
}

.table.striped tbody tr:nth-child(even) {
  background: var(--color-bg-base);
}

.table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.table.bordered {
  border: 1px solid var(--color-border);
}

.table.bordered th,
.table.bordered td {
  border-right: 1px solid var(--color-border);
}

.table.bordered th:last-child,
.table.bordered td:last-child {
  border-right: none;
}

/* 对齐方式 */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* 省略号 */
.ellipsis {
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 选择列 */
.selection-cell {
  width: 48px;
  text-align: center;
  vertical-align: middle;
}

/* 空状态 */
.empty-cell,
.loading-cell {
  text-align: center;
  padding: 48px 16px;
}

.empty-state,
.loading-state {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 尺寸变体 */
.table-small tbody td,
.table-small thead th {
  padding: 8px 12px;
  font-size: 13px;
}

.table-large tbody td,
.table-large thead th {
  padding: 16px 20px;
  font-size: 15px;
}

/* 分页器 */
.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid var(--color-border);
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.pagination-page {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-page:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-page.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.pagination-size {
  display: flex;
  align-items: center;
}

/* 加载状态 */
.cyber-table.loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>
