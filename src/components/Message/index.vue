<template>
  <Transition name="message-fade">
    <div
      v-if="visible"
      class="message"
      :class="[`message-${type}`]"
      @click="close"
    >
      <!-- 背景装饰 -->
      <div class="message-bg" />
      <div class="message-glow" />

      <!-- 图标容器 -->
      <div class="message-icon-wrapper">
        <div class="icon-circle">
          <i v-if="type === 'success'" class="fas fa-check" />
          <i v-if="type === 'error'" class="fas fa-times" />
          <i v-if="type === 'warning'" class="fas fa-exclamation" />
          <i v-if="type === 'info'" class="fas fa-info" />
        </div>
      </div>

      <!-- 内容 -->
      <div class="message-body">
        <div class="message-content">{{ content }}</div>
      </div>

      <!-- 关闭按钮 -->
      <button class="message-close" @click.stop="close">
        <i class="fas fa-times" />
      </button>

      <!-- 进度条 -->
      <div v-if="duration > 0" class="message-progress">
        <div
          class="progress-bar"
          :style="{ animationDuration: `${duration}ms` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

export interface MessageProps {
  content: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

const props = withDefaults(defineProps<MessageProps>(), {
  type: "info",
  duration: 3000,
});

const visible = ref(false);
let timer: number | null = null;

const close = () => {
  visible.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  props.onClose?.();
};

onMounted(() => {
  visible.value = true;

  if (props.duration > 0) {
    timer = window.setTimeout(() => {
      close();
    }, props.duration);
  }
});
</script>

<style scoped>
.message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  padding-right: 40px;
  min-width: 300px;
  max-width: 480px;
  border-radius: 10px;
  z-index: 99999;
  cursor: pointer;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
}

/* 背景层 */
.message-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-elevated);
  opacity: 0.95;
  z-index: -2;
}

/* 发光层 */
.message-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
}

.message:hover .message-glow {
  opacity: 1;
}

/* 图标容器 */
.message-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  position: relative;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.icon-circle i {
  position: relative;
  z-index: 2;
}

/* 内容区 */
.message-body {
  flex: 1;
  min-width: 0;
}

.message-content {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary);
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* 关闭按钮 */
.message-close {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  opacity: 0.6;
}

.message-close:hover {
  opacity: 1;
  background: rgba(var(--color-primary-rgb, 167, 139, 250), 0.15);
  color: var(--color-primary);
  transform: translateY(-50%) scale(1.1);
}

/* 进度条 */
.message-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: progressShrink linear forwards;
}

@keyframes progressShrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Success 样式 */
.message-success {
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow:
    0 8px 24px rgba(16, 185, 129, 0.15),
    0 0 0 1px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.message-success .message-glow {
  background: radial-gradient(
    circle at center,
    rgba(16, 185, 129, 0.15) 0%,
    transparent 70%
  );
}

.message-success .icon-circle {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.2),
    rgba(16, 185, 129, 0.05)
  );
  border: 2px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.message-success .progress-bar {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

/* Error 样式 */
.message-error {
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow:
    0 8px 24px rgba(239, 68, 68, 0.15),
    0 0 0 1px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.message-error .message-glow {
  background: radial-gradient(
    circle at center,
    rgba(239, 68, 68, 0.15) 0%,
    transparent 70%
  );
}

.message-error .icon-circle {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2),
    rgba(239, 68, 68, 0.05)
  );
  border: 2px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.message-error .progress-bar {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

/* Warning 样式 */
.message-warning {
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow:
    0 8px 24px rgba(245, 158, 11, 0.15),
    0 0 0 1px rgba(245, 158, 11, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.message-warning .message-glow {
  background: radial-gradient(
    circle at center,
    rgba(245, 158, 11, 0.15) 0%,
    transparent 70%
  );
}

.message-warning .icon-circle {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.2),
    rgba(245, 158, 11, 0.05)
  );
  border: 2px solid rgba(245, 158, 11, 0.4);
  color: #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.message-warning .progress-bar {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}

/* Info 样式 */
.message-info {
  border: 1px solid rgba(var(--color-primary-rgb, 167, 139, 250), 0.3);
  box-shadow:
    0 8px 24px rgba(var(--color-primary-rgb, 167, 139, 250), 0.15),
    0 0 0 1px rgba(var(--color-primary-rgb, 167, 139, 250), 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.message-info .message-glow {
  background: radial-gradient(
    circle at center,
    rgba(var(--color-primary-rgb, 167, 139, 250), 0.15) 0%,
    transparent 70%
  );
}

.message-info .icon-circle {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb, 167, 139, 250), 0.2),
    rgba(var(--color-primary-rgb, 167, 139, 250), 0.05)
  );
  border: 2px solid rgba(var(--color-primary-rgb, 167, 139, 250), 0.4);
  color: var(--color-primary);
  box-shadow: 0 0 20px rgba(var(--color-primary-rgb, 167, 139, 250), 0.3);
}

.message-info .progress-bar {
  background: linear-gradient(
    90deg,
    var(--color-primary),
    rgba(var(--color-primary-rgb, 167, 139, 250), 0.8)
  );
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb, 167, 139, 250), 0.5);
}

/* Transitions */
.message-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.9);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95);
}

@media (max-width: 768px) {
  .message {
    min-width: calc(100vw - 32px);
    max-width: calc(100vw - 32px);
    top: 16px;
  }
}
</style>
