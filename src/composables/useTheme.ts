/**
 * 主题系统
 *
 * 功能：
 * - 支持多种主题（赛博朋克、现代亮色、经典暗色等）
 * - 自动检测系统主题（深色/浅色）
 * - 监听系统主题变化
 * - 支持用户手动切换主题
 * - 持久化保存用户偏好
 * - CSS 变量系统
 *
 * 使用示例：
 * ```typescript
 * import { useTheme } from '@/composables/useTheme';
 *
 * const { currentTheme, isDark, setTheme, toggleTheme, availableThemes } = useTheme();
 *
 * // 设置主题
 * setTheme('cyberpunk-dark');
 *
 * // 切换深色/浅色
 * toggleTheme();
 * ```
 */

import { ref, computed } from "vue";
import { storage } from "@/utils/storage";
import {
  themes,
  getThemeById,
  getDefaultTheme,
  type Theme,
} from "@/config/themes";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "app.theme";
const THEME_ID_KEY = "app.theme.id";
const HTML_ATTR = "data-theme";

export function useTheme() {
  const themeMode = ref<ThemeMode>("light");
  const systemTheme = ref<"light" | "dark">("light");
  let mediaQuery: MediaQueryList | null = null;

  /**
   * 实际应用的主题模式（解析 system）
   */
  const activeMode = computed<"light" | "dark">(() => {
    if (themeMode.value === "system") {
      return systemTheme.value;
    }
    return themeMode.value;
  });

  /**
   * 当前主题对象
   */
  const currentTheme = computed<Theme>(() => {
    return getDefaultTheme(activeMode.value);
  });

  /**
   * 是否为深色模式
   */
  const isDark = computed(() => activeMode.value === "dark");

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
   * 应用主题到 DOM（应用 CSS 变量）
   */
  const applyTheme = (theme: Theme) => {
    const html = document.documentElement;
    const { colors, tokens } = theme;

    // 设置 data-theme 属性
    html.setAttribute(HTML_ATTR, theme.name);

    // 设置 dark class（兼容 TailwindCSS）
    if (theme.isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // 应用颜色变量
    html.style.setProperty("--color-primary", colors.primary);
    html.style.setProperty("--color-primary-hover", colors.primaryHover);
    html.style.setProperty("--color-primary-active", colors.primaryActive);

    html.style.setProperty("--color-secondary", colors.secondary);
    html.style.setProperty("--color-secondary-hover", colors.secondaryHover);

    html.style.setProperty("--color-accent", colors.accent);
    html.style.setProperty("--color-accent-glow", colors.accentGlow);

    html.style.setProperty("--color-bg-base", colors.bgBase);
    html.style.setProperty("--color-bg-elevated", colors.bgElevated);
    html.style.setProperty("--color-bg-hover", colors.bgHover);
    html.style.setProperty("--color-bg-active", colors.bgActive);

    html.style.setProperty("--color-text-primary", colors.textPrimary);
    html.style.setProperty("--color-text-secondary", colors.textSecondary);
    html.style.setProperty("--color-text-muted", colors.textMuted);
    html.style.setProperty("--color-text-inverse", colors.textInverse);

    html.style.setProperty("--color-border", colors.border);
    html.style.setProperty("--color-border-hover", colors.borderHover);

    html.style.setProperty("--color-success", colors.success);
    html.style.setProperty("--color-warning", colors.warning);
    html.style.setProperty("--color-error", colors.error);
    html.style.setProperty("--color-info", colors.info);

    html.style.setProperty("--color-glow", colors.glow);
    html.style.setProperty("--color-shadow", colors.shadow);

    // 应用设计系统变量
    // 间距
    html.style.setProperty("--spacing-xs", tokens.spacing.xs);
    html.style.setProperty("--spacing-sm", tokens.spacing.sm);
    html.style.setProperty("--spacing-md", tokens.spacing.md);
    html.style.setProperty("--spacing-lg", tokens.spacing.lg);
    html.style.setProperty("--spacing-xl", tokens.spacing.xl);
    html.style.setProperty("--spacing-2xl", tokens.spacing["2xl"]);
    html.style.setProperty("--spacing-3xl", tokens.spacing["3xl"]);

    // 圆角
    html.style.setProperty("--radius-none", tokens.radius.none);
    html.style.setProperty("--radius-sm", tokens.radius.sm);
    html.style.setProperty("--radius-md", tokens.radius.md);
    html.style.setProperty("--radius-lg", tokens.radius.lg);
    html.style.setProperty("--radius-xl", tokens.radius.xl);
    html.style.setProperty("--radius-full", tokens.radius.full);

    // 字体大小
    html.style.setProperty("--font-size-xs", tokens.fontSize.xs);
    html.style.setProperty("--font-size-sm", tokens.fontSize.sm);
    html.style.setProperty("--font-size-base", tokens.fontSize.base);
    html.style.setProperty("--font-size-lg", tokens.fontSize.lg);
    html.style.setProperty("--font-size-xl", tokens.fontSize.xl);
    html.style.setProperty("--font-size-2xl", tokens.fontSize["2xl"]);
    html.style.setProperty("--font-size-3xl", tokens.fontSize["3xl"]);
    html.style.setProperty("--font-size-4xl", tokens.fontSize["4xl"]);

    // 字重
    html.style.setProperty("--font-weight-normal", tokens.fontWeight.normal);
    html.style.setProperty("--font-weight-medium", tokens.fontWeight.medium);
    html.style.setProperty(
      "--font-weight-semibold",
      tokens.fontWeight.semibold,
    );
    html.style.setProperty("--font-weight-bold", tokens.fontWeight.bold);

    // 行高
    html.style.setProperty("--line-height-tight", tokens.lineHeight.tight);
    html.style.setProperty("--line-height-normal", tokens.lineHeight.normal);
    html.style.setProperty("--line-height-relaxed", tokens.lineHeight.relaxed);

    // 图标尺寸
    html.style.setProperty("--size-icon-sm", tokens.size.icon.sm);
    html.style.setProperty("--size-icon-md", tokens.size.icon.md);
    html.style.setProperty("--size-icon-lg", tokens.size.icon.lg);
    html.style.setProperty("--size-icon-xl", tokens.size.icon.xl);

    // 按钮尺寸
    html.style.setProperty("--size-button-sm", tokens.size.button.sm);
    html.style.setProperty("--size-button-md", tokens.size.button.md);
    html.style.setProperty("--size-button-lg", tokens.size.button.lg);

    // 输入框尺寸
    html.style.setProperty("--size-input-sm", tokens.size.input.sm);
    html.style.setProperty("--size-input-md", tokens.size.input.md);
    html.style.setProperty("--size-input-lg", tokens.size.input.lg);

    // 阴影
    html.style.setProperty("--shadow-sm", tokens.shadow.sm);
    html.style.setProperty("--shadow-md", tokens.shadow.md);
    html.style.setProperty("--shadow-lg", tokens.shadow.lg);
    html.style.setProperty("--shadow-xl", tokens.shadow.xl);

    // z-index
    html.style.setProperty("--z-index-base", tokens.zIndex.base);
    html.style.setProperty("--z-index-dropdown", tokens.zIndex.dropdown);
    html.style.setProperty("--z-index-modal", tokens.zIndex.modal);
    html.style.setProperty("--z-index-popover", tokens.zIndex.popover);
    html.style.setProperty("--z-index-toast", tokens.zIndex.toast);
    html.style.setProperty("--z-index-tooltip", tokens.zIndex.tooltip);

    // 过渡动画
    html.style.setProperty("--transition-fast", tokens.transition.fast);
    html.style.setProperty("--transition-base", tokens.transition.base);
    html.style.setProperty("--transition-slow", tokens.transition.slow);
    html.style.setProperty("--transition-ease", tokens.transition.ease);
  };

  /**
   * 设置主题模式（light/dark/system）
   */
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode;
    storage.set(STORAGE_KEY, mode);

    // 应用主题
    const theme = getDefaultTheme(activeMode.value);
    applyTheme(theme);
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
      if (themeMode.value === "system") {
        const theme = getDefaultTheme(systemTheme.value);
        applyTheme(theme);
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

    // 读取保存的主题模式
    const savedMode = storage.get<ThemeMode>(STORAGE_KEY, "light");
    themeMode.value = savedMode;

    // 应用主题
    const theme = getDefaultTheme(activeMode.value);
    applyTheme(theme);

    // 开始监听系统主题变化
    startSystemThemeListener();
  };

  // 立即初始化主题（不使用 onMounted 避免在 async setup 中的警告）
  initTheme();

  return {
    // 主题数据
    themeMode,
    currentTheme,
    isDark,

    // 主题操作
    setThemeMode,

    // 清理方法（供手动调用）
    cleanup: stopSystemThemeListener,
  };
}
