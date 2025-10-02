/**
 * 响应式数据持久化 Composable
 *
 * 功能：
 * - 将数据自动同步到本地存储
 * - Vue 响应式支持
 * - 自动保存变更
 *
 * 使用示例：
 * ```vue
 * <script setup lang="ts">
 * import { useStorage } from '@/composables/useStorage';
 *
 * // 创建响应式的持久化数据
 * const theme = useStorage('theme', 'light');
 * const username = useStorage('user.name', '');
 *
 * // 修改会自动保存
 * theme.value = 'dark';
 * username.value = 'Alice';
 * </script>
 * ```
 */

import { ref, watch, type Ref } from "vue";
import { storage } from "@/utils/storage";

/**
 * 创建响应式的持久化数据
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns 响应式引用
 */
export function useStorage<T>(key: string, defaultValue: T): Ref<T> {
  // 从存储中读取初始值
  const value = ref<T>(storage.get(key, defaultValue)) as Ref<T>;

  // 监听变化，自动保存
  watch(
    value,
    (newValue) => {
      storage.set(key, newValue);
    },
    { deep: true },
  );

  return value;
}
