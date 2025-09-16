import { apiClient } from './api';

// 推送令牌注册请求类型
export interface RegisterTokenRequest {
  pushToken: string;
  deviceInfo?: {
    platform?: string;
    version?: string;
    model?: string;
  };
}

// 测试通知请求类型
export interface TestNotificationRequest {
  title: string;
  body: string;
  data?: Record<string, any>;
}

// 通知设置类型
export interface NotificationSettings {
  taskReminders: boolean;
  dailyCheckin: boolean;
  milestones: boolean;
  motivation: boolean;
  community: boolean;
  achievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// 通知历史项类型
export interface NotificationHistoryItem {
  id: number;
  type: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

// 通知相关API
export const notificationApi = {
  // 注册推送令牌
  registerToken: async (data: RegisterTokenRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/notifications/register-token', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { message: response.data?.message || '注册成功' };
  },

  // 发送测试通知
  sendTestNotification: async (data: TestNotificationRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/notifications/test', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { message: response.data?.message || '发送成功' };
  },

  // 发送任务提醒
  sendTaskReminder: async (taskTitle: string, taskPoints: number): Promise<{ message: string }> => {
    const response = await apiClient.post('/notifications/task-reminder', {
      taskTitle,
      taskPoints
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return { message: response.data?.message || '发送成功' };
  },

  // 发送激励消息
  sendMotivation: async (): Promise<{ message: string; data: { motivation: string } }> => {
    const response = await apiClient.post('/notifications/motivation');
    if (response.error) {
      throw new Error(response.error);
    }
    return { 
      message: response.data?.message || '发送成功',
      data: response.data?.data || { motivation: '' }
    };
  },

  // 获取通知设置
  getSettings: async (): Promise<{ data: NotificationSettings }> => {
    const response = await apiClient.get<NotificationSettings>('/notifications/settings');
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  },

  // 更新通知设置
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<{ message: string; data: NotificationSettings }> => {
    const response = await apiClient.put<NotificationSettings>('/notifications/settings', settings);
    if (response.error) {
      throw new Error(response.error);
    }
    return { 
      message: response.data?.message || '更新成功',
      data: response.data?.data || response.data!
    };
  },

  // 获取通知历史
  getHistory: async (page: number = 1, limit: number = 20): Promise<{ data: { notifications: NotificationHistoryItem[]; pagination: any } }> => {
    const response = await apiClient.get<{ notifications: NotificationHistoryItem[]; pagination: any }>(`/notifications/history?page=${page}&limit=${limit}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  },

  // 标记通知为已读
  markAsRead: async (notificationId: number): Promise<{ message: string }> => {
    const response = await apiClient.put(`/notifications/mark-read/${notificationId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { message: response.data?.message || '标记成功' };
  },

  // 清除所有通知
  clearAll: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/notifications/clear');
    if (response.error) {
      throw new Error(response.error);
    }
    return { message: response.data?.message || '清除成功' };
  }
};
