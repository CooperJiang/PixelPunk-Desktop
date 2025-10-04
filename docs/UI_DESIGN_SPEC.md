# PixelPunk Desktop UI 设计规范

> 本文档定义了 PixelPunk Desktop 应用的 UI 设计规范，所有组件开发必须严格遵守此规范。

## 1. 设计系统概述

PixelPunk Desktop 采用赛博朋克风格的设计语言，强调科技感、未来感和沉浸感。

### 1.1 设计原则

- **科技美学** - 使用霓虹色、渐变和发光效果
- **简洁直观** - 清晰的信息层级和操作流程
- **一致性** - 统一的视觉语言和交互模式
- **可访问性** - 支持键盘导航和无障碍功能

## 2. 颜色系统

### 2.1 主题色

```css
/* 主题色变量定义 */
--color-primary: #00FFFF;           /* 青色 - 主品牌色 */
--color-primary-hover: #00CCCC;     /* 青色悬停态 */
--color-primary-active: #00B8D4;    /* 青色激活态 */
--color-secondary: #FF00FF;         /* 品红色 - 次要色 */
```

### 2.2 功能色

```css
--color-success: #00E676;    /* 成功 - 绿色 */
--color-warning: #FFD600;    /* 警告 - 黄色 */
--color-error: #FF1744;      /* 错误 - 红色 */
--color-info: #00B8D4;       /* 信息 - 蓝色 */
```

### 2.3 中性色

```css
--color-text-primary: #FFFFFF;       /* 主要文本 */
--color-text-secondary: #B0BEC5;     /* 次要文本 */
--color-text-muted: #78909C;         /* 辅助文本 */
--color-text-disabled: #546E7A;      /* 禁用文本 */
--color-text-inverse: #000000;       /* 反色文本 */

--color-bg-base: #0D1117;            /* 基础背景 */
--color-bg-elevated: #161B22;        /* 浮起背景 */
--color-bg-overlay: #1C2128;         /* 遮罩背景 */
--color-bg-active: #21262D;          /* 激活背景 */
--color-bg-hover: rgba(255,255,255,0.05); /* 悬停背景 */

--color-border: rgba(0,255,255,0.3); /* 边框 */
--color-border-hover: rgba(0,255,255,0.5); /* 悬停边框 */
```

### 2.4 使用规范

- **主色调** - 用于强调、CTA按钮、重要信息
- **功能色** - 仅用于状态反馈，不可滥用
- **中性色** - 用于文本、背景、边框等基础元素
- **透明度** - 使用 rgba 实现玻璃态和层次感

## 3. 间距系统

### 3.1 间距值

```css
--spacing-xs: 4px;      /* 极小间距 */
--spacing-sm: 8px;      /* 小间距 */
--spacing-md: 12px;     /* 中等间距 */
--spacing-lg: 16px;     /* 大间距 */
--spacing-xl: 24px;     /* 超大间距 */
--spacing-2xl: 32px;    /* 特大间距 */
--spacing-3xl: 48px;    /* 巨大间距 */
```

### 3.2 使用规范

- **组件内部** - 使用 xs/sm 间距
- **组件之间** - 使用 md/lg 间距
- **区块之间** - 使用 xl/2xl 间距
- **页面布局** - 使用 2xl/3xl 间距

## 4. 字体系统

### 4.1 字号规范

```css
--font-size-xs: 11px;    /* 辅助文字 */
--font-size-sm: 12px;    /* 次要文字 */
--font-size-base: 13px;  /* 正文 */
--font-size-md: 14px;    /* 标题辅助 */
--font-size-lg: 16px;    /* 小标题 */
--font-size-xl: 18px;    /* 中标题 */
--font-size-2xl: 24px;   /* 大标题 */
--font-size-3xl: 32px;   /* 特大标题 */
```

### 4.2 字重规范

```css
--font-weight-normal: 400;    /* 常规 */
--font-weight-medium: 500;    /* 中等 */
--font-weight-semibold: 600;  /* 半粗 */
--font-weight-bold: 700;      /* 粗体 */
```

