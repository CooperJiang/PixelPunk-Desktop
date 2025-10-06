<script setup lang="ts">
import { ref, computed } from "vue";
import { Folder, ChevronRight, ChevronDown, Loader2 } from "lucide-vue-next";
import { getFolderList } from "@/api/folder";
import type { FolderInfo } from "@/api/types";

interface Props {
  folder: FolderInfo;
  level: number;
  selectedId?: string;
  isExpanded: boolean;
  expandedFolders: Set<string>;
  cachedChildren: FolderInfo[];
  getFolderChildren: (folderId: string) => FolderInfo[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [folder: FolderInfo];
  toggle: [folderId: string, isExpanded: boolean];
  "children-loaded": [folderId: string, children: FolderInfo[]];
}>();

const isLoading = ref(false);

const hasChildren = computed(() => {
  // 如果明确标记为没有子文件夹
  if (props.folder.has_children === false) {
    return false;
  }
  // 如果已经加载过子文件夹
  if (props.cachedChildren.length > 0) {
    return true;
  }
  // 默认认为可能有子文件夹
  return props.folder.has_children !== false;
});

const children = computed(() => props.cachedChildren);

// 切换展开/折叠
const toggleExpand = async () => {
  const newExpandedState = !props.isExpanded;

  // 如果要展开且还没有加载子文件夹
  if (newExpandedState && children.value.length === 0 && !isLoading.value) {
    isLoading.value = true;

    try {
      const response = await getFolderList(props.folder.id);
      if (response.success && response.data) {
        const folders = response.data || [];
        const processedFolders = folders.map((folder) => ({
          ...folder,
          fullPath: `${props.folder.fullPath} / ${folder.name}`,
        }));
        emit("children-loaded", props.folder.id, processedFolders);
      }
    } catch (error) {
      console.error("Failed to fetch subfolders:", error);
    } finally {
      isLoading.value = false;
    }
  }

  emit("toggle", props.folder.id, newExpandedState);
};

// 选择文件夹
const selectFolder = () => {
  emit("select", props.folder);
};
</script>

<template>
  <div class="folder-tree-item">
    <!-- 文件夹项 -->
    <div
      class="folder-tree-item__content"
      :class="{
        'folder-tree-item__content--selected': selectedId === folder.id,
      }"
      :style="{ paddingLeft: `${level * 20 + 12}px` }"
      @click="selectFolder"
    >
      <!-- 展开/折叠按钮 -->
      <div
        class="folder-tree-item__toggle"
        :class="{ 'folder-tree-item__toggle--has-children': hasChildren }"
        @click.stop="hasChildren && toggleExpand()"
      >
        <Loader2
          v-if="hasChildren && isLoading"
          :size="12"
          class="folder-tree-item__spinner"
        />
        <ChevronDown
          v-else-if="hasChildren && isExpanded"
          :size="12"
          class="folder-tree-item__chevron folder-tree-item__chevron--expanded"
        />
        <ChevronRight
          v-else-if="hasChildren"
          :size="12"
          class="folder-tree-item__chevron"
        />
      </div>

      <!-- 文件夹图标和名称 -->
      <Folder :size="14" class="folder-tree-item__icon" />
      <span class="folder-tree-item__name">{{ folder.name }}</span>
    </div>

    <!-- 子文件夹 -->
    <Transition name="folder-tree-item-expand">
      <div
        v-if="isExpanded && children.length > 0"
        class="folder-tree-item__children"
      >
        <FolderTreeItem
          v-for="child in children"
          :key="child.id"
          :folder="child"
          :level="level + 1"
          :selected-id="selectedId"
          :is-expanded="expandedFolders.has(child.id)"
          :expanded-folders="expandedFolders"
          :cached-children="getFolderChildren(child.id)"
          :get-folder-children="getFolderChildren"
          @select="$emit('select', $event)"
          @toggle="
            (folderId, isExpanded) => $emit('toggle', folderId, isExpanded)
          "
          @children-loaded="
            (folderId, children) => $emit('children-loaded', folderId, children)
          "
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.folder-tree-item {
  position: relative;
}

.folder-tree-item__content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.folder-tree-item__content:hover {
  background: var(--color-bg-hover);
}

.folder-tree-item__content--selected {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  color: var(--color-primary);
}

.folder-tree-item__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.3;
}

.folder-tree-item__toggle--has-children {
  opacity: 1;
  cursor: pointer;
}

.folder-tree-item__toggle--has-children:hover {
  opacity: 0.7;
}

.folder-tree-item__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.folder-tree-item__chevron {
  transition: transform 0.2s;
}

.folder-tree-item__chevron--expanded {
  transform: rotate(0deg);
}

.folder-tree-item__icon {
  flex-shrink: 0;
  color: currentColor;
}

.folder-tree-item__name {
  flex: 1;
  font-size: 13px;
  color: currentColor;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-tree-item__children {
  position: relative;
}

.folder-tree-item__children::before {
  content: "";
  position: absolute;
  left: calc(var(--level, 0) * 20px + 18px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
  opacity: 0.3;
}

/* 动画 */
.folder-tree-item-expand-enter-active,
.folder-tree-item-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
  opacity: 1;
}

.folder-tree-item-expand-enter-from,
.folder-tree-item-expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
