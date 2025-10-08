<template>
  <Dialog v-model="visible" title="新建分类" width="500px">
    <div class="create-category-form">
      <!-- 分类名称 -->
      <div class="form-group">
        <label class="form-label">
          分类名称
          <span class="required">*</span>
        </label>
        <Input
          v-model="formData.name"
          placeholder="请输入分类名称"
          :maxlength="50"
        />
      </div>

      <!-- 描述 -->
      <div class="form-group">
        <label class="form-label">描述</label>
        <textarea
          v-model="formData.description"
          class="form-textarea"
          placeholder="请输入分类描述（可选）"
          rows="4"
          maxlength="200"
        ></textarea>
        <div class="char-count">
          {{ (formData.description || "").length }} / 200
        </div>
      </div>

      <!-- 排序 -->
      <div class="form-group">
        <label class="form-label">排序</label>
        <Input
          v-model.number="formData.sort_order"
          type="number"
          placeholder="排序值（数字越小越靠前）"
          :min="0"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <Button type="secondary" size="small" @click="handleCancel"
          >取消</Button
        >
        <Button
          type="primary"
          size="small"
          :loading="loading"
          :disabled="!formData.name"
          @click="handleCreate"
        >
          创建
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import Dialog from "@/components/Dialog/index.vue";
import Input from "@/components/Input/index.vue";
import Button from "@/components/Button/index.vue";
import { createCategory } from "@/api/category";
import { message } from "@/components/Message/message";

interface CreateCategoryDialogProps {
  modelValue: boolean;
}

interface CreateCategoryDialogEmits {
  (e: "update:modelValue", value: boolean): void;
  (e: "category-created"): void;
}

const props = defineProps<CreateCategoryDialogProps>();
const emit = defineEmits<CreateCategoryDialogEmits>();

const visible = ref(props.modelValue);
const loading = ref(false);

const formData = reactive({
  name: "",
  description: "",
  sort_order: 0,
});

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    if (val) {
      // 重置表单
      formData.name = "";
      formData.description = "";
      formData.sort_order = 0;
    }
  },
);

watch(visible, (val) => {
  emit("update:modelValue", val);
});

const handleCancel = () => {
  visible.value = false;
};

const handleCreate = async () => {
  if (!formData.name) {
    message.warning("请输入分类名称");
    return;
  }

  loading.value = true;

  try {
    const result = await createCategory({
      name: formData.name,
      description: formData.description || undefined,
      sort_order: formData.sort_order,
    });

    if (result.success) {
      message.success("分类创建成功");
      visible.value = false;
      emit("category-created");
    }
  } catch {
    message.error("创建分类失败");
  }

  loading.value = false;
};
</script>

<style scoped>
.create-category-form {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
}
</style>
