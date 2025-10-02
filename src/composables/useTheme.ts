/**
 * 主题系统
 *
 * 功能：
 * - 自动检测系统主题（深色/浅色）
 * - 监听系统主题变化
 * - 支持用户手动切换主题
 * - 持久化保存用户偏好
 *
 * 使用示例：
 * ```typescript
 * import { useTheme } from '@/composables/useTheme';
 *
 * const { theme, isDark, setTheme, toggleTheme } = useTheme();
 *
 * // 设置主题
 * setTheme('dark');
 *
 * // 切换主题
 * toggleTheme();
 *
 * // 跟随系统
 * setTheme('system');
 * ```
 */

/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted, computed } from "vue";
import { storage } from "@/utils/storage";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "app.theme";
const HTML_ATTR = "data-theme";

export function useTheme() {
  const theme = ref<ThemeMode>("system");
  const systemTheme = ref<"light" | "dark">("light");
  let mediaQuery: MediaQueryList | null = null;

  /**
   * 实际应用的主题（解析 system）
   */
  const activeTheme = computed(() => {
    if (theme.value === "system") {
      return systemTheme.value;
    }
    return theme.value;
  });

  /**
   * 是否为深色模式
   */
  const isDark = computed(() => activeTheme.value === "dark");

  /**
   * 检测系统主题
   */
  const detectSystemTheme = (): "light" | "dark" => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  };

  /**
   * 应用主题到 DOM
   */
  const applyTheme = (themeValue: "light" | "dark") => {
    const html = document.documentElement;
    html.setAttribute(HTML_ATTR, themeValue);

    // 同时设置 class 以兼容 TailwindCSS dark mode
    if (themeValue === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  /**
   * 设置主题
   */
  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme;
    storage.set(STORAGE_KEY, newTheme);

    // 立即应用主题
    if (newTheme === "system") {
      applyTheme(systemTheme.value);
    } else {
      applyTheme(newTheme);
    }
  };

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    if (theme.value === "system") {
      // 从系统模式切换到相反的主题
      setTheme(systemTheme.value === "dark" ? "light" : "dark");
    } else {
      // 在 light 和 dark 之间切换
      setTheme(theme.value === "dark" ? "light" : "dark");
    }
  };

  /**
   * 监听系统主题变化
   */
  const startSystemThemeListener = () => {
    if (!window.matchMedia) return;

    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      systemTheme.value = e.matches ? "dark" : "light";

      // 如果当前是跟随系统，则应用新主题
      if (theme.value === "system") {
        applyTheme(systemTheme.value);
      }
    };

    // 兼容不同浏览器的 API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  };

  /**
   * 停止监听系统主题
   */
  const stopSystemThemeListener = () => {
    if (!mediaQuery) return;

    const handleChange = (e: MediaQueryListEvent) => {
      systemTheme.value = e.matches ? "dark" : "light";
    };

    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener("change", handleChange);
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(handleChange);
    }
  };

  /**
   * 初始化主题
   */
  const initTheme = () => {
    // 检测系统主题
    systemTheme.value = detectSystemTheme();

    // 读取保存的主题设置
    const savedTheme = storage.get<ThemeMode>(STORAGE_KEY, "system");
    theme.value = savedTheme;

    // 应用主题
    if (savedTheme === "system") {
      applyTheme(systemTheme.value);
    } else {
      applyTheme(savedTheme);
    }

    // 开始监听系统主题变化
    startSystemThemeListener();
  };

  // 生命周期
  onMounted(() => {
    initTheme();
  });

  onUnmounted(() => {
    stopSystemThemeListener();
  });

  return {
    theme,
    activeTheme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
