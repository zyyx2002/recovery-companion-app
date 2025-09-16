import { apiClient } from './api';

// AI聊天请求类型
export interface ChatRequest {
  message: string;
  context?: {
    currentStreak?: number;
    addictionType?: string;
    mood?: string;
  };
}

// AI聊天响应类型
export interface ChatResponse {
  message: string;
  suggestions: string[];
  encouragement: string;
  timestamp: string;
}

// 情绪分析请求类型
export interface MoodAnalysisRequest {
  text: string;
}

// 情绪分析响应类型
export interface MoodAnalysisResponse {
  mood: 'positive' | 'negative' | 'neutral';
  confidence: number;
  recommendations: string[];
}

// AI相关API
export const aiApi = {
  // 发送聊天消息
  chat: async (data: ChatRequest): Promise<{ data: ChatResponse }> => {
    const response = await apiClient.post<ChatResponse>('/ai/chat', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  },

  // 获取AI建议
  getSuggestions: async (type: string = 'general'): Promise<{ data: { suggestions: string[]; type: string } }> => {
    const response = await apiClient.get<{ suggestions: string[]; type: string }>(`/ai/suggestions?type=${type}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  },

  // 获取每日激励
  getDailyMotivation: async (): Promise<{ data: { motivation: string; date: string } }> => {
    const response = await apiClient.get<{ motivation: string; date: string }>('/ai/daily-motivation');
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  },

  // 情绪分析
  analyzeMood: async (data: MoodAnalysisRequest): Promise<{ data: MoodAnalysisResponse }> => {
    const response = await apiClient.post<MoodAnalysisResponse>('/ai/mood-analysis', data);
    if (response.error) {
      throw new Error(response.error);
    }
    return { data: response.data! };
  }
};
