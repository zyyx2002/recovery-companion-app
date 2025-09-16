import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../database/connection';
import { users, userPoints } from '../database/schema';
import { eq } from 'drizzle-orm';
import { generateTokens, verifyRefreshToken, authenticateToken } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// 注册验证schema
const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  username: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),
  password: z.string().min(8, '密码至少8个字符').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '密码必须包含大小写字母和数字'
  ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '密码确认不匹配',
  path: ['confirmPassword']
});

// 登录验证schema
const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(1, '密码不能为空')
});

// 刷新令牌验证schema
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '刷新令牌不能为空')
});

// 用户注册
router.post('/register', asyncHandler(async (req, res) => {
  // 验证输入数据
  const validatedData = registerSchema.parse(req.body);
  const { email, username, password } = validatedData;

  // 检查邮箱是否已存在
  const existingUserByEmail = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUserByEmail.length > 0) {
    throw createError.conflict('该邮箱已被注册');
  }

  // 检查用户名是否已存在
  const existingUserByUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUserByUsername.length > 0) {
    throw createError.conflict('该用户名已被使用');
  }

  // 加密密码
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // 创建用户
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      createdAt: users.createdAt
    });

  // 创建用户积分记录
  await db.insert(userPoints).values({
    userId: newUser.id,
    totalPoints: 0,
    currentLevel: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 生成令牌
  const { accessToken, refreshToken } = generateTokens({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username
  });

  res.status(201).json({
    message: '注册成功',
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

// 用户登录
router.post('/login', asyncHandler(async (req, res) => {
  // 验证输入数据
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  // 查找用户
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      lastLogin: users.lastLogin
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw createError.unauthorized('邮箱或密码错误');
  }

  if (!user.isActive) {
    throw createError.forbidden('账户已被禁用');
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw createError.unauthorized('邮箱或密码错误');
  }

  // 更新最后登录时间
  await db
    .update(users)
    .set({ 
      lastLogin: new Date(),
      updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  // 生成令牌
  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    username: user.username
  });

  res.json({
    message: '登录成功',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      lastLogin: user.lastLogin
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
}));

// 刷新访问令牌
router.post('/refresh', asyncHandler(async (req, res) => {
  // 验证输入数据
  const validatedData = refreshTokenSchema.parse(req.body);
  const { refreshToken } = validatedData;

  // 验证刷新令牌
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw createError.unauthorized('无效的刷新令牌');
  }

  // 查找用户
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      isActive: users.isActive
    })
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

  if (!user || !user.isActive) {
    throw createError.unauthorized('用户不存在或已被禁用');
  }

  // 生成新的访问令牌
  const { accessToken, refreshToken: newRefreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    username: user.username
  });

  res.json({
    message: '令牌刷新成功',
    tokens: {
      accessToken,
      refreshToken: newRefreshToken
    }
  });
}));

// 获取当前用户信息
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      phone: users.phone,
      dateOfBirth: users.dateOfBirth,
      gender: users.gender,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
      timezone: users.timezone
    })
    .from(users)
    .where(eq(users.id, req.user!.id))
    .limit(1);

  if (!user) {
    throw createError.notFound('用户不存在');
  }

  res.json({
    user
  });
}));

// 用户登出（客户端处理，这里只是记录日志）
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // 在实际应用中，可以将令牌加入黑名单
  // 这里只是返回成功响应
  res.json({
    message: '登出成功'
  });
}));

export default router;
