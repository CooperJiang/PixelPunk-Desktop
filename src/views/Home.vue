<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { appConfig } from "@/config";
import { Code2, Settings, Palette, Package, Circle } from "lucide-vue-next";

const floatBallVisible = ref(false);
const loading = ref(false);

// 检查悬浮球状态
const checkFloatBallStatus = async () => {
  try {
    floatBallVisible.value = await invoke<boolean>("is_float_ball_visible");
  } catch (error) {
    console.error("Failed to check float ball status:", error);
  }
};

// 切换悬浮球
const toggleFloatBall = async () => {
  loading.value = true;
  try {
    const newState = !floatBallVisible.value;
    await invoke("toggle_float_ball", { show: newState });
    floatBallVisible.value = newState;
  } catch (error) {
    console.error("Failed to toggle float ball:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkFloatBallStatus();
});
</script>

<template>
  <div
    class="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50"
  >
    <div class="mx-auto max-w-5xl px-8 py-12">
      <!-- 头部 -->
      <div class="mb-12 text-center">
        <h1 class="mb-3 text-5xl font-bold text-gray-900">
          {{ appConfig.name }}
        </h1>
        <p class="text-lg text-gray-600">
          {{ appConfig.description }}
        </p>
        <div
          class="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500"
        >
          <span class="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700"
            >v{{ appConfig.version }}</span
          >
          <span>•</span>
          <span>Tauri 2.0 + Vue 3 + TypeScript</span>
        </div>
      </div>

      <!-- 悬浮球演示 -->
      <div class="mb-12">
        <div
          class="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8"
        >
          <div class="mb-6 text-center">
            <h2 class="mb-2 text-2xl font-bold text-gray-900">
              🎯 悬浮球功能演示
            </h2>
            <p class="text-gray-600">
              拖放文件上传、实时进度跟踪，完整的交互体验
            </p>
          </div>

          <div class="mx-auto max-w-md">
            <div class="rounded-xl bg-white p-6 shadow-lg">
              <div class="mb-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                  >
                    <Circle :size="24" class="text-white" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">悬浮球</h3>
                    <p class="text-sm text-gray-500">
                      {{ floatBallVisible ? "已显示" : "已隐藏" }}
                    </p>
                  </div>
                </div>

                <!-- 开关按钮 -->
                <button
                  :disabled="loading"
                  class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  :class="floatBallVisible ? 'bg-indigo-600' : 'bg-gray-300'"
                  @click="toggleFloatBall"
                >
                  <span
                    class="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform"
                    :class="
                      floatBallVisible ? 'translate-x-7' : 'translate-x-1'
                    "
                  ></span>
                </button>
              </div>

              <div class="space-y-3 text-sm text-gray-600">
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600">✓</span>
                  <span>拖放文件到悬浮球即可上传</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600">✓</span>
                  <span>实时显示上传进度和状态</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600">✓</span>
                  <span>支持拖动悬浮球到任意位置</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-indigo-600">✓</span>
                  <span>始终置顶，不干扰其他应用</span>
                </div>
              </div>

              <div
                v-if="floatBallVisible"
                class="mt-4 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700"
              >
                💡 悬浮球已在屏幕右下角显示，尝试拖放文件上传吧！
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能特性 -->
      <div class="mb-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">✨ 功能特性</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100"
            >
              <Code2 :size="20" class="text-indigo-600" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">现代技术栈</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              Vue 3 Composition API + TypeScript + Tailwind
              CSS，开箱即用的现代开发体验
            </p>
          </div>

          <div
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100"
            >
              <Settings :size="20" class="text-purple-600" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">系统托盘</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              内置系统托盘支持，可通过配置文件轻松自定义菜单和行为
            </p>
          </div>

          <div
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100"
            >
              <Palette :size="20" class="text-emerald-600" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">
              自定义标题栏
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              完美适配 macOS 的自定义标题栏，支持全屏、最小化等窗口控制
            </p>
          </div>

          <div
            class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100"
            >
              <Package :size="20" class="text-amber-600" />
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">轻量打包</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              基于 Rust 的 Tauri，打包体积小，性能优异，跨平台支持
            </p>
          </div>
        </div>
      </div>

      <!-- 项目架构 -->
      <div class="mb-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">📂 项目架构</h2>
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <div class="space-y-4">
            <div>
              <h4 class="mb-3 font-semibold text-gray-900">核心目录结构</h4>
              <pre
                class="rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
              ><code>pixelpunk/
├── src/                          # Vue 前端代码
│   ├── config/                   # 📝 配置文件（这是你主要修改的地方）
│   │   └── app.config.ts        # 应用配置（窗口、托盘、应用信息等）
│   ├── features/                 # 功能模块
│   │   └── about/               # 关于页面功能
│   ├── views/                    # 页面视图
│   ├── types/                    # TypeScript 类型定义
│   └── stores/                   # Pinia 状态管理
│
├── src-tauri/                    # Rust 后端代码
│   ├── src/
│   │   ├── lib.rs               # 主程序入口（托盘事件处理）
│   │   └── config.rs            # 配置加载逻辑
│   ├── icons/                    # 🎨 应用图标（替换图标的位置）
│   │   ├── 32x32.png           # 托盘图标
│   │   ├── icon.icns           # macOS 应用图标
│   │   ├── icon.ico            # Windows 应用图标
│   │   └── icon.png            # Linux 应用图标
│   └── app.config.json          # 自动生成的配置（无需手动修改）
│
└── scripts/
    └── sync-config.js            # 配置同步脚本</code></pre>
            </div>

            <div>
              <h4 class="mb-2 font-semibold text-gray-900">配置工作流程</h4>
              <div class="space-y-2 text-sm text-gray-700">
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600"
                    >1</span
                  >
                  <div>
                    <p class="font-medium">修改 TypeScript 配置</p>
                    <p class="text-xs text-gray-600">
                      编辑
                      <code class="rounded bg-gray-100 px-1"
                        >src/config/app.config.ts</code
                      >
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600"
                    >2</span
                  >
                  <div>
                    <p class="font-medium">自动同步到 Rust</p>
                    <p class="text-xs text-gray-600">
                      运行
                      <code class="rounded bg-gray-100 px-1"
                        >npm run tauri:dev</code
                      >
                      时自动执行
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600"
                    >3</span
                  >
                  <div>
                    <p class="font-medium">配置立即生效</p>
                    <p class="text-xs text-gray-600">
                      Rust 启动时读取配置并应用到窗口和托盘
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速开始 -->
      <div class="mb-12">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">🚀 快速开始</h2>
        <div class="rounded-xl border border-gray-200 bg-white p-6">
          <div class="space-y-4">
            <div>
              <h4 class="mb-2 font-semibold text-gray-900">1. 配置应用信息</h4>
              <p class="mb-2 text-sm text-gray-600">
                编辑
                <code class="rounded bg-gray-100 px-2 py-1 text-xs"
                  >src/config/app.config.ts</code
                >
                文件：
              </p>
              <pre
                class="rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
              ><code>export const appConfig = {
  name: '你的应用名称',
  version: '1.0.0',
  author: '你的名字',
  description: '应用描述',
  // ...
};</code></pre>
            </div>

            <div>
              <h4 class="mb-2 font-semibold text-gray-900">
                2. 自定义托盘菜单（支持多级分组）
              </h4>
              <p class="mb-2 text-sm text-gray-600">
                在
                <code class="rounded bg-gray-100 px-2 py-1 text-xs"
                  >src/config/app.config.ts</code
                >
                中配置托盘菜单：
              </p>
              <pre
                class="rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
              ><code>tray: {
  enabled: true,              // 是否启用托盘
  tooltip: '应用提示文字',      // 鼠标悬停提示
  title: '',                  // 托盘标题（macOS 显示，空字符串不显示）
  menus: [                    // 多级菜单分组
    {
      label: '应用',          // 一级菜单标题
      items: [                // 该分组下的菜单项
        { id: 'about', label: '关于', action: 'about' },
        { id: 'settings', label: '设置', action: 'custom' },
      ],
    },
    {
      label: '窗口',
      items: [
        { id: 'show', label: '显示窗口', action: 'show' },
        { id: 'quit', label: '退出', action: 'quit' },
      ],
    },
  ],
}</code></pre>
              <div class="mt-3 space-y-1 text-xs text-gray-600">
                <p>
                  •
                  <strong>预定义动作</strong
                  >：about（关于窗口）、show（显示窗口）、quit（退出）
                </p>
                <p>
                  • <strong>自定义动作</strong>：设置 action 为 'custom'，然后在
                  <code class="rounded bg-gray-800 px-1"
                    >src-tauri/src/lib.rs</code
                  >
                  的
                  <code class="rounded bg-gray-800 px-1">on_menu_event</code>
                  中添加处理逻辑
                </p>
                <p>
                  •
                  <strong>多级菜单</strong
                  >：可以配置多个菜单分组，每个分组包含多个菜单项
                </p>
              </div>
            </div>

            <div>
              <h4 class="mb-2 font-semibold text-gray-900">3. 替换应用图标</h4>
              <p class="mb-2 text-sm text-gray-600">应用图标和托盘图标位置：</p>
              <div class="space-y-2 text-xs text-gray-700">
                <div class="rounded bg-gray-50 p-3">
                  <p class="mb-1 font-semibold">📁 托盘图标（系统托盘显示）</p>
                  <code class="text-xs text-indigo-600"
                    >src-tauri/icons/32x32.png</code
                  >
                  <p class="mt-1 text-gray-600">
                    • 建议尺寸：32x32 px（高清屏需要 @2x）
                  </p>
                </div>
                <div class="rounded bg-gray-50 p-3">
                  <p class="mb-1 font-semibold">📁 应用图标（各平台）</p>
                  <p class="text-gray-600">
                    • <strong>macOS</strong>:
                    <code class="text-indigo-600">icon.icns</code> +
                    <code class="text-indigo-600">App.iconset/</code>
                  </p>
                  <p class="text-gray-600">
                    • <strong>Windows</strong>:
                    <code class="text-indigo-600">icon.ico</code>
                  </p>
                  <p class="text-gray-600">
                    • <strong>Linux</strong>:
                    <code class="text-indigo-600">icon.png</code>
                  </p>
                </div>
                <div class="rounded bg-amber-50 p-3">
                  <p class="font-semibold text-amber-800">💡 提示</p>
                  <p class="text-gray-700">
                    修改图标后需运行
                    <code class="rounded bg-gray-800 px-1 text-gray-100"
                      >npm run sync:config && npm run tauri:build</code
                    >
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-2 font-semibold text-gray-900">4. 开发和构建</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <code class="flex-1 rounded bg-gray-100 px-3 py-2 text-xs"
                    >npm run tauri:dev</code
                  >
                  <span class="text-gray-500">开发模式</span>
                </div>
                <div class="flex items-center gap-2">
                  <code class="flex-1 rounded bg-gray-100 px-3 py-2 text-xs"
                    >npm run tauri:build</code
                  >
                  <span class="text-gray-500">构建应用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术栈 -->
      <div>
        <h2 class="mb-6 text-2xl font-bold text-gray-900">🛠️ 技术栈</h2>
        <div class="flex flex-wrap gap-3">
          <span
            class="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700"
            >Vue 3.5</span
          >
          <span
            class="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
            >TypeScript 5.8</span
          >
          <span
            class="rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700"
            >Tauri 2.8</span
          >
          <span
            class="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700"
            >Vite 7.1</span
          >
          <span
            class="rounded-lg bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700"
            >Tailwind CSS 3</span
          >
          <span
            class="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700"
            >Pinia 3.0</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
