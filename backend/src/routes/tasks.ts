import express from 'express';
import { z } from 'zod';
import { db } from '../database/connection';
import { tasks, userTaskCompletions, users, userPoints } from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 获取任务列表验证schema
const getTasksSchema = z.object({
  category: z.string().optional(),
  is_daily: z.string().transform(val => val === 'true').optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 50, 100)).optional()
});

// 完成任务验证schema
const completeTaskSchema = z.object({
  taskId: z.number().int().positive('无效的任务ID'),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误').optional(),
  notes: z.string().max(500, '备注过长').optional()
});

// 获取任务列表
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { category, is_daily, limit = 50 } = getTasksSchema.parse(req.query);

  // 构建查询条件
  let query = db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      category: tasks.category,
      difficultyLevel: tasks.difficultyLevel,
      points: tasks.points,
      isDaily: tasks.isDaily,
      completed: sql<boolean>`CASE WHEN ${userTaskCompletions.id} IS NOT NULL THEN true ELSE false END`
    })
    .from(tasks)
    .leftJoin(
      userTaskCompletions,
      and(
        eq(userTaskCompletions.taskId, tasks.id),
        eq(userTaskCompletions.userId, userId),
        eq(userTaskCompletions.completedDate, sql`CURRENT_DATE`)
      )
    )
    .where(eq(tasks.isActive, true));

  // 添加过滤条件
  if (category) {
    query = query.where(eq(tasks.category, category));
  }

  if (is_daily !== undefined) {
    query = query.where(eq(tasks.isDaily, is_daily));
  }

  // 执行查询
  const taskList = await query
    .orderBy(desc(tasks.createdAt))
    .limit(limit);

  res.json({
    tasks: taskList,
    total: taskList.length
  });
}));

// 获取今日任务
router.get('/daily', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const todayTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      category: tasks.category,
      difficultyLevel: tasks.difficultyLevel,
      points: tasks.points,
      isDaily: tasks.isDaily,
      completed: sql<boolean>`CASE WHEN ${userTaskCompletions.id} IS NOT NULL THEN true ELSE false END`
    })
    .from(tasks)
    .leftJoin(
      userTaskCompletions,
      and(
        eq(userTaskCompletions.taskId, tasks.id),
        eq(userTaskCompletions.userId, userId),
        eq(userTaskCompletions.completedDate, sql`CURRENT_DATE`)
      )
    )
    .where(and(
      eq(tasks.isActive, true),
      eq(tasks.isDaily, true)
    ))
    .orderBy(desc(tasks.createdAt));

  const completedCount = todayTasks.filter(task => task.completed).length;

  res.json({
    tasks: todayTasks,
    stats: {
      total: todayTasks.length,
      completed: completedCount,
      remaining: todayTasks.length - completedCount
    }
  });
}));

// 完成任务
router.post('/complete', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { taskId, completedDate, notes } = completeTaskSchema.parse(req.body);

  const date = completedDate || new Date().toISOString().split('T')[0];

  // 检查任务是否存在
  const [task] = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      points: tasks.points,
      isActive: tasks.isActive
    })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task) {
    throw createError.notFound('任务不存在');
  }

  if (!task.isActive) {
    throw createError.badRequest('任务已停用');
  }

  // 检查是否已经完成过
  const [existing] = await db
    .select({ id: userTaskCompletions.id })
    .from(userTaskCompletions)
    .where(and(
      eq(userTaskCompletions.userId, userId),
      eq(userTaskCompletions.taskId, taskId),
      eq(userTaskCompletions.completedDate, date)
    ))
    .limit(1);

  if (existing) {
    throw createError.conflict('任务今天已经完成过了');
  }

  // 使用事务完成任务并更新积分
  await db.transaction(async (tx) => {
    // 记录任务完成
    await tx.insert(userTaskCompletions).values({
      userId,
      taskId,
      completedDate: date,
      pointsEarned: task.points,
      notes: notes || null,
      createdAt: new Date()
    });

    // 更新用户积分
    await tx
      .insert(userPoints)
      .values({
        userId,
        totalPoints: task.points,
        currentLevel: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: userPoints.userId,
        set: {
          totalPoints: sql`${userPoints.totalPoints} + ${task.points}`,
          currentLevel: sql`CASE 
            WHEN (${userPoints.totalPoints} + ${task.points}) >= 500 THEN 5
            WHEN (${userPoints.totalPoints} + ${task.points}) >= 300 THEN 4
            WHEN (${userPoints.totalPoints} + ${task.points}) >= 150 THEN 3
            WHEN (${userPoints.totalPoints} + ${task.points}) >= 50 THEN 2
            ELSE 1
          END`,
          updatedAt: new Date()
        }
      });
  });

  res.json({
    message: '任务完成成功',
    pointsEarned: task.points,
    task: {
      id: task.id,
      title: task.title
    }
  });
}));

// 获取任务完成历史
router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, date } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let query = db
    .select({
      id: userTaskCompletions.id,
      completedDate: userTaskCompletions.completedDate,
      pointsEarned: userTaskCompletions.pointsEarned,
      notes: userTaskCompletions.notes,
      createdAt: userTaskCompletions.createdAt,
      taskTitle: tasks.title,
      taskCategory: tasks.category
    })
    .from(userTaskCompletions)
    .leftJoin(tasks, eq(userTaskCompletions.taskId, tasks.id))
    .where(eq(userTaskCompletions.userId, userId));

  // 如果指定了日期，过滤该日期的记录
  if (date) {
    query = query.where(eq(userTaskCompletions.completedDate, date as string));
  }

  const history = await query
    .orderBy(desc(userTaskCompletions.completedDate), desc(userTaskCompletions.createdAt))
    .limit(Number(limit))
    .offset(offset);

  res.json({
    history,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: history.length
    }
  });
}));

// 获取任务统计
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { period = 'week' } = req.query;

  let dateFilter = sql`1=1`;
  if (period === 'week') {
    dateFilter = sql`${userTaskCompletions.completedDate} >= CURRENT_DATE - INTERVAL '7 days'`;
  } else if (period === 'month') {
    dateFilter = sql`${userTaskCompletions.completedDate} >= CURRENT_DATE - INTERVAL '30 days'`;
  }

  // 获取完成统计
  const [stats] = await db
    .select({
      totalCompleted: sql<number>`COUNT(*)`,
      totalPoints: sql<number>`COALESCE(SUM(${userTaskCompletions.pointsEarned}), 0)`,
      averagePerDay: sql<number>`COALESCE(COUNT(*)::float / NULLIF(EXTRACT(days FROM CURRENT_DATE - MIN(${userTaskCompletions.completedDate})), 0), 0)`
    })
    .from(userTaskCompletions)
    .where(and(
      eq(userTaskCompletions.userId, userId),
      dateFilter
    ));

  // 获取分类统计
  const categoryStats = await db
    .select({
      category: tasks.category,
      count: sql<number>`COUNT(*)`,
      points: sql<number>`COALESCE(SUM(${userTaskCompletions.pointsEarned}), 0)`
    })
    .from(userTaskCompletions)
    .leftJoin(tasks, eq(userTaskCompletions.taskId, tasks.id))
    .where(and(
      eq(userTaskCompletions.userId, userId),
      dateFilter
    ))
    .groupBy(tasks.category);

  res.json({
    period,
    stats: {
      totalCompleted: Number(stats.totalCompleted) || 0,
      totalPoints: Number(stats.totalPoints) || 0,
      averagePerDay: Number(stats.averagePerDay) || 0
    },
    categoryStats
  });
}));

export default router;
