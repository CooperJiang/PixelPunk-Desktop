<template>
  <!-- 当作为独立组件使用时，使用 teleport -->
  <teleport v-if="useDirectTeleport" to="body">
    <!-- 遮罩层用于捕获外部点击 - 必须先渲染，这样菜单会在它上面 -->
    <div
      v-if="modelValue"
      class="context-menu-overlay"
      @click="handleOverlayClick"
      @contextmenu.prevent="handleOverlayClick"
    />

    <transition name="context-menu" appear>
      <div
        v-if="modelValue"
        ref="menuRef"
        class="context-menu"
        :class="[className, `context-menu--${finalPlacement}`]"
        :style="menuStyle"
        tabindex="-1"
        @click.stop
        @keydown="handleKeydown"
      >
        <div class="context-menu__content">
          <ContextMenuItem
            v-for="(item, index) in items"
            :key="item.key"
            :item="item"
            :is-first="index === 0"
            @item-click="handleItemClick"
          />
        </div>
      </div>
    </transition>
  </teleport>

  <!-- 当通过指令渲染时，不使用 teleport -->
  <transition v-else name="context-menu" appear>
    <div
      v-if="modelValue"
      ref="menuRef"
      class="context-menu"
      :class="[className, `context-menu--${finalPlacement}`]"
      :style="menuStyle"
      tabindex="-1"
      @click.stop
      @keydown="handleKeydown"
    >
      <div class="context-menu__content">
        <ContextMenuItem
          v-for="(item, index) in items"
          :key="item.key"
          :item="item"
          :is-first="index === 0"
          @item-click="handleItemClick"
        />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import ContextMenuItem from "./ContextMenuItem.vue";
import type {
  ContextMenuProps,
  ContextMenuEmits,
  ContextMenuItem as ContextMenuItemType,
  MenuPosition,
} from "./types";

defineOptions({
  name: "ContextMenu",
});

const props = withDefaults(defineProps<ContextMenuProps>(), {
  modelValue: false,
  x: 0,
  y: 0,
  zIndex: 9999,
  placement: "auto",
});

// 检测是否作为独立组件使用（有父组件）或通过指令渲染（无父组件，直接渲染到 body）
const useDirectTeleport = computed(() => {
  // 如果有 trigger 属性，说明是通过指令渲染，不需要 teleport
  return !props.trigger;
});

const emit = defineEmits<ContextMenuEmits>();

const menuRef = ref<HTMLElement>();
const menuPosition = ref<MenuPosition>({
  x: props.x,
  y: props.y,
  placement: "bottom",
});
const currentFocusIndex = ref(-1);

const finalPlacement = computed(() => {
  return props.placement === "auto"
    ? menuPosition.value.placement
    : props.placement;
});

const menuStyle = computed(() => {
  return {
    left: `${menuPosition.value.x}px`,
    top: `${menuPosition.value.y}px`,
    zIndex: props.zIndex,
  };
});

const flattenedItems = computed(() => {
  const items: ContextMenuItemType[] = [];
  const flatten = (menuItems: ContextMenuItemType[]) => {
    menuItems.forEach((item) => {
      if (!item.divided) {
        items.push(item);
      }
      if (item.children) {
        flatten(item.children);
      }
    });
  };
  flatten(props.items);
  return items.filter((item) => !item.disabled);
});

// 计算菜单位置
const calculatePosition = async () => {
  await nextTick();

  if (!menuRef.value) return;

  const menuRect = menuRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = props.x;
  let y = props.y;
  let placement: "top" | "bottom" | "left" | "right" = "bottom";

  if (props.placement === "auto") {
    // 简化为"按垂直优先翻转 + 横向钳制"的稳健策略
    const spaceBottom = viewportHeight - props.y;

    // 垂直：优先放在下方，不够则翻到上方
    if (spaceBottom >= menuRect.height + 8) {
      placement = "bottom";
      y = props.y;
    } else {
      placement = "top";
      y = props.y - menuRect.height;
    }

    // 横向：尽量靠触发点，若越界则钳制到视口内
    x = props.x;
    if (x + menuRect.width > viewportWidth - 10)
      x = viewportWidth - menuRect.width - 10;
    if (x < 10) x = 10;

    // 纵向最终钳制
    if (y < 10) y = 10;
    if (y + menuRect.height > viewportHeight - 10)
      y = viewportHeight - menuRect.height - 10;
  } else {
    // 按指定位置放置
    switch (props.placement) {
      case "top":
        y = props.y - menuRect.height;
        placement = "top";
        break;
      case "left":
        x = props.x - menuRect.width;
        placement = "left";
        break;
      case "right":
        x = props.x;
        placement = "right";
        break;
      default:
        placement = "bottom";
    }
  }

  // 最终保险钳制
  x = Math.max(10, Math.min(x, viewportWidth - menuRect.width - 10));
  y = Math.max(10, Math.min(y, viewportHeight - menuRect.height - 10));

  menuPosition.value = { x, y, placement };
};

