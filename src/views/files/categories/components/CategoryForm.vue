<template>
  <div v-if="formState" class="category-form">
    <!-- 分类名称 -->
    <div class="form-group">
      <label class="form-label">
        分类名称
        <span class="required">*</span>
      </label>
      <Input
        v-model="formState.name"
        placeholder="请输入分类名称"
        :maxlength="50"
      />
    </div>

    <!-- 描述 -->
    <div class="form-group">
      <label class="form-label">描述</label>
      <textarea
        v-model="formState.description"
        class="form-textarea"
        placeholder="请输入分类描述（可选）"
        rows="4"
        maxlength="200"
      ></textarea>
      <div class="char-count">
        {{ (formState.description || "").length }} / 200
      </div>
    </div>

    <!-- 排序 -->
    <div class="form-group">
      <label class="form-label">排序</label>
      <Input
        v-model.number="formState.sort_order"
        type="number"
        placeholder="排序值（数字越小越靠前）"
        :min="0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Input from "@/components/Input/index.vue";
import type { ImageCategory } from "@/api/types/category";

interface CategoryFormProps {
  modelValue: ImageCategory | null;
}

const props = defineProps<CategoryFormProps>();

const emit = defineEmits<{
  (event: "update:modelValue", value: ImageCategory | null): void;
}>();

const formState = ref<ImageCategory | null>(null);

let syncingFromProps = false;

watch(
  () => props.modelValue,
  (value) => {
    syncingFromProps = true;
    formState.value = value ? { ...value } : null;
  },
  { immediate: true, deep: true },
);

watch(
  formState,
  (value) => {
    if (syncingFromProps) {
      syncingFromProps = false;
      return;
    }
    emit("update:modelValue", value ? { ...value } : null);
  },
  { deep: true },
);
</script>

<style scoped>
.category-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary, #f3f4f6);
}

.required {
  color: var(--color-danger, #ef4444);
  margin-left: 4px;
}

.form-textarea {
  padding: 10px 12px;
  background: var(--color-bg-elevated, #1e293b);
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  color: var(--color-text-primary, #f3f4f6);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
}

.form-textarea:hover {
  border-color: var(--color-border-hover, #4b5563);
}

.form-textarea:focus {
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-textarea::placeholder {
  color: var(--color-text-tertiary, #6b7280);
}

.char-count {
  font-size: 12px;
  color: var(--color-text-tertiary, #6b7280);
  text-align: right;
}
</style>
