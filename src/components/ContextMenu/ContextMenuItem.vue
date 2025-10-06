<template>
  <div
    class="context-menu-item"
    :class="{
      'context-menu-item--disabled': item.disabled,
      'context-menu-item--danger': item.danger && !item.disabled,
      'context-menu-item--has-children': hasChildren,
      'context-menu-item--active': isActive,
      'context-menu-item--has-active-submenu': hasChildren && showSubMenu,
      'context-menu-item--hover': isHovered && !item.disabled,
    }"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 分隔线 -->
    <div v-if="item.divided && !isFirst" class="context-menu-item__divider" />

    <!-- 菜单项内容 (只有非分隔线项才显示内容) -->
    <div v-if="!item.divided || item.label" class="context-menu-item__content">
      <!-- 图标 -->
      <span v-if="item.icon" class="context-menu-item__icon">
        <component :is="getLucideIcon(item.icon)" :size="14" />
      </span>

      <!-- 标签文字 -->
      <span class="context-menu-item__label">
        {{ item.label }}
      </span>

      <!-- 快捷键 -->
      <span v-if="item.shortcut" class="context-menu-item__shortcut">
        {{ item.shortcut }}
      </span>

      <!-- 子菜单箭头 -->
      <span v-if="hasChildren" class="context-menu-item__arrow">
        <ChevronRight :size="12" />
      </span>
    </div>

    <!-- 子菜单 -->
    <transition name="context-submenu" appear>
      <div
        v-if="hasChildren && showSubMenu"
        ref="submenuRef"
        class="context-submenu"
        :class="{ 'context-submenu--left': submenuOpensLeft }"
        :style="submenuStyle"
        @click.stop
        @mouseenter="handleSubmenuMouseEnter"
        @mouseleave="handleSubmenuMouseLeave"
      >
        <!-- 加载状态 -->
        <div v-if="isLoading" class="context-menu-item__loading">
          <Loader2 :size="14" class="context-menu-item__loading-icon" />
          <span class="context-menu-item__loading-text">加载中...</span>
        </div>
        <!-- 加载错误 -->
        <div v-else-if="loadError" class="context-menu-item__error">
          <AlertTriangle :size="14" class="context-menu-item__error-icon" />
          <span class="context-menu-item__error-text">{{ loadError }}</span>
        </div>
        <!-- 子菜单项 -->
        <template v-else>
          <ContextMenuItem
            v-for="(childItem, index) in localChildren"
            :key="childItem.key"
            :item="childItem"
            :is-first="index === 0"
            @item-click="(item, event) => $emit('item-click', item, event)"
          />
        </template>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from "vue";
import {
  ChevronRight,
  Loader2,
  AlertTriangle,
  Eye,
  ExternalLink,
  Link,
  Download,
  FolderInput as Move,
  Trash2,
  Folder,
  Home,
  Image,
  Film,
  Edit,
} from "lucide-vue-next";
import type { ContextMenuItem } from "./types";

defineOptions({
  name: "ContextMenuItem",
});

interface Props {
  item: ContextMenuItem;
  isFirst?: boolean;
}

