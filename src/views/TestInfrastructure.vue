<script setup lang="ts">
/* eslint-disable no-undef */
import { ref } from "vue";
import { useTheme } from "@/composables/useTheme";
import { logger, createTimer } from "@/utils/logger";
import { storage } from "@/utils/storage";
import {
  Moon,
  Sun,
  Monitor,
  TestTube,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle,
  Timer,
} from "lucide-vue-next";

const { theme, isDark, setTheme, toggleTheme } = useTheme();

const testResults = ref<string[]>([]);
const testKey = ref("test.message");
const testValue = ref("Hello Infrastructure!");

const addLog = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  testResults.value.unshift(`${icon} ${message}`);
};

// 测试主题切换
const testThemeSwitch = async () => {
  addLog("测试主题切换...");
  await logger.info("Theme switch test started");

  toggleTheme();
  addLog(`主题已切换到: ${theme.value}`, "success");
  await logger.info("Theme switched", { theme: theme.value });
};

// 测试存储
const testStorage = async () => {
  addLog("测试数据持久化...");
  await logger.info("Storage test started");

  try {
    storage.set(testKey.value, testValue.value);
    const retrieved = storage.get(testKey.value);

    if (retrieved === testValue.value) {
      addLog(`✓ 存储成功: ${testKey.value} = ${testValue.value}`, "success");
      await logger.info("Storage test passed", {
        key: testKey.value,
        value: testValue.value,
      });
    } else {
      addLog("存储验证失败", "error");
      await logger.error("Storage test failed", {
        expected: testValue.value,
        got: retrieved,
      });
    }
  } catch (err) {
    addLog(`存储错误: ${err}`, "error");
    await logger.exception(err as Error, { context: "storage_test" });
  }
};

// 测试日志
const testLogger = async () => {
  addLog("测试日志系统...");

  await logger.trace("这是 Trace 日志", { level: "trace" });
  await logger.debug("这是 Debug 日志", { level: "debug" });
  await logger.info("这是 Info 日志", { level: "info" });
  await logger.warn("这是 Warning 日志", { level: "warn" });
  await logger.error("这是 Error 日志", { level: "error" });

  addLog("已输出 5 条不同级别的日志", "success");
  addLog("请查看控制台和日志文件", "info");
};

// 测试性能追踪
const testPerformance = async () => {
  addLog("测试性能追踪...");

  const timer = createTimer("test_operation");

  // 模拟耗时操作
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await timer.end({ operation: "mock_delay" });
  addLog("性能追踪完成，耗时约 1000ms", "success");
};

// 测试异常捕获
const testExceptionLogging = async () => {
  addLog("测试异常日志...");

  try {
    throw new Error("这是一个测试异常");
  } catch (err) {
    await logger.exception(err as Error, { context: "test_exception" });
    addLog("异常已记录（包含堆栈信息）", "success");
  }
};

// 清空测试结果
const clearResults = () => {
  testResults.value = [];
  addLog("测试结果已清空");
};

