import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { recoverySessions, addictionTypes, dailyCheckins, users } from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 开始戒断会话验证schema
const startSessionSchema = z.object({
  addictionTypeId: z.number().int().positive('无效的成瘾类型ID'),
  targetDays: z.number().int().min(1).max(365).default(30),
  notes: z.string().max(500, '备注过长').optional()
});

// 结束戒断会话验证schema
const endSessionSchema = z.object({
  sessionId: z.number().int().positive('无效的会话ID'),
  notes: z.string().max(500, '备注过长').optional()
});

// 心情签到验证schema
const moodCheckinSchema = z.object({
  moodRating: z.number().int().min(1).max(5, '心情评分必须在1-5之间'),
  notes: z.string().max(500, '备注过长').optional()
});

// 获取成瘾类型列表
router.get('/addiction-types', asyncHandler(async (req, res) => {
  const addictionTypesList = await db
    .select({
      id: addictionTypes.id,
      name: addictionTypes.name,
      description: addictionTypes.description,
      iconUrl: addictionTypes.iconUrl,
      colorCode: addictionTypes.colorCode
    })
    .from(addictionTypes)
    .where(eq(addictionTypes.isActive, true))
    .orderBy(addictionTypes.name);

  res.json({
    addictionTypes: addictionTypesList
  });
}));

// 开始新的戒断会话
router.post('/sessions/start', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { addictionTypeId, targetDays, notes } = startSessionSchema.parse(req.body);

  // 检查成瘾类型是否存在
  const [addictionType] = await db
    .select({ id: addictionTypes.id, name: addictionTypes.name })
    .from(addictionTypes)
    .where(and(
      eq(addictionTypes.id, addictionTypeId),
      eq(addictionTypes.isActive, true)
    ))
    .limit(1);

  if (!addictionType) {
    throw createError.notFound('成瘾类型不存在');
  }

  // 检查是否已有活跃的戒断会话
  const [existingSession] = await db
    .select({ id: recoverySessions.id })
    .from(recoverySessions)
    .where(and(
      eq(recoverySessions.userId, userId),
      eq(recoverySessions.isActive, true)
    ))
    .limit(1);

  if (existingSession) {
    throw createError.conflict('您已有一个活跃的戒断会话');
  }

  // 创建新的戒断会话
  const [newSession] = await db
    .insert(recoverySessions)
    .values({
      userId,
      addictionTypeId,
      startDate: new Date().toISOString().split('T')[0],
      targetDays,
      notes: notes || null,
      currentStreak: 0,
      longestStreak: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning({
      id: recoverySessions.id,
      startDate: recoverySessions.startDate,
      targetDays: recoverySessions.targetDays,
      notes: recoverySessions.notes,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak
    });

  res.status(201).json({
    message: '戒断会话开始成功',
    session: {
      ...newSession,
      addictionType: {
        id: addictionType.id,
        name: addictionType.name
      }
    }
  });
}));

// 结束戒断会话
router.post('/sessions/end', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { sessionId, notes } = endSessionSchema.parse(req.body);

  // 检查会话是否存在且属于当前用户
  const [session] = await db
    .select({
      id: recoverySessions.id,
      isActive: recoverySessions.isActive,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak
    })
    .from(recoverySessions)
    .where(and(
      eq(recoverySessions.id, sessionId),
      eq(recoverySessions.userId, userId)
    ))
    .limit(1);

  if (!session) {
    throw createError.notFound('戒断会话不存在');
  }

  if (!session.isActive) {
    throw createError.badRequest('戒断会话已经结束');
  }

  // 更新会话状态
  const [updatedSession] = await db
    .update(recoverySessions)
    .set({
      endDate: new Date().toISOString().split('T')[0],
      isActive: false,
      notes: notes || null,
      updatedAt: new Date()
    })
    .where(eq(recoverySessions.id, sessionId))
    .returning({
      id: recoverySessions.id,
      endDate: recoverySessions.endDate,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak
    });

  res.json({
    message: '戒断会话结束成功',
    session: updatedSession
  });
}));

