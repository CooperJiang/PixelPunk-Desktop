<script setup lang="ts">
import { ref } from "vue";
import { useTheme, type ThemeMode } from "@/composables/useTheme";
import { Sun, Moon, Monitor, Check } from "lucide-vue-next";

const { themeMode, isDark, setThemeMode } = useTheme();

const showThemeMenu = ref(false);

// 主题选项
const themeOptions: Array<{ mode: ThemeMode; icon: any; label: string }> = [
  { mode: "light", icon: Sun, label: "明亮模式" },
  { mode: "dark", icon: Moon, label: "暗黑模式" },
  { mode: "system", icon: Monitor, label: "跟随系统" },
];

const handleThemeChange = (mode: ThemeMode) => {
  setThemeMode(mode);
  showThemeMenu.value = false;
};

// 获取当前图标
const getCurrentIcon = () => {
  if (themeMode.value === "system") return Monitor;
  if (themeMode.value === "dark") return Moon;
  return Sun;
};
</script>

<template>
  <div class="relative">
    <!-- 主题切换按钮 -->
    <button
      :class="[
        'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
        'hover:bg-[var(--color-bg-hover)]',
      ]"
      :style="{ color: 'var(--color-primary)' }"
      :title="themeOptions.find(t => t.mode === themeMode)?.label"
      @click="showThemeMenu = !showThemeMenu"
    >
      <component :is="getCurrentIcon()" :size="20" :stroke-width="2" />
    </button>

    <!-- 主题选择菜单 -->
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
        class="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-lg backdrop-blur-md"
        :style="{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
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
            @mouseenter="$event.currentTarget.style.background = 'var(--color-bg-hover)'"
            @mouseleave="$event.currentTarget.style.background = themeMode === option.mode ? 'var(--color-bg-active)' : 'transparent'"
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

    <!-- 点击外部关闭菜单 -->
    <div
      v-if="showThemeMenu"
      class="fixed inset-0 z-40"
      @click="showThemeMenu = false"
    />
  </div>
</template>
