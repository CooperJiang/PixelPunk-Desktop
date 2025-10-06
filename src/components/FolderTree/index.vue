<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { Folder, Home, ChevronDown, Search, X } from "lucide-vue-next";
import { getFolderList, searchFolders, getFolderPathChain } from "@/api/folder";
import type { FolderInfo } from "@/api/types";
import FolderTreeItem from "./FolderTreeItem.vue";

interface Props {
  modelValue?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "选择文件夹",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  folderSelected: [folder: { id: string; name: string; path: string }];
}>();

// 状态
const isOpen = ref(false);
const isLoading = ref(false);
const searchQuery = ref("");
const selectedPath = ref("");
const folders = ref<FolderInfo[]>([]);
const searchResults = ref<FolderInfo[]>([]);

// 位置计算相关
const triggerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();
const dropdownStyle = ref<Record<string, string>>({});

// 懒加载相关
const expandedFolders = ref<Set<string>>(new Set());
const foldersChildrenCache = ref<Map<string, FolderInfo[]>>(new Map());

// 计算属性
const displayText = computed(() => {
  if (selectedPath.value) {
    return selectedPath.value;
  }
  return props.placeholder;
});

const filteredFolders = computed(() => {
  if (searchQuery.value.trim()) {
    return searchResults.value;
  }
  return folders.value;
});

const isSearching = computed(() => searchQuery.value.trim().length > 0);

// 加载顶级文件夹列表
const loadFolders = async () => {
  try {
    isLoading.value = true;
    const response = await getFolderList(); // 不传parentId，获取顶级文件夹
    if (response.success && response.data) {
      folders.value = response.data.map((folder) => ({
        ...folder,
        fullPath: folder.name,
      }));

      // 如果有选中的文件夹，加载其路径
      if (props.modelValue) {
        await loadFolderPath(props.modelValue);
      }
    }
  } catch (error) {
    console.error("Failed to load folders:", error);
    folders.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 加载文件夹路径
const loadFolderPath = async (folderId: string) => {
  if (!folderId) {
    selectedPath.value = "";
    return;
  }

  try {
    const response = await getFolderPathChain(folderId);
    if (response.success && response.data) {
      selectedPath.value = response.data.path_string || "";
    }
  } catch (error) {
    console.error("Failed to load folder path:", error);
  }
};

// 搜索文件夹
let searchTimeout: number;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(async () => {
    const keyword = searchQuery.value.trim();
    if (!keyword) {
      searchResults.value = [];
      return;
    }

    try {
      const response = await searchFolders(keyword);
      if (response.success && response.data) {
        searchResults.value = response.data.map((folder) => ({
          ...folder,
          fullPath: folder.description || folder.fullPath || folder.name,
        }));
      }
    } catch (error) {
      console.error("Failed to search folders:", error);
      searchResults.value = [];
    }
  }, 300);
};

// 选择文件夹
const selectFolder = (folder: FolderInfo) => {
  selectedPath.value = folder.fullPath || folder.name;
  emit("update:modelValue", folder.id);
  emit("folderSelected", {
    id: folder.id,
    name: folder.name,
    path: folder.fullPath || folder.name,
  });
  isOpen.value = false;
  searchQuery.value = "";
};

// 选择根目录
const selectRoot = () => {
  selectedPath.value = "";
  emit("update:modelValue", "");
  emit("folderSelected", {
    id: "",
    name: "根目录",
    path: "/",
  });
  isOpen.value = false;
  searchQuery.value = "";
};

// 文件夹树相关
const handleFolderToggle = (folderId: string, isExpanded: boolean) => {
  if (isExpanded) {
    expandedFolders.value.add(folderId);
  } else {
    expandedFolders.value.delete(folderId);
  }
};

const handleChildrenLoaded = (folderId: string, children: FolderInfo[]) => {
  foldersChildrenCache.value.set(folderId, children);
};

const getFolderChildren = (folderId: string): FolderInfo[] => {
  return foldersChildrenCache.value.get(folderId) || [];
};

// 更新下拉框位置
const updateDropdownPosition = () => {
  if (!triggerRef.value || !isOpen.value) return;

  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = 400; // max-height
  const bottomSpace = window.innerHeight - rect.bottom;
  const shouldOpenAbove =
    bottomSpace < dropdownHeight && rect.top > dropdownHeight;

  dropdownStyle.value = {
    position: "fixed",
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: "9998",
    ...(shouldOpenAbove
      ? { bottom: `${window.innerHeight - rect.top}px` }
      : { top: `${rect.bottom + 4}px` }),
  };
};

// 切换下拉框
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
      const searchInput = document.querySelector(
        ".folder-tree__search-input",
      ) as HTMLInputElement;
      searchInput?.focus();
    });
  }
};

// 监听滚动和resize更新位置
const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

const handleResize = () => {
  if (isOpen.value) {
    updateDropdownPosition();
  }
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!triggerRef.value || !dropdownRef.value) return;
  const target = event.target as Node;
  if (
    !triggerRef.value.contains(target) &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
};

// 监听搜索
watch(searchQuery, handleSearch);

// 监听 modelValue 变化（仅在没有selectedPath时才加载）
watch(
  () => props.modelValue,
  (newValue) => {
    // 如果已经有selectedPath，说明是用户刚选择的，不需要重新加载
    if (!newValue) {
      selectedPath.value = "";
    }
    // 不再自动加载路径，因为在selectFolder中已经设置了正确的fullPath
  },
);

