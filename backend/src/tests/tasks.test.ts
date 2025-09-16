import request from 'supertest';
import { app } from '../index';
import { db } from '../database/connection';
import { users, tasks, userTaskCompletions, userPoints } from '../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

describe('任务API测试', () => {
  let accessToken: string;
  let userId: number;

  beforeEach(async () => {
    // 清理测试数据
    await db.delete(userTaskCompletions);
    await db.delete(userPoints);
    await db.delete(tasks);
    await db.delete(users);

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('Test123456', 12);
    const [user] = await db.insert(users).values({
      email: 'test@example.com',
      username: 'testuser',
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({ id: users.id });

    userId = user.id;

    // 创建用户积分记录
    await db.insert(userPoints).values({
      userId: user.id,
      totalPoints: 0,
      currentLevel: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 创建测试任务
    await db.insert(tasks).values([
      {
        title: '深呼吸练习',
        description: '进行5分钟的深呼吸冥想',
        category: '心理健康',
        difficultyLevel: 1,
        points: 10,
        isDaily: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '运动锻炼',
        description: '进行30分钟的身体锻炼',
        category: '身体健康',
        difficultyLevel: 2,
        points: 20,
        isDaily: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: '学习新技能',
        description: '花时间学习一项新的技能',
        category: '个人发展',
        difficultyLevel: 3,
        points: 30,
        isDaily: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 获取访问令牌
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123456'
      });

    accessToken = loginResponse.body.tokens.accessToken;
  });

  afterAll(async () => {
    // 清理测试数据
    await db.delete(userTaskCompletions);
    await db.delete(userPoints);
    await db.delete(tasks);
    await db.delete(users);
  });

  describe('GET /api/tasks', () => {
    it('应该返回任务列表', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body.tasks).toHaveLength(3);
      expect(response.body.tasks[0]).toHaveProperty('id');
      expect(response.body.tasks[0]).toHaveProperty('title');
      expect(response.body.tasks[0]).toHaveProperty('points');
    });

    it('应该支持按分类过滤', async () => {
      const response = await request(app)
        .get('/api/tasks?category=心理健康')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].category).toBe('心理健康');
    });

    it('应该支持按每日任务过滤', async () => {
      const response = await request(app)
        .get('/api/tasks?is_daily=true')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(2);
      response.body.tasks.forEach((task: any) => {
        expect(task.isDaily).toBe(true);
      });
    });
  });

  describe('GET /api/tasks/daily', () => {
    it('应该返回今日任务', async () => {
      const response = await request(app)
        .get('/api/tasks/daily')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.tasks).toHaveLength(2); // 只有每日任务
      expect(response.body.stats.total).toBe(2);
      expect(response.body.stats.completed).toBe(0);
      expect(response.body.stats.remaining).toBe(2);
    });
  });

  describe('POST /api/tasks/complete', () => {
    it('应该成功完成任务', async () => {
      // 获取第一个任务
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      const taskId = tasksResponse.body.tasks[0].id;

      const response = await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId })
        .expect(200);

      expect(response.body).toHaveProperty('message', '任务完成成功');
      expect(response.body).toHaveProperty('pointsEarned');
      expect(response.body).toHaveProperty('task');
    });

    it('应该更新用户积分', async () => {
      // 获取第一个任务
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      const taskId = tasksResponse.body.tasks[0].id;
      const taskPoints = tasksResponse.body.tasks[0].points;

      await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId })
        .expect(200);

      // 检查用户积分是否更新
      const [userPoint] = await db
        .select()
        .from(userPoints)
        .where(eq(userPoints.userId, userId));

      expect(userPoint.totalPoints).toBe(taskPoints);
    });

    it('应该拒绝重复完成同一任务', async () => {
      // 获取第一个任务
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      const taskId = tasksResponse.body.tasks[0].id;

      // 第一次完成
      await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId })
        .expect(200);

      // 第二次完成应该失败
      const response = await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId })
        .expect(409);

      expect(response.body).toHaveProperty('error', '任务今天已经完成过了');
    });

    it('应该拒绝无效的任务ID', async () => {
      const response = await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId: 99999 })
        .expect(404);

      expect(response.body).toHaveProperty('error', '任务不存在');
    });
  });

  describe('GET /api/tasks/history', () => {
    beforeEach(async () => {
      // 完成一个任务
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      const taskId = tasksResponse.body.tasks[0].id;

      await request(app)
        .post('/api/tasks/complete')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ taskId });
    });

    it('应该返回任务完成历史', async () => {
      const response = await request(app)
        .get('/api/tasks/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('history');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.history).toHaveLength(1);
      expect(response.body.history[0]).toHaveProperty('taskTitle');
      expect(response.body.history[0]).toHaveProperty('pointsEarned');
    });
  });

  describe('GET /api/tasks/stats', () => {
    beforeEach(async () => {
      // 完成几个任务
      const tasksResponse = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      // 完成前两个任务
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/tasks/complete')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ taskId: tasksResponse.body.tasks[i].id });
      }
    });

    it('应该返回任务统计', async () => {
      const response = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('categoryStats');
      expect(response.body.stats.totalCompleted).toBe(2);
      expect(response.body.stats.totalPoints).toBeGreaterThan(0);
    });

    it('应该支持按时间段过滤', async () => {
      const response = await request(app)
        .get('/api/tasks/stats?period=week')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('period', 'week');
      expect(response.body).toHaveProperty('stats');
    });
  });
});
