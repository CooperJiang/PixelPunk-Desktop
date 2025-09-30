<script setup lang="ts">
import { appConfig } from "@/config";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

const closeWindow = async () => {
  await appWindow.close();
};
</script>

<template>
  <div class="flex h-screen w-screen flex-col bg-white">
    <!-- 头部区域 -->
    <div
      class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center"
    >
      <h1 class="mb-2 text-2xl font-bold text-white">{{ appConfig.name }}</h1>
      <p class="text-sm text-indigo-100">版本 {{ appConfig.version }}</p>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto px-8 py-6">
      <div class="space-y-5">
        <!-- 作者信息 -->
        <div>
          <p
            class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            作者
          </p>
          <p class="text-sm text-gray-900">{{ appConfig.author }}</p>
        </div>

        <!-- 描述信息 -->
        <div>
          <p
            class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            描述
          </p>
          <p class="text-sm leading-relaxed text-gray-700">
            {{ appConfig.description }}
          </p>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-200"></div>

        <!-- 链接按钮 -->
        <div
          v-if="appConfig.homepage || appConfig.repository"
          class="space-y-2"
        >
          <a
            v-if="appConfig.homepage"
            :href="appConfig.homepage"
            target="_blank"
            class="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            访问主页
          </a>
          <a
            v-if="appConfig.repository"
            :href="appConfig.repository"
            target="_blank"
            class="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            查看仓库
          </a>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="border-t border-gray-200 bg-gray-50 px-8 py-4">
      <!-- 版权信息 -->
      <p
        v-if="appConfig.copyright"
        class="mb-3 text-center text-xs text-gray-500"
      >
        {{ appConfig.copyright }}
      </p>

      <!-- 关闭按钮 -->
      <button
        class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="closeWindow"
      >
        关闭
      </button>
    </div>
  </div>
</template>
