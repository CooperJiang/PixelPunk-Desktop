<template>
  <div class="login-container">
    <!-- 左侧装饰区 -->
    <div class="left-section" data-tauri-drag-region>
      <!-- 背景动画 -->
      <div class="bg-animation" data-tauri-drag-region>
        <div class="grid-lines" data-tauri-drag-region></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>

      <!-- 内容 -->
      <div class="left-content" data-tauri-drag-region>
        <!-- Logo -->
        <div class="brand" data-tauri-drag-region>
          <div class="brand-icon" data-tauri-drag-region>P</div>
          <h1 class="brand-name" data-tauri-drag-region>PixelPunk</h1>
        </div>

        <!-- 标语 -->
        <div class="slogan" data-tauri-drag-region>
          <p class="slogan-main" data-tauri-drag-region>赛博朋克图床</p>
          <p class="slogan-sub" data-tauri-drag-region>
            下一代图片存储与分享平台
          </p>
        </div>

        <!-- 特性列表 -->
        <div class="features" data-tauri-drag-region>
          <div class="feature-item" data-tauri-drag-region>
            <div class="feature-icon" data-tauri-drag-region>⚡</div>
            <div class="feature-text" data-tauri-drag-region>
              <div class="feature-title" data-tauri-drag-region>极速上传</div>
              <div class="feature-desc" data-tauri-drag-region>
                毫秒级响应，秒传体验
              </div>
            </div>
          </div>
          <div class="feature-item" data-tauri-drag-region>
            <div class="feature-icon" data-tauri-drag-region>🔒</div>
            <div class="feature-text" data-tauri-drag-region>
              <div class="feature-title" data-tauri-drag-region>安全加密</div>
              <div class="feature-desc" data-tauri-drag-region>
                端到端加密，隐私保护
              </div>
            </div>
          </div>
          <div class="feature-item" data-tauri-drag-region>
            <div class="feature-icon" data-tauri-drag-region>🌐</div>
            <div class="feature-text" data-tauri-drag-region>
              <div class="feature-title" data-tauri-drag-region>全球加速</div>
              <div class="feature-desc" data-tauri-drag-region>
                CDN分发，全球可达
              </div>
            </div>
          </div>
        </div>

        <!-- 版本信息 -->
        <div class="version-info" data-tauri-drag-region>v1.0.0 Beta</div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="right-section">
      <!-- 拖动区域 -->
      <div class="drag-area" data-tauri-drag-region>
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="handleClose">
          <XIcon :size="16" />
        </button>
      </div>

      <!-- 表单容器 -->
      <div class="form-wrapper">
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
        <form
          v-if="activeTab === 'login'"
          class="form"
          @submit.prevent="handleLogin"
        >
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

          <!-- 隐私协议 -->
          <div class="privacy-notice">
            登录即表示同意
            <a href="#" class="privacy-link" @click.prevent>《用户协议》</a>
            和
            <a href="#" class="privacy-link" @click.prevent>《隐私政策》</a>
          </div>
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

          <!-- 隐私协议 -->
          <div class="privacy-notice">
            注册即表示同意
            <a href="#" class="privacy-link" @click.prevent>《用户协议》</a>
            和
            <a href="#" class="privacy-link" @click.prevent>《隐私政策》</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  X as XIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  User as UserIcon,
  Shield as ShieldIcon,
} from "lucide-vue-next";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAuthStore } from "@/store";
import { closeAndShowMain } from "@/utils/window";
import { storage } from "@/utils/storage";
import Button from "@/components/Button/index.vue";
import Input from "@/components/Input/index.vue";
import CodeInput from "@/components/CodeInput/index.vue";
import Checkbox from "@/components/Checkbox/index.vue";
import message from "@/components/Message/message";
import { logger } from "@/utils/logger";

const authStore = useAuthStore();

const activeTab = ref<"login" | "register">("login");
const loading = ref(false);
const rememberMe = ref(false);

// 从 storage 读取记住的账号
const REMEMBER_ACCOUNT_KEY = "login.rememberAccount";
const savedAccount = storage.get<string>(REMEMBER_ACCOUNT_KEY);

const loginForm = ref({
  account: savedAccount || "",
  password: "",
});

// 如果有保存的账号，自动勾选"记住我"
if (savedAccount) {
  rememberMe.value = true;
}

const registerForm = ref({
  username: "",
  email: "",
  code: "",
  password: "",
});

const indicatorStyle = computed(() => ({
  transform: activeTab.value === "login" ? "translateX(0)" : "translateX(100%)",
}));

const handleClose = async () => {
  const window = getCurrentWindow();
  await window.close();
};

