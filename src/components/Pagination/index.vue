<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { PaginationProps, PaginationEmits } from "./types";

defineOptions({
  name: "Pagination",
});

const props = withDefaults(defineProps<PaginationProps>(), {
  pageSize: 20,
  pageSizeOptions: () => [10, 20, 50, 100],
  showPageSizeSelector: true,
  showQuickJumper: true,
  showTotal: true,
  maxVisiblePages: 7,
  autoScrollToTop: true,
  scrollTarget: "",
});

const emit = defineEmits<PaginationEmits>();

const currentPageSize = ref(props.pageSize);
const sizeDropdownVisible = ref(false);
const jumpPageValue = ref<number | string>("");
const selectorRef = ref<HTMLElement>();
const optionsRef = ref<HTMLElement>();

type Placement = "up" | "down";
const popupLeft = ref(0);
const popupTop = ref(0);
const popupWidth = ref(0);
const popupPlacement = ref<Placement>("down");

const popupStyle = computed(() => ({
  position: "fixed",
  left: `${popupLeft.value}px`,
  top: `${popupTop.value}px`,
  width: `${popupWidth.value}px`,
  zIndex: 9999,
}));

const totalPages = computed(() =>
  Math.ceil(props.total / currentPageSize.value),
);

const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = totalPages.value;
  const maxVisible = props.maxVisiblePages;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  pages.push(1);

  let start = Math.max(2, current - halfVisible);
  let end = Math.min(total - 1, current + halfVisible);

  if (end - start + 1 < maxVisible - 2) {
    if (start === 2) {
      end = Math.min(total - 1, start + maxVisible - 3);
    } else {
      start = Math.max(2, end - maxVisible + 3);
    }
  }

  if (start > 2) {
    pages.push("...");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
});

const scrollToTop = () => {
  if (!props.autoScrollToTop) {
    return;
  }

  nextTick(() => {
    let targetElement: HTMLElement | null = null;

    if (props.scrollTarget) {
      targetElement = document.querySelector(props.scrollTarget);
    }

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  });
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit("update:currentPage", page);
    emit("page-change", page);
    scrollToTop();
  }
};

const computePopupPosition = async (preOpen = false) => {
  if (!preOpen) {
    await nextTick();
  }
  const trigger = selectorRef.value;
  if (!trigger) {
    return;
  }
  const rect = trigger.getBoundingClientRect();
  const estimatedHeight = preOpen ? 160 : optionsRef.value?.offsetHeight || 160;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const openUp = spaceBelow < estimatedHeight + 8 && spaceAbove > spaceBelow;
  popupPlacement.value = openUp ? "up" : "down";
  popupLeft.value = Math.round(rect.left);
  popupWidth.value = Math.round(rect.width);
  popupTop.value = Math.round(
    openUp ? rect.top - estimatedHeight - 4 : rect.bottom + 4,
  );
};

const openSizeDropdown = async () => {
  await computePopupPosition(true);
  sizeDropdownVisible.value = true;
  await computePopupPosition(false);
};

const toggleSizeDropdown = async () => {
  if (sizeDropdownVisible.value) {
    sizeDropdownVisible.value = false;
  } else {
    await openSizeDropdown();
  }
};

const selectPageSize = (size: number) => {
  currentPageSize.value = size;
  sizeDropdownVisible.value = false;
  emit("update:pageSize", size);
  emit("page-size-change", size);

  const newTotalPages = Math.ceil(props.total / size);
  if (props.currentPage > newTotalPages) {
    goToPage(newTotalPages);
  } else {
    scrollToTop();
  }
};

const handleJump = () => {
  const page = parseInt(jumpPageValue.value as string);
  if (page >= 1 && page <= totalPages.value) {
    goToPage(page);
    jumpPageValue.value = "";
  }
};

const handleClickOutside = (event: Event) => {
  const target = event.target as Node;
  const insideTrigger = selectorRef.value?.contains(target);
  const insidePopup = optionsRef.value?.contains(target);
  if (!insideTrigger && !insidePopup) {
    sizeDropdownVisible.value = false;
  }
};

const handleWindowUpdate = () => {
  if (sizeDropdownVisible.value) {
    computePopupPosition();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleWindowUpdate, { passive: true });
  window.addEventListener("scroll", handleWindowUpdate, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleWindowUpdate);
  window.removeEventListener("scroll", handleWindowUpdate);
});

watch(
  () => props.pageSize,
  (newSize) => {
    currentPageSize.value = newSize;
  },
);
</script>

