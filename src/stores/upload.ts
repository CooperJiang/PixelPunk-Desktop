import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface UploadFile {
  id: string;
  path: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export const useUploadStore = defineStore("upload", () => {
  const files = ref<UploadFile[]>([]);
  const currentUploading = ref<string[]>([]);

  // 计算属性
  const isUploading = computed(
    () =>
      currentUploading.value.length > 0 ||
      files.value.some((f) => f.status === "uploading"),
  );

  const totalProgress = computed(() => {
    const uploadingFiles = files.value.filter(
      (f) => f.status === "uploading" || f.status === "success",
    );

    if (uploadingFiles.length === 0) return 0;

    const total = uploadingFiles.reduce((sum, f) => sum + f.progress, 0);
    return total / uploadingFiles.length;
  });

  const pendingCount = computed(
    () => files.value.filter((f) => f.status === "pending").length,
  );

  const successCount = computed(
    () => files.value.filter((f) => f.status === "success").length,
  );

  const errorCount = computed(
    () => files.value.filter((f) => f.status === "error").length,
  );

  // 添加文件到队列
  const addFiles = async (filePaths: string[]) => {
    for (const path of filePaths) {
      const name = path.split(/[\\/]/).pop() || path;
      const id = `${Date.now()}-${Math.random()}`;

      // 获取文件大小（简化版本，实际需要调用 Tauri API）
      const size = 0; // TODO: 使用 fs API 获取文件大小

      files.value.push({
        id,
        path,
        name,
        size,
        status: "pending",
        progress: 0,
      });
    }

    // 开始上传
    processQueue();
  };

  // 处理上传队列
  const processQueue = async () => {
    // 获取配置的并发数（默认 3）
    const concurrent = 3;

    while (currentUploading.value.length < concurrent) {
      const pending = files.value.find((f) => f.status === "pending");
      if (!pending) break;

      currentUploading.value.push(pending.id);
      uploadFile(pending);
    }
  };

  // 上传单个文件
  const uploadFile = async (file: UploadFile) => {
    try {
      file.status = "uploading";

      // TODO: 实现实际的上传逻辑
      // 这里提供一个模拟上传的示例
      await simulateUpload(file);

      file.status = "success";
      file.progress = 100;
    } catch (error) {
      file.status = "error";
      file.error = error instanceof Error ? error.message : "上传失败";
    } finally {
      // 从当前上传列表移除
      const index = currentUploading.value.indexOf(file.id);
      if (index > -1) {
        currentUploading.value.splice(index, 1);
      }

      // 继续处理队列
      processQueue();
    }
  };

  // 模拟上传（示例）
  const simulateUpload = (file: UploadFile): Promise<void> => {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      const interval = setInterval(() => {
        file.progress += 10;
        if (file.progress >= 100) {
          // eslint-disable-next-line no-undef
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  };

  // 重试上传
  const retryFile = (fileId: string) => {
    const file = files.value.find((f) => f.id === fileId);
    if (file && file.status === "error") {
      file.status = "pending";
      file.progress = 0;
      file.error = undefined;
      processQueue();
    }
  };

  // 移除文件
  const removeFile = (fileId: string) => {
    const index = files.value.findIndex((f) => f.id === fileId);
    if (index > -1) {
      files.value.splice(index, 1);
    }
  };

  // 清空已完成和失败的文件
  const clearCompleted = () => {
    files.value = files.value.filter(
      (f) => f.status === "pending" || f.status === "uploading",
    );
  };

  return {
    files,
    isUploading,
    totalProgress,
    pendingCount,
    successCount,
    errorCount,
    addFiles,
    retryFile,
    removeFile,
    clearCompleted,
  };
});