interface Emits {
  (e: "item-click", _item: ContextMenuItem, _event: MouseEvent): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const showSubMenu = ref(false);
const isActive = ref(false);
const isHovered = ref(false);
const submenuRef = ref<HTMLElement>();
const submenuStyle = ref<Record<string, string>>({});
const localChildren = ref<ContextMenuItem[]>(props.item.children ?? []);
const isLoading = ref(false);
const loadError = ref<string | undefined>(undefined);
const submenuOpensLeft = ref(false);
let openTimer: number | null = null;

const hasChildren = computed(() => {
  return (
    (localChildren.value && localChildren.value.length > 0) ||
    props.item.hasAsyncChildren
  );
});

// Icon mapping
const getLucideIcon = (iconName: string) => {
  const iconMap: Record<string, unknown> = {
    Eye,
    ExternalLink,
    Link,
    Download,
    Move,
    Trash2,
    Folder,
    Home,
    Image,
    Film,
    Edit,
    ChevronRight,
    Loader2,
    AlertTriangle,
  };
  return iconMap[iconName] || Eye;
};

// 与外部 children 同步（若父侧更新）
watch(
  () => props.item.children,
  (val) => {
    if (Array.isArray(val)) localChildren.value = val;
  },
);

// 子菜单内容变化（首次加载完成、错误切换等）时，展开状态下重新计算位置
watch([localChildren, isLoading, loadError], async () => {
  if (showSubMenu.value) {
    await nextTick();
    calculateSubmenuPosition();
  }
});

const handleClick = async (event: MouseEvent) => {
  event.stopPropagation();

  // 如果是分隔线项目且没有标签，不处理点击
  if (props.item.divided && !props.item.label) {
    return;
  }

  if (props.item.disabled) {
    return;
  }

  const target = event.target as Element;
  const clickedArrow = !!target.closest(".context-menu-item__arrow");

  // 如果点击了箭头，显式切换子菜单展开
  if (clickedArrow && hasChildren.value) {
    showSubMenu.value = !showSubMenu.value;
    if (showSubMenu.value) {
      nextTick(() => {
        calculateSubmenuPosition();
      });
    }
    return;
  }

  // 优先执行动作：如果定义了 onClick，则点击即触发动作（即使有子菜单）
  if (props.item.onClick) {
    // 先执行动作（等待完成），再向父级发出事件（父级会关闭菜单并清理状态）
    await Promise.resolve(props.item.onClick(props.item, event));
    emit("item-click", props.item, event);
    return;
  }

  // 否则按是否有子菜单处理
  if (hasChildren.value) {
    showSubMenu.value = !showSubMenu.value;
    if (showSubMenu.value) {
      nextTick(() => {
        calculateSubmenuPosition();
      });
    }
  } else {
    emit("item-click", props.item, event);
  }
};

const handleMouseEnter = async (event: MouseEvent) => {
  if (props.item.disabled) return;

  // 检查是否是直接hover到菜单项内容区域，而不是从子菜单传播过来的
  const target = event.target as Element;
  const currentTarget = event.currentTarget as Element;

  // 如果hover的是内容区域或者是当前元素本身，才显示hover状态
  if (
    target.classList.contains("context-menu-item__content") ||
    target.closest(".context-menu-item") === currentTarget
  ) {
    // 进一步检查，确保不是从子菜单传播过来的
    if (!target.closest(".context-submenu")) {
      isHovered.value = true;
    }
  }

  isActive.value = true;
  if (hasChildren.value) {
    if (openTimer) {
      clearTimeout(openTimer);
      openTimer = null;
    }
    openTimer = window.setTimeout(async () => {
      // 打开子菜单（带懒加载）
      if (
        props.item.hasAsyncChildren &&
        localChildren.value.length === 0 &&
        props.item.loadChildren
      ) {
        isLoading.value = true;
        showSubMenu.value = true;
        await nextTick();
        calculateSubmenuPosition();
        try {
          const children = await props.item.loadChildren();
          localChildren.value = Array.isArray(children) ? children : [];
          loadError.value = undefined;
        } catch (error) {
          console.error("Failed to load submenu children:", error);
          loadError.value = "加载失败";
        } finally {
          isLoading.value = false;
          await nextTick();
          calculateSubmenuPosition();
        }
      } else {
        showSubMenu.value = true;
        await nextTick();
        calculateSubmenuPosition();
      }
    }, 140);
  }
};

const handleMouseLeave = (event: MouseEvent) => {
  // 检查鼠标是否离开了当前项目的边界
  const rect = (event.currentTarget as Element).getBoundingClientRect();
  const isLeavingItem =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (isLeavingItem) {
    isHovered.value = false;
  }

  isActive.value = false;
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (hasChildren.value) {
    // 延迟关闭，给用户移动到子菜单的时间，并允许穿越微小空隙
    const delay = 250;
    setTimeout(() => {
      const hoveringCurrent = submenuRef.value
        ? submenuRef.value.matches(":hover")
        : false;
      const hoveringDescendant = submenuRef.value
        ? !!submenuRef.value.querySelector(".context-submenu:hover")
        : false;
      if (
        !isActive.value &&
        !isSubmenuHovered.value &&
        !hoveringCurrent &&
        !hoveringDescendant
      ) {
        showSubMenu.value = false;
      }
    }, delay);
  }
};

// 子菜单hover状态
const isSubmenuHovered = ref(false);

const handleSubmenuMouseEnter = () => {
  isSubmenuHovered.value = true;
  isActive.value = true;
  // 进入子菜单时，父项不应该显示hover状态
  isHovered.value = false;
};

const handleSubmenuMouseLeave = () => {
  isSubmenuHovered.value = false;
  isActive.value = false;
  // 延迟关闭子菜单
  setTimeout(() => {
    if (!isActive.value && !isSubmenuHovered.value) {
      showSubMenu.value = false;
    }
  }, 100);
};

const calculateSubmenuPosition = () => {
  if (!submenuRef.value) return;

  const rect = submenuRef.value.getBoundingClientRect();
  const parentRect = (
    submenuRef.value.parentElement as HTMLElement
  ).getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left: string | undefined = "100%";
  let right: string | undefined = "auto";
  let topOffset = 0;
  const margin = 10;

  // 检查右侧空间是否足够
  if (parentRect.right + rect.width > viewportWidth - 10) {
    submenuOpensLeft.value = true;
    left = "auto";
    right = "100%";
  } else {
    submenuOpensLeft.value = false;
    left = "100%";
    right = "auto";
  }

  // 计算垂直方向的可用范围并钳制 top 偏移量
  const minTopOffset = margin - parentRect.top; // 不超过视口上边缘
  const maxTopOffset = viewportHeight - rect.height - margin - parentRect.top; // 不超过视口下边缘
  topOffset = Math.min(Math.max(0, minTopOffset), maxTopOffset);

  submenuStyle.value = {
    left: left as string,
    right: right as string,
    top: `${Math.round(topOffset)}px`,
  };
};
</script>

<style scoped>
.context-menu-item {
  position: relative;
  user-select: none;
  overflow: visible;
}

.context-menu-item__divider {
  height: 1px;
  background: var(--border-color);
  margin: 6px 12px;
  opacity: 0.3;
}

.context-menu-item__content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  min-height: 28px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 6px;
  margin: 1px 6px;
  position: relative;
}