// 清空存储
const clearStorage = async () => {
  await storage.clear();
  addLog("存储已清空", "success");
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
    <div class="mx-auto max-w-6xl">
      <!-- 标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          🧪 基础设施功能测试
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          验证窗口状态、单实例锁、主题系统、日志系统
        </p>
      </div>

      <!-- 主题状态指示器 -->
      <div
        class="mb-6 rounded-lg border-4 p-4 transition-all duration-300"
        :class="
          isDark ? 'border-blue-500 bg-gray-800' : 'border-yellow-400 bg-white'
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <h3
              class="text-lg font-bold"
              :class="isDark ? 'text-white' : 'text-gray-900'"
            >
              {{ isDark ? "🌙 暗色模式已激活" : "☀️ 亮色模式已激活" }}
            </h3>
            <p
              class="text-sm"
              :class="isDark ? 'text-gray-300' : 'text-gray-600'"
            >
              当前主题设置: <span class="font-semibold">{{ theme }}</span>
            </p>
            <p
              class="mt-1 text-xs"
              :class="isDark ? 'text-gray-400' : 'text-gray-500'"
            >
              检查 HTML: data-theme="{{ theme }}", class="{{
                isDark ? "dark" : "light"
              }}"
            </p>
          </div>
          <div class="text-6xl">
            {{ isDark ? "🌙" : "☀️" }}
          </div>
        </div>
      </div>

      <!-- 测试区域 -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- 左侧：测试控制 -->
        <div class="space-y-6">
          <!-- 主题系统 -->
          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2
              class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"
            >
              <Sun class="h-5 w-5" />
              主题系统
            </h2>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >当前主题:</span
                >
                <span
                  class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {{ theme }} {{ isDark ? "🌙" : "☀️" }}
                </span>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex items-center gap-2 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                  @click="setTheme('light')"
                >
                  <Sun class="h-4 w-4" />
                  浅色
                </button>
                <button
                  class="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                  @click="setTheme('dark')"
                >
                  <Moon class="h-4 w-4" />
                  深色
                </button>
                <button
                  class="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                  @click="setTheme('system')"
                >
                  <Monitor class="h-4 w-4" />
                  跟随系统
                </button>
              </div>

              <button
                class="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                @click="testThemeSwitch"
              >
                <TestTube class="mr-2 inline h-4 w-4" />
                测试主题切换
              </button>
            </div>
          </div>

          <!-- 数据持久化 -->
          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2
              class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"
            >
              <Save class="h-5 w-5" />
              数据持久化
            </h2>

            <div class="space-y-4">
              <div>
                <label
                  class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >键名</label
                >
                <input
                  v-model="testKey"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="test.key"
                />
              </div>

              <div>
                <label
                  class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >值</label
                >
                <input
                  v-model="testValue"
                  type="text"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="test value"
                />
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  @click="testStorage"
                >
                  <TestTube class="mr-2 inline h-4 w-4" />
                  测试存储
                </button>
                <button
                  class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  @click="clearStorage"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 日志系统 -->
          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2
              class="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"
            >
              <AlertCircle class="h-5 w-5" />
              日志系统
            </h2>

            <div class="space-y-2">
              <button
                class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                @click="testLogger"
              >
                <TestTube class="mr-2 inline h-4 w-4" />
                测试日志级别
              </button>
              <button
                class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                @click="testPerformance"
              >
                <Timer class="mr-2 inline h-4 w-4" />
                测试性能追踪
              </button>
              <button
                class="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                @click="testExceptionLogging"
              >
                <AlertCircle class="mr-2 inline h-4 w-4" />
                测试异常日志
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧：测试结果 -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div class="mb-4 flex items-center justify-between">
            <h2
              class="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"
            >
              <CheckCircle class="h-5 w-5" />
              测试结果
            </h2>
            <button
              class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              @click="clearResults"
            >
              清空
            </button>
          </div>

          <div
            class="space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
            style="max-height: 600px"
          >
            <div
              v-if="testResults.length === 0"
              class="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              暂无测试结果
            </div>
            <div
              v-for="(result, index) in testResults"
              :key="index"
              class="rounded bg-white px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {{ result }}
            </div>
          </div>

          <!-- 验证说明 -->
          <div class="mt-6 space-y-3">
            <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h3 class="mb-2 font-medium text-blue-900 dark:text-blue-200">
                窗口状态验证
              </h3>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                1. 移动或调整窗口大小
                <br />
                2. 关闭应用重新打开
                <br />
                3. 窗口应恢复到之前的位置和大小
              </p>
            </div>

            <div class="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <h3 class="mb-2 font-medium text-purple-900 dark:text-purple-200">
                单实例验证
              </h3>
              <p class="text-sm text-purple-700 dark:text-purple-300">
                尝试再次启动应用，应该会提示已有实例正在运行
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
