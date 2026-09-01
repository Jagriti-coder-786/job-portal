import { Router } from 'express';
import { register, login, logout, getMe, changePassword, refresh } from '../controllers/auth.controller.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/change-password', auth, validate(changePasswordSchema), changePassword);

export default router;