/* JavaScript控制的hover状态 */
.context-menu-item--hover > .context-menu-item__content {
  background: var(--surface-hover);
  border-left: 2px solid var(--primary-color);
  padding-left: 10px;
  transform: translateX(2px);
}

/* CSS :hover 兜底，确保叶子项也有 hover 效果 */
.context-menu-item:not(.context-menu-item--disabled):hover
  > .context-menu-item__content {
  background: var(--surface-hover);
  border-left: 2px solid var(--primary-color);
  padding-left: 10px;
  transform: translateX(2px);
}

/* 有活动子菜单时的样式（仅作用于当前项，不级联到子菜单） */
.context-menu-item--has-active-submenu > .context-menu-item__content {
  background: var(--surface-hover);
  border-left: 2px solid var(--primary-color);
  padding-left: 10px;
}

/* 危险项的JavaScript控制hover状态 */
.context-menu-item--danger.context-menu-item--hover
  > .context-menu-item__content {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #ef4444;
  border-left-color: #ef4444 !important;
}

/* 危险项 :hover 兜底 */
.context-menu-item--danger:not(.context-menu-item--disabled):hover
  > .context-menu-item__content {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #ef4444;
  border-left-color: #ef4444 !important;
}

.context-menu-item--disabled .context-menu-item__content {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-tertiary);
}

.context-menu-item__icon {
  min-width: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.context-menu-item--danger .context-menu-item__icon {
  color: #ef4444;
}

.context-menu-item__label {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--text-primary);
  white-space: nowrap;
  font-weight: 500;
}

.context-menu-item--danger .context-menu-item__label {
  color: #ef4444;
}

.context-menu-item__shortcut {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  opacity: 0.75;
  font-weight: 400;
}

.context-menu-item__arrow {
  min-width: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* 子菜单样式 - 重置所有继承的hover状态 */
.context-submenu {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 140px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 6px 0;
  z-index: 10001;
}

/* 当需要向左展开时，固定 transform 方向，避免动画闪跳 */
.context-submenu.context-submenu--left {
  left: auto;
  right: 100%;
}

/* 子菜单动画 */
.context-submenu-enter-active,
.context-submenu-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.context-submenu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateX(-10px);
}

/* 向左展开的入场动画方向相反，避免先闪到右侧 */
.context-submenu--left.context-submenu-enter-from {
  transform: scale(0.95) translateX(10px);
}

.context-submenu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateX(-10px);
}
.context-submenu--left.context-submenu-leave-to {
  transform: scale(0.95) translateX(10px);
}

/* 加载状态样式 */
.context-menu-item__loading,
.context-menu-item__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  min-height: 32px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.context-menu-item__loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.context-menu-item__error {
  color: #ef4444;
}
</style>
