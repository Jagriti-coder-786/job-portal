import { Router } from 'express';
import { createCompany, getCompanies, getCompany, updateCompany, uploadLogo, getMyCompany } from '../controllers/company.controller.js';
import { addReview, getCompanyReviews } from '../controllers/review.controller.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import { createCompanySchema, updateCompanySchema } from '../validators/company.validator.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

router.get('/my/company', auth, authorize('recruiter'), getMyCompany);
router.post('/', auth, authorize('recruiter'), validate(createCompanySchema), createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.put('/:id', auth, authorize('recruiter', 'admin'), validate(updateCompanySchema), updateCompany);
router.put('/:id/logo', auth, authorize('recruiter'), uploadSingle('logo'), uploadLogo);

// Reviews
router.post('/:companyId/reviews', auth, authorize('seeker'), addReview);
router.get('/:companyId/reviews', getCompanyReviews);

export default router;
