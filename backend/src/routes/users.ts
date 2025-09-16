import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { users, userPoints, recoverySessions, addictionTypes } from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 更新用户资料验证schema
const updateProfileSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符').optional(),
  avatarUrl: z.string().url('无效的头像URL').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '无效的手机号').optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  timezone: z.string().optional()
});

// 获取用户统计信息
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  // 获取用户基本信息
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  // 获取用户积分信息
  const [points] = await db
    .select({
      totalPoints: userPoints.totalPoints,
      currentLevel: userPoints.currentLevel
    })
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  // 获取当前活跃的戒断会话
  const [currentSession] = await db
    .select({
      id: recoverySessions.id,
      startDate: recoverySessions.startDate,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak,
      targetDays: recoverySessions.targetDays,
      addictionName: addictionTypes.name,
      addictionColor: addictionTypes.colorCode
    })
    .from(recoverySessions)
    .leftJoin(addictionTypes, eq(recoverySessions.addictionTypeId, addictionTypes.id))
    .where(eq(recoverySessions.userId, userId))
    .orderBy(desc(recoverySessions.createdAt))
    .limit(1);

  // 计算戒断天数
  let currentStreak = 0;
  if (currentSession) {
    const startDate = new Date(currentSession.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    currentStreak = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    },
    stats: {
      totalPoints: points?.totalPoints || 0,
      currentLevel: points?.currentLevel || 1,
      currentStreak,
      longestStreak: currentSession?.longestStreak || 0,
      currentAddiction: currentSession ? {
        id: currentSession.id,
        name: currentSession.addictionName,
        color: currentSession.addictionColor,
        startDate: currentSession.startDate,
        targetDays: currentSession.targetDays
      } : null
    }
  });
}));

// 更新用户资料
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  // 验证输入数据
  const validatedData = updateProfileSchema.parse(req.body);

  // 如果更新用户名，检查是否已存在
  if (validatedData.username) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, validatedData.username))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== userId) {
      throw createError.conflict('该用户名已被使用');
    }
  }

  // 更新用户信息
  const [updatedUser] = await db
    .update(users)
    .set({
      ...validatedData,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      avatarUrl: users.avatarUrl,
      phone: users.phone,
      dateOfBirth: users.dateOfBirth,
      gender: users.gender,
      timezone: users.timezone,
      updatedAt: users.updatedAt
    });

  res.json({
    message: '资料更新成功',
    user: updatedUser
  });
}));

// 获取用户历史记录
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  // 获取戒断会话历史
  const sessions = await db
    .select({
      id: recoverySessions.id,
      startDate: recoverySessions.startDate,
      endDate: recoverySessions.endDate,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak,
      targetDays: recoverySessions.targetDays,
      isActive: recoverySessions.isActive,
      addictionName: addictionTypes.name,
      addictionColor: addictionTypes.colorCode
    })
    .from(recoverySessions)
    .leftJoin(addictionTypes, eq(recoverySessions.addictionTypeId, addictionTypes.id))
    .where(eq(recoverySessions.userId, userId))
    .orderBy(desc(recoverySessions.createdAt))
    .limit(Number(limit))
    .offset(offset);

  res.json({
    sessions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: sessions.length
    }
  });
}));

// 删除用户账户
router.delete('/account', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { password } = req.body;

  if (!password) {
    throw createError.badRequest('请输入密码确认删除');
  }

  // 验证密码
  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  const bcrypt = require('bcryptjs');
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createError.unauthorized('密码错误');
  }

  // 软删除用户（设置为非活跃状态）
  await db
    .update(users)
    .set({
      isActive: false,
      email: `deleted_${Date.now()}_${user.passwordHash.slice(-8)}`,
      username: `deleted_${Date.now()}`,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  res.json({
    message: '账户删除成功'
  });
}));

export default router;
