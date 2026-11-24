import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', SubjectController.list);
router.post('/', SubjectController.create);
router.get('/:id', SubjectController.get);
router.patch('/:id', SubjectController.update);
router.delete('/:id', SubjectController.remove);

export default router;
