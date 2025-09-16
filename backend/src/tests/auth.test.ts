import request from 'supertest';
import { app } from '../index';
import { db } from '../database/connection';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

describe('认证API测试', () => {
  beforeEach(async () => {
    // 清理测试数据
    await db.delete(users);
  });

  afterAll(async () => {
    // 清理测试数据
    await db.delete(users);
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', '注册成功');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
    });

    it('应该拒绝无效的邮箱格式', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('应该拒绝弱密码', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('应该拒绝密码不匹配', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456',
        confirmPassword: 'Different123456'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('应该拒绝重复的邮箱', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456',
        confirmPassword: 'Test123456'
      };

      // 第一次注册
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // 第二次注册相同邮箱
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error', '该邮箱已被注册');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      const hashedPassword = await bcrypt.hash('Test123456', 12);
      await db.insert(users).values({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('应该成功登录', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', '登录成功');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('应该拒绝错误的密码', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', '邮箱或密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test123456'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', '邮箱或密码错误');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // 创建测试用户并获取token
      const hashedPassword = await bcrypt.hash('Test123456', 12);
      await db.insert(users).values({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123456'
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('应该返回当前用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.username).toBe('testuser');
    });

    it('应该拒绝无效的token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('应该拒绝缺失的token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', '访问令牌缺失');
    });
  });
});
