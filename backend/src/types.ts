import type { Request } from 'express';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

export type JWTPayload = {
  userId: string;
  email: string;
  tokenVersion?: number;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
