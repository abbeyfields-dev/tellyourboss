import type { Request, Response } from 'express';
import { FeedbackService } from '../services/feedback.service';
import type { AuthRequest } from '../types';

export class FeedbackController {
  static async inbox(req: AuthRequest, res: Response): Promise<void> {
    const data = await FeedbackService.inbox(req.user!.email);
    res.json({ success: true, data });
  }

  static async preview(req: Request, res: Response): Promise<void> {
    const data = await FeedbackService.preview(req.params.token);
    res.json({ success: true, data });
  }

  static async sendCode(req: Request, res: Response): Promise<void> {
    const data = await FeedbackService.sendCode(req.params.token, String(req.body?.email ?? ''));
    res.json({ success: true, data });
  }

  static async verify(req: Request, res: Response): Promise<void> {
    const data = await FeedbackService.verify(req.params.token, String(req.body?.code ?? ''));
    res.json({ success: true, data });
  }

  static async details(req: Request, res: Response): Promise<void> {
    const header = req.headers['x-feedback-view'];
    const viewToken = Array.isArray(header) ? header[0] : header;
    const data = await FeedbackService.details(req.params.token, String(viewToken ?? ''));
    res.json({ success: true, data });
  }

  static async reply(req: Request, res: Response): Promise<void> {
    const header = req.headers['x-feedback-view'];
    const viewToken = Array.isArray(header) ? header[0] : header;
    const data = await FeedbackService.reply(
      req.params.token,
      String(viewToken ?? ''),
      String(req.body?.message ?? ''),
    );
    res.json({ success: true, data });
  }
}
