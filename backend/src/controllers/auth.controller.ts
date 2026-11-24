import type { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthService } from '../services/auth.service';
import type { AuthRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, displayName } = req.body ?? {};
    const result = await AuthService.register(String(email ?? ''), String(password ?? ''), displayName);
    res.status(201).json({ success: true, data: result });
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body ?? {};
    const result = await AuthService.login(String(email ?? ''), String(password ?? ''));
    res.json({ success: true, data: result });
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    const result = await AuthService.refreshToken(String(req.body?.refreshToken ?? ''));
    res.json({ success: true, data: result });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    if (req.body?.refreshToken) await AuthService.logout(String(req.body.refreshToken));
    res.json({ success: true, message: 'Logged out.' });
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        industry: true,
        gender: true,
        country: true,
        location: true,
        state: true,
        postalCode: true,
        ageGroup: true,
        ethnicity: true,
        education: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ success: true, data: user });
  }

  static async updateMe(req: AuthRequest, res: Response): Promise<void> {
    const data = await AuthService.updateProfile(req.user!.id, req.body ?? {});
    res.json({ success: true, data });
  }

  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const data = await AuthService.requestPasswordReset(String(req.body?.email ?? ''));
    res.json({ success: true, data });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const data = await AuthService.resetPassword(String(req.body?.token ?? ''), String(req.body?.password ?? ''));
    res.json({ success: true, data });
  }

  static async requestRating(req: AuthRequest, res: Response): Promise<void> {
    const data = await AuthService.requestRating(req.user!.id, String(req.body?.to ?? ''));
    res.json({ success: true, data });
  }

  static async listRatingRequests(req: AuthRequest, res: Response): Promise<void> {
    const data = await AuthService.listRatingRequests(req.user!.id);
    res.json({ success: true, data });
  }

  static async openRatingRequest(req: AuthRequest, res: Response): Promise<void> {
    const data = await AuthService.openRatingRequest(req.user!.id, String(req.query.token ?? ''));
    res.json({ success: true, data });
  }
}
