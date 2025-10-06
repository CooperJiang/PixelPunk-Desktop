import { ref, computed, type Ref } from "vue";
import type { UploadFile } from "@/components/Upload/Progress.vue";
import { uploadFile } from "@/api/upload";

interface UploadOptions {
  folderId?: Ref<string>;
  accessLevel?: Ref<"public" | "private" | "protected">;
  optimize?: Ref<boolean>;
}

export function useGlobalUpload(options: UploadOptions = {}) {
  // 上传队列
  const uploadQueue = ref<UploadFile[]>([]);

  // 是否正在上传
  const isUploading = ref(false);

  // 全局进度
  const globalProgress = ref(0);

  // 全局速度 (KB/s)
  const globalSpeed = ref(0);

  // 统计信息
  const pendingCount = computed(
    () => uploadQueue.value.filter((file) => file.status === "pending").length,
  );

  const uploadingCount = computed(
    () =>
      uploadQueue.value.filter((file) => file.status === "uploading").length,
  );

  const successCount = computed(
    () =>
      uploadQueue.value.filter(
        (file) => file.status === "success" || file.status === "completed",
      ).length,
  );

  const errorCount = computed(
    () => uploadQueue.value.filter((file) => file.status === "error").length,
  );

  const totalFileSize = computed(() =>
    uploadQueue.value.reduce((total, file) => total + file.size, 0),
  );

  const hasPendingFiles = computed(() => pendingCount.value > 0);
  const hasUploadingFiles = computed(() => uploadingCount.value > 0);
  const hasSuccessFiles = computed(() => successCount.value > 0);

  // 添加文件到队列（新文件插入到队列开头）
  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: UploadFile[] = [];

    fileArray.forEach((file) => {
      const uploadFile: UploadFile = {
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "pending",
        id: `${Date.now()}-${Math.random()}`,
      };

      newFiles.push(uploadFile);
    });

    // 新文件插入到队列开头
    uploadQueue.value.unshift(...newFiles);
  };

  // 移除文件
  const removeFile = (index: number) => {
    uploadQueue.value.splice(index, 1);
  };

  // 清空队列
  const clearQueue = () => {
    // 只清除已完成和失败的文件
    uploadQueue.value = uploadQueue.value.filter(
      (file) => file.status === "uploading" || file.status === "pending",
    );
  };

  // 真实上传单个文件
  const uploadSingleFile = async (file: UploadFile): Promise<void> => {
    try {
      // 设置为分析状态
      file.status = "analyzing";
      file.statusMessage = "准备上传...";

      const startTime = Date.now();

      // 设置为上传中
      file.status = "uploading";
      file.progress = 0;

      // 调用真实上传接口
      const response = await uploadFile(
        file.file,
        {
          folder_id: options.folderId?.value,
          access_level: options.accessLevel?.value,
          optimize: options.optimize?.value,
        },
        (progressEvent) => {
          // 更新进度
          if (progressEvent.lengthComputable) {
            file.progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );

            // 计算上传速度
            const elapsed = (Date.now() - startTime) / 1000; // 秒
            if (elapsed > 0) {
              file.speed = Math.round(progressEvent.loaded / elapsed / 1024); // KB/s

              // 计算剩余时间
              const remainingBytes = progressEvent.total - progressEvent.loaded;
              file.remainingTime =
                file.speed > 0
                  ? Math.round(remainingBytes / (file.speed * 1024))
                  : 0;

              file.statusMessage = `上传中 ${file.progress}%`;
            }
          }
        },
      );

      // 上传成功
      if (response.success && response.data) {
        file.status = "success";
        file.progress = 100;
        file.url = response.data.url;
        file.full_url = response.data.full_url;
        file.statusMessage = "上传成功";
        file.speed = 0;
        file.remainingTime = 0;
      } else {
        throw new Error(response.message || response.error || "上传失败");
      }
    } catch (error) {
      file.status = "error";
      file.error = error instanceof Error ? error.message : "上传失败，请重试";
      file.statusMessage = file.error;
      throw error;
    }
  };

  // 开始上传
  const startUpload = async () => {
    if (isUploading.value) return;

    const pendingFiles = uploadQueue.value.filter(
      (file) => file.status === "pending",
    );

    if (pendingFiles.length === 0) return;

    isUploading.value = true;

    // 并发上传（最多3个）
    const maxConcurrent = 3;
    let currentIndex = 0;

    const uploadNext = async () => {
      if (currentIndex >= pendingFiles.length) {
        isUploading.value = false;
        globalProgress.value = 100;
        globalSpeed.value = 0;
        return;
      }

      const file = pendingFiles[currentIndex];
      currentIndex++;

      try {
        await uploadSingleFile(file);
      } catch (error) {
        console.error("Upload error:", error);
      }

      // 更新全局进度
      const completedCount = uploadQueue.value.filter(
        (f) => f.status === "success" || f.status === "error",
      ).length;
      globalProgress.value = Math.round(
        (completedCount / uploadQueue.value.length) * 100,
      );

      // 更新全局速度（所有上传中文件的平均速度）
      const uploadingSpeeds = uploadQueue.value
        .filter((f) => f.status === "uploading" && f.speed)
        .map((f) => f.speed || 0);

      globalSpeed.value =
        uploadingSpeeds.length > 0
          ? uploadingSpeeds.reduce((a, b) => a + b, 0) / uploadingSpeeds.length
          : 0;

      await uploadNext();
    };

    // 启动多个并发上传
    const promises = [];
    for (let i = 0; i < Math.min(maxConcurrent, pendingFiles.length); i++) {
      promises.push(uploadNext());
    }

    await Promise.all(promises);
  };

  // 取消上传
  const cancelUpload = () => {
    uploadQueue.value.forEach((file) => {
      if (file.status === "uploading") {
        file.status = "error";
        file.error = "已取消";
      }
    });
    isUploading.value = false;
    globalSpeed.value = 0;
  };

  // 重试上传
  const retryUpload = (index: number) => {
    const file = uploadQueue.value[index];
    if (file && file.status === "error") {
      file.status = "pending";
      file.progress = 0;
      file.error = undefined;
      file.statusMessage = undefined;
    }
  };

  // 继续上传（断点续传）
  const resumeUpload = (index: number) => {
    const file = uploadQueue.value[index];
    if (file && file.status === "paused") {
      file.status = "pending";
    }
  };

  // 复制所有成功文件的链接
  const copyAllUrls = async (): Promise<boolean> => {
    const successFiles = uploadQueue.value.filter(
      (file) =>
        (file.status === "success" || file.status === "completed") &&
        file.full_url,
    );

    if (successFiles.length === 0) {
      return false;
    }

    const urls = successFiles.map((file) => file.full_url).join("\n");

    try {
      await navigator.clipboard.writeText(urls);
      return true;
    } catch (error) {
      console.error("Copy failed:", error);
      return false;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    // 状态
    uploadQueue,
    isUploading,
    globalProgress,
    globalSpeed,

    // 统计
    pendingCount,
    uploadingCount,
    successCount,
    errorCount,
    totalFileSize,
    hasPendingFiles,
    hasUploadingFiles,
    hasSuccessFiles,

    // 操作方法
    addFiles,
    removeFile,
    clearQueue,
    startUpload,
    cancelUpload,
    retryUpload,
    resumeUpload,
    copyAllUrls,

    // 工具方法
    formatFileSize,
  };
}
