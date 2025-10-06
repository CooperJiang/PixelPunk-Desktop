<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import type { DropdownProps, DropdownEmits, DropdownOption } from "./types";
import { ChevronDown, X } from "lucide-vue-next";

const props = withDefaults(defineProps<DropdownProps>(), {
  modelValue: "",
  options: () => [],
  placeholder: "请选择",
  disabled: false,
  multiple: false,
  searchable: false,
  maxHeight: "250px",
  clearable: true,
  width: "100%",
  height: undefined,
});

const emit = defineEmits<DropdownEmits>();

const isOpen = ref(false);
const searchQuery = ref("");
const highlightedIndex = ref(-1);
const searchInput = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const dropdownMenuRef = ref<HTMLElement | null>(null);
const showClearButton = ref(false);

// 计算下拉菜单位置
const menuPosition = ref({ top: 0, left: 0, width: 0 });

const updateMenuPosition = () => {
  if (!dropdownRef.value) return;
  const rect = dropdownRef.value.getBoundingClientRect();
  menuPosition.value = {
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
  };
};

// 过滤选项
const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return props.options;
  return props.options.filter((option) =>
    option.label.toLowerCase().includes(query),
  );
});

// 单选模式下的选中项
const selectedOption = computed(() => {
  if (props.multiple) return null;
  return props.options.find(
    (option) =>
      option.value === props.modelValue ||
      String(option.value) === String(props.modelValue),
  );
});

// 多选模式下的选中项
const selectedOptions = computed(() => {
  if (!props.multiple || !Array.isArray(props.modelValue)) return [];
  return props.options.filter((option) =>
    props.modelValue.some(
      (value) =>
        value === option.value || String(value) === String(option.value),
    ),
  );
});

// 判断是否选中
const isSelected = (value: any) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.some(
      (selectedValue) =>
        selectedValue === value || String(selectedValue) === String(value),
    );
  }
  return (
    props.modelValue === value || String(props.modelValue) === String(value)
  );
};

// 选择选项
const selectOption = (option: DropdownOption) => {
  if (props.disabled || option.disabled) return;

  if (props.multiple) {
    const newValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    const index = newValue.findIndex(
      (v) => v === option.value || String(v) === String(option.value),
    );

    if (index === -1) {
      newValue.push(option.value);
    } else {
      newValue.splice(index, 1);
    }

    emit("update:modelValue", newValue);
    emit("change", newValue);
  } else {
    emit("update:modelValue", option.value);
    emit("change", option.value);
    close();
  }
};

// 移除选中项（多选）
const removeSelected = (value: any) => {
  if (props.disabled) return;

  if (props.multiple && Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];
    const index = newValue.findIndex(
      (v) => v === value || String(v) === String(value),
    );

    if (index !== -1) {
      newValue.splice(index, 1);
      emit("update:modelValue", newValue);
      emit("change", newValue);
    }
  }
};

// 清空所有选中
const clearAllSelected = () => {
  if (props.disabled) return;

  if (props.multiple) {
    emit("update:modelValue", []);
    emit("change", []);
  } else {
    emit("update:modelValue", "");
    emit("change", "");
  }
};

// 切换下拉菜单
const toggleDropdown = () => {
  if (props.disabled) return;

  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    searchQuery.value = "";
    highlightedIndex.value = -1;
    updateMenuPosition();

    if (props.searchable) {
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
};

// 关闭下拉菜单
const close = () => {
  isOpen.value = false;
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return;

  const target = event.target as HTMLElement;
  const isClickInDropdown =
    dropdownRef.value?.contains(target) ||
    dropdownMenuRef.value?.contains(target);

  if (!isClickInDropdown) {
    close();
  }
};

// 键盘导航
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++;
      } else {
        highlightedIndex.value = 0;
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
      } else {
        highlightedIndex.value = filteredOptions.value.length - 1;
      }
      break;
    case "Enter":
      e.preventDefault();
      if (highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
      break;
    case "Escape":
      e.preventDefault();
      close();
      break;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", updateMenuPosition);
  window.addEventListener("scroll", updateMenuPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("resize", updateMenuPosition);
  window.removeEventListener("scroll", updateMenuPosition, true);
});

