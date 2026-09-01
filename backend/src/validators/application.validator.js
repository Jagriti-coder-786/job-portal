import { z } from 'zod';
import { APPLICATION_STATUS } from '../utils/constants.js';

export const createApplicationSchema = z.object({
  job: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().max(3000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(Object.values(APPLICATION_STATUS)),
  notes: z.string().max(1000).optional(),
});
