import { Expo, ExpoPushMessage } from 'expo-server-sdk';

// 创建Expo推送客户端
const expo = new Expo();

// 推送通知类型
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

// 推送通知服务类
export class NotificationService {
  // 发送单个推送通知
  static async sendPushNotification(
    pushToken: string,
    notification: NotificationData
  ): Promise<boolean> {
    try {
      // 检查推送令牌是否有效
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error('无效的推送令牌:', pushToken);
        return false;
      }

      // 构建推送消息
      const message: ExpoPushMessage = {
        to: pushToken,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId || 'default',
      };

      // 发送推送通知
      const chunks = expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('发送推送通知失败:', error);
          return false;
        }
      }

      // 检查是否有错误
      const hasErrors = tickets.some(ticket => ticket.status === 'error');
      if (hasErrors) {
        console.error('推送通知发送错误:', tickets);
        return false;
      }

      console.log('推送通知发送成功:', tickets);
      return true;
    } catch (error) {
      console.error('推送通知服务错误:', error);
      return false;
    }
  }

  // 批量发送推送通知
  static async sendBulkPushNotifications(
    pushTokens: string[],
    notification: NotificationData
  ): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    // 过滤有效的推送令牌
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    const invalidTokens = pushTokens.filter(token => !Expo.isExpoPushToken(token));

    failed.push(...invalidTokens);

    if (validTokens.length === 0) {
      return { success, failed };
    }

    try {
      // 构建推送消息
      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        channelId: notification.channelId || 'default',
      }));

      // 分块发送
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('批量发送推送通知失败:', error);
          // 如果整个chunk失败，将所有token标记为失败
          const chunkTokens = chunk.map(msg => msg.to as string);
          failed.push(...chunkTokens);
          continue;
        }
      }

      // 处理结果
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          failed.push(validTokens[index]);
        } else {
          success.push(validTokens[index]);
        }
      });

      return { success, failed };
    } catch (error) {
      console.error('批量推送通知服务错误:', error);
      failed.push(...validTokens);
      return { success, failed };
    }
  }

  // 发送任务提醒通知
  static async sendTaskReminder(
    pushToken: string,
    taskTitle: string,
    taskPoints: number
  ): Promise<boolean> {
    return this.sendPushNotification(pushToken, {
      title: '任务提醒',
      body: `别忘了完成今日任务：${taskTitle}（+${taskPoints}积分）`,
      data: {
        type: 'task_reminder',
        taskTitle,
        taskPoints
      },
      sound: 'default'
    });
  }

  // 发送戒断里程碑通知
  static async sendMilestoneNotification(
    pushToken: string,
    days: number,
    addictionType: string
  ): Promise<boolean> {
    return this.sendPushNotification(pushToken, {
      title: '🎉 里程碑达成！',
      body: `恭喜！您已经戒断${addictionType}${days}天了！`,
      data: {
        type: 'milestone',
        days,
        addictionType
      },
      sound: 'default'
    });
  }

  // 发送每日签到提醒
  static async sendDailyCheckinReminder(pushToken: string): Promise<boolean> {
    return this.sendPushNotification(pushToken, {
      title: '每日签到',
      body: '记得记录今天的心情和感受哦～',
      data: {
        type: 'daily_checkin'
      },
      sound: 'default'
    });
  }

  // 发送激励消息
  static async sendMotivationMessage(
    pushToken: string,
    message: string
  ): Promise<boolean> {
    return this.sendPushNotification(pushToken, {
      title: '💪 加油！',
      body: message,
      data: {
        type: 'motivation'
      },
      sound: 'default'
    });
  }

  // 发送社区互动通知
  static async sendCommunityNotification(
    pushToken: string,
    type: 'like' | 'comment' | 'reply',
    content: string
  ): Promise<boolean> {
    const titles = {
      like: '❤️ 收到点赞',
      comment: '💬 收到评论',
      reply: '↩️ 收到回复'
    };

    return this.sendPushNotification(pushToken, {
      title: titles[type],
      body: content,
      data: {
        type: 'community',
        action: type
      },
      sound: 'default'
    });
  }

  // 发送成就解锁通知
  static async sendAchievementNotification(
    pushToken: string,
    achievementName: string,
    achievementDescription: string
  ): Promise<boolean> {
    return this.sendPushNotification(pushToken, {
      title: '🏆 成就解锁！',
      body: `恭喜获得成就：${achievementName}`,
      data: {
        type: 'achievement',
        achievementName,
        achievementDescription
      },
      sound: 'default'
    });
  }
}

// 预定义的激励消息
export const MOTIVATION_MESSAGES = [
  '每一天的坚持都是向自由迈进的一步！',
  '你比想象中更强大，比困难更坚韧！',
  '戒断不是放弃，而是选择更好的自己！',
  '每一次拒绝诱惑，都是对未来的投资！',
  '困难是成长的阶梯，坚持是成功的钥匙！',
  '你的决心比任何诱惑都更强大！',
  '每一天都是新的开始，每一刻都是新的机会！',
  '戒断路上，你并不孤单，我们与你同在！',
  '坚持下去，胜利就在前方！',
  '你已经走了这么远，不要现在放弃！'
];

// 获取随机激励消息
export function getRandomMotivationMessage(): string {
  return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
}
