<template>
  <div class="batch-operations">
    <div class="batch-info">
      <span class="selected-count"
        >已选择 {{ selectedCategories.length }} 项</span
      >
      <button class="clear-btn" @click="emit('clear-selection')">
        <X :size="14" :stroke-width="2" />
        清除选择
      </button>
    </div>

    <div class="batch-actions">
      <Button type="danger" size="small" @click="emit('batch-delete')">
        <template #icon>
          <Trash2 :size="14" :stroke-width="2" />
        </template>
        批量删除
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/Button/index.vue";
import type { ImageCategory } from "@/api/types/category";
import { X, Trash2 } from "lucide-vue-next";

interface BatchOperationsProps {
  selectedCategories: number[];
  allCategories: ImageCategory[];
}

interface BatchOperationsEmits {
  (e: "clear-selection"): void;
  (e: "batch-delete"): void;
  (e: "batch-completed"): void;
}

defineProps<BatchOperationsProps>();
const emit = defineEmits<BatchOperationsEmits>();
</script>

<style scoped>
.batch-operations {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--color-primary-hover);
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  margin-bottom: 16px;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-count {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-bg-hover);
}

.batch-actions {
  display: flex;
  gap: 12px;
}
</style>
