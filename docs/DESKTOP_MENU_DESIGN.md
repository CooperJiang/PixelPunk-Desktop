# PixelPunk 桌面端菜单设计文档

> 文档创建时间：2025-10-05
> 版本：v1.0
> 菜单方案：功能导向型（方案一）

## 📋 目录

- [设计原则](#设计原则)
- [菜单结构总览](#菜单结构总览)
- [详细菜单设计](#详细菜单设计)
- [菜单配置](#菜单配置)
- [路由映射](#路由映射)
- [权限控制](#权限控制)
- [未来扩展](#未来扩展)

---

## 设计原则

### 1. 功能优先

- 按照功能模块划分，而非简单的页面导航
- 每个一级菜单代表一个功能领域
- 二级菜单是该功能领域的细分

### 2. 易于理解

- 菜单名称简洁明了
- 图标与功能高度相关
- 符合用户心智模型

### 3. 高频在前

- 最常用的功能放在前面
- 上传、文件管理等高频功能优先展示
- 设置、管理等低频功能靠后

### 4. 扩展性强

- 预留扩展位置
- 菜单结构可以灵活增删
- 不破坏原有逻辑

### 5. 一致性

- 图标库统一使用 `lucide-vue-next`
- 命名风格统一
- 交互方式统一

---

## 菜单结构总览

```
📱 PixelPunk Desktop

├─ 🏠 首页 (Dashboard)
│  ├─ 📊 数据概览
│  └─ 🔥 快捷操作
│
├─ ⬆️ 上传 (Upload)
│  ├─ 📤 快速上传
│  ├─ 📸 截图上传
│  ├─ 📋 剪贴板上传
│  └─ ⚙️ 上传设置
│
├─ 📁 我的文件 (Files)
│  ├─ 📋 全部文件
│  ├─ 🗂️ 文件夹
│  ├─ 🏷️ 标签
│  ├─ 📑 分类
│  └─ 🔍 高级搜索
│
├─ 🔗 分享管理 (Shares)
│  ├─ 📋 我的分享
│  └─ 📊 分享统计
│
├─ 🔧 工具箱 (Tools)
│  ├─ 🖼️ 图片处理
│  ├─ 📋 剪贴板历史
│  ├─ 🔑 API 管理
│  ├─ 📦 批量操作
│  └─ 🕐 上传历史
│
├─ ⚙️ 设置 (Settings)
│  ├─ 🎨 外观设置
│  ├─ ⌨️ 快捷键
│  ├─ 🔔 通知
│  ├─ 🌐 服务器
│  ├─ 📤 上传默认配置
│  └─ 💾 本地缓存
│
├─ 👤 个人中心 (Profile)
│  ├─ 📊 我的统计
│  ├─ 🔐 账号安全
│  └─ 💳 存储空间
│
└─ 🛡️ 管理中心 (Admin) [管理员可见]
   ├─ 👥 用户管理
   ├─ 📁 文件审核
   ├─ 🤖 AI 管理
   ├─ 📊 系统监控
   └─ ⚙️ 系统设置
```

---

## 详细菜单设计

### 1. 🏠 首页 (Dashboard)

**路由**：`/dashboard`
**图标**：`Home`
**说明**：用户登录后的默认页面，提供整体数据概览和快捷操作入口

#### 子菜单

##### 📊 数据概览

- **路由**：`/dashboard#overview`
- **图标**：`BarChart3`
- **功能**：
  - 存储空间使用情况（饼图/进度条）
  - 上传统计（今日/本周/本月）
  - 文件数量统计
  - 流量使用统计
  - 最近 7 天上传趋势图

##### 🔥 快捷操作

- **路由**：`/dashboard#quick-actions`
- **图标**：`Zap`
- **功能**：
  - 快速上传按钮（大按钮）
  - 最近上传的文件（5-10 条）
  - 常用文件夹快速访问
  - 常用标签快速访问
  - 快速分享入口

---

### 2. ⬆️ 上传 (Upload)

**路由**：`/upload`
**图标**：`Upload`
**说明**：所有上传相关功能的集中入口

#### 子菜单

##### 📤 快速上传

- **路由**：`/upload/quick`
- **图标**：`FileUp`
- **功能**：
  - 拖拽上传区域
  - 点击选择文件按钮
  - 文件夹上传按钮
  - 上传队列实时显示
  - 上传进度条
  - 成功/失败文件列表

##### 📸 截图上传

- **路由**：`/upload/screenshot`
- **图标**：`Camera`
- **功能**：
  - 全屏截图按钮
  - 区域截图按钮
  - 窗口截图按钮
  - 延时截图设置
  - 截图预览
  - 标注工具（矩形、箭头、文字、马赛克）
  - 上传/取消按钮

##### 📋 剪贴板上传

- **路由**：`/upload/clipboard`
- **图标**：`Clipboard`
- **功能**：
  - 剪贴板监听开关
  - 当前剪贴板内容预览
  - 立即上传按钮
  - 剪贴板历史记录（最近 10 条）
  - 监听设置（自动上传/询问/禁用）

##### ⚙️ 上传设置

- **路由**：`/upload/settings`
- **图标**：`Settings`
- **功能**：
  - 默认文件夹选择
  - 默认标签设置
  - 默认访问权限（public/private/protected）
  - 自动优化开关
  - 压缩质量设置
  - 水印设置
  - 存储时长设置
  - 自动清理设置
  - 重命名规则设置

---

### 3. 📁 我的文件 (Files)

**路由**：`/files`
**图标**：`Folder`
**说明**：文件管理的核心区域

#### 子菜单

##### 📋 全部文件

- **路由**：`/files/all`
- **图标**：`Files`
- **功能**：
  - 文件列表（表格/网格切换）
  - 文件缩略图
  - 文件信息（名称、大小、上传时间、访问权限）
  - 快速操作按钮（查看、编辑、删除、分享、下载）
  - 批量选择
  - 排序（时间/大小/名称）
  - 筛选（类型/权限/标签）
  - 分页

##### 🗂️ 文件夹

- **路由**：`/files/folders`
- **图标**：`FolderTree`
- **功能**：
  - 文件夹树形结构
  - 创建文件夹
  - 重命名文件夹
  - 删除文件夹
  - 移动文件到文件夹
  - 文件夹内文件列表
  - 面包屑导航
  - 拖拽移动文件

##### 🏷️ 标签

- **路由**：`/files/tags`
- **图标**：`Tag`
- **功能**：
  - 标签列表（带文件数量）
  - 创建标签
  - 编辑标签（名称、颜色）
  - 删除标签
  - 点击标签查看关联文件
  - 标签分组（可选）
  - 标签统计

##### 📑 分类

- **路由**：`/files/categories`
- **图标**：`Grid3x3`
- **功能**：
  - 分类列表
  - 创建分类
  - 编辑分类
  - 删除分类
  - 点击分类查看关联文件
  - 分类统计

##### 🔍 高级搜索

- **路由**：`/files/search`
- **图标**：`Search`
- **功能**：
  - 关键词搜索
  - 文件类型筛选
  - 访问权限筛选
  - 标签筛选（多选）
  - 分类筛选
  - 文件夹筛选
  - 时间范围筛选
  - 文件大小范围筛选
  - AI 向量搜索（以图搜图）
  - 搜索历史
  - 保存搜索条件

---

### 4. 🔗 分享管理 (Shares)

**路由**：`/shares`
**图标**：`Share2`
**说明**：分享功能的管理中心

#### 子菜单

##### 📋 我的分享

- **路由**：`/shares/list`
- **图标**：`List`
- **功能**：
  - 分享列表（表格视图）
  - 分享信息（文件、创建时间、访问次数、过期时间）
  - 短链接复制
  - 二维码生成
  - 分享权限设置（密码保护）
  - 删除分享
  - 延长过期时间
  - 筛选（全部/有效/已过期）
  - 搜索

##### 📊 分享统计

- **路由**：`/shares/stats`
- **图标**：`TrendingUp`
- **功能**：
  - 分享总数统计
  - 访问总数统计
  - 热门分享排行
  - 访问趋势图
  - 访问来源统计（IP/设备/浏览器）
  - 时间分布图
  - 导出报表

---

### 5. 🔧 工具箱 (Tools)

**路由**：`/tools`
**图标**：`Wrench`
**说明**：辅助工具集合，提升工作效率

#### 子菜单

##### 🖼️ 图片处理

- **路由**：`/tools/image-process`
- **图标**：`ImagePlus`
- **功能**：
  - **压缩工具**
    - 选择图片
    - 压缩质量调整
    - 批量压缩
    - 压缩前后对比
    - 保存/上传
  - **格式转换**
    - 选择图片
    - 目标格式选择（PNG/JPG/WebP/AVIF）
    - 批量转换
    - 保存/上传
  - **水印工具**
    - 选择图片
    - 水印类型（文字/图片）
    - 水印位置/透明度/大小
    - 批量添加水印
    - 水印模板管理
    - 保存/上传
  - **EXIF 清理**
    - 选择图片
    - 查看 EXIF 信息
    - 选择性清理（GPS/设备/时间等）
    - 批量清理
    - 保存/上传
  - **尺寸调整**
    - 选择图片
    - 目标尺寸设置
    - 保持比例/裁剪
    - 批量调整
    - 保存/上传

##### 📋 剪贴板历史

- **路由**：`/tools/clipboard-history`
- **图标**：`ClipboardList`
- **功能**：
  - 剪贴板历史记录（图片/文本）
  - 预览缩略图
  - 快速上传
  - 复制到剪贴板
  - 删除记录
  - 清空历史
  - 搜索历史
  - 设置保存数量（10/20/50/100）

##### 🔑 API 管理

- **路由**：`/tools/api`
- **图标**：`Key`
- **功能**：
  - API Key 列表
  - 生成新的 API Key
  - API Key 名称/备注
  - 查看 API Key
  - 删除 API Key
  - API 调用统计（次数/流量）
  - API 使用文档
  - 调用历史记录

##### 📦 批量操作

- **路由**：`/tools/batch`
- **图标**：`Package`
- **功能**：
  - **批量上传**
    - 选择多个文件/文件夹
    - 统一设置（文件夹/标签/权限）
    - 并发数控制
    - 失败自动重试
    - 上传进度
  - **批量下载**
    - 选择多个文件
    - 保持文件夹结构
    - 压缩包下载
    - 下载进度
  - **批量修改**
    - 选择多个文件
    - 批量修改标签
    - 批量移动文件夹
    - 批量更改权限
    - 批量设置存储时长
  - **批量删除**
    - 选择多个文件
    - 确认删除
    - 回收站功能

##### 🕐 上传历史

- **路由**：`/tools/history`
- **图标**：`History`
- **功能**：
  - 历史记录列表（最近 1000 条）
  - 文件缩略图
  - 文件信息（名称、大小、上传时间）
  - 快速搜索（本地搜索）
  - 标签筛选
  - 时间范围筛选
  - 快速操作（复制链接/重新上传/删除）
  - 批量复制链接
  - 导出历史记录（CSV/JSON）
  - 清空历史记录

---

### 6. ⚙️ 设置 (Settings)

**路由**：`/settings`
**图标**：`Settings`
**说明**：应用程序配置中心

#### 子菜单

##### 🎨 外观设置

- **路由**：`/settings/appearance`
- **图标**：`Palette`
- **功能**：
  - 主题选择（赛博朋克风格主题变体）
  - 颜色方案（默认/高对比度/护眼模式）
  - 字体大小调整
  - 缩放比例调整
  - 动画效果开关
  - 语言选择（中文/英文）
  - 时间格式（12h/24h）
  - 日期格式

##### ⌨️ 快捷键

- **路由**：`/settings/shortcuts`
- **图标**：`Keyboard`
- **功能**：
  - 快捷键列表
  - 自定义快捷键
  - 快捷键冲突检测
  - 恢复默认快捷键
  - 导入/导出快捷键配置
  - 快捷键帮助文档
  - 常用快捷键：
    - 打开上传窗口
    - 截图上传
    - 剪贴板上传
    - 查看历史
    - 复制最后上传的链接
    - 全局搜索

##### 🔔 通知

- **路由**：`/settings/notifications`
- **图标**：`Bell`
- **功能**：
  - 通知总开关
  - 上传开始通知
  - 上传进度通知（可选，每 10%/25%/50%）
  - 上传成功通知
  - 上传失败通知
  - 分享访问通知
  - 系统消息通知
  - 通知声音开关
  - 通知显示时长设置
  - 勿扰模式（时间段设置）

##### 🌐 服务器

- **路由**：`/settings/server`
- **图标**：`Server`
- **功能**：
  - API 地址配置
  - 连接测试
  - 账号切换
  - 登出
  - 多账号管理（可选）
  - 代理设置（HTTP/SOCKS5）
  - 超时设置
  - 重试次数设置

##### 📤 上传默认配置

- **路由**：`/settings/upload-defaults`
- **图标**：`FileUp`
- **功能**：
  - 默认文件夹
  - 默认标签
  - 默认访问权限
  - 默认存储时长
  - 自动优化开关
  - 压缩质量
  - 水印默认配置
  - 重命名规则
  - 自动清理设置
  - EXIF 清理开关
  - 上传模板管理（创建/编辑/删除）

##### 💾 本地缓存

- **路由**：`/settings/cache`
- **图标**：`HardDrive`
- **功能**：
  - 缓存大小查看
  - 缓存路径查看/修改
  - 历史记录保存数量
  - 剪贴板历史保存数量
  - 缓存过期时间设置
  - 清空缓存按钮
  - 离线队列管理
  - 数据库管理（备份/恢复/清空）

---

### 7. 👤 个人中心 (Profile)

**路由**：`/profile`
**图标**：`User`
**说明**：用户个人信息和统计

#### 子菜单

##### 📊 我的统计

- **路由**：`/profile/stats`
- **图标**：`BarChart`
- **功能**：
  - 存储空间使用情况
  - 文件总数统计
  - 上传统计（今日/本周/本月/总计）
  - 流量使用统计
  - 分享统计
  - 标签使用统计
  - 文件夹统计
  - 趋势图（上传/流量/访问）
  - 导出报表

##### 🔐 账号安全

- **路由**：`/profile/security`
- **图标**：`Shield`
- **功能**：
  - 用户名/邮箱显示
  - 头像上传/修改
  - 修改密码
  - 绑定邮箱
  - 两步验证设置（可选）
  - 登录历史
  - 设备管理
  - 注销其他设备

##### 💳 存储空间

- **路由**：`/profile/storage`
- **图标**：`Database`
- **功能**：
  - 当前存储空间使用情况
  - 存储空间详细占用（按类型/文件夹）
  - 存储空间升级（如果有套餐）
  - 存储空间清理建议
  - 过期文件清理
  - 大文件排行

---

### 8. 🛡️ 管理中心 (Admin)

**路由**：`/admin`
**图标**：`Shield`
**说明**：管理员专用功能
**权限**：仅管理员可见

#### 子菜单

##### 👥 用户管理

- **路由**：`/admin/users`
- **图标**：`Users`
- **功能**：
  - 用户列表
  - 用户详情查看
  - 用户权限管理（普通用户/管理员）
  - 用户启用/禁用
  - 用户存储空间配置
  - 用户统计
  - 搜索用户
  - 批量操作

##### 📁 文件审核

- **路由**：`/admin/files`
- **图标**：`FileSearch`
- **功能**：
  - 全局文件列表
  - 文件详情查看
  - 文件审核（通过/拒绝）
  - 文件删除
  - 违规文件管理
  - NSFW 文件筛选
  - 文件统计
  - 搜索文件
  - 批量操作

##### 🤖 AI 管理

- **路由**：`/admin/ai`
- **图标**：`Cpu`
- **功能**：
  - AI 服务配置
  - 向量数据库管理
  - 标签模型管理
  - NSFW 检测配置
  - AI 任务队列
  - AI 统计（调用次数/成功率）
  - 重新处理文件

##### 📊 系统监控

- **路由**：`/admin/monitor`
- **图标**：`Activity`
- **功能**：
  - 系统状态（CPU/内存/磁盘）
  - 在线用户数
  - 上传统计（实时/历史）
  - 流量统计
  - 错误日志
  - 性能监控
  - 数据库状态
  - Redis 状态

##### ⚙️ 系统设置

- **路由**：`/admin/settings`
- **图标**：`Sliders`
- **功能**：
  - 网站基本信息设置
  - 注册开关
  - 邮箱验证开关
  - 上传限制（文件大小/类型）
  - 存储配置（本地/OSS）
  - 邮件服务配置
  - 缓存配置
  - 备份配置
  - 系统维护模式

---

## 菜单配置

### TypeScript 配置文件

```typescript
// src/config/menu.config.ts

import type { Component } from "vue";
import {
  Home,
  Upload,
  Folder,
  Share2,
  Wrench,
  Settings,
  User,
  Shield,
  BarChart3,
  Zap,
  FileUp,
  Camera,
  Clipboard,
  Files,
  FolderTree,
  Tag,
  Grid3x3,
  Search,
  List,
  TrendingUp,
  ImagePlus,
  ClipboardList,
  Key,
  Package,
  History,
  Palette,
  Keyboard,
  Bell,
  Server,
  HardDrive,
  BarChart,
  Database,
  Users,
  FileSearch,
  Cpu,
  Activity,
  Sliders,
} from "lucide-vue-next";

export interface MenuItem {
  id: string;
  label: string;
  icon: Component;
  route?: string;
  children?: MenuItem[];
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  badge?: string | number; // 徽章显示（如：新功能、未读数量）
  description?: string; // 菜单项描述
}

export const menuConfig: MenuItem[] = [
  {
    id: "dashboard",
    label: "首页",
    icon: Home,
    route: "/dashboard",
    requiresAuth: true,
    description: "数据概览和快捷操作",
    children: [
      {
        id: "dashboard-overview",
        label: "数据概览",
        icon: BarChart3,
        route: "/dashboard#overview",
        description: "查看存储、上传、流量统计",
      },
      {
        id: "dashboard-quick",
        label: "快捷操作",
        icon: Zap,
        route: "/dashboard#quick-actions",
        description: "快速上传和常用功能入口",
      },
    ],
  },
  {
    id: "upload",
    label: "上传",
    icon: Upload,
    route: "/upload",
    requiresAuth: true,
    description: "上传文件到图床",
    children: [
      {
        id: "upload-quick",
        label: "快速上传",
        icon: FileUp,
        route: "/upload/quick",
        description: "拖拽或选择文件上传",
      },
      {
        id: "upload-screenshot",
        label: "截图上传",
        icon: Camera,
        route: "/upload/screenshot",
        description: "截图并上传",
        badge: "推荐",
      },
      {
        id: "upload-clipboard",
        label: "剪贴板上传",
        icon: Clipboard,
        route: "/upload/clipboard",
        description: "从剪贴板上传图片",
      },
      {
        id: "upload-settings",
        label: "上传设置",
        icon: Settings,
        route: "/upload/settings",
        description: "配置上传默认选项",
      },
    ],
  },
  {
    id: "files",
    label: "我的文件",
    icon: Folder,
    route: "/files",
    requiresAuth: true,
    description: "管理你的文件",
    children: [
      {
        id: "files-all",
        label: "全部文件",
        icon: Files,
        route: "/files/all",
        description: "查看所有上传的文件",
      },
      {
        id: "files-folders",
        label: "文件夹",
        icon: FolderTree,
        route: "/files/folders",
        description: "管理文件夹",
      },
      {
        id: "files-tags",
        label: "标签",
        icon: Tag,
        route: "/files/tags",
        description: "管理标签",
      },
      {
        id: "files-categories",
        label: "分类",
        icon: Grid3x3,
        route: "/files/categories",
        description: "管理分类",
      },
      {
        id: "files-search",
        label: "高级搜索",
        icon: Search,
        route: "/files/search",
        description: "多条件搜索文件",
      },
    ],
  },
  {
    id: "shares",
    label: "分享管理",
    icon: Share2,
    route: "/shares",
    requiresAuth: true,
    description: "管理你的分享链接",
    children: [
      {
        id: "shares-list",
        label: "我的分享",
        icon: List,
        route: "/shares/list",
        description: "查看和管理分享链接",
      },
      {
        id: "shares-stats",
        label: "分享统计",
        icon: TrendingUp,
        route: "/shares/stats",
        description: "分享数据统计",
      },
    ],
  },
  {
    id: "tools",
    label: "工具箱",
    icon: Wrench,
    route: "/tools",
    requiresAuth: true,
    description: "实用工具集合",
    children: [
      {
        id: "tools-image",
        label: "图片处理",
        icon: ImagePlus,
        route: "/tools/image-process",
        description: "压缩、转换、水印、EXIF清理",
      },
      {
        id: "tools-clipboard-history",
        label: "剪贴板历史",
        icon: ClipboardList,
        route: "/tools/clipboard-history",
        description: "查看剪贴板历史记录",
      },
      {
        id: "tools-api",
        label: "API 管理",
        icon: Key,
        route: "/tools/api",
        description: "管理 API Key",
      },
      {
        id: "tools-batch",
        label: "批量操作",
        icon: Package,
        route: "/tools/batch",
        description: "批量上传、下载、修改",
      },
      {
        id: "tools-history",
        label: "上传历史",
        icon: History,
        route: "/tools/history",
        description: "查看本地上传历史",
      },
    ],
  },
  {
    id: "settings",
    label: "设置",
    icon: Settings,
    route: "/settings",
    requiresAuth: true,
    description: "应用程序设置",
    children: [
      {
        id: "settings-appearance",
        label: "外观设置",
        icon: Palette,
        route: "/settings/appearance",
        description: "主题、语言、字体",
      },
      {
        id: "settings-shortcuts",
        label: "快捷键",
        icon: Keyboard,
        route: "/settings/shortcuts",
        description: "自定义快捷键",
      },
      {
        id: "settings-notifications",
        label: "通知",
        icon: Bell,
        route: "/settings/notifications",
        description: "通知偏好设置",
      },
      {
        id: "settings-server",
        label: "服务器",
        icon: Server,
        route: "/settings/server",
        description: "服务器和账号设置",
      },
      {
        id: "settings-upload-defaults",
        label: "上传默认配置",
        icon: FileUp,
        route: "/settings/upload-defaults",
        description: "配置默认上传选项",
      },
      {
        id: "settings-cache",
        label: "本地缓存",
        icon: HardDrive,
        route: "/settings/cache",
        description: "缓存管理",
      },
    ],
  },
  {
    id: "profile",
    label: "个人中心",
    icon: User,
    route: "/profile",
    requiresAuth: true,
    description: "个人信息和统计",
    children: [
      {
        id: "profile-stats",
        label: "我的统计",
        icon: BarChart,
        route: "/profile/stats",
        description: "查看个人数据统计",
      },
      {
        id: "profile-security",
        label: "账号安全",
        icon: Shield,
        route: "/profile/security",
        description: "密码、邮箱、两步验证",
      },
      {
        id: "profile-storage",
        label: "存储空间",
        icon: Database,
        route: "/profile/storage",
        description: "存储空间管理",
      },
    ],
  },
  {
    id: "admin",
    label: "管理中心",
    icon: Shield,
    route: "/admin",
    requiresAuth: true,
    requiresAdmin: true,
    description: "系统管理功能",
    children: [
      {
        id: "admin-users",
        label: "用户管理",
        icon: Users,
        route: "/admin/users",
        description: "管理用户",
      },
      {
        id: "admin-files",
        label: "文件审核",
        icon: FileSearch,
        route: "/admin/files",
        description: "审核和管理文件",
      },
      {
        id: "admin-ai",
        label: "AI 管理",
        icon: Cpu,
        route: "/admin/ai",
        description: "管理 AI 服务",
      },
      {
        id: "admin-monitor",
        label: "系统监控",
        icon: Activity,
        route: "/admin/monitor",
        description: "监控系统状态",
      },
      {
        id: "admin-settings",
        label: "系统设置",
        icon: Sliders,
        route: "/admin/settings",
        description: "系统配置",
      },
    ],
  },
];
```

---

## 路由映射

### 路由配置文件

```typescript
// src/router/routes.ts

import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      // 默认重定向到首页
      {
        path: "",
        redirect: "/dashboard",
      },

      // 1. 首页 Dashboard
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/Dashboard.vue"),
        meta: {
          title: "首页",
          requiresAuth: true,
        },
      },

      // 2. 上传 Upload
      {
        path: "/upload",
        name: "upload",
        redirect: "/upload/quick",
        meta: {
          title: "上传",
          requiresAuth: true,
        },
        children: [
          {
            path: "quick",
            name: "upload-quick",
            component: () => import("@/views/upload/Quick.vue"),
            meta: { title: "快速上传" },
          },
          {
            path: "screenshot",
            name: "upload-screenshot",
            component: () => import("@/views/upload/Screenshot.vue"),
            meta: { title: "截图上传" },
          },
          {
            path: "clipboard",
            name: "upload-clipboard",
            component: () => import("@/views/upload/Clipboard.vue"),
            meta: { title: "剪贴板上传" },
          },
          {
            path: "settings",
            name: "upload-settings",
            component: () => import("@/views/upload/Settings.vue"),
            meta: { title: "上传设置" },
          },
        ],
      },

      // 3. 我的文件 Files
      {
        path: "/files",
        name: "files",
        redirect: "/files/all",
        meta: {
          title: "我的文件",
          requiresAuth: true,
        },
        children: [
          {
            path: "all",
            name: "files-all",
            component: () => import("@/views/files/All.vue"),
            meta: { title: "全部文件" },
          },
          {
            path: "folders",
            name: "files-folders",
            component: () => import("@/views/files/Folders.vue"),
            meta: { title: "文件夹" },
          },
          {
            path: "tags",
            name: "files-tags",
            component: () => import("@/views/files/Tags.vue"),
            meta: { title: "标签" },
          },
          {
            path: "categories",
            name: "files-categories",
            component: () => import("@/views/files/Categories.vue"),
            meta: { title: "分类" },
          },
          {
            path: "search",
            name: "files-search",
            component: () => import("@/views/files/Search.vue"),
            meta: { title: "高级搜索" },
          },
        ],
      },

      // 4. 分享管理 Shares
      {
        path: "/shares",
        name: "shares",
        redirect: "/shares/list",
        meta: {
          title: "分享管理",
          requiresAuth: true,
        },
        children: [
          {
            path: "list",
            name: "shares-list",
            component: () => import("@/views/shares/List.vue"),
            meta: { title: "我的分享" },
          },
          {
            path: "stats",
            name: "shares-stats",
            component: () => import("@/views/shares/Stats.vue"),
            meta: { title: "分享统计" },
          },
        ],
      },

      // 5. 工具箱 Tools
      {
        path: "/tools",
        name: "tools",
        redirect: "/tools/image-process",
        meta: {
          title: "工具箱",
          requiresAuth: true,
        },
        children: [
          {
            path: "image-process",
            name: "tools-image",
            component: () => import("@/views/tools/ImageProcess.vue"),
            meta: { title: "图片处理" },
          },
          {
            path: "clipboard-history",
            name: "tools-clipboard-history",
            component: () => import("@/views/tools/ClipboardHistory.vue"),
            meta: { title: "剪贴板历史" },
          },
          {
            path: "api",
            name: "tools-api",
            component: () => import("@/views/tools/Api.vue"),
            meta: { title: "API 管理" },
          },
          {
            path: "batch",
            name: "tools-batch",
            component: () => import("@/views/tools/Batch.vue"),
            meta: { title: "批量操作" },
          },
          {
            path: "history",
            name: "tools-history",
            component: () => import("@/views/tools/History.vue"),
            meta: { title: "上传历史" },
          },
        ],
      },

      // 6. 设置 Settings
      {
        path: "/settings",
        name: "settings",
        redirect: "/settings/appearance",
        meta: {
          title: "设置",
          requiresAuth: true,
        },
        children: [
          {
            path: "appearance",
            name: "settings-appearance",
            component: () => import("@/views/settings/Appearance.vue"),
            meta: { title: "外观设置" },
          },
          {
            path: "shortcuts",
            name: "settings-shortcuts",
            component: () => import("@/views/settings/Shortcuts.vue"),
            meta: { title: "快捷键" },
          },
          {
            path: "notifications",
            name: "settings-notifications",
            component: () => import("@/views/settings/Notifications.vue"),
            meta: { title: "通知" },
          },
          {
            path: "server",
            name: "settings-server",
            component: () => import("@/views/settings/Server.vue"),
            meta: { title: "服务器" },
          },
          {
            path: "upload-defaults",
            name: "settings-upload-defaults",
            component: () => import("@/views/settings/UploadDefaults.vue"),
            meta: { title: "上传默认配置" },
          },
          {
            path: "cache",
            name: "settings-cache",
            component: () => import("@/views/settings/Cache.vue"),
            meta: { title: "本地缓存" },
          },
        ],
      },

      // 7. 个人中心 Profile
      {
        path: "/profile",
        name: "profile",
        redirect: "/profile/stats",
        meta: {
          title: "个人中心",
          requiresAuth: true,
        },
        children: [
          {
            path: "stats",
            name: "profile-stats",
            component: () => import("@/views/profile/Stats.vue"),
            meta: { title: "我的统计" },
          },
          {
            path: "security",
            name: "profile-security",
            component: () => import("@/views/profile/Security.vue"),
            meta: { title: "账号安全" },
          },
          {
            path: "storage",
            name: "profile-storage",
            component: () => import("@/views/profile/Storage.vue"),
            meta: { title: "存储空间" },
          },
        ],
      },

      // 8. 管理中心 Admin
      {
        path: "/admin",
        name: "admin",
        redirect: "/admin/users",
        meta: {
          title: "管理中心",
          requiresAuth: true,
          requiresAdmin: true,
        },
        children: [
          {
            path: "users",
            name: "admin-users",
            component: () => import("@/views/admin/Users.vue"),
            meta: { title: "用户管理" },
          },
          {
            path: "files",
            name: "admin-files",
            component: () => import("@/views/admin/Files.vue"),
            meta: { title: "文件审核" },
          },
          {
            path: "ai",
            name: "admin-ai",
            component: () => import("@/views/admin/AI.vue"),
            meta: { title: "AI 管理" },
          },
          {
            path: "monitor",
            name: "admin-monitor",
            component: () => import("@/views/admin/Monitor.vue"),
            meta: { title: "系统监控" },
          },
          {
            path: "settings",
            name: "admin-settings",
            component: () => import("@/views/admin/Settings.vue"),
            meta: { title: "系统设置" },
          },
        ],
      },
    ],
  },

  // 登录页面（独立布局）
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
    meta: {
      title: "登录",
      guest: true,
    },
  },

  // 404 页面
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/404.vue"),
    meta: {
      title: "页面未找到",
    },
  },
];

export default routes;
```

---

## 权限控制

### 路由守卫

```typescript
// src/router/guards.ts

import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";

export function setupRouterGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 设置页面标题
    document.title = to.meta.title
      ? `${to.meta.title} - PixelPunk`
      : "PixelPunk";

    // 检查是否需要登录
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next({
        path: "/dashboard",
        query: { error: "no_permission" },
      });
      return;
    }

    // 已登录用户访问登录页，重定向到首页
    if (to.meta.guest && authStore.isLoggedIn) {
      next("/dashboard");
      return;
    }

    next();
  });
}
```

### 菜单过滤

```typescript
// src/composables/useMenu.ts

import { computed } from "vue";
import { useAuthStore } from "@/store/auth";
import { menuConfig, type MenuItem } from "@/config/menu.config";

export function useMenu() {
  const authStore = useAuthStore();

  // 过滤菜单：根据权限显示/隐藏菜单项
  const filterMenu = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => {
        // 需要登录但未登录，隐藏
        if (item.requiresAuth && !authStore.isLoggedIn) {
          return false;
        }

        // 需要管理员权限但不是管理员，隐藏
        if (item.requiresAdmin && !authStore.isAdmin) {
          return false;
        }

        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterMenu(item.children) : undefined,
      }));
  };

  // 可见的菜单
  const visibleMenu = computed(() => filterMenu(menuConfig));

  // 获取当前激活的菜单
  const getActiveMenu = (route: string): string | null => {
    for (const item of menuConfig) {
      if (item.route === route) {
        return item.id;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.route === route) {
            return child.id;
          }
        }
      }
    }
    return null;
  };

  return {
    menuConfig,
    visibleMenu,
    getActiveMenu,
  };
}
```

---

## 未来扩展

### 可能的新增菜单

#### 1. 📊 数据分析（第三期）

```typescript
{
  id: 'analytics',
  label: '数据分析',
  icon: LineChart,
  route: '/analytics',
  requiresAuth: true,
  children: [
    {
      id: 'analytics-overview',
      label: '总览',
      icon: BarChart,
      route: '/analytics/overview',
    },
    {
      id: 'analytics-traffic',
      label: '流量分析',
      icon: TrendingUp,
      route: '/analytics/traffic',
    },
    {
      id: 'analytics-hotfiles',
      label: '热门文件',
      icon: Flame,
      route: '/analytics/hotfiles',
    },
  ],
}
```

#### 2. 🎨 创作工具（第四期）

```typescript
{
  id: 'creator',
  label: '创作工具',
  icon: Palette,
  route: '/creator',
  requiresAuth: true,
  children: [
    {
      id: 'creator-editor',
      label: '图片编辑器',
      icon: Edit,
      route: '/creator/editor',
    },
    {
      id: 'creator-templates',
      label: '模板库',
      icon: Layout,
      route: '/creator/templates',
    },
    {
      id: 'creator-ai-tools',
      label: 'AI 工具',
      icon: Sparkles,
      route: '/creator/ai-tools',
    },
  ],
}
```

#### 3. 🔌 扩展插件（第四期）

```typescript
{
  id: 'extensions',
  label: '扩展插件',
  icon: Plug,
  route: '/extensions',
  requiresAuth: true,
  children: [
    {
      id: 'extensions-installed',
      label: '已安装',
      icon: CheckCircle,
      route: '/extensions/installed',
    },
    {
      id: 'extensions-market',
      label: '插件市场',
      icon: ShoppingBag,
      route: '/extensions/market',
    },
    {
      id: 'extensions-custom',
      label: '自定义脚本',
      icon: Code,
      route: '/extensions/custom',
    },
  ],
}
```

### 扩展位置建议

新增菜单建议插入到以下位置：

1. **数据分析**：插入到 "我的文件" 之后
2. **创作工具**：插入到 "工具箱" 之后
3. **扩展插件**：插入到 "设置" 之前

保持菜单的逻辑顺序：

```
首页 → 上传 → 文件管理 → 数据分析 → 分享 → 工具箱 → 创作工具 → 设置 → 扩展插件 → 个人中心 → 管理中心
```

---

## 总结

### 菜单特点

1. **功能导向**：按功能领域划分，易于理解
2. **两级结构**：不超过两级，避免层级过深
3. **高频优先**：常用功能放在前面
4. **权限控制**：根据用户角色动态显示
5. **扩展性强**：预留扩展空间，易于添加新功能

### 菜单统计

- **一级菜单**：8 个（管理员可见 8 个，普通用户可见 7 个）
- **二级菜单**：42 个
- **总菜单项**：50 个

### 开发优先级

**第一期（MVP）**

1. 首页 Dashboard
2. 上传 Upload（快速上传、截图上传、剪贴板上传）
3. 我的文件 Files（全部文件、文件夹、标签、搜索）
4. 设置 Settings（外观、快捷键、通知、服务器、上传默认配置）

**第二期** 5. 工具箱 Tools（图片处理、批量操作、上传历史）6. 分享管理 Shares 7. 个人中心 Profile

**第三期** 8. 管理中心 Admin（仅管理员）9. 工具箱完善（剪贴板历史、API 管理）

这套菜单设计能够支撑桌面端从 MVP 到完整产品的全周期开发。
