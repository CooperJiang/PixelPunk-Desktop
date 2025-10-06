<script setup lang="ts">
import { computed, ref } from "vue";
import type { FolderInfo } from "@/api/types";
import type { BreadcrumbEmits, BreadcrumbProps } from "./types";

defineOptions({
  name: "Breadcrumb",
});

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  maxItems: 5,
  startVisible: 1,
  endVisible: 2,
});

const emit = defineEmits<BreadcrumbEmits>();

const expanded = ref(false);

/* 计算显示的项目 */
const displayItems = computed(() => {
  if (expanded.value || props.items.length <= props.maxItems) {
    return props.items;
  }
  return props.items;
});

/* 是否应该显示折叠 */
const shouldShowCollapse = computed(
  () => !expanded.value && props.items.length > props.maxItems,
);

/* 折叠时显示的前面几项 */
const visibleStartItems = computed(() => {
  if (!shouldShowCollapse.value) {
    return [];
  }
  return props.items.slice(0, props.startVisible);
});

/* 折叠时显示的后面几项 */
const visibleEndItems = computed(() => {
  if (!shouldShowCollapse.value) {
    return [];
  }
  return props.items.slice(-props.endVisible);
});

const handleClick = (folder: FolderInfo | null) => {
  emit("click", folder);
};

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};
</script>

<template>
  <div class="breadcrumb">
    <div class="breadcrumb-item" @click="handleClick(null)">
      <i class="fas fa-home" />
      <span class="breadcrumb-text">根目录</span>
    </div>

    <template v-if="displayItems.length > 0">
      <template v-if="shouldShowCollapse">
        <template
          v-for="(item, index) in visibleStartItems"
          :key="`start-${index}`"
        >
          <div class="breadcrumb-separator">
            <i class="fas fa-chevron-right" />
          </div>
          <div class="breadcrumb-item" @click="handleClick(item)">
            <span class="breadcrumb-text">{{ item.name }}</span>
          </div>
        </template>

        <div class="breadcrumb-separator">
          <i class="fas fa-chevron-right" />
        </div>
        <div
          class="breadcrumb-item breadcrumb-collapse"
          @click="toggleExpanded"
        >
          <span class="breadcrumb-text">...</span>
        </div>

        <template
          v-for="(item, index) in visibleEndItems"
          :key="`end-${index}`"
        >
          <div class="breadcrumb-separator">
            <i class="fas fa-chevron-right" />
          </div>
          <div
            class="breadcrumb-item"
            :class="{ active: index === visibleEndItems.length - 1 }"
            @click="handleClick(item)"
          >
            <span class="breadcrumb-text">{{ item.name }}</span>
          </div>
        </template>
      </template>

      <template v-else>
        <template v-for="(item, index) in displayItems" :key="index">
          <div class="breadcrumb-separator">
            <i class="fas fa-chevron-right" />
          </div>
          <div
            class="breadcrumb-item"
            :class="{ active: index === displayItems.length - 1 }"
            @click="handleClick(item)"
          >
            <span class="breadcrumb-text">{{ item.name }}</span>
          </div>
        </template>
      </template>
    </template>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  padding: 8px 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--color-text);
  background: transparent;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.breadcrumb-item.active {
  cursor: default;
  background: transparent;
  color: var(--color-primary);
}

.breadcrumb-text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-item.active .breadcrumb-text {
  max-width: 150px;
  font-weight: 500;
}

.breadcrumb-collapse {
  position: relative;
  min-width: 0;
}

.breadcrumb-collapse:hover {
  transform: scale(1.1);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.breadcrumb-collapse .breadcrumb-text {
  max-width: none;
  font-size: 1.125rem;
  font-weight: bold;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}

.breadcrumb-collapse:hover .breadcrumb-text {
  color: var(--color-primary);
}

.breadcrumb-separator {
  margin: 0 4px;
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-text-disabled);
}

@media (max-width: 768px) {
  .breadcrumb-text {
    max-width: 80px;
  }
}
</style>
