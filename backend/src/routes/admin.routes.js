import { Router } from 'express';
import {
  getStats, getUsers, getRecruiters, getCompanies,
  updateCompanyStatus, getJobs, updateJobStatus,
  deleteJob, toggleSuspendUser, getRecentActivity,
} from '../controllers/admin.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

router.use(auth, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/recruiters', getRecruiters);
router.get('/companies', getCompanies);
router.put('/companies/:id/status', updateCompanyStatus);
router.get('/jobs', getJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteJob);
router.put('/users/:id/suspend', toggleSuspendUser);
router.get('/activity', getRecentActivity);

export default router;
