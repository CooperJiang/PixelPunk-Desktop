/**
 * 主题配置
 *
 * 定义应用中所有可用的主题及其颜色方案
 */

export interface ThemeColors {
  // 主色调
  primary: string;
  primaryHover: string;
  primaryActive: string;

  // 次要色
  secondary: string;
  secondaryHover: string;

  // 强调色
  accent: string;
  accentGlow: string;

  // 背景色
  bgBase: string;
  bgElevated: string;
  bgHover: string;
  bgActive: string;

  // 文字颜色
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // 边框
  border: string;
  borderHover: string;

  // 状态色
  success: string;
  warning: string;
  error: string;
  info: string;

  // 特殊效果
  glow: string;
  shadow: string;
}

/**
 * 设计系统变量（间距、尺寸、字体等）
 */
export interface ThemeDesignTokens {
  // 间距系统 (px)
  spacing: {
    xs: string; // 4px
    sm: string; // 8px
    md: string; // 16px
    lg: string; // 24px
    xl: string; // 32px
    "2xl": string; // 48px
    "3xl": string; // 64px
  };

  // 圆角系统 (px)
  radius: {
    none: string; // 0
    sm: string; // 4px
    md: string; // 8px
    lg: string; // 12px
    xl: string; // 16px
    full: string; // 9999px
  };

  // 字体大小 (px)
  fontSize: {
    xs: string; // 12px
    sm: string; // 14px
    base: string; // 16px
    lg: string; // 18px
    xl: string; // 20px
    "2xl": string; // 24px
    "3xl": string; // 30px
    "4xl": string; // 36px
  };

  // 字重
  fontWeight: {
    normal: string; // 400
    medium: string; // 500
    semibold: string; // 600
    bold: string; // 700
  };

  // 行高
  lineHeight: {
    tight: string; // 1.2
    normal: string; // 1.5
    relaxed: string; // 1.75
  };

  // 组件尺寸
  size: {
    icon: {
      sm: string; // 16px
      md: string; // 20px
      lg: string; // 24px
      xl: string; // 32px
    };
    button: {
      sm: string; // 32px
      md: string; // 40px
      lg: string; // 48px
    };
    input: {
      sm: string; // 32px
      md: string; // 40px
      lg: string; // 48px
    };
  };

  // 阴影系统
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // z-index层级
  zIndex: {
    base: string; // 0
    dropdown: string; // 1000
    modal: string; // 2000
    popover: string; // 3000
    toast: string; // 4000
    tooltip: string; // 5000
  };

  // 过渡动画
  transition: {
    fast: string; // 150ms
    base: string; // 200ms
    slow: string; // 300ms
    ease: string; // ease-in-out
  };
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  isDark: boolean;
  colors: ThemeColors;
  tokens: ThemeDesignTokens;
}

/**
 * 通用设计系统变量（所有主题共用）
 */
export const commonDesignTokens: ThemeDesignTokens = {
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },
  radius: {
    none: "0",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    normal: "1.5",
    relaxed: "1.75",
  },
  size: {
    icon: {
      sm: "16px",
      md: "20px",
      lg: "24px",
      xl: "32px",
    },
    button: {
      sm: "32px",
      md: "40px",
      lg: "48px",
    },
    input: {
      sm: "32px",
      md: "40px",
      lg: "48px",
    },
  },
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  zIndex: {
    base: "0",
    dropdown: "1000",
    modal: "2000",
    popover: "3000",
    toast: "4000",
    tooltip: "5000",
  },
  transition: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    ease: "ease-in-out",
  },
};

/**
 * 赛博朋克暗色主题（默认）
 */
export const cyberpunkDarkTheme: Theme = {
  id: "cyberpunk-dark",
  name: "cyberpunk",
  displayName: "赛博朋克",
  isDark: true,
  colors: {
    // 主色调 - 柔和紫色
    primary: "#a78bfa",
    primaryHover: "#8b5cf6",
    primaryActive: "#7c3aed",

    // 次要色 - 青绿色
    secondary: "#34d399",
    secondaryHover: "#10b981",

    // 强调色 - 粉紫色
    accent: "#c084fc",
    accentGlow: "rgba(192, 132, 252, 0.3)",

    // 背景色 - 深沉蓝紫黑
    bgBase: "#0f0f23",
    bgElevated: "#1a1a2e", // 深色卡片背景
    bgHover: "rgba(167, 139, 250, 0.1)",
    bgActive: "rgba(167, 139, 250, 0.2)",

    // 文字颜色
    textPrimary: "#f3f4f6",
    textSecondary: "#d1d5db",
    textMuted: "#9ca3af",
    textInverse: "#0f0f23",

    // 边框
    border: "rgba(167, 139, 250, 0.2)",
    borderHover: "rgba(167, 139, 250, 0.4)",

    // 状态色
    success: "#10b981",
    warning: "#f59e0b",
    error: "#f87171",
    info: "#60a5fa",

    // 特殊效果
    glow: "rgba(167, 139, 250, 0.5)",
    shadow: "rgba(167, 139, 250, 0.3)",
  },
  tokens: commonDesignTokens,
};

/**
 * 现代亮色主题
 */
export const modernLightTheme: Theme = {
  id: "modern-light",
  name: "light",
  displayName: "明亮模式",
  isDark: false,
  colors: {
    // 主色调 - 蓝色
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    primaryActive: "#1d4ed8",

    // 次要色 - 紫色
    secondary: "#8b5cf6",
    secondaryHover: "#7c3aed",

    // 强调色
    accent: "#06b6d4",
    accentGlow: "rgba(6, 182, 212, 0.2)",

    // 背景色
    bgBase: "#ffffff",
    bgElevated: "#f9fafb",
    bgHover: "#f3f4f6",
    bgActive: "#e5e7eb",

    // 文字颜色
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",

    // 边框
    border: "#e5e7eb",
    borderHover: "#d1d5db",

    // 状态色
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",

    // 特殊效果
    glow: "rgba(59, 130, 246, 0.3)",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  tokens: commonDesignTokens,
};

/**
 * 所有可用主题
 */
export const themes: Theme[] = [cyberpunkDarkTheme, modernLightTheme];

/**
 * 根据 ID 获取主题
 */
export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) || cyberpunkDarkTheme;
}

/**
 * 根据模式获取默认主题
 */
export function getDefaultTheme(mode: "light" | "dark"): Theme {
  return mode === "dark" ? cyberpunkDarkTheme : modernLightTheme;
}
