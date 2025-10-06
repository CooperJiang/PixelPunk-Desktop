<script setup lang="ts">
import {
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  Gauge,
  HardDrive,
} from "lucide-vue-next";

interface Props {
  pendingCount: number;
  uploadingCount: number;
  successCount: number;
  errorCount: number;
  totalFileSize: number;
  globalSpeed?: number; // KB/s
  globalProgress?: number; // 0-100
}

const props = withDefaults(defineProps<Props>(), {
  pendingCount: 0,
  uploadingCount: 0,
  successCount: 0,
  errorCount: 0,
  totalFileSize: 0,
  globalSpeed: 0,
  globalProgress: 0,
});

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
</script>

<template>
  <div class="upload-stats">
    <!-- 待上传 -->
    <div class="upload-stats__item">
      <div class="upload-stats__icon upload-stats__icon--pending">
        <Clock :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">待上传</div>
        <div class="upload-stats__value">{{ pendingCount }}</div>
      </div>
    </div>

    <!-- 上传中 -->
    <div class="upload-stats__item">
      <div class="upload-stats__icon upload-stats__icon--uploading">
        <Upload :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">上传中</div>
        <div class="upload-stats__value">{{ uploadingCount }}</div>
      </div>
    </div>

    <!-- 已完成 -->
    <div class="upload-stats__item">
      <div class="upload-stats__icon upload-stats__icon--success">
        <CheckCircle :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">已完成</div>
        <div class="upload-stats__value">{{ successCount }}</div>
      </div>
    </div>

    <!-- 失败 -->
    <div class="upload-stats__item">
      <div class="upload-stats__icon upload-stats__icon--error">
        <XCircle :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">失败</div>
        <div class="upload-stats__value">{{ errorCount }}</div>
      </div>
    </div>

    <!-- 上传速度 -->
    <div v-if="globalSpeed > 0" class="upload-stats__item">
      <div class="upload-stats__icon upload-stats__icon--speed">
        <Gauge :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">速度</div>
        <div class="upload-stats__value">
          {{ formatFileSize(globalSpeed * 1024) }}/s
        </div>
      </div>
    </div>

    <!-- 总大小 -->
    <div class="upload-stats__item upload-stats__item--total">
      <div class="upload-stats__icon">
        <HardDrive :size="16" />
      </div>
      <div class="upload-stats__info">
        <div class="upload-stats__label">总大小</div>
        <div class="upload-stats__value">
          {{ formatFileSize(totalFileSize) }}
          <span v-if="globalProgress > 0" class="upload-stats__progress"
            >({{ globalProgress }}%)</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px;
  background: linear-gradient(
    135deg,
    var(--color-bg-elevated),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.upload-stats__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(
    135deg,
    var(--color-bg-base),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.02)
  );
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upload-stats__item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.05),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-stats__item:hover {
  background: linear-gradient(
    135deg,
    var(--color-bg-hover),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.04)
  );
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 16px rgba(var(--color-primary-rgb, 5, 217, 232), 0.15);
  transform: translateY(-2px);
}

.upload-stats__item:hover::before {
  opacity: 1;
}

.upload-stats__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.upload-stats__icon::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 10px;
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.3s;
  z-index: -1;
}

.upload-stats__item:hover .upload-stats__icon {
  transform: scale(1.1);
}

.upload-stats__item:hover .upload-stats__icon::before {
  opacity: 0.6;
}

.upload-stats__icon--pending {
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.15),
    rgba(251, 191, 36, 0.1)
  );
  color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

.upload-stats__icon--pending::before {
  background: linear-gradient(135deg, #fbbf24, rgba(251, 191, 36, 0.6));
}

.upload-stats__icon--uploading {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.15),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1)
  );
  color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.upload-stats__icon--uploading::before {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.6)
  );
}

.upload-stats__icon--success {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(34, 197, 94, 0.1)
  );
  color: #22c55e;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.upload-stats__icon--success::before {
  background: linear-gradient(135deg, #22c55e, rgba(34, 197, 94, 0.6));
}

.upload-stats__icon--error {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.15),
    rgba(239, 68, 68, 0.1)
  );
  color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.upload-stats__icon--error::before {
  background: linear-gradient(135deg, #ef4444, rgba(239, 68, 68, 0.6));
}

.upload-stats__icon--speed {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.15),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.1)
  );
  color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 5, 217, 232), 0.2);
}

.upload-stats__icon--speed::before {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    rgba(var(--color-primary-rgb, 5, 217, 232), 0.6)
  );
}

.upload-stats__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.upload-stats__label {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.upload-stats__value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.upload-stats__progress {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.upload-stats__item--total {
  margin-left: auto;
}

@media (max-width: 768px) {
  .upload-stats {
    gap: 8px;
  }

  .upload-stats__item {
    padding: 6px 10px;
    gap: 8px;
  }

  .upload-stats__icon {
    width: 28px;
    height: 28px;
  }

  .upload-stats__label {
    font-size: 10px;
  }

  .upload-stats__value {
    font-size: 13px;
  }
}
</style>
