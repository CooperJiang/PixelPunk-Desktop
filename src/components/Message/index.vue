<template>
  <Transition name="message-fade">
    <div
      v-if="visible"
      class="message"
      :class="[`message-${type}`]"
      @click="close"
    >
      <div class="message-icon">
        <i v-if="type === 'success'" class="fas fa-check-circle" />
        <i v-if="type === 'error'" class="fas fa-times-circle" />
        <i v-if="type === 'warning'" class="fas fa-exclamation-triangle" />
        <i v-if="type === 'info'" class="fas fa-info-circle" />
      </div>
      <div class="message-content">{{ content }}</div>
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
  gap: 12px;
  padding: 12px 20px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  cursor: pointer;
  min-width: 320px;
  max-width: 520px;
  backdrop-filter: blur(10px);
}

.message-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 20px;
}

.message-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
}

/* Success */
.message-success {
  border-color: var(--color-success);
}

.message-success .message-icon {
  color: var(--color-success);
}

/* Error */
.message-error {
  border-color: var(--color-error);
}

.message-error .message-icon {
  color: var(--color-error);
}

/* Warning */
.message-warning {
  border-color: var(--color-warning);
}

.message-warning .message-icon {
  color: var(--color-warning);
}

/* Info */
.message-info {
  border-color: var(--color-info);
}

.message-info .message-icon {
  color: var(--color-info);
}

/* Transitions */
.message-fade-enter-active {
  transition: all 0.3s ease;
}

.message-fade-leave-active {
  transition: all 0.2s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>
