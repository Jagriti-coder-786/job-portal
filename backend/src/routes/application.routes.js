import { Router } from 'express';
import {
  applyForJob, getMyApplications, getJobApplicants,
  updateApplicationStatus, bulkUpdateApplications, withdrawApplication, downloadApplicantResume,
  scheduleInterview,
} from '../controllers/application.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { APPLICATION_STATUS } from '../utils/constants.js';
import { createApplicationSchema, updateApplicationStatusSchema } from '../validators/application.validator.js';
import { uploadSingle } from '../middleware/upload.js';
import { z } from 'zod';

const router = Router();

const bulkUpdateSchema = z.object({
  applicationIds: z.array(z.string()).min(1, 'Please select at least one application'),
  status: z.enum(Object.values(APPLICATION_STATUS)),
  notes: z.string().max(1000).optional(),
});

router.post('/', auth, authorize('seeker'), uploadSingle('resume'), validate(createApplicationSchema), applyForJob);
router.get('/my', auth, authorize('seeker'), getMyApplications);
router.get('/job/:jobId', auth, authorize('recruiter', 'admin'), getJobApplicants);
router.put('/bulk-update', auth, authorize('recruiter', 'admin'), validate(bulkUpdateSchema), bulkUpdateApplications);
router.put('/:id/status', auth, authorize('recruiter', 'admin'), validate(updateApplicationStatusSchema), updateApplicationStatus);
router.put('/:id/interview', auth, authorize('recruiter', 'admin'), scheduleInterview);
router.put('/:id/withdraw', auth, authorize('seeker'), withdrawApplication);
router.get('/:id/resume', auth, authorize('recruiter', 'admin'), downloadApplicantResume);

export default router;
