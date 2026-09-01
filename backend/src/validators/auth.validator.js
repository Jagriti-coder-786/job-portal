import { z } from 'zod';
import { USER_ROLES } from '../utils/constants.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum([USER_ROLES.SEEKER, USER_ROLES.RECRUITER]).default(USER_ROLES.SEEKER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  skills: z.array(z.string().trim()).optional(),
  education: z.array(z.object({
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().min(1),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
  })).optional(),
  experience: z.array(z.object({
    company: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
  })).optional(),
}).strict();
