import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../services/notificationApi';

// 配置通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // 注册推送通知
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // 注册到后端
        registerTokenWithBackend(token);
      }
    });

    // 监听通知
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('通知响应:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // 注册推送通知权限
  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    let token: string | null = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('推送通知权限被拒绝');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('推送令牌:', token);
    } catch (error) {
      console.error('获取推送令牌失败:', error);
    }

    return token;
  };

  // 注册令牌到后端
  const registerTokenWithBackend = async (token: string) => {
    try {
      await notificationApi.registerToken({
        pushToken: token,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version.toString(),
        }
      });
      console.log('推送令牌注册成功');
    } catch (error) {
      console.error('注册推送令牌到后端失败:', error);
    }
  };

  // 获取通知设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('获取通知设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 更新通知设置
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      setLoading(true);
      const response = await notificationApi.updateSettings(newSettings);
      setSettings(response.data);
      return response.data;
    } catch (error) {
      console.error('更新通知设置失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 发送测试通知
  const sendTestNotification = async (title: string, body: string) => {
    try {
      await notificationApi.sendTestNotification({ title, body });
    } catch (error) {
      console.error('发送测试通知失败:', error);
      throw error;
    }
  };

  // 发送任务提醒
  const sendTaskReminder = async (taskTitle: string, taskPoints: number) => {
    try {
      await notificationApi.sendTaskReminder(taskTitle, taskPoints);
    } catch (error) {
      console.error('发送任务提醒失败:', error);
      throw error;
    }
  };

  // 发送激励消息
  const sendMotivation = async () => {
    try {
      const response = await notificationApi.sendMotivation();
      return response.data.motivation;
    } catch (error) {
      console.error('发送激励消息失败:', error);
      throw error;
    }
  };

  // 安排本地通知
  const scheduleLocalNotification = async (
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger,
      });
    } catch (error) {
      console.error('安排本地通知失败:', error);
      throw error;
    }
  };

  // 取消所有通知
  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('取消所有通知失败:', error);
      throw error;
    }
  };

  // 获取通知历史
  const getNotificationHistory = async (page: number = 1, limit: number = 20) => {
    try {
      const response = await notificationApi.getHistory(page, limit);
      return response.data;
    } catch (error) {
      console.error('获取通知历史失败:', error);
      throw error;
    }
  };

  // 标记通知为已读
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      throw error;
    }
  };

  // 清除所有通知
  const clearAllNotifications = async () => {
    try {
      await notificationApi.clearAll();
    } catch (error) {
      console.error('清除所有通知失败:', error);
      throw error;
    }
  };

  return {
    expoPushToken,
    notification,
    settings,
    loading,
    loadSettings,
    updateSettings,
    sendTestNotification,
    sendTaskReminder,
    sendMotivation,
    scheduleLocalNotification,
    cancelAllNotifications,
    getNotificationHistory,
    markAsRead,
    clearAllNotifications,
  };
}
