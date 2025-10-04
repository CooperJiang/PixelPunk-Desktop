import { defineStore } from 'pinia';
import { userApi } from '@/api';
import type {
  UserInfo,
  UserLoginRequest,
  UserRegisterRequest,
  SendCodeRequest,
} from '@/api/types';
import { storage } from '@/utils/storage';
import { TOKEN_KEY, USER_INFO_KEY, TOKEN_EXPIRES } from '@/constants/api';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  avatarUrl: string | null;
  initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const storedUser = storage.get<UserInfo>(USER_INFO_KEY);
    const storedToken = storage.get<string>(TOKEN_KEY);

    return {
      user: storedUser || null,
      token: storedToken || null,
      isAuthenticated: Boolean(storedToken && storedUser),
      avatarUrl: storedUser?.avatarFullPath || storedUser?.avatar || null,
      initialized: false,
    };
  },

  getters: {
    userInfo: (state) => state.user,
    isLoggedIn: (state) =>
      state.isAuthenticated && Boolean(state.token) && Boolean(state.user),
    userAvatar: (state) => state.avatarUrl,
    isAdmin: (state) => (state.user?.role ? [1, 2].includes(state.user.role) : false),
  },

  actions: {
    /**
     * 初始化认证状态 - 确保只执行一次
     */
    initAuth() {
      if (this.initialized) {
        return;
      }

      this.checkAuth();
      this.initialized = true;
    },

    /**
     * 用户登录
     */
    async login(loginData: UserLoginRequest) {
      const result = await userApi.login(loginData);
      if (result.success) {
        const { userInfo, token } = result.data;
        await this.setUserInfo(userInfo);
        await this.setToken(token);
        return result.data;
      }
      /* 抛出包含具体错误信息的错误 */
      const errorMessage = result.message || '登录失败';
      const error = new Error(errorMessage);
      /* 保留原始响应数据用于调试 */
      (error as any).response = { data: result };
      throw error;
    },

    /**
     * 用户注册
     */
    async register(registerData: UserRegisterRequest) {
      const result = await userApi.register(registerData);
      if (result.success) {
        return result.data;
      }
      /* 抛出错误让调用方知道注册失败 */
      const errorMessage = result.message || '注册失败';
      throw new Error(errorMessage);
    },

    /**
     * 发送验证码
     */
    async sendCode(email: string) {
      const result = await userApi.sendRegistrationCode({ email });
      if (result.success) {
        return result.data;
      }
      const errorMessage = result.message || '发送验证码失败';
      throw new Error(errorMessage);
    },

    /**
     * 存储用户信息
     */
    async setUserInfo(user: UserInfo) {
      this.user = user;
      this.isAuthenticated = true;
      this.avatarUrl = user.avatarFullPath || user.avatar;
      storage.set(USER_INFO_KEY, user);
      // 立即保存到磁盘，确保数据持久化
      await storage.save();
    },

    /**
     * 存储token
     */
    async setToken(token: string) {
      this.token = token;
      storage.set(TOKEN_KEY, token);
      // 立即保存到磁盘，确保数据持久化
      await storage.save();
    },

    /**
     * 用户登出
     */
    async logout() {
      /* 清理状态 */
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      this.avatarUrl = null;
      this.initialized = false;
      storage.remove(TOKEN_KEY);
      storage.remove(USER_INFO_KEY);
      // 立即保存到磁盘
      await storage.save();
    },

    /**
     * 检查是否已认证
     */
    checkAuth() {
      const token = storage.get<string>(TOKEN_KEY);
      const userInfo = storage.get<UserInfo>(USER_INFO_KEY);

      if (token && userInfo) {
        this.token = token;
        this.user = userInfo;
        this.isAuthenticated = true;
        this.avatarUrl = userInfo.avatarFullPath || userInfo.avatar;
      } else {
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.avatarUrl = null;
        /* 清理可能损坏的数据 */
        if (!token || !userInfo) {
          storage.remove(TOKEN_KEY);
          storage.remove(USER_INFO_KEY);
        }
      }
    },

    /**
     * 更新用户头像
     */
    updateUserAvatar(avatarUrl: string, fullUrl?: string) {
      if (this.user) {
        /* 更新avatar路径用于表单提交 */
        this.user.avatar = avatarUrl;

        /* 保存完整URL用于显示 */
        if (fullUrl) {
          this.user.avatarFullPath = fullUrl;
          /* 更新头像URL状态 */
          this.avatarUrl = fullUrl;
        } else {
          this.avatarUrl = avatarUrl;
        }

        /* 更新本地存储 */
        storage.set(USER_INFO_KEY, this.user);
      }
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(newUserInfo: Partial<UserInfo>) {
      if (!this.user) {
        return;
      }
      this.user = { ...this.user, ...newUserInfo };

      /* 如果更新了头像，同步更新avatarUrl */
      if (newUserInfo.avatarFullPath) {
        this.avatarUrl = newUserInfo.avatarFullPath;
      } else if (newUserInfo.avatar) {
        this.avatarUrl = newUserInfo.avatar;
      }

      /* 保存到本地存储 */
      storage.set(USER_INFO_KEY, this.user);
    },
  },
});
