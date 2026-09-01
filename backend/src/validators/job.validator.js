import { z } from 'zod';
import { JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '../utils/constants.js';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(10000),
  requirements: z.array(z.string().trim()).optional().default([]),
  skills: z.array(z.string().trim()).min(1, 'At least one skill is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required').max(200),
  salary: z.object({
    min: z.number().min(0).optional().default(0),
    max: z.number().min(0).optional().default(0),
    currency: z.string().default('USD'),
  }).optional().default({}),
  jobType: z.enum(Object.values(JOB_TYPES)),
  experienceLevel: z.enum(Object.values(EXPERIENCE_LEVELS)),
  workMode: z.enum(Object.values(WORK_MODES)).optional().default(WORK_MODES.ON_SITE),
  category: z.string().optional().default('Other'),
  applicationDeadline: z.string().optional(),
});

export const updateJobSchema = createJobSchema.partial();
