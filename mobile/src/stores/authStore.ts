import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, userApi } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../services/api';

// 认证状态接口
interface AuthState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 用户登录
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);

          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }

          if (response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          }

          set({ error: '登录失败', isLoading: false });
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登录失败';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // 用户注册
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.register(data);

          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }

          if (response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          }

          set({ error: '注册失败', isLoading: false });
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '注册失败';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // 用户登出
      logout: async () => {
        set({ isLoading: true });

        try {
          await authApi.logout();
        } catch (error) {
          console.error('登出API调用失败:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      // 获取当前用户信息
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.getCurrentUser();

          if (response.error) {
            set({ error: response.error, isLoading: false });
            return;
          }

          if (response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // 清除错误信息
      clearError: () => {
        set({ error: null });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// 用户统计状态管理
interface UserStatsState {
  stats: any | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  clearError: () => void;
}

export const useUserStatsStore = create<UserStatsState>((set, get) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await userApi.getStats();

      if (response.error) {
        set({ error: response.error, isLoading: false });
        return;
      }

      if (response.data) {
        set({
          stats: response.data,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取统计信息失败';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