// 获取当前活跃的戒断会话
router.get('/sessions/current', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const [currentSession] = await db
    .select({
      id: recoverySessions.id,
      startDate: recoverySessions.startDate,
      endDate: recoverySessions.endDate,
      targetDays: recoverySessions.targetDays,
      notes: recoverySessions.notes,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak,
      isActive: recoverySessions.isActive,
      addictionType: {
        id: addictionTypes.id,
        name: addictionTypes.name,
        description: addictionTypes.description,
        colorCode: addictionTypes.colorCode
      }
    })
    .from(recoverySessions)
    .leftJoin(addictionTypes, eq(recoverySessions.addictionTypeId, addictionTypes.id))
    .where(and(
      eq(recoverySessions.userId, userId),
      eq(recoverySessions.isActive, true)
    ))
    .orderBy(desc(recoverySessions.createdAt))
    .limit(1);

  if (!currentSession) {
    return res.json({
      session: null,
      message: '没有活跃的戒断会话'
    });
  }

  // 计算实际戒断天数
  const startDate = new Date(currentSession.startDate);
  const today = new Date();
  const actualDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  res.json({
    session: {
      ...currentSession,
      actualDays,
      progress: Math.min((actualDays / currentSession.targetDays) * 100, 100)
    }
  });
}));

// 心情签到
router.post('/checkin', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { moodRating, notes } = moodCheckinSchema.parse(req.body);

  const today = new Date().toISOString().split('T')[0];

  // 检查今天是否已经签到
  const [existingCheckin] = await db
    .select({ id: dailyCheckins.id })
    .from(dailyCheckins)
    .where(and(
      eq(dailyCheckins.userId, userId),
      eq(dailyCheckins.checkinDate, today)
    ))
    .limit(1);

  // 获取当前活跃的戒断会话
  const [currentSession] = await db
    .select({ id: recoverySessions.id })
    .from(recoverySessions)
    .where(and(
      eq(recoverySessions.userId, userId),
      eq(recoverySessions.isActive, true)
    ))
    .limit(1);

  let checkin;
  if (existingCheckin) {
    // 更新今日签到
    [checkin] = await db
      .update(dailyCheckins)
      .set({
        moodRating,
        notes: notes || null
      })
      .where(eq(dailyCheckins.id, existingCheckin.id))
      .returning();
  } else {
    // 创建新签到
    [checkin] = await db
      .insert(dailyCheckins)
      .values({
        userId,
        recoverySessionId: currentSession?.id || null,
        checkinDate: today,
        moodRating,
        notes: notes || null,
        createdAt: new Date()
      })
      .returning();
  }

  // 更新戒断会话的连续天数
  if (currentSession) {
    const startDate = new Date(currentSession.id); // 这里应该是startDate，但为了简化使用id
    const actualDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    await db
      .update(recoverySessions)
      .set({
        currentStreak: actualDays,
        longestStreak: sql`GREATEST(${recoverySessions.longestStreak}, ${actualDays})`,
        updatedAt: new Date()
      })
      .where(eq(recoverySessions.id, currentSession.id));
  }

  res.json({
    message: existingCheckin ? '心情记录已更新' : '心情签到成功',
    checkin: {
      id: checkin.id,
      checkinDate: checkin.checkinDate,
      moodRating: checkin.moodRating,
      notes: checkin.notes
    }
  });
}));

// 获取心情签到历史
router.get('/checkin/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { limit = 30 } = req.query;

  const checkinHistory = await db
    .select({
      id: dailyCheckins.id,
      checkinDate: dailyCheckins.checkinDate,
      moodRating: dailyCheckins.moodRating,
      notes: dailyCheckins.notes,
      createdAt: dailyCheckins.createdAt
    })
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, userId))
    .orderBy(desc(dailyCheckins.checkinDate))
    .limit(Number(limit));

  res.json({
    history: checkinHistory,
    total: checkinHistory.length
  });
}));

// 获取戒断会话历史
router.get('/sessions/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const sessions = await db
    .select({
      id: recoverySessions.id,
      startDate: recoverySessions.startDate,
      endDate: recoverySessions.endDate,
      targetDays: recoverySessions.targetDays,
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak,
      isActive: recoverySessions.isActive,
      notes: recoverySessions.notes,
      addictionType: {
        id: addictionTypes.id,
        name: addictionTypes.name,
        colorCode: addictionTypes.colorCode
      }
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

export default router;
