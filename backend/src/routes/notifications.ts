import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { NotificationService, getRandomMotivationMessage } from '../services/notificationService';

const router = express.Router();

// 注册推送令牌验证schema
const registerTokenSchema = z.object({
  pushToken: z.string().min(1, '推送令牌不能为空'),
  deviceInfo: z.object({
    platform: z.string().optional(),
    version: z.string().optional(),
    model: z.string().optional()
  }).optional()
});

// 发送测试通知验证schema
const testNotificationSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  body: z.string().min(1, '内容不能为空'),
  data: z.record(z.any()).optional()
});

// 注册推送令牌
router.post('/register-token', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { pushToken, deviceInfo } = registerTokenSchema.parse(req.body);

  try {
    // 更新用户的推送令牌
    await db
      .update(users)
      .set({
        // 这里需要在数据库schema中添加pushToken字段
        // pushToken: pushToken,
        // deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      message: '推送令牌注册成功'
    });
  } catch (error) {
    console.error('注册推送令牌失败:', error);
    throw createError.internal('注册推送令牌失败');
  }
}));

// 发送测试通知
router.post('/test', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { title, body, data } = testNotificationSchema.parse(req.body);

  // 获取用户的推送令牌
  const [user] = await db
    .select({
      // pushToken: users.pushToken
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  // 模拟推送令牌（实际项目中应该从数据库获取）
  const mockPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

  try {
    const success = await NotificationService.sendPushNotification(mockPushToken, {
      title,
      body,
      data,
      sound: 'default'
    });

    if (success) {
      res.json({
        success: true,
        message: '测试通知发送成功'
      });
    } else {
      throw createError.internal('测试通知发送失败');
    }
  } catch (error) {
    console.error('发送测试通知失败:', error);
    throw createError.internal('发送测试通知失败');
  }
}));

// 发送任务提醒
router.post('/task-reminder', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { taskTitle, taskPoints } = req.body;

  if (!taskTitle || !taskPoints) {
    throw createError.badRequest('任务标题和积分不能为空');
  }

  // 获取用户的推送令牌
  const [user] = await db
    .select({
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  // 模拟推送令牌
  const mockPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

  try {
    const success = await NotificationService.sendTaskReminder(
      mockPushToken,
      taskTitle,
      taskPoints
    );

    if (success) {
      res.json({
        success: true,
        message: '任务提醒发送成功'
      });
    } else {
      throw createError.internal('任务提醒发送失败');
    }
  } catch (error) {
    console.error('发送任务提醒失败:', error);
    throw createError.internal('发送任务提醒失败');
  }
}));

// 发送激励消息
router.post('/motivation', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  // 获取用户的推送令牌
  const [user] = await db
    .select({
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  // 模拟推送令牌
  const mockPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

  try {
    const motivationMessage = getRandomMotivationMessage();
    const success = await NotificationService.sendMotivationMessage(
      mockPushToken,
      motivationMessage
    );

    if (success) {
      res.json({
        success: true,
        message: '激励消息发送成功',
        data: {
          motivation: motivationMessage
        }
      });
    } else {
      throw createError.internal('激励消息发送失败');
    }
  } catch (error) {
    console.error('发送激励消息失败:', error);
    throw createError.internal('发送激励消息失败');
  }
}));

// 获取通知设置
router.get('/settings', authenticateToken, asyncHandler(async (req, res) => {
  // 这里应该从数据库获取用户的通知设置
  // 现在返回默认设置
  res.json({
    success: true,
    data: {
      taskReminders: true,
      dailyCheckin: true,
      milestones: true,
      motivation: true,
      community: true,
      achievements: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    }
  });
}));

// 更新通知设置
router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const settings = req.body;

  // 验证设置数据
  const settingsSchema = z.object({
    taskReminders: z.boolean().optional(),
    dailyCheckin: z.boolean().optional(),
    milestones: z.boolean().optional(),
    motivation: z.boolean().optional(),
    community: z.boolean().optional(),
    achievements: z.boolean().optional(),
    quietHours: z.object({
      enabled: z.boolean(),
      start: z.string(),
      end: z.string()
    }).optional()
  });

  const validatedSettings = settingsSchema.parse(settings);

  try {
    // 这里应该更新数据库中的通知设置
    // await db.update(users).set({ notificationSettings: JSON.stringify(validatedSettings) }).where(eq(users.id, userId));

    res.json({
      success: true,
      message: '通知设置更新成功',
      data: validatedSettings
    });
  } catch (error) {
    console.error('更新通知设置失败:', error);
    throw createError.internal('更新通知设置失败');
  }
}));

// 获取通知历史
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // 这里应该从数据库获取通知历史
  // 现在返回模拟数据
  const mockHistory = [
    {
      id: 1,
      type: 'task_reminder',
      title: '任务提醒',
      body: '别忘了完成今日任务：深呼吸练习（+10积分）',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'motivation',
      title: '💪 加油！',
      body: '每一天的坚持都是向自由迈进的一步！',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    {
      id: 3,
      type: 'milestone',
      title: '🎉 里程碑达成！',
      body: '恭喜！您已经戒断7天了！',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ];

  res.json({
    success: true,
    data: {
      notifications: mockHistory.slice(offset, offset + Number(limit)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: mockHistory.length
      }
    }
  });
}));

// 标记通知为已读
router.put('/mark-read/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    throw createError.badRequest('无效的通知ID');
  }

  try {
    // 这里应该更新数据库中的通知状态
    // await db.update(notifications).set({ read: true }).where(eq(notifications.id, Number(id)));

    res.json({
      success: true,
      message: '通知已标记为已读'
    });
  } catch (error) {
    console.error('标记通知为已读失败:', error);
    throw createError.internal('标记通知为已读失败');
  }
}));

// 清除所有通知
router.delete('/clear', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  try {
    // 这里应该删除用户的所有通知
    // await db.delete(notifications).where(eq(notifications.userId, userId));

    res.json({
      success: true,
      message: '所有通知已清除'
    });
  } catch (error) {
    console.error('清除通知失败:', error);
    throw createError.internal('清除通知失败');
  }
}));

export default router;
