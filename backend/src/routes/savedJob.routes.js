import { Router } from 'express';
import { toggleSaveJob, getSavedJobs, checkSavedJob } from '../controllers/savedJob.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

router.post('/:jobId', auth, authorize('seeker'), toggleSaveJob);
router.get('/', auth, authorize('seeker'), getSavedJobs);
router.get('/check/:jobId', auth, authorize('seeker'), checkSavedJob);

export default router;
