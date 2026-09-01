import { Router } from 'express';
import { reportJob } from '../controllers/report.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// Job reporting is available for seekers
router.post('/jobs/:id', auth, authorize('seeker'), reportJob);

export default router;
