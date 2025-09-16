import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// API基础配置
const API_BASE_URL = `${API_URL}/api`;

// 存储键名
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

// API响应类型
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// 用户类型
export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

// 认证响应类型
export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求类型
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// API客户端类
class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadStoredToken();
  }

  // 加载存储的令牌
  private async loadStoredToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      this.accessToken = token;
    } catch (error) {
      console.error('加载存储令牌失败:', error);
    }
  }

  // 设置访问令牌
  async setAccessToken(token: string) {
    this.accessToken = token;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('保存访问令牌失败:', error);
    }
  }

  // 清除令牌
  async clearTokens() {
    this.accessToken = null;
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA
      ]);
    } catch (error) {
      console.error('清除令牌失败:', error);
    }
  }

  // 获取请求头
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // 处理API响应
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      // 如果是401错误，尝试刷新令牌
      if (response.status === 401 && this.accessToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 重试原请求
          return this.request(data.url, data.options);
        }
      }

      return {
        error: data.error || '请求失败',
        code: data.code
      };
    }

    return { data };
  }

  // 刷新令牌
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const { data } = await response.json();
        await this.setAccessToken(data.tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.tokens.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('刷新令牌失败:', error);
    }

    // 刷新失败，清除所有令牌
    await this.clearTokens();
    return false;
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        error: '网络连接失败，请检查网络设置'
      };
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);

// 认证相关API
export const authApi = {
  // 用户注册
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // 用户登录
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // 登录成功后保存令牌和用户数据
    if (response.data) {
      await apiClient.setAccessToken(response.data.tokens.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  // 用户登出
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    await apiClient.clearTokens();
    return response;
  }
};

// 用户相关API
export const userApi = {
  // 获取用户统计信息
  getStats: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/users/stats');
  },

  // 更新用户资料
  updateProfile: async (data: any): Promise<ApiResponse<any>> => {
    return apiClient.put('/users/profile', data);
  },

  // 获取用户历史记录
  getHistory: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/users/history${queryString}`);
  }
};

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTasks: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/tasks${queryString}`);
  },

  // 获取今日任务
  getDailyTasks: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/tasks/daily');
  },

  // 完成任务
  completeTask: async (data: { taskId: number; notes?: string }): Promise<ApiResponse<any>> => {
    return apiClient.post('/tasks/complete', data);
  },

  // 获取任务历史
  getTaskHistory: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/tasks/history${queryString}`);
  },

  // 获取任务统计
  getTaskStats: async (period?: string): Promise<ApiResponse<any>> => {
    const queryString = period ? `?period=${period}` : '';
    return apiClient.get(`/tasks/stats${queryString}`);
  }
};

// 戒断相关API
export const recoveryApi = {
  // 获取成瘾类型列表
  getAddictionTypes: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/recovery/addiction-types');
  },

  // 开始戒断会话
  startSession: async (data: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/recovery/sessions/start', data);
  },

  // 结束戒断会话
  endSession: async (data: any): Promise<ApiResponse<any>> => {
    return apiClient.post('/recovery/sessions/end', data);
  },

  // 获取当前戒断会话
  getCurrentSession: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/recovery/sessions/current');
  },

  // 心情签到
  moodCheckin: async (data: { moodRating: number; notes?: string }): Promise<ApiResponse<any>> => {
    return apiClient.post('/recovery/checkin', data);
  },

  // 获取心情签到历史
  getCheckinHistory: async (limit?: number): Promise<ApiResponse<any>> => {
    const queryString = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/recovery/checkin/history${queryString}`);
  },

  // 获取戒断会话历史
  getSessionHistory: async (params?: any): Promise<ApiResponse<any>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiClient.get(`/recovery/sessions/history${queryString}`);
  }
};

export default apiClient;
