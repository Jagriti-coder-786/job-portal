import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/:applicationId', auth, getMessages);
router.post('/:applicationId', auth, sendMessage);

export default router;