// 初始化
onMounted(() => {
  loadFolders();
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="folder-tree">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="folder-tree__trigger"
      :class="{ 'folder-tree__trigger--active': isOpen }"
      @click="toggleDropdown"
    >
      <div class="folder-tree__display">
        <Folder :size="16" class="folder-tree__icon" />
        <span
          class="folder-tree__text"
          :class="{ 'folder-tree__text--placeholder': !selectedPath }"
        >
          {{ displayText }}
        </span>
      </div>
      <ChevronDown
        :size="14"
        class="folder-tree__arrow"
        :class="{ 'folder-tree__arrow--rotated': isOpen }"
      />
    </div>

    <!-- 下拉菜单 -->
    <Teleport to="body">
      <Transition name="folder-tree-dropdown">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="folder-tree__dropdown"
          :style="dropdownStyle"
          @click.stop
        >
          <!-- 搜索框 -->
          <div class="folder-tree__search">
            <Search :size="14" class="folder-tree__search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="folder-tree__search-input"
              placeholder="搜索文件夹..."
              @keydown.esc="isOpen = false"
            />
            <button
              v-if="searchQuery"
              class="folder-tree__search-clear"
              @click="searchQuery = ''"
            >
              <X :size="12" />
            </button>
          </div>

          <!-- 文件夹列表 -->
          <div class="folder-tree__list">
            <!-- 加载状态 -->
            <div v-if="isLoading" class="folder-tree__loading">
              <div class="folder-tree__spinner" />
              <span>加载中...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!filteredFolders.length" class="folder-tree__empty">
              {{ searchQuery.trim() ? "未找到匹配的文件夹" : "暂无文件夹" }}
            </div>

            <!-- 文件夹项 -->
            <div v-else class="folder-tree__items">
              <!-- 根目录（仅在非搜索时显示） -->
              <div
                v-if="!isSearching"
                class="folder-tree__item folder-tree__item--root"
                :class="{ 'folder-tree__item--selected': !props.modelValue }"
                @click="selectRoot"
              >
                <Home :size="14" class="folder-tree__item-icon" />
                <span class="folder-tree__item-name">根目录</span>
              </div>

              <!-- 搜索结果 -->
              <template v-if="isSearching">
                <div
                  v-for="folder in filteredFolders"
                  :key="folder.id"
                  class="folder-tree__item"
                  :class="{
                    'folder-tree__item--selected':
                      props.modelValue === folder.id,
                  }"
                  @click="selectFolder(folder)"
                >
                  <Folder :size="14" class="folder-tree__item-icon" />
                  <div class="folder-tree__item-content">
                    <span class="folder-tree__item-name">{{
                      folder.name
                    }}</span>
                    <span v-if="folder.fullPath" class="folder-tree__item-path">
                      {{ folder.fullPath }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- 文件夹树（懒加载） -->
              <template v-else>
                <FolderTreeItem
                  v-for="folder in filteredFolders"
                  :key="folder.id"
                  :folder="folder"
                  :level="0"
                  :selected-id="props.modelValue"
                  :is-expanded="expandedFolders.has(folder.id)"
                  :expanded-folders="expandedFolders"
                  :cached-children="getFolderChildren(folder.id)"
                  :get-folder-children="getFolderChildren"
                  @select="selectFolder"
                  @toggle="handleFolderToggle"
                  @children-loaded="handleChildrenLoaded"
                />
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.folder-tree {
  position: relative;
  width: 100%;
}

.folder-tree__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-tree__trigger:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-hover);
}

.folder-tree__trigger--active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.folder-tree__display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.folder-tree__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.folder-tree__text {
  font-size: 14px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-tree__text--placeholder {
  color: var(--color-text-muted);
}

.folder-tree__arrow {
  color: var(--color-text-muted);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.folder-tree__arrow--rotated {
  transform: rotate(180deg);
}

.folder-tree__dropdown {
  position: fixed;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.folder-tree__search {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

.folder-tree__search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.folder-tree__search-input {
  width: 100%;
  height: 32px;
  padding: 0 36px 0 36px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-primary);
  outline: none;
  transition: all 0.2s;
}

.folder-tree__search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.folder-tree__search-input::placeholder {
  color: var(--color-text-muted);
}

.folder-tree__search-clear {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.folder-tree__search-clear:hover {
  color: var(--color-text-primary);
}

.folder-tree__list {
  flex: 1;
  overflow-y: auto;
  max-height: 320px;
}

.folder-tree__loading,
.folder-tree__empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.folder-tree__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.folder-tree__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.folder-tree__items {
  padding: 4px 0;
}

.folder-tree__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.folder-tree__item:hover {
  background: var(--color-bg-hover);
}

.folder-tree__item--selected {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
  color: var(--color-primary);
}

.folder-tree__item--root {
  border-bottom: 1px solid var(--color-border);
}

.folder-tree__item-icon {
  flex-shrink: 0;
  color: var(--color-primary);
}

.folder-tree__item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.folder-tree__item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-tree__item-path {
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 下拉动画 */
.folder-tree-dropdown-enter-active,
.folder-tree-dropdown-leave-active {
  transition: all 0.2s ease;
}

.folder-tree-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.folder-tree-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 滚动条 */
.folder-tree__list::-webkit-scrollbar {
  width: 6px;
}

.folder-tree__list::-webkit-scrollbar-track {
  background: var(--color-bg-base);
}

.folder-tree__list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.folder-tree__list::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
