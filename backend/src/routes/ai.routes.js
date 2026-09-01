import { Router } from 'express';
import { getResumeMatch, getAIStatus } from '../controllers/ai.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/match', auth, getResumeMatch);
router.get('/status', auth, getAIStatus);

export default router;
