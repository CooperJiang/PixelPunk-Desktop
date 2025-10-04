<template>
  <div class="code-field">
    <Input
      v-model="innerValue"
      :placeholder="placeholder"
      :size="size"
      :prefix-icon="prefixIcon"
    />
    <Button
      type="outlined"
      :size="size"
      :disabled="buttonDisabled"
      :custom-class="'send-code-btn'"
      :style="{ width: buttonWidth + 'px' }"
      @click="handleSend"
    >
      {{ countdown > 0 ? `${countdown}s` : buttonText }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Input from '@/components/Input/index.vue';
import Button from '@/components/Button/index.vue';
import { Shield as ShieldIcon } from 'lucide-vue-next';

interface Props {
  modelValue: string;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  duration?: number; // 倒计时秒数
  canSend?: boolean; // 是否允许发送（例如：邮箱已填写）
  requestCode?: () => Promise<void>; // 发送请求回调（由父组件提供）
  prefixIcon?: any;
  buttonText?: string;
  buttonWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '验证码',
  size: 'medium',
  duration: 60,
  canSend: true,
  requestCode: undefined,
  prefixIcon: ShieldIcon,
  buttonText: '获取验证码',
  buttonWidth: 104,
});

const emit = defineEmits(['update:modelValue', 'sent', 'send-error']);

const innerValue = computed<string>({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
});

const countdown = ref(0);
const sending = ref(false);

const buttonDisabled = computed(
  () => sending.value || countdown.value > 0 || !props.canSend,
);

async function handleSend() {
  if (buttonDisabled.value) return;
  try {
    sending.value = true;
    if (props.requestCode) {
      await props.requestCode();
    }
    startCountdown();
    emit('sent');
  } catch (err) {
    emit('send-error', err);
  } finally {
    sending.value = false;
  }
}

function startCountdown() {
  countdown.value = props.duration;
  const timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
}
</script>

<style scoped>
.code-field {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

/* 保证输入框占满剩余空间、按钮定宽不换行 */
.code-field :deep(.input-container) {
  flex: 1;
  min-width: 0;
}

.send-code-btn {
  white-space: nowrap;
  word-break: keep-all;
  flex-shrink: 0;
}
</style>
