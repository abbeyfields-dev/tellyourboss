import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginLimiter, passwordLimiter, ratingRequestLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', loginLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', passwordLimiter, AuthController.forgotPassword);
router.post('/reset-password', passwordLimiter, AuthController.resetPassword);
router.post('/rating-request', authenticate, ratingRequestLimiter, AuthController.requestRating);
router.get('/rating-requests', authenticate, AuthController.listRatingRequests);
router.get('/rating-request/open', authenticate, AuthController.openRatingRequest);
router.get('/me', authenticate, AuthController.me);
router.patch('/me', authenticate, AuthController.updateMe);

export default router;
