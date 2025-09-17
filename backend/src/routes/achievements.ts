import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { achievements, userAchievements, users, userPoints, userTaskCompletions, recoverySessions } from '../database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 获取成就列表
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { category } = req.query;

  let query = db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      iconUrl: achievements.iconUrl,
      pointsRequired: achievements.pointsRequired,
      daysRequired: achievements.daysRequired,
      category: achievements.category,
      earned: sql<boolean>`CASE WHEN ${userAchievements.id} IS NOT NULL THEN true ELSE false END`
    })
    .from(achievements)
    .leftJoin(
      userAchievements,
      and(
        eq(userAchievements.achievementId, achievements.id),
        eq(userAchievements.userId, userId)
      )
    )
    .where(eq(achievements.isActive, true));

  // 分类过滤
  if (category) {
    query = query.where(eq(achievements.category, category as string));
  }

  const achievementsList = await query.orderBy(achievements.pointsRequired, achievements.daysRequired);

  res.json({
    achievements: achievementsList
  });
}));

// 获取用户已获得的成就
router.get('/earned', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const earnedAchievements = await db
    .select({
      id: userAchievements.id,
      earnedDate: userAchievements.earnedDate,
      createdAt: userAchievements.createdAt,
      achievement: {
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        iconUrl: achievements.iconUrl,
        category: achievements.category
      }
    })
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedDate))
    .limit(Number(limit))
    .offset(offset);

  res.json({
    achievements: earnedAchievements,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: earnedAchievements.length
    }
  });
}));

// 检查并授予成就
router.post('/check', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  // 获取用户当前数据
  const [userStats] = await db
    .select({
      totalPoints: userPoints.totalPoints,
      currentLevel: userPoints.currentLevel
    })
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  // 获取用户当前戒断天数
  const [currentSession] = await db
    .select({
      currentStreak: recoverySessions.currentStreak,
      longestStreak: recoverySessions.longestStreak
    })
    .from(recoverySessions)
    .where(and(
      eq(recoverySessions.userId, userId),
      eq(recoverySessions.isActive, true)
    ))
    .orderBy(desc(recoverySessions.createdAt))
    .limit(1);

  // 获取已完成任务数
  const [taskStats] = await db
    .select({
      totalTasks: sql<number>`COUNT(*)`
    })
    .from(userTaskCompletions)
    .where(eq(userTaskCompletions.userId, userId));

  // 获取所有成就
  const allAchievements = await db
    .select()
    .from(achievements)
    .where(eq(achievements.isActive, true));

  // 获取用户已获得的成就
  const earnedAchievements = await db
    .select({ achievementId: userAchievements.achievementId })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const earnedIds = new Set(earnedAchievements.map(ea => ea.achievementId));

  const newAchievements = [];

  // 检查每个成就
  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) {
      continue; // 已经获得过
    }

    let shouldEarn = false;

    // 检查积分成就
    if (achievement.pointsRequired && userStats && userStats.totalPoints >= achievement.pointsRequired) {
      shouldEarn = true;
    }

    // 检查天数成就
    if (achievement.daysRequired && currentSession && currentSession.currentStreak >= achievement.daysRequired) {
      shouldEarn = true;
    }

    // 检查任务成就
    if (achievement.category === '任务' && taskStats && taskStats.totalTasks >= (achievement.pointsRequired || 0)) {
      shouldEarn = true;
    }

    if (shouldEarn) {
      // 授予成就
      await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId: achievement.id,
          earnedDate: new Date().toISOString().split('T')[0],
          createdAt: new Date()
        });

      newAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        category: achievement.category
      });
    }
  }

  res.json({
    message: newAchievements.length > 0 ? '获得新成就！' : '暂无新成就',
    newAchievements,
    totalNew: newAchievements.length
  });
}));

// 获取成就统计
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  // 获取用户成就统计
  const [userStats] = await db
    .select({
      totalEarned: sql<number>`COUNT(*)`
    })
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  // 获取总成就数
  const [totalStats] = await db
    .select({
      totalAchievements: sql<number>`COUNT(*)`
    })
    .from(achievements)
    .where(eq(achievements.isActive, true));

  // 按分类统计
  const categoryStats = await db
    .select({
      category: achievements.category,
      total: sql<number>`COUNT(*)`,
      earned: sql<number>`COUNT(${userAchievements.id})`
    })
    .from(achievements)
    .leftJoin(
      userAchievements,
      and(
        eq(userAchievements.achievementId, achievements.id),
        eq(userAchievements.userId, userId)
      )
    )
    .where(eq(achievements.isActive, true))
    .groupBy(achievements.category);

  res.json({
    stats: {
      totalEarned: userStats?.totalEarned || 0,
      totalAchievements: totalStats?.totalAchievements || 0,
      completionRate: totalStats?.totalAchievements 
        ? Math.round(((userStats?.totalEarned || 0) / totalStats.totalAchievements) * 100)
        : 0
    },
    categoryStats
  });
}));

// 获取成就详情
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const achievementId = parseInt(req.params.id);
  const userId = req.user!.id;

  if (isNaN(achievementId)) {
    throw createError.badRequest('无效的成就ID');
  }

  const [achievement] = await db
    .select({
      id: achievements.id,
      name: achievements.name,
      description: achievements.description,
      iconUrl: achievements.iconUrl,
      pointsRequired: achievements.pointsRequired,
      daysRequired: achievements.daysRequired,
      category: achievements.category,
      earned: sql<boolean>`CASE WHEN ${userAchievements.id} IS NOT NULL THEN true ELSE false END`,
      earnedDate: userAchievements.earnedDate
    })
    .from(achievements)
    .leftJoin(
      userAchievements,
      and(
        eq(userAchievements.achievementId, achievements.id),
        eq(userAchievements.userId, userId)
      )
    )
    .where(eq(achievements.id, achievementId))
    .limit(1);

  if (!achievement) {
    throw createError.notFound('成就不存在');
  }

  res.json({
    achievement
  });
}));

export default router;