### 4.3 行高规范

```css
--line-height-tight: 1.25;   /* 紧凑 - 标题使用 */
--line-height-normal: 1.5;   /* 正常 - 正文使用 */
--line-height-relaxed: 1.75; /* 宽松 - 长文本使用 */
```

## 5. 圆角系统

```css
--radius-sm: 4px;    /* 小圆角 - 小按钮、标签 */
--radius-md: 6px;    /* 中圆角 - 按钮、输入框 */
--radius-lg: 8px;    /* 大圆角 - 卡片 */
--radius-xl: 12px;   /* 超大圆角 - 对话框 */
--radius-full: 9999px; /* 全圆角 - 圆形按钮 */
```

## 6. 阴影系统

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.1);                    /* 小阴影 */
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);                    /* 中阴影 */
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);            /* 大阴影 */
--shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1);            /* 超大阴影 */
--shadow-glow: 0 0 15px rgba(0,255,255,0.3);              /* 发光效果 */
--shadow-glow-strong: 0 0 20px rgba(0,255,255,0.5);       /* 强发光 */
```

### 使用场景

- **sm** - 按钮、标签
- **md** - 下拉菜单、工具提示
- **lg** - 卡片、对话框
- **xl** - 模态框、抽屉
- **glow** - 主题色按钮、激活状态
- **glow-strong** - hover状态、focus状态

## 7. 动画系统

### 7.1 过渡时长

```css
--transition-fast: 0.15s;    /* 快速 - 颜色变化 */
--transition-base: 0.2s;     /* 基础 - 常规过渡 */
--transition-slow: 0.3s;     /* 慢速 - 复杂动画 */
```

### 7.2 缓动函数

```css
--transition-ease: cubic-bezier(0.4, 0, 0.2, 1);      /* 标准 */
--transition-ease-in: cubic-bezier(0.4, 0, 1, 1);     /* 淡入 */
--transition-ease-out: cubic-bezier(0, 0, 0.2, 1);    /* 淡出 */
--transition-ease-in-out: cubic-bezier(0.4, 0, 0.6, 1); /* 淡入淡出 */
```

### 7.3 使用规范

- **颜色变化** - fast + ease
- **位移、缩放** - base + ease-in-out
- **弹出动画** - slow + ease-out
- **消失动画** - fast + ease-in

## 8. 组件规范

### 8.1 按钮 (Button)

#### 尺寸规范

```
Small:   高度 24px, padding: 4px 8px,  字号: 11px
Medium:  高度 32px, padding: 8px 16px, 字号: 13px
Large:   高度 40px, padding: 12px 24px, 字号: 14px
```

#### 类型规范

- **primary** - 主要按钮，使用主题色背景
- **secondary** - 次要按钮，使用主题色半透明背景
- **outlined** - 描边按钮，透明背景 + 主题色边框
- **text** - 文本按钮，无边框无背景
- **danger** - 危险按钮，使用错误色背景
- **success** - 成功按钮，使用成功色背景

#### 状态规范

- **normal** - 默认状态
- **hover** - 微提升 (translateY(-1px)) + 发光阴影
- **active** - 按下状态
- **disabled** - 50%透明度 + 灰度滤镜
- **loading** - 显示loading图标

### 8.2 输入框 (Input)

#### 尺寸规范

```
Small:   高度 28px, padding: 4px 8px,  字号: 12px
Medium:  高度 32px, padding: 6px 12px, 字号: 13px
Large:   高度 40px, padding: 8px 16px, 字号: 14px
```

#### 状态规范

- **normal** - 主题色边框 + 半透明背景
- **hover** - 边框颜色加深
- **focus** - 发光阴影 (box-shadow)
- **error** - 错误色边框 + 错误提示
- **disabled** - 禁用样式
- **readonly** - 只读样式

#### 功能规范

- 支持 prefix/suffix 图标
- 支持 clearable 清除按钮
- 支持 password 类型切换显示
- 支持 textarea 多行输入

### 8.3 复选框 (Checkbox)

#### 尺寸规范

```
Small:   14x14px, 图标: 7px
Medium:  18x18px, 图标: 10px
Large:   22x22px, 图标: 12px
```

#### 状态规范

- **unchecked** - 主题色边框 + 透明背景
- **checked** - 主题色边框 + 半透明背景 + 勾选图标
- **indeterminate** - 减号图标
- **disabled** - 禁用样式
- **hover** - 发光效果

### 8.4 标签页 (Tab)

#### 样式规范

- **下划线模式** - 底部主题色下划线
- **卡片模式** - 激活项背景高亮
- **按钮模式** - 类似按钮组

#### 状态规范

- **active** - 主题色 + 下划线/背景
- **inactive** - 次要文本色
- **hover** - 文本色加深
- **disabled** - 禁用样式

## 9. 层级系统 (Z-index)

```css
--z-index-dropdown: 1000;      /* 下拉菜单 */
--z-index-sticky: 1020;        /* 固定元素 */
--z-index-fixed: 1030;         /* 浮动元素 */
--z-index-modal-backdrop: 1040; /* 模态背景 */
--z-index-modal: 1050;         /* 模态框 */
--z-index-popover: 1060;       /* 弹出层 */
--z-index-tooltip: 1070;       /* 工具提示 */
```

## 10. 响应式规范

### 10.1 断点

```css
--breakpoint-sm: 640px;    /* 小屏幕 */
--breakpoint-md: 768px;    /* 中屏幕 */
--breakpoint-lg: 1024px;   /* 大屏幕 */
--breakpoint-xl: 1280px;   /* 超大屏幕 */
```

### 10.2 适配规范

Desktop应用主要针对桌面端设计，但组件应该支持不同窗口尺寸：

- **最小窗口** - 800x600px
- **推荐窗口** - 1280x720px
- **最大窗口** - 自适应

## 11. 无障碍规范

### 11.1 键盘导航

- 所有可交互元素必须支持 Tab 键导航
- 支持 Enter/Space 触发按钮
- 支持 Escape 关闭弹窗
- 支持方向键在列表中导航

### 11.2 焦点可见

- 焦点状态必须有明显视觉反馈
- 使用 outline 或 box-shadow 表示焦点
- 焦点颜色使用主题色

### 11.3 ARIA 属性

- 使用语义化HTML标签
- 为自定义组件添加适当的 role 属性
- 为图标按钮添加 aria-label
- 为加载状态添加 aria-busy

## 12. 性能规范

### 12.1 动画性能

- 优先使用 transform 和 opacity
- 避免使用 width/height 做动画
- 复杂动画使用 will-change 提示

### 12.2 CSS优化

- 使用 CSS变量统一管理
- 避免深层嵌套选择器
- 使用 scoped 避免样式污染

## 13. 组件开发规范

### 13.1 命名规范

- 组件名：PascalCase (如: Button, Input)
- 文件名：PascalCase (如: Button.vue)
- CSS类名：kebab-case (如: .btn-primary)
- CSS变量：--kebab-case (如: --color-primary)

### 13.2 文件结构

```
components/
├── Button/
│   ├── index.vue      # 组件实现
│   ├── types.ts       # TypeScript类型定义
│   └── README.md      # 组件文档（可选）
```

### 13.3 Props规范

- 使用 TypeScript 定义 Props
- 提供合理的默认值
- 添加清晰的注释说明

### 13.4 事件规范

- 使用标准事件名 (click, change, input等)
- 自定义事件使用动词 (update, submit等)
- 统一使用 emit 抛出事件

## 14. 测试规范

### 14.1 组件测试

- 测试基本渲染
- 测试不同 props 组合
- 测试用户交互
- 测试边界情况

### 14.2 可访问性测试

- 键盘导航测试
- 屏幕阅读器测试
- 色彩对比度测试

---

**版本**: v1.0.0
**更新日期**: 2025-10-03
**维护者**: PixelPunk Team
