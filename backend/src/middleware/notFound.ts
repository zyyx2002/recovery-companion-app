import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError.notFound(`路径 ${req.originalUrl} 不存在`);
  next(error);
};
