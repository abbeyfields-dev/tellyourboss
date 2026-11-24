import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }
  console.error('[error]', req.method, req.path, err);
  res.status(500).json({
    success: false,
    error: env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
}
