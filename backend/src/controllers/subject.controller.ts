import type { Response } from 'express';
import { SubjectService } from '../services/subject.service';
import type { AuthRequest } from '../types';

export class SubjectController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    const includeArchived = req.query.includeArchived === 'true';
    const data = await SubjectService.list(req.user!.id, includeArchived);
    res.json({ success: true, data });
  }

  static async get(req: AuthRequest, res: Response): Promise<void> {
    const data = await SubjectService.get(req.user!.id, req.params.id);
    res.json({ success: true, data });
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    const data = await SubjectService.create(req.user!.id, req.body ?? {});
    res.status(201).json({ success: true, data });
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    const data = await SubjectService.update(req.user!.id, req.params.id, req.body ?? {});
    res.json({ success: true, data });
  }

  static async remove(req: AuthRequest, res: Response): Promise<void> {
    const data = await SubjectService.remove(req.user!.id, req.params.id);
    res.json({ success: true, data });
  }
}