watch(isOpen, (newVal) => {
  if (newVal) {
    updateMenuPosition();
  }
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="{ 'dropdown--open': isOpen, 'dropdown--disabled': disabled }"
    :style="{ width: width, height: height }"
  >
    <!-- 触发器 -->
    <div class="dropdown__trigger" @click="toggleDropdown">
      <div class="dropdown__content">
        <!-- 多选标签 -->
        <template v-if="multiple && selectedOptions.length">
          <div class="dropdown__tags">
            <div
              v-for="option in selectedOptions"
              :key="option.value"
              class="dropdown__tag"
            >
              {{ option.label }}
              <span
                class="dropdown__tag-remove"
                @click.stop="removeSelected(option.value)"
              >
                <X :size="12" />
              </span>
            </div>
          </div>
        </template>
        <!-- 单选已选项 -->
        <template v-else-if="!multiple && selectedOption">
          <div class="dropdown__selected">
            <span
              v-if="$slots['selected-icon']"
              class="dropdown__selected-icon"
            >
              <slot name="selected-icon" :option="selectedOption" />
            </span>
            <span class="dropdown__selected-label">{{
              selectedOption.label
            }}</span>
          </div>
        </template>
        <!-- 占位符 -->
        <template v-else>
          <span class="dropdown__placeholder">{{ placeholder }}</span>
        </template>
      </div>

      <!-- 后缀图标 -->
      <div
        class="dropdown__suffix"
        @mouseenter="showClearButton = true"
        @mouseleave="showClearButton = false"
      >
        <span
          v-if="
            (multiple ? selectedOptions.length > 0 : selectedOption) &&
            showClearButton &&
            clearable
          "
          class="dropdown__clear"
          title="清除"
          @click.stop="clearAllSelected"
        >
          <X :size="14" />
        </span>
        <ChevronDown
          v-else
          :size="14"
          class="dropdown__arrow"
          :class="{ 'dropdown__arrow--open': isOpen }"
        />
      </div>
    </div>

    <!-- 下拉菜单（Teleport 到 body） -->
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isOpen"
          ref="dropdownMenuRef"
          class="dropdown__menu"
          :style="{
            maxHeight: maxHeight,
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
            zIndex: 99999,
          }"
          @click.stop
        >
          <!-- 搜索框 -->
          <div v-if="searchable" class="dropdown__search">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="搜索..."
              class="dropdown__search-input"
              @click.stop
            />
          </div>

          <!-- 选项列表 -->
          <div class="dropdown__options">
            <template v-if="filteredOptions.length">
              <div
                v-for="(option, index) in filteredOptions"
                :key="option.value"
                class="dropdown__option"
                :class="{
                  'dropdown__option--selected': isSelected(option.value),
                  'dropdown__option--highlighted': highlightedIndex === index,
                  'dropdown__option--disabled': option.disabled,
                }"
                @click.stop="selectOption(option)"
                @mouseover="highlightedIndex = index"
              >
                <!-- 多选复选框 -->
                <template v-if="multiple">
                  <div class="dropdown__checkbox">
                    <span
                      class="dropdown__checkbox-icon"
                      :class="{
                        'dropdown__checkbox-icon--checked': isSelected(
                          option.value,
                        ),
                      }"
                    />
                  </div>
                </template>

                <!-- 选项图标插槽 -->
                <span
                  v-if="$slots['option-icon']"
                  class="dropdown__option-icon"
                >
                  <slot
                    name="option-icon"
                    :option="option"
                    :is-selected="isSelected(option.value)"
                  />
                </span>

                <!-- 选项标签 -->
                <span class="dropdown__option-label">{{ option.label }}</span>
              </div>
            </template>

            <!-- 空状态 -->
            <div v-else class="dropdown__empty">
              {{ searchQuery ? "没有找到匹配的选项" : "暂无选项" }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 10px 14px;
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.03)
  );
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--color-text-primary);
  position: relative;
  overflow: hidden;
}

.dropdown__trigger::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.dropdown__trigger:hover:not(.dropdown--disabled .dropdown__trigger) {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
  transform: translateY(-1px);
}

.dropdown__trigger:hover:not(.dropdown--disabled .dropdown__trigger)::before {
  opacity: 1;
}

.dropdown--open .dropdown__trigger {
  border-color: var(--color-primary);
  box-shadow: 0 0 30px rgba(var(--color-primary-rgb, 5, 217, 232), 0.3);
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.08)
  );
}

.dropdown__content {
  flex: 1;
  overflow: hidden;
  margin-right: 8px;
  display: flex;
  align-items: center;
  min-height: 0;
}

.dropdown__suffix {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.dropdown__arrow {
  transition: transform 0.2s;
}

.dropdown__arrow--open {
  transform: rotate(180deg);
}

.dropdown__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.dropdown__clear:hover {
  color: var(--color-text-primary);
}

.dropdown__placeholder {
  color: var(--color-text-muted);
  font-size: 14px;
}

.dropdown__selected {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
}

.dropdown__selected-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.dropdown__selected-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown__tags {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: hidden;
  gap: 4px;
  align-items: center;
}

.dropdown__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 6px;
  background: var(--color-bg-active);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.dropdown__tag-remove {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.dropdown__tag-remove:hover {
  color: var(--color-text-primary);
}

.dropdown__menu {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 4px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 0 0 1px var(--color-primary);
  backdrop-filter: blur(10px);
}

.dropdown__search {
  flex-shrink: 0;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.dropdown__search-input {
  width: 100%;
  min-height: 32px;
  padding: 6px 10px;
  background: var(--color-bg-base);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  transition: all 0.2s;
}

.dropdown__search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 5, 217, 232), 0.1);
}

.dropdown__search-input::placeholder {
  color: var(--color-text-muted);
}

.dropdown__options {
  min-height: 0;
  flex-grow: 1;
  overflow-y: auto;
  padding: 4px;
}

.dropdown__options::-webkit-scrollbar {
  width: 6px;
}

.dropdown__options::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown__options::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.dropdown__options::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

.dropdown__option {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.dropdown__option:hover,
.dropdown__option--highlighted {
  background: var(--color-bg-hover);
}

.dropdown__option--selected {
  background: var(--color-bg-active);
  color: var(--color-primary);
}

.dropdown__option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.dropdown__checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 3px;
  transition: all 0.2s;
}

.dropdown__checkbox-icon--checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dropdown__checkbox-icon--checked::after {
  content: "";
  display: block;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.dropdown__option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.dropdown__option-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown__empty {
  padding: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}

.dropdown--disabled .dropdown__trigger {
  cursor: not-allowed;
  opacity: 0.6;
  background: var(--color-bg-base);
}

.dropdown--disabled .dropdown__trigger:hover {
  border-color: var(--color-border);
  box-shadow: none;
}

/* 过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