// 处理菜单项点击
const handleItemClick = (item: ContextMenuItemType, event: MouseEvent) => {
  emit("item-click", item, event);
  closeMenu();
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  closeMenu();
};

// 关闭菜单
const closeMenu = () => {
  emit("update:modelValue", false);
  emit("close");
  currentFocusIndex.value = -1;
};

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Escape":
      event.preventDefault();
      closeMenu();
      break;
    case "ArrowDown":
      event.preventDefault();
      navigateMenu(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      navigateMenu(-1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      if (currentFocusIndex.value >= 0) {
        const item = flattenedItems.value[currentFocusIndex.value];
        if (item && !item.disabled) {
          handleItemClick(item, event as unknown as MouseEvent);
        }
      }
      break;
  }
};

// 菜单导航
const navigateMenu = (direction: 1 | -1) => {
  const items = flattenedItems.value;
  if (items.length === 0) return;

  currentFocusIndex.value = Math.max(
    0,
    Math.min(items.length - 1, currentFocusIndex.value + direction),
  );
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // 立即更新位置到props指定的位置，避免动画从(0,0)开始
      menuPosition.value.x = props.x;
      menuPosition.value.y = props.y;

      calculatePosition();
      nextTick(() => {
        menuRef.value?.focus();
      });
    } else {
      currentFocusIndex.value = -1;
    }
  },
);

// 监听位置变化
watch([() => props.x, () => props.y], ([newX, newY]) => {
  // 立即更新位置，避免从0,0开始的动画
  menuPosition.value.x = newX;
  menuPosition.value.y = newY;

  if (props.modelValue) {
    calculatePosition();
  }
});

onMounted(() => {
  if (props.modelValue) {
    calculatePosition();
  }
});

// 全局键盘事件监听（ESC + 快捷键）
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue) return;

  if (event.key === "Escape") {
    closeMenu();
    return;
  }

  // 处理快捷键
  const shortcutKey = getShortcutKey(event);
  if (shortcutKey) {
    // 查找匹配快捷键的菜单项
    const matchingItem = findItemByShortcut(props.items, shortcutKey);
    if (matchingItem && !matchingItem.disabled) {
      event.preventDefault();
      event.stopPropagation();
      handleItemClick(matchingItem, event as unknown as MouseEvent);
    }
  }
};

// 获取快捷键字符串
const getShortcutKey = (event: KeyboardEvent): string => {
  const modifiers = [];
  if (event.ctrlKey || event.metaKey) modifiers.push("Ctrl");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");

  let key = event.key;
  if (key === " ") key = "Space";

  return modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;
};

// 递归查找匹配快捷键的菜单项
const findItemByShortcut = (
  items: ContextMenuItemType[],
  shortcut: string,
): ContextMenuItemType | null => {
  for (const item of items) {
    if (item.shortcut === shortcut) {
      return item;
    }
    if (item.children) {
      const found = findItemByShortcut(item.children, shortcut);
      if (found) return found;
    }
  }
  return null;
};

onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style scoped>
.context-menu {
  position: fixed;
  min-width: 160px;
  max-width: 240px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  padding: 6px 0;
  outline: none;
  user-select: none;
  overflow: visible;
}

.context-menu__content {
  width: 100%;
}

.context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  background: transparent;
}

/* 入场动画 */
.context-menu-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.context-menu-leave-active {
  transition: all 0.15s ease-in;
}

.context-menu-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}

/* 位置相关的动画变体 */
.context-menu--top.context-menu-enter-from {
  transform: scale(0.95) translateY(10px);
}

.context-menu--left.context-menu-enter-from {
  transform: scale(0.95) translateX(10px);
}

.context-menu--right.context-menu-enter-from {
  transform: scale(0.95) translateX(-10px);
}
</style>
