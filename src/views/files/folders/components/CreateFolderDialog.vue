<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import Input from "@/components/Input/index.vue";
import Dialog from "@/components/Dialog/index.vue";
import Button from "@/components/Button/index.vue";
import { message } from "@/components/Message/message";
import { createFolder, updateFolder } from "@/api/folder";
import type { FolderInfo } from "@/api/types";

interface Props {
  modelValue: boolean;
  parentId?: string;
  mode?: "create" | "edit";
  folder?: FolderInfo;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "created", folder: FolderInfo): void;
  (e: "updated", folder: FolderInfo): void;
}>();

const isEditMode = computed(() => props.mode === "edit");

const form = ref<{
  name: string;
  permission: "public" | "private";
  description: string;
  parent_id?: string;
}>({
  name: "",
  permission: "public",
  description: "",
  parent_id: props.parentId,
});

const errors = ref({
  name: "",
});

const confirmLoading = ref(false);
const nameInput = ref<InstanceType<typeof Input> | null>(null);

const validateName = () => {
  if (!form.value?.name?.trim()) {
    errors.value.name = "请输入文件夹名称";
    return false;
  } else if (form.value.name.length > 30) {
    errors.value.name = "文件夹名称不能超过30个字符";
    return false;
  }
  errors.value.name = "";
  return true;
};

const isFormValid = computed(
  () => form.value?.name?.trim() !== "" && !errors.value.name,
);

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const resetForm = () => {
  form.value = {
    name: "",
    permission: "public",
    description: "",
    parent_id: props.parentId,
  };
  errors.value = {
    name: "",
  };
};

const initEditForm = () => {
  if (props.folder) {
    form.value = {
      name: props.folder.name || "",
      parent_id: props.folder.parent_id,
      permission: props.folder.permission || "public",
      description: props.folder.description || "",
    };
  }
};

const handleConfirm = async () => {
  if (!validateName() || confirmLoading.value) {
    return;
  }

  confirmLoading.value = true;

  try {
    if (isEditMode.value && props.folder?.id) {
      const result = await updateFolder(props.folder.id, form.value);

      if (result.success && result.data) {
        emit("updated", result.data);
        resetForm();
        visible.value = false;
        message.success("文件夹更新成功");
      } else {
        message.error(result.message || "文件夹更新失败");
      }
    } else {
      const result = await createFolder(form.value);

      if (result.success && result.data) {
        emit("created", result.data);
        resetForm();
        visible.value = false;
        message.success("文件夹创建成功");
      } else {
        message.error(result.message || "文件夹创建失败");
      }
    }
  } catch (error) {
    console.error("文件夹操作失败:", error);
    message.error("操作失败，请重试");
  }

  confirmLoading.value = false;
};

const handleCancel = () => {
  resetForm();
  visible.value = false;
};

watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        nameInput.value?.focus();

        if (isEditMode.value) {
          initEditForm();
        } else {
          resetForm();
        }
      });
    }
  },
);

watch(
  () => props.parentId,
  (newVal) => {
    if (!isEditMode.value && form.value) {
      form.value.parent_id = newVal;
    }
  },
);

watch(
  () => props.folder,
  (newVal) => {
    if (isEditMode.value && newVal) {
      initEditForm();
    }
  },
);
</script>

<template>
  <Dialog
    v-model="visible"
    :title="isEditMode ? '编辑文件夹' : '新建文件夹'"
    :loading="confirmLoading"
    width="450px"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <form class="create-folder-form" @submit.prevent="handleConfirm">
      <div class="form-item">
        <label class="form-label">
          <span class="required">*</span> 文件夹名称
        </label>
        <div class="form-control">
          <Input
            ref="nameInput"
            v-model="form.name"
            placeholder="请输入文件夹名称"
            :error="!!errors.name"
            :error-message="errors.name"
            clearable
            @input="validateName"
          />
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">权限设置</label>
        <div class="form-control">
          <div class="permission-options">
            <label
              class="permission-option"
              :class="{ active: form.permission === 'public' }"
            >
              <input
                v-model="form.permission"
                type="radio"
                name="permission"
                value="public"
              />
              <div class="permission-icon">
                <i class="fas fa-globe" />
              </div>
              <div class="permission-details">
                <div class="permission-name">公开</div>
                <div class="permission-desc">他人进入我的主页可观看内容</div>
              </div>
            </label>

            <label
              class="permission-option"
              :class="{ active: form.permission === 'private' }"
            >
              <input
                v-model="form.permission"
                type="radio"
                name="permission"
                value="private"
              />
              <div class="permission-icon">
                <i class="fas fa-lock" />
              </div>
              <div class="permission-details">
                <div class="permission-name">私密</div>
                <div class="permission-desc">对他人不展示此文件夹</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="form-item">
        <label class="form-label">描述（可选）</label>
        <div class="form-control">
          <Input
            v-model="form.description"
            type="textarea"
            placeholder="添加文件夹描述"
            :rows="3"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <div class="dialog-footer-actions">
        <Button type="outlined" @click="handleCancel"> 取消 </Button>
        <Button
          type="primary"
          :loading="confirmLoading"
          :disabled="!isFormValid"
          @click="handleConfirm"
        >
          <template #icon>
            <i :class="isEditMode ? 'fas fa-edit' : 'fas fa-folder-plus'" />
          </template>
          {{ isEditMode ? "保存" : "创建" }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.create-folder-form {
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.form-item {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
  letter-spacing: 0.025em;
}

.required {
  color: rgb(255, 110, 199);
  margin-right: 4px;
  font-weight: 700;
  text-shadow: 0 0 4px rgba(255, 110, 199, 0.4);
}

.form-control {
  position: relative;
}

.permission-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.permission-option {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.05);
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.permission-option input {
  position: absolute;
  opacity: 0;
}

.permission-option:hover {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  border-color: rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.permission-option.active {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.12);
  border-color: var(--color-primary);
  box-shadow:
    0 0 25px rgba(var(--color-primary-rgb, 5, 217, 232), 0.25),
    inset 0 1px 0 rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    0 4px 15px rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  transform: translateY(-1px);
}

.permission-option.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-primary),
    rgb(255, 110, 199),
    var(--color-primary)
  );
  background-size: 200% 100%;
}

.permission-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  color: var(--color-primary);
  margin-right: 0.75rem;
  transition: all 0.3s ease;
  font-size: 1rem;
  border: 1px solid rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  flex-shrink: 0;
}

.permission-option.active .permission-icon {
  background: linear-gradient(135deg, var(--color-primary), rgb(255, 110, 199));
  color: var(--color-white);
  box-shadow:
    0 4px 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.4),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  transform: scale(1.05);
  border-color: var(--color-primary);
}

.permission-details {
  flex: 1;
}

.permission-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
  font-size: 0.95rem;
  letter-spacing: 0.015em;
}

.permission-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
  opacity: 0.85;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
}

@media (max-width: 640px) {
  .permission-options {
    flex-direction: column;
    gap: 0.75rem;
  }

  .permission-option {
    padding: 1rem;
  }

  .permission-icon {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }

  .form-label {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
}
</style>
