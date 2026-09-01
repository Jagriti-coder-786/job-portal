import mongoose from 'mongoose';
import { JOB_STATUS, JOB_TYPES, EXPERIENCE_LEVELS, WORK_MODES } from '../utils/constants.js';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [10000, 'Description cannot exceed 10000 characters'],
  },
  requirements: [{
    type: String,
    trim: true,
  }],
  skills: [{
    type: String,
    required: true,
    trim: true,
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  jobType: {
    type: String,
    enum: Object.values(JOB_TYPES),
    required: [true, 'Job type is required'],
  },
  experienceLevel: {
    type: String,
    enum: Object.values(EXPERIENCE_LEVELS),
    required: [true, 'Experience level is required'],
  },
  workMode: {
    type: String,
    enum: Object.values(WORK_MODES),
    default: WORK_MODES.ON_SITE,
  },
  category: {
    type: String,
    default: 'Other',
  },
  status: {
    type: String,
    enum: Object.values(JOB_STATUS),
    default: JOB_STATUS.OPEN,
  },
  applicationDeadline: {
    type: Date,
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient searching
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ skills: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;
