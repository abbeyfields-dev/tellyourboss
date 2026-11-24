import { Router } from 'express';
import { ScorecardController } from '../controllers/scorecard.controller';
import { authenticate } from '../middleware/auth';
import { shareLimiter } from '../middleware/rateLimit';

const router = Router();

router.use(authenticate);
router.get('/', ScorecardController.list);
router.post('/', ScorecardController.start);
router.get('/:id', ScorecardController.get);
router.patch('/:id/answers', ScorecardController.saveAnswers);
router.patch('/:id/dimensions', ScorecardController.setDimensions);
router.post('/:id/complete', ScorecardController.complete);
router.post('/:id/share', shareLimiter, ScorecardController.share);
router.delete('/:id', ScorecardController.remove);

export default router;
