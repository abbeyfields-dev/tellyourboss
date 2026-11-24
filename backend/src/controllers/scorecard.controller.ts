import type { Response } from 'express';
import { ScorecardService } from '../services/scorecard.service';
import type { AuthRequest } from '../types';

export class ScorecardController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    const subjectId = typeof req.query.subjectId === 'string' ? req.query.subjectId : undefined;
    const data = await ScorecardService.list(req.user!.id, subjectId);
    res.json({ success: true, data });
  }

  static async get(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.get(req.user!.id, req.params.id);
    res.json({ success: true, data });
  }

  static async start(req: AuthRequest, res: Response): Promise<void> {
    const askToken = typeof req.body?.askToken === 'string' ? req.body.askToken : undefined;
    const data = await ScorecardService.start(req.user!.id, String(req.body?.subjectId ?? ''), askToken);
    res.status(201).json({ success: true, data });
  }

  static async saveAnswers(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.saveAnswers(req.user!.id, req.params.id, req.body?.answers ?? []);
    res.json({ success: true, data });
  }

  static async complete(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.complete(req.user!.id, req.params.id, req.body?.answers);
    res.json({ success: true, data });
  }

  static async remove(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.remove(req.user!.id, req.params.id);
    res.json({ success: true, data });
  }

  static async setDimensions(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.setDimensions(req.user!.id, req.params.id, req.body?.dimensionIds);
    res.json({ success: true, data });
  }

  static async share(req: AuthRequest, res: Response): Promise<void> {
    const data = await ScorecardService.share(req.user!.id, req.params.id, {
      to: String(req.body?.to ?? ''),
      channel: typeof req.body?.channel === 'string' ? req.body.channel : 'anonymous',
    });
    res.json({ success: true, data });
  }
}
