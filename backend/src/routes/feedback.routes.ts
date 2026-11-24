import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';
import { feedbackLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/inbox', authenticate, FeedbackController.inbox);

router.get('/:token', FeedbackController.preview);
router.post('/:token/code', feedbackLimiter, FeedbackController.sendCode);
router.post('/:token/verify', feedbackLimiter, FeedbackController.verify);
router.get('/:token/details', FeedbackController.details);
router.post('/:token/reply', feedbackLimiter, FeedbackController.reply);

export default router;
