import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 预定义的错误类型
export const createError = {
  badRequest: (message: string = '请求参数错误') => 
    new CustomError(message, 400, 'BAD_REQUEST'),
  
  unauthorized: (message: string = '未授权访问') => 
    new CustomError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = '禁止访问') => 
    new CustomError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = '资源未找到') => 
    new CustomError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string = '资源冲突') => 
    new CustomError(message, 409, 'CONFLICT'),
  
  validation: (message: string = '数据验证失败') => 
    new CustomError(message, 422, 'VALIDATION_ERROR'),
  
  tooManyRequests: (message: string = '请求过于频繁') => 
    new CustomError(message, 429, 'TOO_MANY_REQUESTS'),
  
  internal: (message: string = '服务器内部错误') => 
    new CustomError(message, 500, 'INTERNAL_ERROR')
};

// 全局错误处理中间件
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || '服务器内部错误';
  let code = error.code || 'INTERNAL_ERROR';

  // 记录错误日志
  console.error('API错误:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 处理特定类型的错误
  if (error.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = '数据验证失败';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = '无效的ID格式';
  }

  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = '数据已存在';
  }

  // 在生产环境中隐藏敏感错误信息
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = '服务器内部错误';
  }

  // 返回错误响应
  res.status(statusCode).json({
    error: message,
    code,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
};

// 异步错误处理包装器
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404处理中间件
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError.notFound(`路径 ${req.originalUrl} 不存在`);
  next(error);
};
