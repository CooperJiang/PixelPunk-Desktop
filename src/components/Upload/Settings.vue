<script setup lang="ts">
import { ref, watch } from "vue";
import Dropdown from "@/components/Dropdown/index.vue";
import FolderTree from "@/components/FolderTree/index.vue";
import Tooltip from "@/components/Tooltip/index.vue";

interface Props {
  folderId?: string;
  accessLevel?: "public" | "private" | "protected";
  optimize?: boolean;
  autoRemove?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  folderId: "",
  accessLevel: "private",
  optimize: true,
  autoRemove: false,
});

const emit = defineEmits<{
  "update:folderId": [value: string];
  "update:accessLevel": [value: "public" | "private" | "protected"];
  "update:optimize": [value: boolean];
  "update:autoRemove": [value: boolean];
  change: [
    settings: {
      folderId: string;
      accessLevel: "public" | "private" | "protected";
      optimize: boolean;
      autoRemove: boolean;
    },
  ];
}>();

// 本地状态
const localFolderId = ref(props.folderId);
const localAccessLevel = ref(props.accessLevel);
const localOptimize = ref(props.optimize);
const localAutoRemove = ref(props.autoRemove);

// 访问权限选项
const accessLevelOptions = [
  {
    label: "🌍 公开",
    value: "public",
  },
  {
    label: "🔗 私有",
    value: "private",
  },
  {
    label: "🔒 受保护",
    value: "protected",
  },
];

// 监听本地状态变化
watch(localFolderId, (newValue) => {
  emit("update:folderId", newValue);
  emitChangeEvent();
});

watch(localAccessLevel, (newValue) => {
  emit("update:accessLevel", newValue as "public" | "private" | "protected");
  emitChangeEvent();
});

watch(localOptimize, (newValue) => {
  emit("update:optimize", newValue);
  emitChangeEvent();
});

watch(localAutoRemove, (newValue) => {
  emit("update:autoRemove", newValue);
  emitChangeEvent();
});

// 发送 change 事件
const emitChangeEvent = () => {
  emit("change", {
    folderId: localFolderId.value,
    accessLevel: localAccessLevel.value as "public" | "private" | "protected",
    optimize: localOptimize.value,
    autoRemove: localAutoRemove.value,
  });
};

// 监听 props 变化
watch(
  () => props.folderId,
  (newValue) => {
    if (newValue !== localFolderId.value) {
      localFolderId.value = newValue;
    }
  },
);

watch(
  () => props.accessLevel,
  (newValue) => {
    if (newValue !== localAccessLevel.value) {
      localAccessLevel.value = newValue;
    }
  },
);

watch(
  () => props.optimize,
  (newValue) => {
    if (newValue !== localOptimize.value) {
      localOptimize.value = newValue;
    }
  },
);

watch(
  () => props.autoRemove,
  (newValue) => {
    if (newValue !== localAutoRemove.value) {
      localAutoRemove.value = newValue;
    }
  },
);

// 获取访问权限帮助文本
const getAccessLevelHelp = () => {
  if (localAccessLevel.value === "public") {
    return "可被推荐展示，任何人可通过链接访问";
  } else if (localAccessLevel.value === "private") {
    return "不会被推荐，但可正常分享和外部引用";
  } else {
    return "只有您登录后可见，外部链接无法访问";
  }
};
</script>

<template>
  <div class="upload-settings">
    <!-- 文件夹选择 -->
    <div class="upload-settings__group">
      <div class="upload-settings__label-row">
        <label class="upload-settings__label">保存位置</label>
        <Tooltip content="选择文件上传后的保存位置" />
      </div>
      <FolderTree v-model="localFolderId" placeholder="根目录" />
    </div>

    <!-- 访问权限 -->
    <div class="upload-settings__group">
      <div class="upload-settings__label-row">
        <label class="upload-settings__label">访问权限</label>
        <Tooltip :content="getAccessLevelHelp()" />
      </div>
      <Dropdown
        v-model="localAccessLevel"
        :options="accessLevelOptions"
        placeholder="选择访问权限"
      />
    </div>

    <!-- 自动优化 -->
    <div class="upload-settings__group">
      <div class="upload-settings__label-row">
        <label class="upload-settings__checkbox">
          <input
            v-model="localOptimize"
            type="checkbox"
            class="upload-settings__checkbox-input"
          />
          <span class="upload-settings__checkbox-label">自动优化文件</span>
        </label>
        <Tooltip content="自动压缩和优化缩略图，减小文件大小而不明显降低质量" />
      </div>
    </div>

    <!-- 上传成功后自动移除 -->
    <div class="upload-settings__group">
      <div class="upload-settings__label-row">
        <label class="upload-settings__checkbox">
          <input
            v-model="localAutoRemove"
            type="checkbox"
            class="upload-settings__checkbox-input"
          />
          <span class="upload-settings__checkbox-label"
            >上传成功后自动移除</span
          >
        </label>
        <Tooltip
          content="上传成功的文件将自动从列表中移除，适合批量上传时保持列表简洁"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-settings__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-settings__label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.upload-settings__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.upload-settings__checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.upload-settings__checkbox-input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
  transition: all 0.2s;
}

.upload-settings__checkbox-input:hover {
  transform: scale(1.1);
}

.upload-settings__checkbox-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  user-select: none;
  transition: color 0.2s;
}

.upload-settings__checkbox:hover .upload-settings__checkbox-label {
  color: var(--color-primary);
}
</style>
