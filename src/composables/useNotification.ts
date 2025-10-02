/**
 * 系统通知 Composable
 *
 * 功能：
 * - 在组件中便捷使用系统通知
 *
 * 使用示例：
 * ```vue
 * <script setup lang="ts">
 * import { useNotification } from '@/composables/useNotification';
 *
 * const { notify, success, error, info, warning } = useNotification();
 *
 * const handleSave = async () => {
 *   try {
 *     await saveData();
 *     await success('保存成功', '数据已保存');
 *   } catch (err) {
 *     await error('保存失败', err.message);
 *   }
 * };
 * </script>
 * ```
 */

import { notification } from "@/utils/notification";

export function useNotification() {
  return {
    notify: notification.send.bind(notification),
    success: notification.success.bind(notification),
    error: notification.error.bind(notification),
    info: notification.info.bind(notification),
    warning: notification.warning.bind(notification),
    isGranted: notification.isGranted.bind(notification),
  };
}
