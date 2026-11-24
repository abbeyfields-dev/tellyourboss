import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import type { AuthRequest, JWTPayload } from '../types';
import { AuthenticationError } from '../utils/errors';

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    const decoded = jwt.verify(header.slice(7), env.jwtSecret) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, displayName: true, tokenVersion: true },
    });
    if (!user || (decoded.tokenVersion ?? 0) !== user.tokenVersion) {
      throw new AuthenticationError('Invalid token');
    }
    req.user = { id: user.id, email: user.email, displayName: user.displayName };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
      return;
    }
    next(error);
  }
}
