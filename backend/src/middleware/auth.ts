import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

// 扩展Request类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// JWT认证中间件
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: '访问令牌缺失',
        code: 'MISSING_TOKEN'
      });
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // 从数据库获取用户信息
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        isActive: users.isActive
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({
        error: '用户不存在',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user[0].isActive) {
      return res.status(401).json({
        error: '账户已被禁用',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // 将用户信息添加到请求对象
    req.user = {
      id: user[0].id,
      email: user[0].email,
      username: user[0].username
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: '无效的访问令牌',
        code: 'INVALID_TOKEN'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: '访问令牌已过期',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('认证中间件错误:', error);
    return res.status(500).json({
      error: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    });
  }
};

// 可选认证中间件（不强制要求认证）
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // 没有token也继续执行
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        isActive: users.isActive
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length > 0 && user[0].isActive) {
      req.user = {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username
      };
    }

    next();
  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

// 生成JWT令牌
export const generateTokens = (user: { id: number; email: string; username: string }) => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// 验证刷新令牌
export const verifyRefreshToken = (token: string): { userId: number } | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
};