<template>
  <div v-if="totalPages > 0" class="pagination">
    <div class="pagination-container">
      <div v-if="props.showPageSizeSelector" class="page-size-section">
        <span class="size-label">每页</span>
        <div ref="selectorRef" class="size-selector">
          <div
            class="size-current"
            :class="{ active: sizeDropdownVisible }"
            @click="toggleSizeDropdown"
          >
            <span>{{ currentPageSize }}</span>
            <i
              class="fas fa-angle-down"
              :class="{ rotate: sizeDropdownVisible }"
            />
          </div>
          <teleport to="body">
            <transition name="fade-slide">
              <div
                v-if="sizeDropdownVisible"
                ref="optionsRef"
                class="size-options-popup"
                :style="popupStyle"
                @mousedown.stop
              >
                <div
                  v-for="size in props.pageSizeOptions"
                  :key="size"
                  class="size-option"
                  :class="{ selected: size === currentPageSize }"
                  @click="selectPageSize(size)"
                >
                  {{ size }}
                </div>
              </div>
            </transition>
          </teleport>
        </div>
        <span class="size-label">条</span>
      </div>

      <div class="page-controls">
        <button
          class="page-btn prev-btn"
          :disabled="props.currentPage === 1"
          title="上一页"
          @click="goToPage(props.currentPage - 1)"
        >
          <i class="fas fa-chevron-left" />
        </button>

        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            class="page-btn number-btn"
            :class="{ active: page === props.currentPage }"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
          <span v-else class="page-ellipsis">•••</span>
        </template>

        <button
          class="page-btn next-btn"
          :disabled="props.currentPage === totalPages"
          title="下一页"
          @click="goToPage(props.currentPage + 1)"
        >
          <i class="fas fa-chevron-right" />
        </button>
      </div>

      <div class="page-info">
        <div v-if="props.showQuickJumper && totalPages > 5" class="page-jump">
          <span class="jump-label">跳至</span>
          <input
            v-model="jumpPageValue"
            type="number"
            :min="1"
            :max="totalPages"
            class="jump-input"
            placeholder="页码"
            @keyup.enter="handleJump"
            @blur="handleJump"
          />
        </div>

        <div v-if="props.showTotal" class="total-info">
          <span class="total-text">
            共 <em class="total-number">{{ props.total.toLocaleString() }}</em>
            条
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
}

.pagination-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-size-section {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: 8px;
  color: var(--color-text-secondary);
}

.size-label {
  white-space: nowrap;
  font-weight: 500;
}

.size-selector {
  position: relative;
}

.size-current {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  padding: 0 8px;
  transition: all 0.2s ease;
  gap: 8px;
  height: 30px;
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.4);
  color: var(--color-text-primary);
  min-width: 50px;
}

.size-current:hover,
.size-current.active {
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.size-current i {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  color: var(--color-text-secondary);
}

.size-current i.rotate {
  transform: rotate(180deg);
}

.size-options-popup {
  position: fixed;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  transform: none !important;
}

.size-option {
  cursor: pointer;
  padding: 6px 12px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  color: var(--color-text-primary);
}

.size-option:hover {
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
}

.size-option.selected {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  display: flex;
  cursor: pointer;
  user-select: none;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  padding: 0 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  height: 30px;
  min-width: 30px;
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.4);
  color: var(--color-text-secondary);
}

.page-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.page-btn.active {
  font-weight: 600;
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
  box-shadow:
    0 2px 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3),
    0 0 16px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  height: 30px;
  min-width: 30px;
  color: var(--color-text-secondary);
  letter-spacing: 2px;
}

.page-info {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  gap: 16px;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}

.jump-label {
  white-space: nowrap;
  font-weight: 500;
}

.jump-input {
  width: 48px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  padding: 0 8px;
  text-align: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  height: 30px;
  background: rgba(var(--color-bg-elevated-rgb, 255, 255, 255), 0.4);
  color: var(--color-text-primary);
}

.jump-input::-webkit-outer-spin-button,
.jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.jump-input[type="number"] {
  -moz-appearance: textfield;
}

.jump-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.total-info {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.total-text {
  white-space: nowrap;
}

.total-number {
  font-weight: 600;
  font-style: normal;
  color: var(--color-primary);
  text-shadow: 0 0 8px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  transform: translateY(-8px);
  opacity: 0;
}

.fade-slide-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}

@media (max-width: 1024px) {
  .pagination-container {
    padding: 12px;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .page-size-section {
    order: 2;
  }

  .page-controls {
    order: 1;
  }

  .page-info {
    order: 3;
    flex-direction: column;
    gap: 8px;
  }

  .page-btn {
    height: 28px;
    min-width: 28px;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .page-controls {
    gap: 2px;
  }

  .page-btn {
    height: 26px;
    min-width: 26px;
    padding: 0 4px;
  }

  .pagination-container {
    margin: 0 -8px;
  }
}
</style>
