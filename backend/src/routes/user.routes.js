import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, uploadResume, downloadResume, getUserById, getPublicProfile, parseResume } from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/auth.validator.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, validate(updateProfileSchema), updateProfile);
router.put('/avatar', auth, uploadSingle('avatar'), uploadAvatar);
router.put('/resume', auth, uploadSingle('resume'), uploadResume);
router.post('/resume/parse', auth, uploadSingle('resume'), parseResume);
router.get('/resume/download', auth, downloadResume);
router.get('/profile/:id', getPublicProfile); // Public route
router.get('/:id', auth, getUserById);

export default router;
