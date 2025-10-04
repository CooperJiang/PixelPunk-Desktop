<template>
  <div class="login-page" data-tauri-drag-region>
    <!-- 关闭按钮 -->
    <div class="window-controls">
      <button class="control-btn" @click="handleClose">
        <XIcon :size="16" />
      </button>
    </div>

    <!-- Logo和标题 -->
    <div class="login-header">
      <div class="logo">
        <div class="logo-icon">P</div>
      </div>
      <h1 class="title">PixelPunk</h1>
      <p class="subtitle">赛博朋克图床</p>
    </div>

    <!-- Tab切换 -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'login' }]"
        @click="activeTab = 'login'"
      >
        登录
      </button>
      <button
        :class="['tab', { active: activeTab === 'register' }]"
        @click="activeTab = 'register'"
      >
        注册
      </button>
      <div class="tab-indicator" :style="indicatorStyle" />
    </div>

    <!-- 登录表单 -->
    <form v-if="activeTab === 'login'" class="form" @submit.prevent="handleLogin">
      <Input
        v-model="loginForm.account"
        placeholder="邮箱或用户名"
        size="medium"
        :prefix-icon="MailIcon"
      />

      <Input
        v-model="loginForm.password"
        type="password"
        placeholder="密码"
        size="medium"
        :prefix-icon="LockIcon"
      />

      <div class="form-footer">
        <Checkbox v-model="rememberMe" size="small">记住我</Checkbox>
      </div>

      <Button
        type="primary"
        size="large"
        block
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </Button>
    </form>

    <!-- 注册表单 -->
    <form
      v-if="activeTab === 'register'"
      class="form"
      @submit.prevent="handleRegister"
    >
      <Input
        v-model="registerForm.username"
        placeholder="用户名"
        size="medium"
        :prefix-icon="UserIcon"
      />

      <Input
        v-model="registerForm.email"
        type="email"
        placeholder="邮箱"
        size="medium"
        :prefix-icon="MailIcon"
      />

      <CodeInput
        v-model="registerForm.code"
        size="medium"
        :prefix-icon="ShieldIcon"
        :can-send="Boolean(registerForm.email)"
        :request-code="sendCode"
        @sent="onCodeSent"
        @send-error="onCodeError"
      />

      <Input
        v-model="registerForm.password"
        type="password"
        placeholder="密码"
        size="medium"
        :prefix-icon="LockIcon"
      />

      <Button
        type="primary"
        size="large"
        block
        :loading="loading"
        @click="handleRegister"
      >
        注册
      </Button>
    </form>

    <!-- 版本信息 -->
    <div class="version">v1.0.0</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  X as XIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  User as UserIcon,
  Shield as ShieldIcon,
} from 'lucide-vue-next';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useAuthStore } from '@/store';
import { closeAndShowMain } from '@/utils/window';
import Button from '@/components/Button/index.vue';
import Input from '@/components/Input/index.vue';
import CodeInput from '@/components/CodeInput/index.vue';
import Checkbox from '@/components/Checkbox/index.vue';
import message from '@/components/Message/message';

const authStore = useAuthStore();

const activeTab = ref<'login' | 'register'>('login');
const loading = ref(false);
const rememberMe = ref(false);
// CodeInput 组件内部管理倒计时

const loginForm = ref({
  account: '',
  password: '',
});

const registerForm = ref({
  username: '',
  email: '',
  code: '',
  password: '',
});

const indicatorStyle = computed(() => ({
  transform: activeTab.value === 'login' ? 'translateX(0)' : 'translateX(100%)',
}));

const handleClose = async () => {
  const window = getCurrentWindow();
  await window.close();
};

const handleLogin = async () => {
  if (!loginForm.value.account || !loginForm.value.password) {
    message.warning('请填写完整的登录信息');
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      account: loginForm.value.account,
      password: loginForm.value.password,
    });

    // 登录成功，关闭登录窗口，显示主窗口
    message.success('登录成功');
    await closeAndShowMain();
  } catch (error: any) {
    message.error(error?.message || '登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (
    !registerForm.value.username ||
    !registerForm.value.email ||
    !registerForm.value.code ||
    !registerForm.value.password
  ) {
    message.warning('请填写完整的注册信息');
    return;
  }

  loading.value = true;
  try {
    await authStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      code: registerForm.value.code,
      password: registerForm.value.password,
    });

    message.success('注册成功，请登录');
    // 注册成功后切换到登录标签
    activeTab.value = 'login';
    // 清空注册表单
    registerForm.value = {
      username: '',
      email: '',
      code: '',
      password: '',
    };
  } catch (error: any) {
    message.error(error?.message || '注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 供 CodeInput 调用的发送方法
const sendCode = async () => {
  if (!registerForm.value.email) {
    throw new Error('请输入邮箱地址');
  }
  await authStore.sendCode(registerForm.value.email);
};

const onCodeSent = () => {
  message.success('验证码已发送到您的邮箱');
};

const onCodeError = (err: any) => {
  message.error(err?.message || '发送验证码失败，请稍后重试');
};
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: var(--color-bg-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(0, 255, 255, 0.05) 0%,
    transparent 50%
  );
  animation: pulse 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

/* 窗口控制按钮 */
.window-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast) ease;
}

.control-btn:hover {
  background: rgba(255, 23, 68, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

/* Logo和标题 */
.login-header {
  margin-top: 40px;
  margin-bottom: 32px;
  text-align: center;
  z-index: 1;
}

.logo {
  margin-bottom: 16px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.2) 0%,
    rgba(0, 255, 255, 0.05) 100%
  );
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
  font-size: 32px;
  font-weight: bold;
  color: var(--color-primary);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
  }
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
  letter-spacing: 0.05em;
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* Tab切换 */
.tabs {
  position: relative;
  display: flex;
  width: 100%;
  max-width: 320px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 24px;
  z-index: 1;
}

.tab {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast) ease;
  position: relative;
  z-index: 2;
}

.tab.active {
  color: var(--color-primary);
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: rgba(0, 255, 255, 0.15);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  transition: transform var(--transition-base) ease;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  z-index: 1;
}

/* 表单 */
.form {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

/* 验证码输入区域样式在 CodeInput 组件内处理 */

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
}

/* 版本信息 */
.version {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  opacity: 0.5;
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .login-page::before,
  .logo-icon {
    animation: none !important;
  }
}
</style>