const handleLogin = async () => {
  if (!loginForm.value.account || !loginForm.value.password) {
    message.warning("请填写完整的登录信息");
    return;
  }

  if (import.meta.env.DEV)
    await logger.debug("[Login] 准备登录", {
      account: loginForm.value.account,
    });
  loading.value = true;

  try {
    const result = await authStore.login({
      account: loginForm.value.account,
      password: loginForm.value.password,
    });

    if (import.meta.env.DEV) await logger.info("[Login] 登录成功");

    // 处理"记住我"功能
    if (rememberMe.value) {
      if (import.meta.env.DEV) await logger.debug("[Login] 保存账号到本地");
      storage.set(REMEMBER_ACCOUNT_KEY, loginForm.value.account);
      await storage.save();
    } else {
      if (import.meta.env.DEV) await logger.debug("[Login] 清除已保存的账号");
      storage.remove(REMEMBER_ACCOUNT_KEY);
      await storage.save();
    }

    // 通知主窗口刷新认证状态（携带数据，避免读写竞态）
    try {
      const win = getCurrentWindow();
      await win.emitTo("main", "auth:updated", {
        at: Date.now(),
        source: "login",
        token: result?.token,
        userInfo: result?.userInfo,
      });
      if (import.meta.env.DEV)
        await logger.debug("[Login] 已通知主窗口刷新认证状态");
    } catch (e) {
      await logger.warn("[Login] 通知主窗口失败", { error: String(e) });
    }

    message.success("登录成功");

    if (import.meta.env.DEV) await logger.debug("[Login] 准备切换到主窗口");
    // 等待 100ms 确保文件系统操作完全完成
    await new Promise((resolve) => window.setTimeout(resolve, 100));
    await closeAndShowMain();
    if (import.meta.env.DEV) await logger.debug("[Login] 已切换到主窗口");
  } catch (error: any) {
    await logger.error("[Login] 登录失败", {
      error: String(error),
      message: error?.message,
    });
    message.error(error?.message || "登录失败，请稍后重试");
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
    message.warning("请填写完整的注册信息");
    return;
  }

  loading.value = true;
  try {
    // 保存密码用于自动登录
    const registeredEmail = registerForm.value.email;
    const registeredPassword = registerForm.value.password;

    await authStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      code: registerForm.value.code,
      password: registerForm.value.password,
    });

    message.success("注册成功，正在自动登录...");

    // 自动登录
    try {
      const result = await authStore.login({
        account: registeredEmail,
        password: registeredPassword,
      });

      if (import.meta.env.DEV) await logger.info("[Login] 注册后自动登录成功");

      // 通知主窗口刷新认证状态（携带数据）
      try {
        const win = getCurrentWindow();
        await win.emitTo("main", "auth:updated", {
          at: Date.now(),
          source: "register",
          token: result?.token,
          userInfo: result?.userInfo,
        });
      } catch (e) {
        await logger.warn("[Login] 通知主窗口失败", { error: String(e) });
      }

      message.success("登录成功");

      // 等待 100ms 确保文件系统操作完全完成
      await new Promise((resolve) => window.setTimeout(resolve, 100));
      // 切换到主窗口
      await closeAndShowMain();
    } catch (loginError: any) {
      await logger.error("[Login] 自动登录失败", { error: String(loginError) });
      message.warning("注册成功，但自动登录失败，请手动登录");

      // 切换到登录标签，并填充邮箱
      activeTab.value = "login";
      loginForm.value.account = registeredEmail;
      loginForm.value.password = "";
    }

    // 清空注册表单
    registerForm.value = {
      username: "",
      email: "",
      code: "",
      password: "",
    };
  } catch (error: any) {
    message.error(error?.message || "注册失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

const sendCode = async () => {
  if (!registerForm.value.email) {
    throw new Error("请输入邮箱地址");
  }
  await authStore.sendCode(registerForm.value.email);
};

const onCodeSent = () => {
  message.success("验证码已发送到您的邮箱");
};

const onCodeError = (err: any) => {
  message.error(err?.message || "发送验证码失败，请稍后重试");
};

// 监听"记住我"状态变化
watch(rememberMe, async (newValue) => {
  if (!newValue) {
    // 取消勾选时立即清除保存的账号
    if (import.meta.env.DEV)
      await logger.debug('[Login] 取消"记住我"，清除保存的账号');
    storage.remove(REMEMBER_ACCOUNT_KEY);
    await storage.save();
  }
});
</script>

<style scoped>
/* 主容器 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  background: var(--color-bg-base);
  overflow: hidden;
}

/* ========== 左侧装饰区 ========== */
.left-section {
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  overflow: hidden;
}

/* 背景动画 */
.bg-animation {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(0deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(0, 255, 255, 0.4) 0%,
    transparent 70%
  );
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(
    circle,
    rgba(138, 43, 226, 0.3) 0%,
    transparent 70%
  );
  bottom: -80px;
  right: -80px;
  animation-delay: 2s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(255, 0, 128, 0.25) 0%,
    transparent 70%
  );
  top: 50%;
  left: 30%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 左侧内容 */
.left-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  user-select: none;
}

/* 品牌 */
.brand {
  margin-bottom: 40px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(0, 255, 255, 0.15) 0%,
    rgba(0, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 20px;
  font-size: 42px;
  font-weight: bold;
  color: #00ffff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  margin-bottom: 20px;
}

.brand-name {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, #00ffff 0%, #00ccff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 标语 */
.slogan {
  margin-bottom: 50px;
}

.slogan-main {
  font-size: 24px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px 0;
}

.slogan-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 特性列表 */
.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 20px;
  flex-shrink: 0;
}

.feature-text {
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* 版本信息 */
.version-info {
  position: absolute;
  bottom: 30px;
  left: 60px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* ========== 右侧表单区 ========== */
.right-section {
  width: 420px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-base);
  padding: 60px 50px;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
}

/* 拖动区域 */
.drag-area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  z-index: 10;
}

/* 关闭按钮 */
.close-btn {
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
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 23, 68, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

/* 表单容器 */
.form-wrapper {
  width: 100%;
  max-width: 320px;
}

/* Tab切换 */
.tabs {
  position: relative;
  display: flex;
  width: 100%;
  background: rgba(0, 255, 255, 0.05);
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  padding: 10px 0;
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
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -4px;
  margin-bottom: 4px;
}

/* 隐私协议 */
.privacy-notice {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.privacy-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--transition-fast) ease;
}

.privacy-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* 无障碍 */
@media (prefers-reduced-motion: reduce) {
  .grid-lines,
  .glow-orb {
    animation: none !important;
  }
}
</style>
