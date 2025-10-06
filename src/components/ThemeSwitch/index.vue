<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useTheme, type ThemeMode } from "@/composables/useTheme";
import { Sun, Moon, Palette, Check } from "lucide-vue-next";

const { themeMode, setThemeMode } = useTheme();

const showThemeMenu = ref(false);
const buttonRef = ref<HTMLElement | null>(null);
const menuPosition = ref({ top: 0, left: 0, width: 0 });

// 主题选项
const themeOptions: Array<{ mode: ThemeMode; icon: any; label: string }> = [
  { mode: "light", icon: Sun, label: "明亮模式" },
  { mode: "dark", icon: Moon, label: "暗黑模式" },
  { mode: "system", icon: Palette, label: "跟随系统" },
];

const handleThemeChange = (mode: ThemeMode) => {
  setThemeMode(mode);
  showThemeMenu.value = false;
};

// 获取当前图标
const getCurrentIcon = () => {
  if (themeMode.value === "system") return Palette;
  if (themeMode.value === "dark") return Moon;
  return Sun;
};

// 计算菜单位置
const updateMenuPosition = () => {
  if (!buttonRef.value) return;
  const rect = buttonRef.value.getBoundingClientRect();
  menuPosition.value = {
    top: rect.bottom + 8,
    left: rect.right - 176, // 176px = w-44 (11rem * 16px)
    width: 176,
  };
};

// 切换菜单时更新位置
const toggleMenu = () => {
  showThemeMenu.value = !showThemeMenu.value;
  if (showThemeMenu.value) {
    nextTick(() => {
      updateMenuPosition();
    });
  }
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!showThemeMenu.value) return;
  const target = event.target as HTMLElement;
  if (!buttonRef.value?.contains(target)) {
    showThemeMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", updateMenuPosition);
  window.addEventListener("scroll", updateMenuPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", updateMenuPosition);
  window.removeEventListener("scroll", updateMenuPosition, true);
});

watch(showThemeMenu, (newVal) => {
  if (newVal) {
    updateMenuPosition();
  }
});
</script>

<template>
  <div>
    <!-- 主题切换按钮 -->
    <button
      ref="buttonRef"
      :class="[
        'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
        'hover:bg-[var(--color-bg-hover)]',
      ]"
      :style="{ color: 'var(--color-primary)' }"
      :title="themeOptions.find((t) => t.mode === themeMode)?.label"
      @click.stop="toggleMenu"
    >
      <component :is="getCurrentIcon()" :size="20" :stroke-width="2" />
    </button>

    <!-- 主题选择菜单（Teleport 到 body） -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showThemeMenu"
          class="w-44 overflow-hidden rounded-lg backdrop-blur-md"
          :style="{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 99999,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow:
              '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-primary)',
          }"
          @click.stop
        >
          <div class="py-2">
            <button
              v-for="option in themeOptions"
              :key="option.mode"
              :class="[
                'group flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors',
                themeMode === option.mode ? 'bg-[var(--color-bg-active)]' : '',
              ]"
              :style="{
                color:
                  themeMode === option.mode
                    ? 'var(--color-primary)'
                    : 'var(--color-text-secondary)',
              }"
              @click="handleThemeChange(option.mode)"
              @mouseenter="
                $event.currentTarget.style.background = 'var(--color-bg-hover)'
              "
              @mouseleave="
                $event.currentTarget.style.background =
                  themeMode === option.mode
                    ? 'var(--color-bg-active)'
                    : 'transparent'
              "
            >
              <div class="flex items-center gap-3">
                <!-- 主题图标 -->
                <component :is="option.icon" :size="18" :stroke-width="2" />
                <!-- 主题名称 -->
                <span class="font-medium">{{ option.label }}</span>
              </div>

              <!-- 选中标记 -->
              <Check
                v-if="themeMode === option.mode"
                :size="16"
                :style="{ color: 'var(--color-primary)' }"
              />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
