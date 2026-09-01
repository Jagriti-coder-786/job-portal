import { Router } from 'express';
import { createJob, getJobs, getJob, updateJob, deleteJob, updateJobStatus, getMyJobs, getRecommendedJobs } from '../controllers/job.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { createJobSchema, updateJobSchema } from '../validators/job.validator.js';
import { checkJobQuality } from '../middleware/jobQuality.js';

const router = Router();

router.get('/recruiter/my-jobs', auth, authorize('recruiter'), getMyJobs);
router.post('/', auth, authorize('recruiter'), validate(createJobSchema), checkJobQuality, createJob);
router.get('/recommended', auth, authorize('seeker'), getRecommendedJobs);
router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/:id', auth, authorize('recruiter', 'admin'), validate(updateJobSchema), checkJobQuality, updateJob);
router.delete('/:id', auth, authorize('recruiter', 'admin'), deleteJob);
router.put('/:id/status', auth, authorize('recruiter', 'admin'), updateJobStatus);

export default router;
