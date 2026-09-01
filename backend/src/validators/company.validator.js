import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required').max(200),
  industry: z.string().max(100).optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', '']).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
