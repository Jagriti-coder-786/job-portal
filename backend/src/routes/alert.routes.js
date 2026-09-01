import { Router } from 'express';
import { createAlert, getAlerts, updateAlert, deleteAlert } from '../controllers/alert.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// Job alerts are for job seekers
router.use(auth, authorize('seeker'));

router.post('/', createAlert);
router.get('/', getAlerts);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

export default router;
